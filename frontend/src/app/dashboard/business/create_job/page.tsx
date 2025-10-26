"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type UUID = string;

type Worker = { id: UUID; display_name?: string | null };

type PaymentRules = {
  require_location_verification: boolean;
  allowed_completion_zones: Array<{ lat: number; lng: number; radius_m: number }>;
  require_business_approval: boolean;
  auto_release_on_completion: boolean;
};

export default function CreateJobPage() {
  const router = useRouter();

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amountPlt, setAmountPlt] = useState<string>("");
  const [postcode, setPostcode] = useState("");
  const [radiusM, setRadiusM] = useState<string>("");
  const [assignedWorkerId, setAssignedWorkerId] = useState<string>("");

  // Payment rules state
  const [requireLocationVerification, setRequireLocationVerification] = useState(true);
  const [requireBusinessApproval, setRequireBusinessApproval] = useState(false);
  const [autoReleaseOnCompletion, setAutoReleaseOnCompletion] = useState(false);
  const [useCompletionZones, setUseCompletionZones] = useState(false);
  const [completionZones, setCompletionZones] = useState<Array<{ postcode: string; radius_m: string }>>([
    { postcode: "", radius_m: "" }
  ]);

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [busy, setBusy] = useState(false);
  const [businessId, setBusinessId] = useState<UUID | null>(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id || null;
      setBusinessId(uid);

      const { data: workerRows, error } = await supabase
        .from("workers")
        .select(`
          id,
          profiles (
            id,
            display_name
          )
        `);

      if (!error && workerRows) {
        const ws: Worker[] = workerRows.map((w: any) => ({
          id: w.id,
          display_name: w.profiles?.display_name || null,
        }));
        setWorkers(ws);
      } else {
        setWorkers([]);
      }
    })();
  }, []);

  const addCompletionZone = () => {
    setCompletionZones([...completionZones, { postcode: "", radius_m: "" }]);
  };

  const removeCompletionZone = (index: number) => {
    setCompletionZones(completionZones.filter((_, i) => i !== index));
  };

  const updateCompletionZone = (index: number, field: 'postcode' | 'radius_m', value: string) => {
    const updated = [...completionZones];
    updated[index][field] = value;
    setCompletionZones(updated);
  };

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
    if (!businessId) return alert("Not signed in");

    setBusy(true);
    try {
      // Geocode main postcode
      const geoRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`);
      if (!geoRes.ok) throw new Error("Invalid postcode");
      const data = await geoRes.json();
      const lat = data?.result?.latitude;
      const lng = data?.result?.longitude;
      if (typeof lat !== "number" || typeof lng !== "number") throw new Error("Could not resolve location");

      // Build payment rules
      const paymentRules: PaymentRules = {
        require_location_verification: requireLocationVerification,
        require_business_approval: requireBusinessApproval,
        auto_release_on_completion: autoReleaseOnCompletion,
        allowed_completion_zones: [],
      };

      // Geocode completion zones if enabled
      if (useCompletionZones) {
        for (const zone of completionZones) {
          if (zone.postcode.trim() && zone.radius_m.trim()) {
            const zoneRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(zone.postcode.trim())}`);
            if (zoneRes.ok) {
              const zoneData = await zoneRes.json();
              const zoneLat = zoneData?.result?.latitude;
              const zoneLng = zoneData?.result?.longitude;
              const zoneRadius = Number(zone.radius_m);
              
              if (typeof zoneLat === "number" && typeof zoneLng === "number" && !Number.isNaN(zoneRadius)) {
                paymentRules.allowed_completion_zones.push({
                  lat: zoneLat,
                  lng: zoneLng,
                  radius_m: zoneRadius,
                });
              }
            }
          }
        }
      }

      const ewkt = `SRID=4326;POINT(${lng} ${lat})`;
      const { error: insertErr } = await supabase.from("jobs").insert({
        business_id: businessId,
        worker_id: assignedWorkerId || null,
        title: title.trim(),
        description: description.trim() || null,
        amount_plt: parsedAmount,
        radius_m: parsedRadius,
        location: ewkt,
        payment_rules: paymentRules,
      });

      if (insertErr) throw insertErr;

      if (insertErr) throw insertErr;

      alert("Job created successfully!");
      router.push("/dashboard/business");
      router.push("/dashboard/business");
    } catch (err: any) {
      console.error(err);
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
          <a href="/dashboard/business" className="text-blue-600 hover:underline">Back to Dashboard</a>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Basic Job Info */}
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

          {/* Payment Rules Section */}
          <div className="border-t pt-4 mt-2">
            <h3 className="text-xl font-bold mb-3">Payment Release Rules</h3>
            
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={requireLocationVerification}
                  onChange={(e) => setRequireLocationVerification(e.target.checked)}
                  className="w-5 h-5"
                />
                <div>
                  <span className="font-medium">Require Location Verification</span>
                  <p className="text-sm text-gray-600">Worker must be at the job location to complete</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={requireBusinessApproval}
                  onChange={(e) => setRequireBusinessApproval(e.target.checked)}
                  className="w-5 h-5"
                />
                <div>
                  <span className="font-medium">Require Manual Approval</span>
                  <p className="text-sm text-gray-600">Payment requires your explicit approval</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={autoReleaseOnCompletion}
                  onChange={(e) => setAutoReleaseOnCompletion(e.target.checked)}
                  className="w-5 h-5"
                />
                <div>
                  <span className="font-medium">Auto-Release Payment</span>
                  <p className="text-sm text-gray-600">Automatically release payment when conditions are met</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={useCompletionZones}
                  onChange={(e) => setUseCompletionZones(e.target.checked)}
                  className="w-5 h-5"
                />
                <div>
                  <span className="font-medium">Restrict Completion Zones</span>
                  <p className="text-sm text-gray-600">Only allow completion in specific areas</p>
                </div>
              </label>

              {useCompletionZones && (
                <div className="ml-8 border-l-2 border-blue-200 pl-4 space-y-3">
                  <p className="text-sm text-gray-600 font-medium">Allowed Completion Zones:</p>
                  {completionZones.map((zone, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        className="border border-gray-300 p-2 rounded-lg text-sm flex-1"
                        placeholder="Postcode"
                        value={zone.postcode}
                        onChange={(e) => updateCompletionZone(index, 'postcode', e.target.value)}
                      />
                      <input
                        className="border border-gray-300 p-2 rounded-lg text-sm w-24"
                        placeholder="Radius (m)"
                        value={zone.radius_m}
                        onChange={(e) => updateCompletionZone(index, 'radius_m', e.target.value)}
                        inputMode="numeric"
                      />
                      {completionZones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCompletionZone(index)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCompletionZone}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Add another zone
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            disabled={busy}
            className="bg-green-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 transition disabled:opacity-60 mt-4"
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
