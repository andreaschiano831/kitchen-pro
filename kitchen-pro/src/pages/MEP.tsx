import { useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { useKitchen } from "../store/kitchenStore";
import { loadMEP, saveMEP, type MEPTask } from "../utils/mepStorage";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}



  function handleCompleteWithStock(task: any) {
    const qty = Number(prompt("Quantità prodotta?"));
    if (!qty || qty <= 0) return;

    const location = prompt("Destinazione? (fridge/freezer)", "fridge");
    if (location !== "fridge" && location !== "freezer") return;

    addFreezerItem({
      id: crypto.randomUUID(),
      name: task.title,
      quantity: qty,
      unit: "pz",
      location,
      insertedAt: new Date().toISOString(),
    });
  }

export default function MEP() {
  const { state, getCurrentRole, addFreezerItem } = useKitchen();
  const role = getCurrentRole();

  const kitchenId = state.currentKitchenId;
  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === kitchenId),
    [state.kitchens, kitchenId]
  );

  const canEdit =
    role === "admin" ||
    role === "chef" ||
    role === "sous-chef" ||
    role === "capo-partita";

  const [date, setDate] = useState(todayISO());
  const [tasks, setTasks] = useState<MEPTask[]>([]);
  const [title, setTitle] = useState("");
  const [station, setStation] = useState("");

  // load when kitchen changes
  useEffect(() => {
    if (!kitchenId) return;
    const loaded = loadMEP(kitchenId);
    setDate(loaded.date);
    setTasks(loaded.tasks);
  }, [kitchenId]);

  // persist
  useEffect(() => {
    if (!kitchenId) return;
    saveMEP(kitchenId, date, tasks);
  }, [kitchenId, date, tasks]);

  const ordered = useMemo(() => {
    const copy = tasks.slice();
    copy.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return (a.station || "").localeCompare(b.station || "") || a.title.localeCompare(b.title);
    });
    return copy;
  }, [tasks]);

  function addTask() {
    if (!canEdit) return;
    const t = title.trim();
    if (!t) return;

    const st = station.trim();
    const item: MEPTask = {
      id: uuid(),
      title: t,
      station: st || undefined,
      done: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [item, ...prev]);
    setTitle("");
    setStation("");
  }

  function toggle(id: string) {
    if (!canEdit) return;
    setTasks((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, done: !x.done, doneAt: !x.done ? new Date().toISOString() : undefined }
          : x
      )
    );
  }

  function remove(id: string) {
    if (!canEdit) return;
    setTasks((prev) => prev.filter((x) => x.id !== id));
  }

  function clearDone() {
    if (!canEdit) return;
    setTasks((prev) => prev.filter((x) => !x.done));
  }

  function resetToday() {
    if (!canEdit) return;
    setDate(todayISO());
    setTasks([]);
  }

  if (!kitchen) {
    return (
      <div className="card p-5">
        <div className="h1">Mise en Place</div>
        <p className="p-muted mt-2">Seleziona una kitchen prima (Kitchen).</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h1">Mise en Place</div>
            <div className="p-muted">
              {kitchen.name} • {date}
            </div>
          </div>

          <div className="badge" style={{ borderColor: "rgba(198,167,94,.6)" }}>
            <span className="text-xs font-medium">{role ?? "—"}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task (es. porzionare branzino)"
            disabled={!canEdit}
          />
          <input
            className="input"
            value={station}
            onChange={(e) => setStation(e.target.value)}
            placeholder="Stazione (es. pesce, carne, pasticceria)"
            disabled={!canEdit}
          />
        </div>

        <div className="mt-3 flex gap-2">
            <button className="btn btn-gold" onClick={() => handleCompleteWithStock(addFreezerItem, task.title)} disabled={!canEdit}>Completa + Carica</button>
          <button
            className={`btn flex-1 ${canEdit ? "btn-primary" : "btn-ghost"}`}
            onClick={addTask}
            disabled={!canEdit}
          >
            Aggiungi
          </button>

          <button className="btn btn-ghost flex-1" onClick={clearDone} disabled={!canEdit}>
            Clear done
          </button>

          <button className="btn btn-ghost flex-1" onClick={resetToday} disabled={!canEdit}>
            Reset day
          </button>
        </div>

        {!canEdit && (
          <div className="p-muted text-xs mt-2">
            Solo Admin/Chef/Sous-chef/Capo partita possono modificare.
          </div>
        )}
      </div>

      <div className="space-y-2">
        {ordered.length === 0 && (
          <div className="card p-4">
            <div className="p-muted">Nessun task oggi.</div>
          </div>
        )}

        {ordered.map((t) => (
          <div key={t.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    className={`btn px-3 py-2 ${t.done ? "btn-gold" : "btn-ghost"}`}
                    onClick={() => toggle(t.id)}
                    disabled={!canEdit}
                    title="Toggle"
                  >
                    {t.done ? "✓" : "○"}
                  </button>

                  <div className="min-w-0">
                    <div className={`font-semibold truncate ${t.done ? "line-through opacity-70" : ""}`}>
                      {t.title}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {t.station ? `• ${t.station}` : ""}
                      {t.done && t.doneAt ? ` • done ${t.doneAt.slice(11, 16)}` : ""}
                    </div>
                  </div>
                </div>
              </div>

              {canEdit && (
                <button className="btn btn-ghost px-3 py-2" onClick={() => remove(t.id)} title="Rimuovi">
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
