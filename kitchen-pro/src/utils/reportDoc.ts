import type { Kitchen, ShoppingCategory } from "../store/kitchenStore";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function esc(s: any) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hoursUntil(iso?: string) {
  if (!iso) return null as number | null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null as number | null;
  return Math.floor((t - Date.now()) / (1000 * 60 * 60));
}

function minStock(item: any) {
  const unit = String(item.unit || "pz");
  if (unit !== "pz") return null as number | null;
  const v = item.parLevel;
  if (v === undefined || v === null) return 5;
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n <= 0) return 5;
  return n;
}

function catTitle(c: ShoppingCategory) {
  if (c === "economato") return "Economato";
  if (c === "giornaliero") return "Giornaliera";
  return "Settimanale";
}

export function exportKitchenReportDoc(kitchen: Kitchen, filename = "kitchen-report.doc") {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 16).replace("T", " ");

  const inv = (kitchen.freezer || []).slice();

  inv.sort((a: any, b: any) => {
    const ad = a.expiresAt ? Date.parse(a.expiresAt) : Infinity;
    const bd = b.expiresAt ? Date.parse(b.expiresAt) : Infinity;
    if (ad !== bd) return ad - bd;
    const ai = a.insertedAt ? Date.parse(a.insertedAt) : 0;
    const bi = b.insertedAt ? Date.parse(b.insertedAt) : 0;
    return bi - ai;
  });

  const urgent = inv.filter((it: any) => {
    const h = hoursUntil(it.expiresAt);
    return h !== null && h <= 72;
  });

  const low = inv.filter((it: any) => {
    const ms = minStock(it);
    return ms !== null && Number(it.quantity) < Number(ms);
  });

  const byLoc = (loc: "freezer" | "fridge") => inv.filter((it: any) => String(it.location || "freezer") === loc);

  const shopping = (kitchen.shopping || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  const shopBy = (c: ShoppingCategory) => shopping.filter((x) => x.category === c);

  const css = `
    body { font-family: Calibri, Arial, sans-serif; color: #111; }
    h1 { font-size: 18pt; margin: 0 0 6px; }
    h2 { font-size: 13pt; margin: 16px 0 6px; }
    .meta { color:#555; font-size: 10pt; margin: 0 0 12px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 10.5pt; }
    th { background: #f6f6f6; text-align: left; }
    .tag { display:inline-block; padding:2px 6px; border-radius:999px; font-size:9pt; border:1px solid #ddd; }
    .tag-red { border-color:#ef4444; background:#fee2e2; }
    .tag-amber { border-color:#f59e0b; background:#fffbeb; }
    .tag-low { border-color:#dc2626; background:#fef2f2; font-weight:700; }
    .small { color:#555; font-size:9.5pt; }
  `;

  function invRows(items: any[]) {
    return items
      .map((it) => {
        const h = hoursUntil(it.expiresAt);
        const ms = minStock(it);
        const lowTag =
          ms !== null && Number(it.quantity) < Number(ms)
            ? `<span class="tag tag-low">LOW (MIN ${ms})</span>`
            : "";
        let expTag = "";
        if (h !== null) {
          if (h <= 0) expTag = `<span class="tag tag-red">SCADUTO/OGGI</span>`;
          else if (h <= 24) expTag = `<span class="tag tag-red">&lt;24h</span>`;
          else if (h <= 72) expTag = `<span class="tag tag-amber">&lt;72h</span>`;
        }
        return `
          <tr>
            <td>${esc(it.name)}</td>
            <td>${esc(it.quantity)} ${esc(it.unit)}</td>
            <td>${esc(it.section || "")}</td>
            <td>${esc(it.expiresAt ? it.expiresAt.slice(0, 10) : "")}</td>
            <td>${lowTag} ${expTag}</td>
          </tr>
        `;
      })
      .join("");
  }

  function shopRows(items: any[]) {
    return items
      .map(
        (it) => `
        <tr>
          <td>${esc(it.checked ? "✓" : "")}</td>
          <td>${esc(it.name)}</td>
          <td>${esc(it.quantity)} ${esc(it.unit)}</td>
          <td>${esc(it.notes || "")}</td>
        </tr>
      `
      )
      .join("");
  }

  function shopTable(cat: ShoppingCategory) {
    const items = shopBy(cat);
    return `
      <h2>Lista Spesa — ${esc(catTitle(cat))}</h2>
      <table>
        <thead><tr><th>OK</th><th>Prodotto</th><th>Qty</th><th>Note</th></tr></thead>
        <tbody>${items.length ? shopRows(items) : `<tr><td colspan="4" class="small">Vuota</td></tr>`}</tbody>
      </table>
    `;
  }

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(kitchen.name)} Report</title>
<style>${css}</style></head>
<body>
  <h1>${esc(kitchen.name)} — Report Cucina</h1>
  <div class="meta">Export: ${esc(stamp)} • Urgenti(≤72h): <b>${urgent.length}</b> • LOW(pz): <b>${low.length}</b></div>

  <h2>Urgenti scadenza (≤72h)</h2>
  <table>
    <thead><tr><th>Prodotto</th><th>Qty</th><th>Sezione</th><th>Scadenza</th><th>Tag</th></tr></thead>
    <tbody>${urgent.length ? invRows(urgent) : `<tr><td colspan="5" class="small">Nessuna urgenza</td></tr>`}</tbody>
  </table>

  <h2>Congelatore</h2>
  <table>
    <thead><tr><th>Prodotto</th><th>Qty</th><th>Sezione</th><th>Scadenza</th><th>Tag</th></tr></thead>
    <tbody>${invRows(byLoc("freezer"))}</tbody>
  </table>

  <h2>Frigo</h2>
  <table>
    <thead><tr><th>Prodotto</th><th>Qty</th><th>Sezione</th><th>Scadenza</th><th>Tag</th></tr></thead>
    <tbody>${invRows(byLoc("fridge"))}</tbody>
  </table>

  ${shopTable("economato")}
  ${shopTable("giornaliero")}
  ${shopTable("settimanale")}

</body></html>`;

  downloadBlob(new Blob([html], { type: "application/msword;charset=utf-8" }), filename);
}
