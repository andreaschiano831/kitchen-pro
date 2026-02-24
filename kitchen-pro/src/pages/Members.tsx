import { useMemo } from "react";
import { useKitchen } from "../store/kitchenStore";
import type { Role } from "../store/kitchenStore";

const ROLES: Role[] = [
  "admin",
  "chef",
  "sous-chef",
  "capo-partita",
  "commis",
  "stagista",
  "fb",
  "mm",
  "staff",
];

function roleBadge(role: Role) {
  const base = "badge-role";
  if (role === "admin") return `${base} border border-[#C6A75E] bg-[#fff7e6] text-[#6b4f12]`;
  if (role === "chef" || role === "sous-chef" || role === "capo-partita")
    return `${base} border border-[#8B0000] bg-[#fff1f1] text-[#8B0000]`;
  return `${base} bg-neutral-100 text-neutral-700`;
}

export default function Members() {
  const { state, getCurrentRole, updateMemberRole, removeMember } = useKitchen();

  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const currentRole = getCurrentRole();
  const isAdmin = currentRole === "admin";

  if (!kitchen) {
    return (
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Members</h2>
        <p className="text-sm text-neutral-600">Seleziona una kitchen prima.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight">Team</h2>
            <p className="text-sm text-neutral-600 truncate">{kitchen.name}</p>
            <p className="text-xs text-neutral-400 truncate mt-1">{kitchen.id}</p>
          </div>

          <div className="text-right">
            <div className="text-xs text-neutral-500">Ruolo corrente</div>
            <div className="mt-1 inline-flex items-center rounded-full border border-neutral-200 bg-white px-2 py-1 text-xs font-medium">
              {currentRole ?? "—"}
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div className="mt-3 rounded-lg border border-neutral-200 bg-[#fff7e6] p-3 text-sm">
            <span className="font-medium">Nota:</span> solo <span className="font-medium">Admin</span> può modificare ruoli o rimuovere membri.
          </div>
        )}
      </div>

      <div className="space-y-3">
        {kitchen.members.map((m) => (
          <div key={m.id} className="card p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-base font-semibold truncate">{m.name}</div>
                <div className="mt-2">
                  <span className={roleBadge(m.role)}>{m.role}</span>
                </div>
              </div>

              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <select
                    value={m.role}
                    onChange={(e) => updateMemberRole(kitchen.id, m.id, e.target.value as Role)}
                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      if (confirm(`Rimuovere ${m.name}?`)) removeMember(kitchen.id, m.id);
                    }}
                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
                    title="Rimuovi membro"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-xs text-neutral-500">Solo lettura</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
