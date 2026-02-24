import { useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { useKitchen } from "../store/kitchenStore";
import { loadMEP, saveMEP, type MEPTask } from "../utils/mepStorage";
import Modal from "../components/Modal";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function MEP() {
  const { state, getCurrentRole, addFreezerItem } = useKitchen();
  const role = getCurrentRole();

  const canEdit =
    role === "admin" || role === "chef" || role === "sous-chef" || role === "capo-partita";

  const kitchenId = state.currentKitchenId;

  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === kitchenId),
    [state.kitchens, kitchenId]
  );

  const [date] = useState(todayISO());
  const [tasks, setTasks] = useState<MEPTask[]>([]);
  const [title, setTitle] = useState("");

  // Modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MEPTask | null>(null);
  const [qty, setQty] = useState(1);
  const [location, setLocation] = useState<"fridge" | "freezer">("fridge");

  useEffect(() => {
    if (!kitchenId) return;
    const data = loadMEP(kitchenId);
    setTasks(data.tasks);
  }, [kitchenId]);

  useEffect(() => {
    if (!kitchenId) return;
    saveMEP(kitchenId, { date, tasks });
  }, [kitchenId, date, tasks]);

  function addTask() {
    if (!canEdit) return;
    const t = title.trim();
    if (!t) return;

    const newTask: MEPTask = {
      id: uuid(),
      title: t,
      station: "",
      done: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle("");
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              done: !t.done,
              doneAt: !t.done ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  }

  function openComplete(task: MEPTask) {
    setSelected(task);
    setQty(1);
    setLocation("fridge");
    setOpen(true);
  }

  function confirmComplete() {
    if (!selected || !kitchen) return;

    const q = Math.floor(Number(qty));
    if (!Number.isFinite(q) || q <= 0) return;

    addFreezerItem({
      id: uuid(),
      name: selected.title,
      quantity: q,
      unit: "pz",
      location,
      insertedAt: new Date().toISOString(),
    } as any);

    toggleTask(selected.id);
    setOpen(false);
  }

  if (!kitchenId || !kitchen) {
    return (
      <div className="card p-6">
        <div className="h1">MEP</div>
        <div className="p-muted mt-2">Seleziona una Kitchen.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="h1">MEP Giornaliero</div>
        <div className="p-muted text-xs mt-1">Reset automatico giornaliero • Carico in giacenze via modal</div>

        <div className="mt-3 flex gap-2">
          <input
            className="input flex-1"
            placeholder="Nuova preparazione…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!canEdit}
          />
          <button className="btn btn-primary" onClick={addTask} disabled={!canEdit}>
            Aggiungi
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.length === 0 && (
          <div className="card p-4">
            <div className="p-muted">Nessuna preparazione.</div>
          </div>
        )}

        {tasks.map((task) => (
          <div key={task.id} className="card p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className={task.done ? "line-through text-neutral-400" : "font-semibold"}>
                {task.title}
              </div>
              <div className="p-muted text-xs mt-1">
                {task.done ? "Completata" : "In corso"}
              </div>
            </div>

            <div className="flex gap-2">
              {!task.done && canEdit && (
                <button className="btn btn-gold text-xs" onClick={() => openComplete(task)}>
                  Completa + Carica
                </button>
              )}
              <button className="btn btn-ghost text-xs" onClick={() => toggleTask(task.id)}>
                {task.done ? "Ripristina" : "Toggle"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} title="Completa preparazione" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div className="p-muted text-xs">Preparazione</div>
          <div className="font-semibold">{selected?.title ?? ""}</div>

          <div>
            <div className="p-muted text-xs mb-1">Quantità prodotta (pz)</div>
            <input
              className="input w-full"
              type="number"
              min={1}
              step={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </div>

          <div>
            <div className="p-muted text-xs mb-1">Destinazione</div>
            <select
              className="input w-full"
              value={location}
              onChange={(e) => setLocation(e.target.value as any)}
            >
              <option value="fridge">Frigo</option>
              <option value="freezer">Congelatore</option>
            </select>
          </div>

          <button className="btn btn-primary w-full" onClick={confirmComplete}>
            Conferma
          </button>
        </div>
      </Modal>
    </div>
  );
}
