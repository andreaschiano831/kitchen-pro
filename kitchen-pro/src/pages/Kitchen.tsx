import { useState } from "react";
import { useKitchen } from "../store/kitchenStore";

type Role =
  | "admin"
  | "chef"
  | "sous-chef"
  | "capo-partita"
  | "commis"
  | "stagista"
  | "fb"
  | "mm"
  | "staff";

const INVITE_ALLOWED: Role[] = ["admin", "chef", "sous-chef", "capo-partita"];

export default function Kitchen() {
  const { state, createKitchen, selectKitchen, getCurrentRole } = useKitchen();
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("staff");
  const [generatedLink, setGeneratedLink] = useState("");

  const currentRole = getCurrentRole();
  const canInvite = currentRole ? INVITE_ALLOWED.includes(currentRole as Role) : false;

  function handleCreate() {
    if (!name.trim() || !owner.trim()) return;
    createKitchen(name.trim(), owner.trim());
    setName("");
    setOwner("");
  }

  function generateInvite(kitchenId: string) {
    if (!canInvite) {
      alert("Permessi insufficienti: puoi generare inviti solo se sei Admin/Chef/Sous-chef/Capo partita.");
      return;
    }
    const base = window.location.origin + window.location.pathname;
    const link = `${base}#/join?k=${kitchenId}&r=${inviteRole}`;
    setGeneratedLink(link);
  }

  async function copyLink() {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    alert("Link copiato");
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Kitchen Management</h2>

      <div className="rounded bg-neutral-900 p-4 space-y-2">
        <div className="text-xs text-neutral-400">Crea nuova kitchen</div>
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
      </div>

      <div className="rounded bg-neutral-900 p-4">
        <div className="text-xs text-neutral-400 mb-2">
          Ruolo corrente: <span className="text-neutral-200">{currentRole ?? "—"}</span>
        </div>
        <div className="text-xs text-neutral-500">
          Inviti consentiti: Admin / Chef / Sous-chef / Capo partita
        </div>
      </div>

      <div className="space-y-4">
        {state.kitchens.map((k) => (
          <div
            key={k.id}
            className={`space-y-3 rounded p-4 ${
              k.id === state.currentKitchenId ? "bg-neutral-700" : "bg-neutral-900"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
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

            <div className="space-y-2">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="w-full rounded bg-neutral-800 px-2 py-2 text-sm"
              >
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

              <button
                onClick={() => generateInvite(k.id)}
                disabled={!canInvite}
                className={`w-full rounded px-3 py-2 text-sm font-medium ${
                  canInvite ? "bg-emerald-500 text-black" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                Genera Link Invito
              </button>
            </div>
          </div>
        ))}
      </div>

      {generatedLink && (
        <div className="space-y-2 rounded bg-neutral-900 p-4">
          <div className="text-xs text-neutral-400">Link generato</div>
          <div className="break-all text-sm">{generatedLink}</div>
          <button
            onClick={copyLink}
            className="w-full rounded bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
          >
            Copia Link
          </button>
        </div>
      )}
    </div>
  );
}
