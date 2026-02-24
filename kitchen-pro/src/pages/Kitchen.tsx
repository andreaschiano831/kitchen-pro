import { useState } from "react";
import { useKitchen } from "../store/kitchenStore";

export default function Kitchen() {
  const { state, createKitchen, selectKitchen } = useKitchen();
  const [name, setName] = useState("");

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    createKitchen(trimmed);
    setName("");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Kitchen Management</h2>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded bg-neutral-800 px-3 py-2 text-sm"
          placeholder="Nuova kitchen..."
        />
        <button
          onClick={handleCreate}
          className="rounded bg-blue-500 px-4 py-2 text-sm font-medium"
        >
          Crea
        </button>
      </div>

      <div className="space-y-2">
        {state.kitchens.map((k) => (
          <div
            key={k.id}
            className={`flex justify-between rounded p-3 text-sm ${
              k.id === state.currentKitchenId
                ? "bg-neutral-700"
                : "bg-neutral-900"
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
