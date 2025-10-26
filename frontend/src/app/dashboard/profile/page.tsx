// app/dashboard/profile/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type UUID = string;

type Profile = {
  id: UUID;
  role?: "worker" | "business" | "admin" | null;
  display_name?: string | null;
  email?: string | null;
  concordium_account?: string | null;
  concordium_did?: boolean | null;
};

type Notification = {
  id: string;
  type: "assignment" | "info";
  message: string;
  created_at: string;
};

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
  return data as T;
}

export default function DashboardProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifs, setNotifs] = useState<Notification[]>([]);

  // form fields (UI only)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [ccd, setCcd] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // Hook these up to your backend
        // 1) Load current user
        const me = await fetchJSON<Profile>("/api/me");
        setProfile(me);
        setName(me.display_name || "");
        setEmail(me.email || "");
        setCcd(me.concordium_account || "");

        // 2) Load notifications
        const ns = await fetchJSON<Notification[]>("/api/worker/notifications");
        setNotifs(Array.isArray(ns) ? ns : []);
      } catch {
        // render empty if calls fail
      } finally {
        setLoading(false);
      }
    })();
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
              <p className="text-sm text-gray-600">
                Concordium DID:{" "}
                <span className={profile?.concordium_did ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {profile?.concordium_did ? "Verified" : "Not verified"}
                </span>
              </p>
            </div>
          </div>

          <nav className="w-full flex md:flex-col gap-2 items-center md:items-stretch">
            <a href="/dashboard/worker" className="w-full p-3 rounded-lg hover:bg-gray-50 text-left">Home</a>
            <a href="/dashboard/profile" className="w-full p-3 rounded-lg text-left bg-blue-50 text-blue-700 font-medium">Profile</a>
            <a href="/dashboard/settings" className="w-full p-3 rounded-lg hover:bg-gray-50 text-left">Settings</a>

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
            </div>
          </nav>
        </aside>

        {/* MAIN */}
        <section className="flex-1 p-6 md:p-10 pt-24 md:pt-28 lg:pt-32">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Profile</h2>

            {/* Account info */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Account</h3>
              <div className="flex flex-col gap-3">
                <label className="text-sm text-gray-600">Email</label>
                <input className="border border-gray-300 p-3 rounded-lg text-lg bg-gray-50" value={email} readOnly />

                <label className="text-sm text-gray-600 mt-2">Display name</label>
                <input className="border border-gray-300 p-3 rounded-lg text-lg" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />

                <div className="flex justify-end mt-2">
                  <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">Save name</button>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Change password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="password" className="border border-gray-300 p-3 rounded-lg text-lg" placeholder="Current password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                <input type="password" className="border border-gray-300 p-3 rounded-lg text-lg" placeholder="New password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                <input type="password" className="border border-gray-300 p-3 rounded-lg text-lg" placeholder="Confirm new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
              </div>
              <div className="flex justify-end mt-3">
                <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">Update password</button>
              </div>
            </div>

            {/* Concordium ID */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">Concordium Identity</h3>
              <p className="text-gray-600 text-sm mb-3">Connect your Concordium ID to become verified.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className="border border-gray-300 p-3 rounded-lg text-lg md:col-span-2" placeholder="Concordium account address" value={ccd} onChange={(e) => setCcd(e.target.value)} />
                <button className="bg-green-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 transition">Add / Verify</button>
              </div>
              {profile?.concordium_did && (
                <p className="text-sm text-green-700 mt-2">Status: Verified</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
