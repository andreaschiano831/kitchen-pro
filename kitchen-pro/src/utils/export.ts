import type { Kitchen } from "../store/kitchenStore";

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

export function buildKitchenReportHtml(kitchen: Kitchen) {
  const today = new Date().toISOString().slice(0, 10);

  const freezer = (kitchen.freezer || []).map((it: any) => ({
    name: it.name,
    qty: it.quantity,
    unit: it.unit,
    location: it.location || "freezer",
    exp: it.expiresAt ? String(it.expiresAt).slice(0, 10) : "",
    min: it.unit === "pz" ? (it.parLevel ?? 5) : "",
  }));

  const economato = (kitchen.shopping || []).filter((x) => x.category === "economato");

  return `
<html><head><meta charset="utf-8"/>
<style>
  body{font-family:Arial,sans-serif;color:#111}
  h1{font-size:18px;margin:0 0 8px}
  h2{font-size:14px;margin:18px 0 8px}
  table{width:100%;border-collapse:collapse}
  th,td{border:1px solid #ddd;padding:6px;font-size:12px}
  th{background:#f6f6f6;text-align:left}
  .muted{color:#666;font-size:12px}
</style>
</head><body>
  <h1>${kitchen.name} — Report</h1>
  <div class="muted">Data: ${today}</div>

  <h2>Giacenze (Freezer/Fridge)</h2>
  <table>
    <thead><tr><th>Prodotto</th><th>Qty</th><th>Unit</th><th>Loc</th><th>Scadenza</th><th>MIN (pz)</th></tr></thead>
    <tbody>
      ${freezer.map(r => `<tr><td>${r.name}</td><td>${r.qty}</td><td>${r.unit}</td><td>${r.location}</td><td>${r.exp}</td><td>${r.min}</td></tr>`).join("")}
    </tbody>
  </table>

  <h2>Economato (Lista spesa)</h2>
  <table>
    <thead><tr><th>Prodotto</th><th>Qty</th><th>Unit</th><th>Note</th><th>OK</th></tr></thead>
    <tbody>
      ${economato.map(x => `<tr><td>${x.name}</td><td>${x.quantity}</td><td>${x.unit}</td><td>${x.notes ?? ""}</td><td>${x.checked ? "✓" : ""}</td></tr>`).join("")}
    </tbody>
  </table>

  <div class="muted" style="margin-top:16px;">Generato da Kitchen-Pro</div>
</body></html>`;
}

export function downloadDoc(filename: string, html: string) {
  dl(filename, html, "application/msword");
}
