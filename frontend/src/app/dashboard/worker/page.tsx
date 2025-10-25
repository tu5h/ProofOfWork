// app/dashboard/worker/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UUID = string;

type Profile = {
  id: UUID;
  role?: "worker" | "business" | "admin" | null;
  display_name?: string | null;
  concordium_account?: string | null;
  concordium_did?: boolean | null;
};

type JobStatus = "open" | "in_progress" | "completed" | "paid" | "cancelled";

type Job = {
  id: UUID;
  title?: string | null;
  description?: string | null;
  amount_plt?: number | null;
  location?: { lat: number; lng: number } | null;
  radius_m?: number | null;
  status: JobStatus;
  release_if_nearby?: boolean;
};

type Notification = {
  id: string;
  type: "assignment" | "info";
  message: string;
  jobId?: UUID;
  created_at: string;
};

const MOCK_PROFILE: Profile = {
  id: "w0000000-0000-0000-0000-000000000001",
  role: "worker",
  display_name: "Sam Walker",
  concordium_account: "4t8C…WorkerAcct",
  concordium_did: true,
};

const MOCK_JOBS: Job[] = [
  {
    id: "j0000000-0000-0000-0000-000000000002",
    title: "Flat clean",
    description: "1 bed deep clean",
    amount_plt: 70,
    location: { lat: 51.515, lng: -0.141 },
    radius_m: 80,
    status: "in_progress",
    release_if_nearby: true,
  },
  {
    id: "j0000000-0000-0000-0000-000000000003",
    title: "Dog walk",
    description: "30 min afternoon walk",
    amount_plt: 25,
    location: { lat: 51.531, lng: -0.155 },
    radius_m: 60,
    status: "open",
    release_if_nearby: false,
  },
];

const MOCK_NOTIFS: Notification[] = [
  {
    id: "n1",
    type: "assignment",
    message: "Pawfect Walks assigned you a new job: Dog walk",
    jobId: "j0000000-0000-0000-0000-000000000003",
    created_at: new Date().toISOString(),
  },
  {
    id: "n2",
    type: "info",
    message: "Payment will auto-release when you finish within the geofence.",
    created_at: new Date().toISOString(),
  },
];

export default function WorkerDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTimer, setNotificationTimer] = useState<NodeJS.Timeout | null>(null);

  const handleNotificationMouseEnter = () => {
    if (notificationTimer) {
      clearTimeout(notificationTimer);
      setNotificationTimer(null);
    }
    setShowNotifications(true);
  };

  const handleNotificationMouseLeave = () => {
    const timer = setTimeout(() => {
      setShowNotifications(false);
    }, 200);
    setNotificationTimer(timer);
  };

  useEffect(() => {
    setTimeout(() => {
      setProfile(MOCK_PROFILE);
      setJobs(MOCK_JOBS);
      setNotifs(MOCK_NOTIFS);
      setLoading(false);
    }, 250);
  }, []);

  const unseenCount = useMemo(() => notifs.length, [notifs]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blue-50/40">
      <div className="min-h-screen flex">
        <aside className="w-full md:w-64 bg-white shadow-xl md:rounded-r-2xl p-6 flex md:flex-col gap-4 items-center md:items-stretch md:sticky md:top-0">
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold">ProofOfWork</h1>
            <p className="text-sm text-gray-500">Worker Dashboard</p>
          </div>

          <div className="w-full mt-2">
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-bold">{profile?.display_name || "Worker"}</h3>
              <p className="text-sm text-gray-600">Concordium DID: <span className={profile?.concordium_did ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{profile?.concordium_did ? "Verified" : "Not verified"}</span></p>
            </div>
          </div>

          <nav className="w-full flex md:flex-col gap-2 items-center md:items-stretch">
            <button 
              onClick={() => router.push("/dashboard/worker")}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                typeof window !== 'undefined' && window.location.pathname === "/dashboard/worker" 
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
          </nav>
        </aside>

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
                          <div><span className="text-gray-500">Auto-release: </span><span className="font-semibold">{job.release_if_nearby ? "Enabled" : "Disabled"}</span></div>
                        </div>
                      </div>

                      <div className="w-full md:w-60 shrink-0 flex flex-col gap-2">
                        <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition text-center" onClick={() => alert("Marking as finished… (this will check location via Supabase RPC in the real app)")}>Mark job as finished</button>
                      </div>
                    </div>
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