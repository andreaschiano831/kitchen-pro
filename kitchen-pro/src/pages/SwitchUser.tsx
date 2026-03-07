import { useMemo, useState } from "react";
import { useKitchen } from "../store/kitchenStore";
import type { Role } from "../store/kitchenStore";

export default function SwitchUser() {
  const { state, selectKitchen, addMember } = useKitchen();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("staff");

  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  if (!kitchen) {
    return (
      <div className="container-pro py-6 space-y-3">
        <div className="card p-5">
          <div className="h1">Switch User</div>
          <p className="p-muted mt-2">Seleziona una kitchen prima (pagina Kitchen).</p>
        </div>
      </div>
    );
  }

  function handleAdd() {
    if (!kitchen) return;
    if (!name.trim()) return;
    addMember(kitchen.id, name.trim(), role);
    setName("");
  }

  return (
    <div className="container-pro py-6 space-y-4">
      <div className="card p-5 space-y-2">
        <div className="h1">Switch User</div>
        <p className="p-muted">Crea un membro e “entra” come lui (utile per test ruoli senza incognito).</p>
        <div className="badge mt-2">{kitchen.name}</div>
      </div>

      <div className="card p-5 space-y-3">
        <div className="h2">Aggiungi membro</div>

        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (es. Commis Luca)" />

        <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="staff">Staff</option>
          <option value="commis">Commis</option>
          <option value="stagista">Stagista</option>
          <option value="fb">F&B</option>
          <option value="mm">MM</option>
          <option value="capo-partita">Capo partita</option>
          <option value="sous-chef">Sous-chef</option>
          <option value="chef">Chef</option>
          <option value="admin">Admin</option>
        </select>

        <button className="btn btn-gold w-full" onClick={handleAdd}>Crea & Entra</button>
      </div>

      <div className="card p-5 space-y-3">
        <div className="h2">Cambia Kitchen</div>
        <div className="space-y-2">
          {state.kitchens.map((k) => (
            <button
              key={k.id}
              className="btn btn-ghost w-full justify-between"
              onClick={() => selectKitchen(k.id)}
            >
              <span className="truncate">{k.name}</span>
              <span className="text-xs text-neutral-500">seleziona</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
