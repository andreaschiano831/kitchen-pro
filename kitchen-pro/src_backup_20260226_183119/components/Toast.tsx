import { useEffect } from "react";

export type ToastMsg = {
  id: string;
  type: "success" | "warning" | "error";
  title: string;
  message?: string;
};

export function Toast({ toast, onClose }: { toast: ToastMsg; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [toast.id]);

  const cls =
    toast.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : toast.type === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-rose-200 bg-rose-50 text-rose-900";

  return (
    <div className="fixed bottom-20 left-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2">
      <div className={`card p-4 border ${cls}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold">{toast.title}</div>
            {toast.message ? <div className="text-xs opacity-80 mt-1">{toast.message}</div> : null}
          </div>
          <button className="btn btn-ghost text-xs" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}
