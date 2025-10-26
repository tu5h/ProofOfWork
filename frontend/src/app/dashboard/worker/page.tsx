// app/dashboard/worker/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
// ⬇️ same client you use elsewhere (adjust path if yours lives in /lib)
import { supabase } from "@/lib/supabaseClient";

type UUID = string;

type Profile = {
  id: UUID;
  display_name?: string | null;
  concordium_did?: boolean | null;
};

type JobStatus = "open" | "in_progress" | "completed" | "paid" | "cancelled";

type JobRow = {
  id: UUID;
  title?: string | null;
  description?: string | null;
  amount_plt?: number | null;
  location?: any | null;           // PostGIS GeoJSON or {lat,lng}
  radius_m?: number | null;
  status: JobStatus;
  updated_at?: string | null;
};

type Notification = {
  id: string;
  type: "assignment" | "info";
  message: string;
  jobId?: UUID;
  created_at: string;
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

export default function WorkerDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTimer, setNotificationTimer] = useState<NodeJS.Timeout | null>(null);

  const unseenCount = useMemo(() => notifs.length, [notifs]);

  // Load current worker (profile) + jobs assigned to them
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id;
        if (!uid) {
          router.push("/login");
          return;
        }

        // Sidebar profile
        const { data: me } = await supabase
          .from("profiles")
          .select("id, display_name, concordium_did")
          .eq("id", uid)
          .maybeSingle();
        setProfile(me as Profile | null);

        // Assigned jobs for this worker
        const { data: js } = await supabase
          .from("jobs")
          .select("id, title, description, amount_plt, location, radius_m, status, updated_at")
          .eq("worker_id", uid)
          .order("updated_at", { ascending: false });
        setJobs((js as JobRow[]) || []);

        // Realtime assignments/updates for this worker (lightweight notifications)
        channel = supabase
          .channel(`jobs-for-${uid}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "jobs", filter: `worker_id=eq.${uid}` },
            (payload) => {
              const row = payload.new as JobRow;
              setNotifs((prev) => [
                {
                  id: `ins-${row.id}-${Date.now()}`,
                  type: "assignment",
                  jobId: row.id,
                  message: `You were assigned a new job: ${row.title || "Untitled job"}`,
                  created_at: new Date().toISOString(),
                },
                ...prev,
              ]);
              setJobs((prev) => [row, ...prev]);
            }
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "jobs", filter: `worker_id=eq.${uid}` },
            (payload) => {
              const row = payload.new as JobRow;
              setJobs((prev) => prev.map((j) => (j.id === row.id ? row : j)));
            }
          )
          .subscribe();
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  const reloadJobs = async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;

      const { data: js } = await supabase
        .from("jobs")
        .select("id, title, description, amount_plt, location, radius_m, status, updated_at")
        .eq("worker_id", uid)
        .order("updated_at", { ascending: false });

      setJobs((js as JobRow[]) || []);
    } catch (error) {
      console.error("Error reloading jobs:", error);
    }
  };

  // Notification tray hover handlers (unchanged)
  const handleNotificationMouseEnter = () => {
    if (notificationTimer) {
      clearTimeout(notificationTimer);
      setNotificationTimer(null);
    }
    setShowNotifications(true);
  };

  const handleNotificationMouseLeave = () => {
    const timer = setTimeout(() => setShowNotifications(false), 200);
    setNotificationTimer(timer);
  };

  // “Mark job as finished” (placeholder: geolocate + call RPC)
  const markFinished = async (jobId: UUID) => {
    try {
      if (!("geolocation" in navigator)) {
        return alert("Geolocation not available on this device.");
      }

      console.log('=== STARTING JOB COMPLETION ===');
      console.log('Job ID:', jobId);

      // Get worker's current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000
        });
      });

      const workerLat = position.coords.latitude;
      const workerLng = position.coords.longitude;

      console.log('Worker location:', { workerLat, workerLng });

      // FIRST: Update job status to completed
      console.log('Updating job status to completed...');
      const { error: updateError } = await supabase
        .from("jobs")
        .update({ status: "completed" })
        .eq("id", jobId);

      if (updateError) {
        console.error('Error updating job status:', updateError);
        throw updateError;
      }

      console.log('✅ Job status updated to completed');

      // Wait for database to propagate
      await new Promise(resolve => setTimeout(resolve, 2500));
      // THEN: Validate payment conditions
      console.log('Calling payment validation API...');
      const validationRes = await fetch("/api/validate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          workerLat,
          workerLng,
          businessApproval: false
        }),
      });

      console.log('Validation response status:', validationRes.status);

      if (!validationRes.ok) {
        const errorText = await validationRes.text();
        console.error('Validation request failed:', errorText);
        throw new Error("Payment validation request failed");
      }

      const validation = await validationRes.json();
      console.log('Validation result:', validation);

      if (!validation.valid) {
        const errorMessage = `Job marked as complete, but payment cannot be released:\n\n${validation.errors.join("\n")}\n\nPlease contact the business for manual approval.`;
        console.error('Validation failed:', errorMessage);
        alert(errorMessage);
        await reloadJobs();
        return;
      }

      // Success!
      console.log('✅ Validation passed!');
      if (validation.released) {
        alert("Job completed and payment released automatically! 🎉");
      } else if (validation.autoRelease) {
        alert("Job marked as complete! Payment will be released automatically.");
      } else {
        alert("Job marked as complete! Waiting for business approval.");
      }

      await reloadJobs();
      console.log('=== JOB COMPLETION FINISHED ===');
    } catch (e: any) {
      console.error('❌ Error in markFinished:', e);
      alert(e?.message || "Could not mark as finished.");
    }
  };

  return (
    <main className="min-h-screen bg-blue-50/40">
      <div className="min-h-screen flex">
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 bg-white shadow-xl md:rounded-r-2xl p-6 flex md:flex-col gap-4 items-center md:items-stretch md:sticky md:top-0">
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold">ProofOfWork</h1>
            <p className="text-sm text-gray-500">Worker Dashboard</p>
          </div>

          <div className="w-full mt-2">
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-bold">{profile?.display_name || "Worker"}</h3>
              <p className="text-sm text-gray-600">
                Concordium DID:{" "}
                <span className={profile?.concordium_did ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {profile?.concordium_did ? "Verified" : "Not verified"}
                </span>
              </p>
            </div>
          </div>

          <nav className="w-full flex md:flex-col gap-2 items-center md:items-stretch">
            <button
              onClick={() => router.push("/dashboard/worker")}
              className={`w-full p-3 rounded-lg text-left transition-colors ${typeof window !== "undefined" && window.location.pathname === "/dashboard/worker"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-50"
                }`}
            >
              Home
            </button>

            <div
              className="relative w-full"
              onMouseEnter={handleNotificationMouseEnter}
              onMouseLeave={handleNotificationMouseLeave}
            >
              <button className="w-full p-3 rounded-lg hover:bg-gray-50 flex items-center justify-between transition-colors">
                <span>Notifications</span>
                <span className="relative inline-block">
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unseenCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-green-600 text-white text-[10px] flex items-center justify-center">
                      {unseenCount}
                    </span>
                  )}
                </span>
              </button>

              {showNotifications && (
                <div className="absolute z-20 left-full md:left-0 md:right-auto md:top-full md:mt-2 top-0 ml-2 md:ml-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200">
                  <div className="p-3 border-b border-gray-100 font-semibold">Notifications</div>
                  <ul className="max-h-72 overflow-auto">
                    {notifs.length === 0 ? (
                      <li className="p-4 text-sm text-gray-500">No notifications</li>
                    ) : (
                      notifs.map((n) => (
                        <li key={n.id} className="p-4 text-sm hover:bg-gray-50">
                          <p className="text-gray-800">{n.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                          {n.type === "assignment" && (
                            <div className="mt-2 flex gap-2">
                              <button className="bg-green-600 text-white py-1 px-3 rounded-lg text-xs hover:bg-blue-700 transition">Accept</button>
                              <button className="border border-gray-300 py-1 px-3 rounded-lg text-xs hover:bg-gray-50">Reject</button>
                            </div>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push("/dashboard/profile")}
              className={`w-full p-3 rounded-lg text-left transition-colors ${typeof window !== "undefined" && window.location.pathname === "/dashboard/profile"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-50"
                }`}
            >
              Profile
            </button>
            <button
              onClick={() => router.push("/dashboard/settings")}
              className={`w-full p-3 rounded-lg text-left transition-colors ${typeof window !== "undefined" && window.location.pathname === "/dashboard/settings"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-50"
                }`}
            >
              Settings
            </button>
          </nav>
        </aside>

        {/* MAIN */}
        <section className="flex-1 p-6 md:p-10 pt-24 md:pt-28 lg:pt-32">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-bold">My Jobs</h2>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
                <p className="text-gray-600 mb-2">No jobs assigned yet.</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {jobs.map((job) => {
                  const { lat, lng } = toLatLng(job.location);
                  return (
                    <li key={job.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">{job.title || "Untitled job"}</h3>
                          <p className="text-gray-600">{job.description || "—"}</p>
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            <div><span className="text-gray-500">Amount (PLT): </span><span className="font-semibold">{job.amount_plt ?? "—"}</span></div>
                            <div><span className="text-gray-500">Radius (m): </span><span className="font-semibold">{job.radius_m ?? "—"}</span></div>
                            <div><span className="text-gray-500">Status: </span><span className="font-semibold capitalize">{job.status}</span></div>
                            <div className="col-span-2">
                              <span className="text-gray-500">Location: </span>
                              <span className="font-mono">
                                {lat !== undefined && lng !== undefined ? `${lat.toFixed(3)}, ${lng.toFixed(3)}` : "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:w-60 shrink-0 flex flex-col gap-2">
                          <button
                            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition text-center"
                            onClick={() => markFinished(job.id)}
                          >
                            Mark job as finished
                          </button>
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
