// app/business_dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type UUID = string;

type Profile = {
  id: UUID;
  display_name: string | null;
  concordium_did: boolean | null;
};

type Business = {
  id: UUID;
  company_name: string;
};

type Escrow = {
  status: "none" | "held" | "released" | "failed";
  tx_hash: string | null;
  simulated: boolean | null;
  updated_at: string | null;
};

type JobStatus = "open" | "in_progress" | "completed" | "paid" | "cancelled";

type Job = {
  id: UUID;
  business_id: UUID;
  worker_id: UUID | null;
  title: string | null;
  description: string | null;
  amount_plt: number | null;
  location: any | null; // PostGIS / user-defined
  radius_m: number | null;
  status: JobStatus;
  created_at: string | null;
  updated_at: string | null;
  escrow?: Escrow | null;
};

type WorkerLite = {
  id: UUID;
  display_name: string | null;
};

function toLatLng(loc: any): { lat?: number; lng?: number } {
  // Handle PostGIS WKB binary format (hex string)
  if (typeof loc === "string" && loc.startsWith("0101000020E6100000")) {
    try {
      // Extract the coordinate bytes from the WKB
      // WKB format: 0101000020E6100000 + 16 bytes for coordinates (8 bytes each for lng, lat)
      const coordBytes = loc.slice(18); // Remove the header
      
      // Convert hex to bytes and parse as double precision floats
      const lngHex = coordBytes.slice(0, 16);
      const latHex = coordBytes.slice(16, 32);
      
      // Convert from little-endian hex to double (browser-compatible)
      const lngBytes = new Uint8Array(8);
      const latBytes = new Uint8Array(8);
      
      for (let i = 0; i < 8; i++) {
        lngBytes[i] = parseInt(lngHex.slice(i * 2, i * 2 + 2), 16);
        latBytes[i] = parseInt(latHex.slice(i * 2, i * 2 + 2), 16);
      }
      
      const lngView = new DataView(lngBytes.buffer);
      const latView = new DataView(latBytes.buffer);
      
      const lng = lngView.getFloat64(0, true); // little-endian
      const lat = latView.getFloat64(0, true); // little-endian
      
      return { lat, lng };
    } catch (err) {
      console.error('Error parsing WKB location:', err);
    }
  }
  
  // Handles PostGIS GeoJSON: { type: 'Point', coordinates: [lng, lat] }
  if (loc && typeof loc === "object") {
    if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
      const [lng, lat] = loc.coordinates;
      return { lat: typeof lat === "number" ? lat : undefined, lng: typeof lng === "number" ? lng : undefined };
    }
    // Plain { lat, lng }
    if (typeof loc.lat === "number" && typeof loc.lng === "number") {
      return { lat: loc.lat, lng: loc.lng };
    }
  }
  return {};
}

