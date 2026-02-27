import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import { downloadDoc } from "../utils/export";

type Props = {
  open: boolean;
  title: string;
  defaultFilename: string;
  initialHtml: string;
  onClose: () => void;
};

export default function ExportPreviewModal({ open, title, defaultFilename, initialHtml, onClose }: Props) {
  const [filename, setFilename] = useState(defaultFilename);
  const [html, setHtml] = useState(initialHtml);

  useEffect(() => {
    if (!open) return;
    setFilename(defaultFilename);
    setHtml(initialHtml);
  }, [open, defaultFilename, initialHtml]);

  const safePreview = useMemo(() => {
    // render in sandboxed iframe (no scripts)
    return html;
  }, [html]);

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(html);
    } catch {
      // fallback: nothing
    }
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          <div className="p-muted text-xs">Nome file (.doc)</div>
          <input className="input" value={filename} onChange={(e) => setFilename(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="p-muted text-xs">HTML modificabile</div>
            <textarea
              className="input"
              style={{ height: 220, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-ghost text-xs" onClick={copyHtml}>Copia HTML</button>
              <button className="btn btn-primary text-xs" onClick={() => downloadDoc(filename || "report.doc", html)}>
                Scarica DOC
              </button>
              <button className="btn btn-ghost text-xs" onClick={onClose}>Chiudi</button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-muted text-xs">Anteprima</div>
            <iframe
              title="preview"
              sandbox=""
              className="w-full rounded-lg border border-neutral-200 bg-white"
              style={{ height: 220 }}
              srcDoc={safePreview}
            />
            <div className="p-muted text-[11px]">
              Nota: l’anteprima è HTML. Il DOC scaricato è Word-compat (HTML .doc).
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
