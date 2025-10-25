// app/create_job/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    // mock worker list
    setWorkers([
      { id: "w1", display_name: "Sam Walker" },
      { id: "w2", display_name: "Jess Cleaner" },
    ]);
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

    setBusy(true);
    try {
      // Geocode postcode using postcodes.io (server-side route could be added later)
      const geoRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`);
      if (!geoRes.ok) throw new Error("Invalid postcode");
      const data = await geoRes.json();
      const lat = data?.result?.latitude;
      const lng = data?.result?.longitude;
      if (typeof lat !== "number" || typeof lng !== "number") throw new Error("Could not resolve location");

      // Mock job creation
      console.log("Creating job:", {
        title,
        description,
        amount_plt: parsedAmount,
        location: { lat, lng },
        radius_m: parsedRadius,
        worker_id: assignedWorkerId || null,
      });

      alert("Job created successfully!");
      router.push("/business_dashboard");
    } catch (err: any) {
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
          <a href="/business_dashboard" className="text-blue-600 hover:underline">Back to Dashboard</a>
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