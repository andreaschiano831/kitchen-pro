import { useState } from "react";
import { useKitchenStore } from "../store/useKitchenStore";
import { v4 as uuid } from "uuid";

export default function Freezer() {
  const { freezer, addFreezerItem } = useKitchenStore();
  const [name, setName] = useState("");

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
      <h2 className="text-lg font-semibold">Freezer</h2>

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
        {freezer.map((item) => (
          <div key={item.id} className="rounded bg-neutral-900 p-3 text-sm">
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
