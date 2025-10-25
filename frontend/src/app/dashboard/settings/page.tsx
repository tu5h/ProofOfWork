
// app/dashboard/settings/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type UUID2 = string;

type Profile2 = {
  id: UUID2;
  role?: "worker" | "business" | "admin" | null;
  display_name?: string | null;
  concordium_did?: boolean | null;
};

type Notification2 = { id: string; type: "assignment" | "info"; message: string; created_at: string };

const MOCK_PROFILE2: Profile2 = { id: "w000...1", role: "worker", display_name: "Sam Walker", concordium_did: true };
const MOCK_NOTIFS2: Notification2[] = [
  { id: "n1", type: "info", message: "Remember to verify location when finishing jobs.", created_at: new Date().toISOString() },
];

export default function DashboardSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile2 | null>(null);
  const [notifs, setNotifs] = useState<Notification2[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setProfile(MOCK_PROFILE2);
      setNotifs(MOCK_NOTIFS2);
      setLoading(false);
    }, 150);
  }, []);

  const unseenCount = useMemo(() => notifs.length, [notifs]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blue-50/40">
      <div className="min-h-screen flex">
        {/* SIDEBAR (same as worker dashboard style) */}
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
            <a href="/dashboard/worker" className="w-full p-3 rounded-lg hover:bg-gray-50 text-left">Home</a>
            <a href="/dashboard/profile" className="w-full p-3 rounded-lg hover:bg-gray-50 text-left">Profile</a>
            <a href="/dashboard/settings" className="w-full p-3 rounded-lg text-left bg-blue-50 text-blue-700 font-medium">Settings</a>

            {/* Notifications with hover tray */}
            <div className="relative group w-full">
              <button className="w-full p-3 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                <span>Notifications</span>
                <span className="relative inline-block">
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unseenCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-green-600 text-white text-[10px] flex items-center justify-center">{unseenCount}</span>
                  )}
                </span>
              </button>
              <div className="hidden group-hover:block absolute z-20 left-full md:left-0 md:top-full md:mt-2 top-0 ml-2 md:ml-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200">
                <div className="p-3 border-b border-gray-100 font-semibold">Notifications</div>
                <ul className="max-h-72 overflow-auto">
                  {notifs.length === 0 ? (
                    <li className="p-4 text-sm text-gray-500">No notifications</li>
                  ) : (
                    notifs.map((n) => (
                      <li key={n.id} className="p-4 text-sm hover:bg-gray-50">
                        <p className="text-gray-800">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </nav>
        </aside>

        {/* MAIN */}
        <section className="flex-1 p-6 md:p-10 pt-24 md:pt-28 lg:pt-32">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Settings</h2>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-red-100">
              <h3 className="text-xl font-bold mb-2 text-red-700">Danger Zone</h3>
              <p className="text-gray-600 mb-4">Deleting your account is permanent. This will remove your profile and revoke access to assigned jobs.</p>
              <button className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition">Delete account</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