export default function BusinessDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [workers, setWorkers] = useState<WorkerLite[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const businessId = useMemo(() => business?.id ?? null, [business]);

  // Load everything via browser Supabase (auth persisted in localStorage)
  useEffect(() => {
    (async () => {
      try {
        // 1) Who's logged in?
        const { data: auth } = await supabase.auth.getUser();
        const currentUserId = auth.user?.id;
        if (!currentUserId) {
          router.push("/login");
          return;
        }
        setUserId(currentUserId);

        // 2) Load profile
        console.log('Loading profile for user:', currentUserId);
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("id, display_name, concordium_did")
          .eq("id", currentUserId)
          .maybeSingle();
        if (profErr) {
          console.error('Profile error:', profErr);
        }
        console.log('Profile loaded:', prof);
        setProfile(prof as Profile);

        // 3) Business row (businesses.id references profiles.id)
        console.log('Loading business for user:', currentUserId);
        const { data: biz, error: bizErr } = await supabase
          .from("businesses")
          .select("id, company_name")
          .eq("id", currentUserId)
          .maybeSingle();
        if (bizErr) {
          console.error('Business error:', bizErr);
        }
        console.log('Business loaded:', biz);
        setBusiness(biz as Business);

        // 4) Workers list (to populate Assign dropdown)
        //   Get workers from workers table and join with profiles for display names
        console.log('Loading workers...');
        
        const { data: workerRows, error: workersError } = await supabase
          .from("workers")
          .select(`
            id,
            profiles(
              display_name
            )
          `);
        
        console.log('Workers with profiles:', workerRows);
        
        if (workersError) {
          console.error('Workers error:', workersError);
        }

        // Map workers to WorkerLite format
        const ws: WorkerLite[] = (workerRows || []).map((w) => ({
          id: w.id,
          display_name: w.profiles?.[0]?.display_name || null,
        }));
        console.log('Workers loaded:', ws);
        setWorkers(ws);

        // 5) Jobs for this business (plus escrow via related row)
        //    Use currentUserId directly as business_id since create job page uses auth.user.id
        console.log('Loading jobs for business:', currentUserId);
        const { data: jobRows, error: jErr } = await supabase
          .from("jobs")
          .select(
            "id, business_id, worker_id, title, description, amount_plt, location, radius_m, status, created_at, updated_at"
          )
          .eq("business_id", currentUserId)
          .order("created_at", { ascending: false });
        if (jErr) {
          console.error('Jobs error:', jErr);
          throw jErr;
        }

        console.log('Raw job rows from Supabase:', jobRows);
        let jobsOut: Job[] = jobRows as Job[];
        console.log('Jobs after casting:', jobsOut);

        // Escrow rows keyed by job_id
        const jobIds = jobsOut.map((j) => j.id);
        if (jobIds.length) {
          console.log('Loading escrows for jobs:', jobIds);
          const { data: escrows, error: eErr } = await supabase
            .from("escrows")
            .select("job_id, status, tx_hash, simulated, updated_at")
            .in("job_id", jobIds);
          if (eErr) {
            console.error('Escrows error:', eErr);
            throw eErr;
          }

          const escrowByJob = new Map<string, Escrow>();
          (escrows || []).forEach((e: any) => {
            escrowByJob.set(e.job_id, {
              status: e.status,
              tx_hash: e.tx_hash,
              simulated: e.simulated,
              updated_at: e.updated_at,
            });
          });
          jobsOut = jobsOut.map((j) => ({ ...j, escrow: escrowByJob.get(j.id) || null }));
        }

        console.log('Final jobs array:', jobsOut);
        setJobs(jobsOut);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
        // Soft-fail: render empty state; you can add a toast if you want
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const reloadJobs = async () => {
    if (!userId) return;
    const { data: jobRows } = await supabase
      .from("jobs")
      .select(
        "id, business_id, worker_id, title, description, amount_plt, location, radius_m, status, created_at, updated_at"
      )
      .eq("business_id", userId)
      .order("created_at", { ascending: false });

    let jobsOut: Job[] = (jobRows as Job[]) || [];
    const jobIds = jobsOut.map((j) => j.id);
    if (jobIds.length) {
      const { data: escrows } = await supabase
        .from("escrows")
        .select("job_id, status, tx_hash, simulated, updated_at")
        .in("job_id", jobIds);

      const escrowByJob = new Map<string, Escrow>();
      (escrows || []).forEach((e: any) => {
        escrowByJob.set(e.job_id, {
          status: e.status,
          tx_hash: e.tx_hash,
          simulated: e.simulated,
          updated_at: e.updated_at,
        });
      });
      jobsOut = jobsOut.map((j) => ({ ...j, escrow: escrowByJob.get(j.id) || null }));
    }
    setJobs(jobsOut);
  };

  const handleAssignWorker = async (jobId: UUID, workerId: UUID | "") => {
    await supabase
      .from("jobs")
      .update({ worker_id: workerId || null })
      .eq("id", jobId);
    await reloadJobs();
  };


  const handleSimulateEscrow = async (jobId: UUID) => {
    // For demo purposes: upsert an escrow row to “released” (simulated)
    await supabase
      .from("escrows")
      .upsert({ job_id: jobId, status: "released", simulated: true, tx_hash: "0xSIMULATED" }, { onConflict: "job_id" });
    await reloadJobs();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard…</div>
      </main>
    );
  }

  if (!businessId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-10">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">No Business Profile</h2>
          <p className="text-gray-600 mb-6">You’re logged in, but no business profile was found.</p>
          <a
            href="/register"
            className="bg-green-600 text-white py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition inline-block"
          >
            Create Business Profile
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blue-50/40">
      <div className="min-h-screen flex">
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 bg-white shadow-xl md:rounded-r-2xl p-6 flex md:flex-col gap-4 items-center md:items-stretch md:sticky md:top-0">
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold">ProofOfWork</h1>
            <p className="text-sm text-gray-500">Business Dashboard</p>
          </div>

          <div className="w-full mt-2">
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-bold">{business?.company_name || "Your Company"}</h3>
              <p className="text-sm text-gray-600">Owner: {profile?.display_name || "—"}</p>
              <p className="text-xs text-gray-600">
                DID:{" "}
                <span
                  className={
                    profile?.concordium_did ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
                  }
                >
                  {profile?.concordium_did ? "Verified" : "Not verified"}
                </span>
              </p>
            </div>
          </div>

          <nav className="w-full flex md:flex-col gap-2">
            <a 
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                typeof window !== "undefined" && window.location.pathname === "/dashboard/business"
                  ? "bg-blue-100 text-blue-700"
                  : "border border-gray-200 hover:bg-gray-50"
              }`}
              href="/dashboard/business"
            >
              Home
            </a>
            <a 
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                typeof window !== "undefined" && window.location.pathname === "/dashboard/profile"
                  ? "bg-blue-100 text-blue-700"
                  : "border border-gray-200 hover:bg-gray-50"
              }`}
              href="/dashboard/profile"
            >
              Profile
            </a>
            <a 
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                typeof window !== "undefined" && window.location.pathname === "/dashboard/settings"
                  ? "bg-blue-100 text-blue-700"
                  : "border border-gray-200 hover:bg-gray-50"
              }`}
              href="/dashboard/settings"
            >
              Settings
            </a>
            <a
              href="/dashboard/business/create_job"
              className={`w-full p-3 rounded-lg transition text-center ${
                typeof window !== "undefined" && window.location.pathname === "/dashboard/business/create_job"
                  ? "bg-blue-600 text-white"
                  : "bg-green-600 text-white hover:bg-blue-700"
              }`}
            >
              + Create Job
            </a>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 p-6 md:p-10 pt-24 md:pt-28 lg:pt-32">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-bold">Jobs</h2>
              <a
                href="/dashboard/business/create_job"
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                + Create Job
              </a>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
                <p className="text-gray-600 mb-4">No jobs yet.</p>
                <a
                  href="/dashboard/business/create_job"
                  className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition inline-block"
                >
                  Create your first job
                </a>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {jobs.map((job) => {
                  console.log('Job location data:', job.location);
                  const { lat, lng } = toLatLng(job.location);
                  console.log('Parsed lat/lng:', { lat, lng });
                  const workerName =
                    job.worker_id && workers.find((w) => w.id === job.worker_id)?.display_name;

                  return (
                    <li key={job.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">{job.title || "Untitled job"}</h3>
                          <p className="text-gray-600">{job.description || "—"}</p>

                          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Amount (PLT): </span>
                              <span className="font-semibold">{job.amount_plt ?? "—"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Radius (m): </span>
                              <span className="font-semibold">{job.radius_m ?? "—"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Status: </span>
                              <span className="font-semibold capitalize">{job.status}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-500">Location: </span>
                              <span className="font-mono">
                                {lat !== undefined && lng !== undefined ? `${lat.toFixed(3)}, ${lng.toFixed(3)}` : "—"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Worker: </span>
                              <span className="font-semibold">{workerName || "Unassigned"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Escrow: </span>
                              <span className="font-semibold">{job.escrow?.status ?? "none"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right controls */}
                        <div className="w-full md:w-60 shrink-0 flex flex-col gap-2">
                          <select
                            className="border border-gray-300 p-2 rounded-lg text-sm"
                            value={job.worker_id || ""}
                            onChange={(e) => handleAssignWorker(job.id, e.target.value as UUID)}
                          >
                            <option value="">Assign worker...</option>
                            {workers.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.display_name || `Worker ${w.id.slice(0, 8)}`}
                              </option>
                            ))}
                          </select>

                          <button
                            className="bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                            onClick={() => handleSimulateEscrow(job.id)}
                          >
                            Simulate Release
                          </button>

                          <a
                            href={`/jobs/${job.id}`}
                            className="text-center border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50"
                          >
                            View Job
                          </a>

                          {job.escrow?.tx_hash ? (
                            <p className="text-xs text-gray-500 mt-2 break-all">tx: {job.escrow.tx_hash}</p>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
