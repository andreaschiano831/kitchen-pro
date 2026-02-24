import { useEffect } from "react";

export type ToastType = "success" | "warning" | "error";

export type ToastMsg = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

export function Toast({ toast, onClose }: { toast: ToastMsg; onClose: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 2600);
    return () => window.clearTimeout(t);
  }, [onClose]);

  const base = "fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md rounded-xl border p-4 shadow-lg";
  const theme =
    toast.type === "success"
      ? "border-emerald-200 bg-white"
      : toast.type === "warning"
      ? "border-amber-200 bg-white"
      : "border-rose-200 bg-white";

  const dot =
    toast.type === "success"
      ? "bg-emerald-500"
      : toast.type === "warning"
      ? "bg-amber-500"
      : "bg-rose-600";

  return (
    <div className={`${base} ${theme}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-1 h-2.5 w-2.5 rounded-full ${dot}`} />
        <div className="min-w-0">
          <div className="text-sm font-semibold">{toast.title}</div>
          {toast.message ? <div className="text-xs text-neutral-600 mt-1">{toast.message}</div> : null}
        </div>
        <button className="ml-auto text-xs text-neutral-500 hover:text-neutral-900" onClick={onClose}>
          Chiudi
        </button>
      </div>
    </div>
  );
}
