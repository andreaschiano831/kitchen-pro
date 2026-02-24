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
      <h2 className="text-lg font-semibold">Kitchen</h2>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded bg-neutral-800 px-3 py-2 text-sm"
          placeholder="Nuova kitchen..."
        />
        <button onClick={handleCreate} className="rounded bg-blue-500 px-4 py-2 text-sm font-medium text-black">
          Crea
        </button>
      </div>

      <div className="space-y-2">
        {state.kitchens.length === 0 ? (
          <p className="text-sm text-neutral-400">Nessuna kitchen creata.</p>
        ) : (
          state.kitchens.map((k) => (
            <div
              key={k.id}
              className={`flex items-center justify-between rounded p-3 text-sm ${
                k.id === state.currentKitchenId ? "bg-neutral-700" : "bg-neutral-900"
              }`}
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{k.name}</div>
                <div className="truncate text-xs text-neutral-400">{k.id}</div>
              </div>
              <button
                onClick={() => selectKitchen(k.id)}
                className="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700"
              >
                Seleziona
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
