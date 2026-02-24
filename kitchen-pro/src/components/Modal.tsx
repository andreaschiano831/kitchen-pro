import { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ open, title, onClose, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="h2">{title}</div>
          <button className="btn btn-ghost text-xs px-3 py-1" onClick={onClose}>
            Chiudi
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
