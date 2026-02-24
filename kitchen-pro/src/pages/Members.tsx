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

export default function Members() {
  const { state, getCurrentRole } = useKitchen();

  const kitchen = state.kitchens.find(
    (k) => k.id === state.currentKitchenId
  );

  const currentRole = getCurrentRole();

  if (!kitchen) return <div className="p-6">Nessuna kitchen selezionata.</div>;

  const isAdmin = currentRole === "admin";

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">
        Team Members
      </h2>

      <div className="space-y-4">
        {kitchen.members.map((m) => (
          <div
            key={m.id}
            className="card p-5 flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-lg">{m.name}</div>
              <div className="badge-role bg-neutral-100 text-neutral-700 mt-1 inline-block">
                {m.role}
              </div>
            </div>

            {isAdmin && (
              <select
                defaultValue={m.role}
                className="border border-neutral-300 rounded px-3 py-1 text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
