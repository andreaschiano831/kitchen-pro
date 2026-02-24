import { useState } from "react";
import { useKitchen } from "../store/kitchenStore";

export default function Kitchen() {
  const { state, createKitchen, selectKitchen } = useKitchen();
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");

  function handleCreate() {
    if (!name.trim() || !owner.trim()) return;
    createKitchen(name.trim(), owner.trim());
    setName("");
    setOwner("");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Kitchen</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome kitchen"
        className="w-full rounded bg-neutral-800 px-3 py-2 text-sm"
      />

      <input
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
        placeholder="Tuo nome (admin)"
        className="w-full rounded bg-neutral-800 px-3 py-2 text-sm"
      />

      <button
        onClick={handleCreate}
        className="w-full rounded bg-blue-500 px-4 py-2 text-sm font-medium text-black"
      >
        Crea Kitchen
      </button>

      <div className="space-y-2">
        {state.kitchens.map((k) => (
          <div
            key={k.id}
            className={`flex justify-between rounded p-3 text-sm ${
              k.id === state.currentKitchenId ? "bg-neutral-700" : "bg-neutral-900"
            }`}
          >
            <span>{k.name}</span>
            <button
              onClick={() => selectKitchen(k.id)}
              className="text-xs text-neutral-300"
            >
              Seleziona
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
