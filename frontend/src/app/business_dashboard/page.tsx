"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Business Dashboard (Sidebar + Jobs List Only, Mocked)
 * - Replaces center divider with a left sidebar
 * - Sidebar buttons: Profile, Settings, Create Job
 * - Main area shows ONLY the list of current jobs
 * - Each job has a checkbox: "Release payment if worker is nearby"
 * - "Create Job" navigates to /jobs/new (page to be built later)
 * - Keeps your color theme & coding style (Tailwind + simple handlers)
 */

type UUID = string;

type Profile = {
  id: UUID;
  role?: "business" | "worker" | "admin" | null;
  display_name?: string | null;
  concordium_account?: string | null;
  concordium_did?: boolean | null;
  business?: {
    id: UUID;
    company_name: string;
  } | null;
};

type Worker = {
  id: UUID;
  display_name?: string | null;
};

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
  escrow?: {
    status: EscrowStatus;
    tx_hash?: string | null;
    simulated?: boolean | null;
    updated_at?: string | null;
  } | null;
  // New per-job flag for MVP UI control
  release_if_nearby?: boolean;
};

type BusinessRules = {
  require_on_site: boolean;
  min_radius_m?: number | null;
  accepted_region?: string | null;
};

// -----------------------------
// Mock API (frontend only)
// -----------------------------

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let MOCK_DB = {
  me: {
    id: "11111111-1111-1111-1111-111111111111",
    role: "business" as const,
    display_name: "Ava Business Owner",
    concordium_account: "4t8C…ConcordiumAcct",
    concordium_did: true,
    business: {
      id: "b0000000-0000-0000-0000-000000000001",
      company_name: "Pawfect Walks Ltd",
    },
  } as Profile,
  workers: [
    { id: "w0000000-0000-0000-0000-000000000001", display_name: "Sam Walker" },
    { id: "w0000000-0000-0000-0000-000000000002", display_name: "Jess Cleaner" },
  ] as Worker[],
  jobs: [
    {
      id: "j0000000-0000-0000-0000-000000000001",
      business_id: "b0000000-0000-0000-0000-000000000001",
      worker_id: null,
      title: "Dog walk - NW1",
      description: "30 min walk around Regent's Park",
      amount_plt: 25,
      location: { lat: 51.531, lng: -0.155 },
      radius_m: 60,
      status: "open",
      created_at: new Date().toISOString(),
      escrow: { status: "held", simulated: true, updated_at: new Date().toISOString() },
      release_if_nearby: true,
    },
    {
      id: "j0000000-0000-0000-0000-000000000002",
      business_id: "b0000000-0000-0000-0000-000000000001",
      worker_id: "w0000000-0000-0000-0000-000000000001",
      title: "Flat clean - W1",
      description: "1 bed deep clean",
      amount_plt: 70,
      location: { lat: 51.515, lng: -0.141 },
      radius_m: 80,
      status: "in_progress",
      created_at: new Date().toISOString(),
      escrow: { status: "held", simulated: true, updated_at: new Date().toISOString() },
      release_if_nearby: false,
    },
  ] as Job[],
  rules: {
    require_on_site: true,
    min_radius_m: 25,
    accepted_region: "London",
  } as BusinessRules,
};

