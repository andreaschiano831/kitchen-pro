import { useState } from "react";
import { v4 as uuid } from "uuid";
import { useKitchen } from "../store/kitchenStore";

export default function Freezer() {
  const { state, addFreezerItem, removeFreezerItem } = useKitchen();
  const [name, setName] = useState("");

  const currentKitchen = state.kitchens.find((k) => k.id === state.currentKitchenId);

  if (!currentKitchen) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Freezer</h2>
        <p className="text-sm text-neutral-400">Nessuna kitchen selezionata. Vai su Kitchen.</p>
      </div>
    );
  }

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;

    addFreezerItem({
      id: uuid(),
      name: trimmed,
      quantity: 1,
      unit: "pz",
      insertedAt: new Date().toISOString(),
    });

    setName("");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Freezer — {currentKitchen.name}</h2>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded bg-neutral-800 px-3 py-2 text-sm"
          placeholder="Nuovo prodotto..."
        />
        <button
          onClick={handleAdd}
          className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black"
        >
          +
        </button>
      </div>

      <div className="space-y-2">
        {currentKitchen.freezer.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded bg-neutral-900 p-3 text-sm">
            <span>{item.name}</span>
            <button
              onClick={() => removeFreezerItem(item.id)}
              className="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
