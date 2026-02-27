import { useEffect, useMemo, useRef, useState } from "react";
import { useKitchen } from "../store/kitchenStore";
import { parseQuickAddText, type QuickAddDraft } from "../utils/quickAdd";
import Modal from "../components/Modal";

type Unit = "pz" | "g" | "kg" | "ml" | "l";

function cleanLine(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

export default function Capture() {
  const { state, addFreezerItem } = useKitchen();
  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const [mode, setMode] = useState<"text" | "voice" | "camera">("text");
  const [raw, setRaw] = useState("");
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<QuickAddDraft[]>([]);
  const [location, setLocation] = useState<"freezer" | "fridge">("freezer");

  // voice
  const recRef = useRef<any>(null);
  const [listening, setListening] = useState(false);

  // camera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [camOn, setCamOn] = useState(false);

  useEffect(() => {
    return () => {
      try {
        if (videoRef.current?.srcObject) {
          const tracks = (videoRef.current.srcObject as any).getTracks?.() || [];
          tracks.forEach((t: any) => t.stop());
        }
      } catch {}
    };
  }, []);

  function openPreview() {
    const text = raw
      .split("\n")
      .map(cleanLine)
      .filter(Boolean)
      .join("\n");

    const parsed = parseQuickAddText(text);
    setDrafts(parsed);
    setOpen(true);
  }

  function commitAll() {
    if (!kitchen) return;
    for (const d of drafts) {
      addFreezerItem({
        id: crypto.randomUUID(),
        name: d.name,
        quantity: d.quantity,
        unit: (d.unit as Unit) || "pz",
        location: (d.location as any) || location,
        insertedAt: new Date().toISOString(),
        expiresAt: d.expiresAt,
        section: d.section,
        notes: d.notes,
        category: d.category,
        parLevel: d.unit === "pz" ? (d.parLevel ?? 5) : undefined,
      } as any);
    }
    setOpen(false);
    setRaw("");
  }

  async function startVoice() {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) return alert("Voice non supportato su questo browser.");
    const rec = new SR();
    rec.lang = "it-IT";
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e: any) => {
      let out = "";
      for (let i = 0; i < e.results.length; i++) {
        out += e.results[i][0].transcript + "\n";
      }
      setRaw(out);
    };
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
  }

  function stopVoice() {
    try {
      recRef.current?.stop?.();
    } catch {}
    setListening(false);
  }

  async function startCam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream as any;
        await videoRef.current.play();
      }
      setCamOn(true);
    } catch {
      alert("Camera non disponibile.");
    }
  }

  function stopCam() {
    try {
      const stream: any = videoRef.current?.srcObject;
      if (stream?.getTracks) stream.getTracks().forEach((t: any) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {}
    setCamOn(false);
  }

  function snapToText() {
    // NO OCR (gratis): usiamo camera solo come supporto visivo.
    // UX: scatti foto mentale e scrivi/pasti testo. (OCR/AI lo aggiungiamo dopo via endpoint opzionale)
    alert("Per ora: usa la camera come reference e incolla/detta il testo. OCR/AI endpoint opzionale nel prossimo step.");
  }

  if (!kitchen) {
    return (
      <div className="card p-6">
        <div className="h1">Scanner</div>
        <div className="p-muted mt-2">Seleziona una Kitchen.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="h1">Scanner</div>
        <div className="p-muted text-xs mt-1">Inquadra l’etichetta per registrare (preview editabile)</div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className={mode === "text" ? "btn btn-primary text-xs" : "btn btn-ghost text-xs"} onClick={() => setMode("text")}>Text</button>
          <button className={mode === "voice" ? "btn btn-primary text-xs" : "btn btn-ghost text-xs"} onClick={() => setMode("voice")}>Voice</button>
          <button className={mode === "camera" ? "btn btn-primary text-xs" : "btn btn-ghost text-xs"} onClick={() => setMode("camera")}>Camera</button>

          <div className="flex-1" />

          <select className="input" style={{ maxWidth: 180 }} value={location} onChange={(e) => setLocation(e.target.value as any)}>
            <option value="freezer">Freezer</option>
            <option value="fridge">Fridge</option>
          </select>

          <button className="btn btn-gold text-xs" onClick={openPreview} disabled={raw.trim().length === 0}>
            Preview
          </button>
        </div>

        {mode === "text" ? (
          <div className="mt-4 space-y-2">
            <div className="p-muted text-xs">Incolla testo (anche lungo). Esempio:</div>
            <div className="p-muted text-[11px]">
              12 pz branzino frigo scad 2026-02-28 • 2 kg ossa vitello freezer • panna 6 pz
            </div>
            <textarea className="input" style={{ height: 180 }} value={raw} onChange={(e) => setRaw(e.target.value)} />
          </div>
        ) : null}

        {mode === "voice" ? (
          <div className="mt-4 space-y-2">
            <div className="p-muted text-xs">Detta: “10 pz uova frigo, 2 kg ossa vitello freezer, scadenza…”</div>
            <div className="flex gap-2">
              {!listening ? (
                <button className="btn btn-primary text-xs" onClick={startVoice}>Start</button>
              ) : (
                <button className="btn btn-ghost text-xs" onClick={stopVoice}>Stop</button>
              )}
            </div>
            <textarea className="input" style={{ height: 180 }} value={raw} onChange={(e) => setRaw(e.target.value)} />
          </div>
        ) : null}

        {mode === "camera" ? (
          <div className="mt-4 space-y-3">
            <div className="p-muted text-xs">Inquadra l’etichetta per registrare. Se serve: detta/incolla e correggi in preview.</div>
            <div className="flex gap-2">
              {!camOn ? (
                <button className="btn btn-primary text-xs" onClick={startCam}>Apri camera</button>
              ) : (
                <button className="btn btn-ghost text-xs" onClick={stopCam}>Chiudi</button>
              )}
              <button className="btn btn-gold text-xs" onClick={snapToText} disabled={!camOn}>Scatta</button>
            </div>
            <video ref={videoRef} className="w-full rounded-2xl border border-neutral-200 bg-black" />
            <textarea className="input" style={{ height: 120 }} placeholder="Scrivi/incolla qui…" value={raw} onChange={(e) => setRaw(e.target.value)} />
          </div>
        ) : null}
      </div>

      <Modal open={open} title="Preview → Conferma" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          {drafts.length === 0 ? (
            <div className="p-muted text-sm">Nessun elemento riconosciuto. Controlla il testo.</div>
          ) : (
            <div className="space-y-2">
              {drafts.slice(0, 12).map((d, i) => (
                <div key={i} className="card p-3">
                  <div className="font-semibold">{d.name}</div>
                  <div className="p-muted text-xs">
                    {d.quantity} {d.unit} • {location} {d.expiresAt ? `• exp ${String(d.expiresAt).slice(0,10)}` : ""}
                  </div>
                </div>
              ))}
              {drafts.length > 12 ? <div className="p-muted text-xs">…altri {drafts.length - 12}</div> : null}
            </div>
          )}

          <div className="flex gap-2">
            <button className="btn btn-ghost text-xs" onClick={() => setOpen(false)}>Indietro</button>
            <button className="btn btn-primary text-xs" onClick={commitAll} disabled={drafts.length === 0}>Carica in giacenze</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
