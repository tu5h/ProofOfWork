// app/create_job/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// ⬇️ Use the SAME import path you use in navbar.tsx
import { supabase } from "@/lib/supabaseClient";

type UUID = string;

type Worker = { id: UUID; display_name?: string | null };

export default function CreateJobPage() {
  const router = useRouter();

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amountPlt, setAmountPlt] = useState<string>("");
  const [postcode, setPostcode] = useState("");
  const [radiusM, setRadiusM] = useState<string>("");
  const [assignedWorkerId, setAssignedWorkerId] = useState<string>("");

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [busy, setBusy] = useState(false);

  // Resolve current business id from auth (businesses.id == auth.uid())
  const [businessId, setBusinessId] = useState<UUID | null>(null);

  useEffect(() => {
    (async () => {
      // Who is logged in?
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id || null;
      setBusinessId(uid);

      // Load workers for dropdown (joined with profiles for display_name)
      const { data: workerRows, error } = await supabase
        .from("workers")
        .select("id, profiles(display_name)")
        .returns<any[]>();

      if (!error && workerRows) {
        setWorkers(
          workerRows.map((w) => ({
            id: w.id as UUID,
            display_name: w.profiles?.display_name ?? null,
          }))
        );
      } else {
        setWorkers([]); // keep UI happy even if read fails
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const parsedAmount = Number(amountPlt);
    const parsedRadius = Number(radiusM);

    if (!title.trim()) return alert("Please enter a title");
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return alert("Amount must be a positive number");
    if (!postcode.trim()) return alert("Please enter a postcode");
    if (Number.isNaN(parsedRadius) || parsedRadius <= 0) return alert("Radius must be a positive number");
    if (!businessId) return alert("Not signed in");

    setBusy(true);
    try {
      // 1) Geocode postcode client-side (postcodes.io allows CORS)
      const geoRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`);
      if (!geoRes.ok) throw new Error("Invalid postcode");
      const data = await geoRes.json();
      const lat = data?.result?.latitude;
      const lng = data?.result?.longitude;
      if (typeof lat !== "number" || typeof lng !== "number") throw new Error("Could not resolve location");

      // 2) Insert the job into Supabase
      //    Store location as GeoJSON Point so your dashboard can read it directly.
      const ewkt = `SRID=4326;POINT(${lng} ${lat})`;
      const { error: insertErr } = await supabase.from("jobs").insert({
        business_id: businessId,
        worker_id: assignedWorkerId || null,
        title: title.trim(),
        description: description.trim() || null,
        amount_plt: parsedAmount,
        radius_m: parsedRadius,
        location: ewkt, // Store as EWKT (PostGIS) string
        // status: "open", // optional — if your table has a default, you can omit
      });

      if (insertErr) throw insertErr;

      alert("Job created successfully!");
      router.push("/dashboard/business");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-blue-50/40 pt-24 md:pt-28 lg:pt-32">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">Create Job</h1>
          <a href="/dashboard/business" className="text-blue-600 hover:underline">Back to Dashboard</a>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="border border-gray-300 p-3 rounded-lg text-lg"
            placeholder="Job title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="border border-gray-300 p-3 rounded-lg text-lg"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="border border-gray-300 p-3 rounded-lg text-lg"
              placeholder="Amount (PLT)"
              value={amountPlt}
              onChange={(e) => setAmountPlt(e.target.value)}
              inputMode="decimal"
            />

            <select
              className="border border-gray-300 p-3 rounded-lg text-lg"
              value={assignedWorkerId}
              onChange={(e) => setAssignedWorkerId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.display_name || w.id}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="border border-gray-300 p-3 rounded-lg text-lg"
              placeholder="Postcode (e.g. NW1 4NR)"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
            <input
              className="border border-gray-300 p-3 rounded-lg text-lg"
              placeholder="Radius (m)"
              value={radiusM}
              onChange={(e) => setRadiusM(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <button
            disabled={busy}
            className="bg-green-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create Job"}
          </button>

          <p className="text-xs text-gray-500 mt-1">
            Postcode is automatically converted to latitude and longitude.
          </p>
        </form>
      </div>
    </main>
  );
}
