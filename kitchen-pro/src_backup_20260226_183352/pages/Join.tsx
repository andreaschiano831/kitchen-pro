import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useKitchen } from "../store/kitchenStore";

export default function Join() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { addMember } = useKitchen();
  const [name, setName] = useState("");

  const kitchenId = params.get("k");
  const rawRole = (params.get("r") || "staff").toLowerCase();
  const allowed = ["admin","chef","sous-chef","capo-partita","commis","stagista","fb","mm","staff"] as const;
  const role = (allowed.includes(rawRole as any) ? rawRole : "staff") as typeof allowed[number];

  function handleJoin() {
    if (!kitchenId || !name.trim()) return;
    addMember(kitchenId, name.trim(), role);
    navigate("/freezer");
  }

  if (!kitchenId) return <div>Link non valido.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Join Kitchen</h2>
      <p className="text-sm text-neutral-400">Ruolo: {role}</p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Il tuo nome"
        className="w-full rounded bg-neutral-800 px-3 py-2 text-sm"
      />

      <button
        onClick={handleJoin}
        className="w-full rounded bg-green-500 px-4 py-2 text-sm font-medium text-black"
      >
        Entra
      </button>
    </div>
  );
}
