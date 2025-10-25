"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UUID = string;

type Profile = {
  id: UUID;
  role?: "business" | "worker" | "admin" | null;
  display_name?: string | null;
  concordium_account?: string | null;
  concordium_did?: boolean | null;
  business?: { id: UUID; company_name: string } | null;
};

type Worker = { id: UUID; display_name?: string | null };

type JobStatus = "open" | "in_progress" | "completed" | "paid" | "cancelled";
type EscrowStatus = "none" | "held" | "released" | "failed";

type Job = {
  id: UUID;
  business_id: UUID;
  worker_id?: UUID | null;
  title?: string | null;
  description?: string | null;
  amount_plt?: number | null;
  location?: { lat: number; lng: number } | null;
  radius_m?: number | null;
  status: JobStatus;
  created_at?: string | null;
  updated_at?: string | null;
  escrow?: { status: EscrowStatus; tx_hash?: string | null; simulated?: boolean | null; updated_at?: string | null } | null;
  release_if_nearby?: boolean;
};

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
  return data as T;
}

export default function BusinessDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const businessId = useMemo(() => profile?.business?.id ?? null, [profile]);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetchJSON<Profile>("/api/me");
        setProfile(me);
        const ws = await fetchJSON<Worker[]>("/api/workers");
        setWorkers(ws);
        if (me.business?.id) {
          const js = await fetchJSON<Job[]>(`/api/jobs?businessId=${me.business.id}`);
          setJobs(js);
        }
      } catch (err: any) {
        alert(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const reloadJobs = async () => {
    if (!businessId) return;
    const js = await fetchJSON<Job[]>(`/api/jobs?businessId=${businessId}`);
    setJobs(js);
  };

  const handleAssignWorker = async (jobId: UUID, workerId: UUID) => {
    await fetchJSON(`/api/jobs/${jobId}/assign-worker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worker_id: workerId || null }),
    });
    await reloadJobs();
  };

  const handleSimulateEscrowRelease = async (jobId: UUID) => {
    const res = await fetchJSON<{ status: string; tx_hash?: string }>(`/api/escrow/release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId, simulate: true }),
    });
    alert(`Escrow ${res.status}${res.tx_hash ? ` • tx: ${res.tx_hash}` : ""}`);
    await reloadJobs();
  };

  const handleToggleReleaseIfNearby = async (jobId: UUID, value: boolean) => {
    await fetchJSON(`/api/jobs/${jobId}/release-if-nearby`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ release_if_nearby: value }),
    });
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
          <a href="/register" className="bg-green-600 text-white py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition inline-block">
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
              <h3 className="text-lg font-bold">{profile?.business?.company_name || "Your Company"}</h3>
              <p className="text-sm text-gray-600">Owner: {profile?.display_name || "—"}</p>
              <p className="text-xs text-gray-600">
                DID: <span className={profile?.concordium_did ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {profile?.concordium_did ? "Verified" : "Not verified"}
                </span>
              </p>
            </div>
          </div>

          <nav className="w-full flex md:flex-col gap-2">
            <button 
              onClick={() => router.push("/dashboard/business")}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                typeof window !== 'undefined' && window.location.pathname === "/dashboard/business" 
                  ? "bg-blue-100 text-blue-700" 
                  : "hover:bg-gray-50"
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => router.push("/dashboard/profile")}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                typeof window !== 'undefined' && window.location.pathname === "/dashboard/profile" 
                  ? "bg-blue-100 text-blue-700" 
                  : "hover:bg-gray-50"
              }`}
            >
              Profile
            </button>
            <button 
              onClick={() => router.push("/dashboard/settings")}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                typeof window !== 'undefined' && window.location.pathname === "/dashboard/settings" 
                  ? "bg-blue-100 text-blue-700" 
                  : "hover:bg-gray-50"
              }`}
            >
              Settings
            </button>
            <a href="/dashboard/business/create_job" className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-blue-700 transition text-center">
              + Create Job
            </a>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 p-6 md:p-10 pt-24 md:pt-28 lg:pt-32">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-bold">Jobs</h2>
              <div className="flex items-center gap-2">
                <a href="/dashboard/business/create_job" className="hidden md:inline-block bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                  + Create Job
                </a>
                <button className="text-sm text-blue-600 underline" onClick={reloadJobs}>Refresh</button>
              </div>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
                <p className="text-gray-600 mb-4">No jobs yet.</p>
                <a href="/dashboard/business/create_job" className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition inline-block">
                  Create your first job
                </a>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {jobs.map((job) => (
                  <li key={job.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{job.title || "Untitled job"}</h3>
                        <p className="text-gray-600">{job.description || "—"}</p>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <div><span className="text-gray-500">Amount (PLT): </span><span className="font-semibold">{job.amount_plt ?? "—"}</span></div>
                          <div><span className="text-gray-500">Radius (m): </span><span className="font-semibold">{job.radius_m ?? "—"}</span></div>
                          <div><span className="text-gray-500">Status: </span><span className="font-semibold capitalize">{job.status}</span></div>
                          <div className="col-span-2"><span className="text-gray-500">Location: </span><span className="font-mono">{job.location ? `${job.location.lat}, ${job.location.lng}` : "—"}</span></div>
                          <div><span className="text-gray-500">Worker: </span><span className="font-semibold">{job.worker_id ? (workers.find((w) => w.id === job.worker_id)?.display_name || job.worker_id) : "Unassigned"}</span></div>
                          <div><span className="text-gray-500">Escrow: </span><span className="font-semibold">{job.escrow?.status ?? "none"}</span></div>
                        </div>
                      </div>

                      <div className="w-full md:w-60 shrink-0 flex flex-col gap-2">
                        <label className="flex items-center gap-2 border border-gray-200 p-2 rounded-lg">
                          <input
                            type="checkbox"
                            checked={!!job.release_if_nearby}
                            onChange={(e) => handleToggleReleaseIfNearby(job.id, e.target.checked)}
                          />
                          <span className="text-sm">Release payment if worker is nearby</span>
                        </label>

                        <select
                          className="border border-gray-300 p-2 rounded-lg text-sm"
                          value={job.worker_id || ""}
                          onChange={(e) => handleAssignWorker(job.id, e.target.value as UUID)}
                        >
                          <option value="">Assign worker…</option>
                          {workers.map((w) => (
                            <option key={w.id} value={w.id}>{w.display_name || w.id}</option>
                          ))}
                        </select>

                        <button
                          className="bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                          onClick={() => handleSimulateEscrowRelease(job.id)}
                        >
                          Simulate Release
                        </button>

                        <a href={`/jobs/${job.id}`} className="text-center border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50">
                          View Job
                        </a>
                      </div>
                    </div>

                    {job.escrow?.tx_hash ? (
                      <p className="text-xs text-gray-500 mt-2 break-all">tx: {job.escrow.tx_hash}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
