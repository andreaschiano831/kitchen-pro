export type MEPTask = {
  id: string;
  title: string;
  station?: string;
  done: boolean;
  createdAt: string; // ISO
  doneAt?: string;   // ISO
};

const NS = "kitchen-pro:mep:v1";

function key(kitchenId: string) {
  return `${NS}:${kitchenId}`;
}

export function loadMEP(kitchenId: string): { date: string; tasks: MEPTask[] } {
  const today = new Date().toISOString().slice(0, 10);

  try {
    const raw = localStorage.getItem(key(kitchenId));
    if (!raw) return { date: today, tasks: [] };

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { date: today, tasks: [] };

    // reset giornaliero automatico
    if ((parsed as any).date !== today) return { date: today, tasks: [] };

    const tasks = Array.isArray((parsed as any).tasks) ? (parsed as any).tasks : [];
    return { date: today, tasks };
  } catch {
    return { date: today, tasks: [] };
  }
}

export function saveMEP(kitchenId: string, date: string, tasks: MEPTask[]) {
  localStorage.setItem(key(kitchenId), JSON.stringify({ date, tasks }));
}
