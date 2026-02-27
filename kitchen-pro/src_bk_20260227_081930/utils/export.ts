import type { Kitchen } from "../store/kitchenStore";
import { expiryLevel, isUrgent } from "./expiry";

function dl(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escCSV(v: any) {
  const s = String(v ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) return '"' + s.replaceAll('"', '""') + '"';
  return s;
}

export function exportEconomatoCSV(kitchen: Kitchen) {
  const rows = (kitchen.shopping || [])
    .filter((x) => x.category === "economato")
    .map((x) => ({
      name: x.name,
      quantity: x.quantity,
      unit: x.unit,
      checked: x.checked ? "YES" : "NO",
      notes: x.notes ?? "",
    }));

  const header = ["name", "quantity", "unit", "checked", "notes"];
  const lines = [header.join(","), ...rows.map((r) => header.map((k) => escCSV((r as any)[k])).join(","))];

  dl(`economato-${kitchen.name}.csv`, lines.join("\n"), "text/csv;charset=utf-8");
}

function docShell(opts: { title: string; subtitle: string; body: string }) {
  // Luxury theme: white base + bordeaux + gold
  return `
<html><head><meta charset="utf-8"/>
<style>
  body{font-family:Arial,sans-serif;color:#111;background:#fff;margin:24px}
  .top{border-bottom:2px solid #C6A75E;padding-bottom:10px;margin-bottom:14px}
  .brand{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
  .logo{font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#8B0000;font-size:14px}
  .title{font-size:18px;font-weight:800;margin:2px 0 0}
  .sub{color:#666;font-size:12px;margin-top:2px}
  .pill{border:1px solid #C6A75E;background:#fff7e6;color:#6b4f12;font-size:11px;padding:2px 8px;border-radius:999px}
  h2{font-size:13px;margin:18px 0 8px;color:#111}
  table{width:100%;border-collapse:collapse}
  th,td{border:1px solid #e5e5e5;padding:6px;font-size:12px}
  th{background:#fafafa;text-align:left}
  .muted{color:#666;font-size:12px}
  .urgent{font-weight:700;color:#8B0000}
</style>
</head><body>
  <div class="top">
    <div class="brand">
      <div>
        <div class="logo">Kitchen-Pro</div>
        <div class="title">${opts.title}</div>
        <div class="sub">${opts.subtitle}</div>
      </div>
      <div class="pill">EXPORT • DOC</div>
    </div>
  </div>

  ${opts.body}

  <div class="muted" style="margin-top:16px;border-top:1px solid #eee;padding-top:10px;">
    Generato da Kitchen-Pro • Layout premium
  </div>
</body></html>`;
}

function mapGiacenze(kitchen: Kitchen) {
  return (kitchen.freezer || []).map((it: any) => ({
    name: it.name,
    qty: it.quantity,
    unit: it.unit,
    location: it.location || "freezer",
    exp: it.expiresAt ? String(it.expiresAt).slice(0, 10) : "",
    min: it.unit === "pz" ? (it.parLevel ?? 5) : "",
    expLevel: expiryLevel(it.expiresAt),
  }));
}

export function buildKitchenReportHtml(kitchen: Kitchen) {
  const today = new Date().toISOString().slice(0, 10);
  const rows = mapGiacenze(kitchen);

  const economato = (kitchen.shopping || []).filter((x) => x.category === "economato");

  const body = `
  <h2>Giacenze (Freezer/Fridge)</h2>
  <table>
    <thead><tr><th>Prodotto</th><th>Qty</th><th>Unit</th><th>Loc</th><th>Scadenza</th><th>MIN (pz)</th></tr></thead>
    <tbody>
      ${rows.map(r => `<tr>
        <td>${r.name}</td><td>${r.qty}</td><td>${r.unit}</td><td>${r.location}</td><td>${r.exp}</td><td>${r.min}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h2>Economato (Lista spesa)</h2>
  <table>
    <thead><tr><th>Prodotto</th><th>Qty</th><th>Unit</th><th>Note</th><th>OK</th></tr></thead>
    <tbody>
      ${economato.map(x => `<tr><td>${x.name}</td><td>${x.quantity}</td><td>${x.unit}</td><td>${x.notes ?? ""}</td><td>${x.checked ? "✓" : ""}</td></tr>`).join("")}
    </tbody>
  </table>`;

  return docShell({
    title: `${kitchen.name} — Report Completo`,
    subtitle: `Data: ${today}`,
    body,
  });
}

export function buildUrgentReportHtml(kitchen: Kitchen) {
  const today = new Date().toISOString().slice(0, 10);
  const rows = mapGiacenze(kitchen);

  const urgentExpiry = rows.filter(r => isUrgent(r.expLevel));
  const lowStock = rows
    .filter(r => r.unit === "pz")
    .map(r => ({ ...r, min: (r.min === "" ? 5 : Number(r.min)), diff: Math.max(0, (Number(r.min) || 5) - Number(r.qty || 0)) }))
    .filter(r => r.diff > 0);

  const body = `
  <h2>Scadenze Urgenti (OGGI / 24h / 72h)</h2>
  <table>
    <thead><tr><th>Prodotto</th><th>Loc</th><th>Scadenza</th><th>Livello</th></tr></thead>
    <tbody>
      ${
        urgentExpiry.length === 0
          ? `<tr><td colspan="4" class="muted">Nessuna scadenza urgente.</td></tr>`
          : urgentExpiry.map(r => `<tr>
              <td class="urgent">${r.name}</td>
              <td>${r.location}</td>
              <td>${r.exp}</td>
              <td class="urgent">${r.expLevel}</td>
            </tr>`).join("")
      }
    </tbody>
  </table>

  <h2>LOW Stock (solo PZ sotto MIN)</h2>
  <table>
    <thead><tr><th>Prodotto</th><th>Qty</th><th>MIN</th><th>Da ordinare</th></tr></thead>
    <tbody>
      ${
        lowStock.length === 0
          ? `<tr><td colspan="4" class="muted">Nessun low stock.</td></tr>`
          : lowStock.map(r => `<tr>
              <td class="urgent">${r.name}</td>
              <td>${r.qty} pz</td>
              <td>${r.min}</td>
              <td class="urgent">+${r.diff} pz</td>
            </tr>`).join("")
      }
    </tbody>
  </table>`;

  return docShell({
    title: `${kitchen.name} — Report Urgenti`,
    subtitle: `Data: ${today} • scadenze + low stock`,
    body,
  });
}

export function downloadDoc(filename: string, html: string) {
  dl(filename, html, "application/msword");
}