const mockApi = {
  async getMe(): Promise<Profile> {
    await delay(200);
    return JSON.parse(JSON.stringify(MOCK_DB.me));
  },
  async getWorkers(): Promise<Worker[]> {
    await delay(200);
    return JSON.parse(JSON.stringify(MOCK_DB.workers));
  },
  async getJobs(businessId: UUID): Promise<Job[]> {
    await delay(250);
    return MOCK_DB.jobs
      .filter((j) => j.business_id === businessId)
      .map((j) => JSON.parse(JSON.stringify(j)));
  },
  async assignWorker(jobId: UUID, worker_id: UUID | null): Promise<{ ok: true }> {
    await delay(200);
    const j = MOCK_DB.jobs.find((x) => x.id === jobId);
    if (!j) throw new Error("Job not found");
    j.worker_id = worker_id || null;
    j.updated_at = new Date().toISOString();
    return { ok: true };
  },
  async simulateEscrowRelease(jobId: UUID): Promise<{ status: EscrowStatus; tx_hash?: string; simulated: boolean }> {
    await delay(350);
    const j = MOCK_DB.jobs.find((x) => x.id === jobId);
    if (!j) throw new Error("Job not found");
    j.escrow = {
      status: "released",
      tx_hash: `0x${Math.random().toString(16).slice(2).padEnd(16, "0")}`,
      simulated: true,
      updated_at: new Date().toISOString(),
    };
    j.status = "paid";
    return { status: j.escrow.status, tx_hash: j.escrow.tx_hash!, simulated: true };
  },
  async setReleaseIfNearby(jobId: UUID, value: boolean): Promise<{ ok: true }> {
    await delay(150);
    const j = MOCK_DB.jobs.find((x) => x.id === jobId);
    if (!j) throw new Error("Job not found");
    j.release_if_nearby = value;
    j.updated_at = new Date().toISOString();
    return { ok: true };
  },
};

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
        const me = await mockApi.getMe();
        setProfile(me);
        const ws = await mockApi.getWorkers();
        setWorkers(ws);
        if (me.business?.id) {
          const js = await mockApi.getJobs(me.business.id);
          setJobs(js);
        }
      } catch (err: any) {
        alert(err?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const reloadJobs = async () => {
    if (!businessId) return;
    const js = await mockApi.getJobs(businessId);
    setJobs(js);
  };

  const handleAssignWorker = async (jobId: UUID, workerId: UUID) => {
    await mockApi.assignWorker(jobId, workerId);
    await reloadJobs();
  };

  const handleSimulateEscrowRelease = async (jobId: UUID) => {
    const res = await mockApi.simulateEscrowRelease(jobId);
    alert(`Escrow ${res.status}. tx: ${res.tx_hash}`);
    await reloadJobs();
  };

  const handleToggleReleaseIfNearby = async (jobId: UUID, value: boolean) => {
    await mockApi.setReleaseIfNearby(jobId, value);
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
          <a href="/register" className="bg-green-600 text-white py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition inline-block">Create Business Profile</a>
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
              <p className="text-xs text-gray-600">DID: <span className={profile?.concordium_did ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{profile?.concordium_did ? "Verified" : "Not verified"}</span></p>
            </div>
          </div>

          <nav className="w-full flex md:flex-col gap-2">
            <button className="w-full border border-gray-200 p-3 rounded-lg hover:bg-gray-50 text-left">Profile</button>
            <button className="w-full border border-gray-200 p-3 rounded-lg hover:bg-gray-50 text-left">Settings</button>
            <button
              onClick={() => router.push("/jobs/new")}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
            >
              + Create Job
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 p-6 md:p-10 pt-24 md:pt-28 lg:pt-32">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-bold">Jobs</h2>
              <div className="flex items-center gap-2">
                <a href="/jobs/new" className="hidden md:inline-block bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">+ Create Job</a>
                <button className="bg-white border border-gray-200 p-3 rounded-lg hover:bg-gray-50 text-left" onClick={reloadJobs}>Refresh</button>
              </div>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
                <p className="text-gray-600 mb-4">No jobs yet.</p>
                <a href="/jobs/new" className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition inline-block">Create your first job</a>
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
                        {/* Per-job flag */}
                        <label className="flex items-center gap-2 border border-gray-200 p-2 rounded-lg">
                          <input
                            type="checkbox"
                            checked={!!job.release_if_nearby}
                            onChange={(e) => handleToggleReleaseIfNearby(job.id, e.target.checked)}
                          />
                          <span className="text-sm">Release payment if worker is nearby</span>
                        </label>

                        {/* Assign/Change worker */}
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

                        {/* Simulate escrow release (demo) */}
                        <button
                          className="bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                          onClick={() => handleSimulateEscrowRelease(job.id)}
                        >
                          Simulate Release
                        </button>

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
