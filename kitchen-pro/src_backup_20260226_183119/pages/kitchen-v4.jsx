"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = KitchenManagement;
var react_1 = require("react");
var react_2 = require("react");
/* ═══════════════════════════════════════════════
   THEME SYSTEM — 4 curated palettes
   ═══════════════════════════════════════════════ */
var THEMES = {
    carta: {
        name: "Carta Antica", icon: "📜",
        bg: "#F2EDE4", bgAlt: "#EBE4D8", bgCard: "#FFFFFF", bgCardAlt: "#FAF7F2", bgGlass: "rgba(242,237,228,0.88)",
        ink: "#151210", inkSoft: "#3D3530", inkMuted: "#7A7168", inkFaint: "#B0A899", inkGhost: "#D5CFC6",
        accent: "#8B1E2F", accentDeep: "#6A1525", accentGlow: "rgba(139,30,47,0.10)",
        secondary: "#182040", secondaryDeep: "#0F1530",
        gold: "#C19A3E", goldBright: "#D9B44A", goldDim: "rgba(193,154,62,0.30)", goldFaint: "rgba(193,154,62,0.08)",
        success: "#3D7A4A", warning: "#C19A3E", danger: "#8B1E2F",
        div: "rgba(21,18,16,0.07)", divStrong: "rgba(21,18,16,0.14)",
        shadow: "rgba(0,0,0,0.06)", shadowStrong: "rgba(0,0,0,0.12)",
        grain: 0.3,
    },
    ardesia: {
        name: "Ardesia", icon: "🪨",
        bg: "#1A1D24", bgAlt: "#22262F", bgCard: "#262A34", bgCardAlt: "#2C313C", bgGlass: "rgba(26,29,36,0.92)",
        ink: "#E8E4DD", inkSoft: "#C5C0B8", inkMuted: "#8A857D", inkFaint: "#5C5850", inkGhost: "#3A3833",
        accent: "#C75B5B", accentDeep: "#A04040", accentGlow: "rgba(199,91,91,0.15)",
        secondary: "#4A6FA5", secondaryDeep: "#3A5A8A",
        gold: "#D4A843", goldBright: "#E8BC55", goldDim: "rgba(212,168,67,0.30)", goldFaint: "rgba(212,168,67,0.10)",
        success: "#5B9E6F", warning: "#D4A843", danger: "#C75B5B",
        div: "rgba(255,255,255,0.06)", divStrong: "rgba(255,255,255,0.12)",
        shadow: "rgba(0,0,0,0.25)", shadowStrong: "rgba(0,0,0,0.45)",
        grain: 0.15,
    },
    notte: {
        name: "Blu Notte", icon: "🌙",
        bg: "#0D1117", bgAlt: "#151B26", bgCard: "#1A2233", bgCardAlt: "#1F2940", bgGlass: "rgba(13,17,23,0.92)",
        ink: "#E6E1D6", inkSoft: "#B8B3A8", inkMuted: "#6E6A62", inkFaint: "#484540", inkGhost: "#2E2C28",
        accent: "#E85D5D", accentDeep: "#C04040", accentGlow: "rgba(232,93,93,0.12)",
        secondary: "#5B8DD9", secondaryDeep: "#4070B8",
        gold: "#F0C050", goldBright: "#FFD466", goldDim: "rgba(240,192,80,0.28)", goldFaint: "rgba(240,192,80,0.08)",
        success: "#60B878", warning: "#F0C050", danger: "#E85D5D",
        div: "rgba(255,255,255,0.05)", divStrong: "rgba(255,255,255,0.10)",
        shadow: "rgba(0,0,0,0.35)", shadowStrong: "rgba(0,0,0,0.55)",
        grain: 0.12,
    },
    avorio: {
        name: "Avorio Reale", icon: "👑",
        bg: "#FDFBF7", bgAlt: "#F5F1EA", bgCard: "#FFFFFF", bgCardAlt: "#FEFCF8", bgGlass: "rgba(253,251,247,0.90)",
        ink: "#1C1810", inkSoft: "#3E3A30", inkMuted: "#807A6E", inkFaint: "#ADA798", inkGhost: "#D8D2C8",
        accent: "#7A2842", accentDeep: "#5C1830", accentGlow: "rgba(122,40,66,0.08)",
        secondary: "#2A3F6A", secondaryDeep: "#1C2E52",
        gold: "#B08A30", goldBright: "#CCA040", goldDim: "rgba(176,138,48,0.28)", goldFaint: "rgba(176,138,48,0.06)",
        success: "#3A7848", warning: "#B08A30", danger: "#7A2842",
        div: "rgba(28,24,16,0.06)", divStrong: "rgba(28,24,16,0.12)",
        shadow: "rgba(0,0,0,0.04)", shadowStrong: "rgba(0,0,0,0.10)",
        grain: 0.25,
    },
};
/* ═══ DATA ═══ */
var INVENTORY = {
    frigo: [
        { id: "f1", name: "Burro Échiré", qty: 4.2, unit: "kg", min: 2, max: 10, exp: "27/02", cat: "Latticini" },
        { id: "f2", name: "Panna fresca 35%", qty: 6, unit: "L", min: 3, max: 15, exp: "28/02", cat: "Latticini" },
        { id: "f3", name: "Rombo chiodato", qty: 2.8, unit: "kg", min: 1, max: 5, exp: "26/02", cat: "Pesce", alert: true },
        { id: "f4", name: "Foie gras fresco", qty: 1.2, unit: "kg", min: 0.8, max: 3, exp: "01/03", cat: "Carni" },
        { id: "f5", name: "Uova bio calibro A", qty: 48, unit: "pz", min: 24, max: 120, exp: "05/03", cat: "Uova" },
        { id: "f6", name: "Tartufo bianco d'Alba", qty: 0.15, unit: "kg", min: 0.1, max: 0.5, exp: "26/02", cat: "Tartufi", alert: true },
        { id: "f7", name: "Caviale Oscietra", qty: 0.12, unit: "kg", min: 0.05, max: 0.3, exp: "10/03", cat: "Pesce" },
        { id: "f8", name: "Latte intero bio", qty: 8, unit: "L", min: 4, max: 20, exp: "02/03", cat: "Latticini" },
    ],
    congelatore: [
        { id: "c1", name: "Piccione Bresse", qty: 12, unit: "pz", min: 6, max: 24, exp: "15/04", cat: "Carni" },
        { id: "c2", name: "Astice bretone", qty: 8, unit: "pz", min: 4, max: 16, exp: "20/04", cat: "Crostacei" },
        { id: "c3", name: "Midollo di bue", qty: 2.5, unit: "kg", min: 1, max: 5, exp: "30/04", cat: "Carni" },
        { id: "c4", name: "Frutti di bosco IQF", qty: 3, unit: "kg", min: 2, max: 8, exp: "01/06", cat: "Frutta" },
        { id: "c5", name: "Coulis lampone", qty: 4, unit: "L", min: 2, max: 10, exp: "15/05", cat: "Base" },
    ],
    dispensa: [
        { id: "d1", name: "Riso Carnaroli Acquerello", qty: 8, unit: "kg", min: 5, max: 20, cat: "Cereali" },
        { id: "d2", name: "Olio EVO Moraiolo", qty: 12, unit: "L", min: 5, max: 25, cat: "Oli" },
        { id: "d3", name: "Zafferano iraniano", qty: 0.02, unit: "kg", min: 0.01, max: 0.05, cat: "Spezie" },
        { id: "d4", name: "Cioccolato Valrhona 70%", qty: 5, unit: "kg", min: 3, max: 12, cat: "Pasticceria" },
        { id: "d5", name: "Farina Manitoba", qty: 15, unit: "kg", min: 8, max: 30, cat: "Farine" },
        { id: "d6", name: "Sale Maldon", qty: 1.5, unit: "kg", min: 0.5, max: 3, cat: "Condimenti" },
        { id: "d7", name: "Aceto balsamico 25 anni", qty: 0.5, unit: "L", min: 0.2, max: 1, cat: "Condimenti" },
    ],
};
var MOVEMENTS = [
    { id: "m1", type: "scarico", item: "Rombo chiodato", qty: 1.5, unit: "kg", from: "Frigo", to: "Cucina", time: "18:30", chef: "A. Dubois" },
    { id: "m2", type: "carico", item: "Burro Échiré", qty: 5, unit: "kg", from: "Fornitore", to: "Frigo", time: "14:00", chef: "Reception" },
    { id: "m3", type: "scarico", item: "Piccione Bresse", qty: 4, unit: "pz", from: "Congelatore", to: "Frigo", time: "06:00", chef: "P. Bernard" },
    { id: "m4", type: "scarico", item: "Zafferano iraniano", qty: 0.003, unit: "kg", from: "Dispensa", to: "Cucina", time: "17:45", chef: "M. Laurent" },
    { id: "m5", type: "carico", item: "Ostriche Gillardeau", qty: 48, unit: "pz", from: "Fornitore", to: "Frigo", time: "10:30", chef: "Reception" },
];
var PREPS = [
    { id: "p1", name: "Fondo bruno", station: "Saucier", status: "in_corso", progress: 75, time: "6h", chef: "M. Laurent" },
    { id: "p2", name: "Pasta frolla vaniglia", station: "Pâtissier", status: "completata", progress: 100, time: "2h", chef: "S. Petit" },
    { id: "p3", name: "Brunoise verdure", station: "Garde Manger", status: "da_fare", progress: 0, time: "45min", chef: "C. Roux" },
    { id: "p4", name: "Salsa Périgueux", station: "Saucier", status: "in_corso", progress: 40, time: "3h", chef: "M. Laurent" },
    { id: "p5", name: "Crema pasticcera", station: "Pâtissier", status: "in_corso", progress: 90, time: "1h", chef: "S. Petit" },
    { id: "p6", name: "Pulizia astici", station: "Poissonnier", status: "da_fare", progress: 0, time: "1h", chef: "A. Dubois" },
];
var EXPENSES = [
    { id: "e1", vendor: "Rungis Express", amount: 2840, cat: "Pesce", date: "25/02", items: 6 },
    { id: "e2", vendor: "Beurre & Crème", amount: 560, cat: "Latticini", date: "25/02", items: 4 },
    { id: "e3", vendor: "Tartufi Morra", amount: 4200, cat: "Tartufi", date: "24/02", items: 1 },
    { id: "e4", vendor: "Valrhona Direct", amount: 890, cat: "Pasticceria", date: "23/02", items: 3 },
    { id: "e5", vendor: "Mercato Ortofrutticolo", amount: 380, cat: "Verdure", date: "25/02", items: 12 },
];
var ALERTS = [
    { id: "a1", type: "scadenza", level: "critical", msg: "Rombo chiodato scade DOMANI", item: "f3", action: "Utilizzare oggi" },
    { id: "a2", type: "scadenza", level: "critical", msg: "Tartufo bianco scade DOMANI", item: "f6", action: "Utilizzare oggi" },
    { id: "a3", type: "scorta", level: "warning", msg: "Foie gras sotto livello minimo consigliato", item: "f4", action: "Ordinare" },
    { id: "a4", type: "ai", level: "info", msg: "Consumo anomalo: burro +40% vs media settimanale", action: "Verifica" },
    { id: "a5", type: "ai", level: "info", msg: "Suggerimento: ordinare astice per weekend (previsione +60% coperti)", action: "Accetta" },
];
var fmt = function (s) { return "".concat(Math.floor(s / 60), ":").concat((s % 60).toString().padStart(2, "0")); };
/* ═══ REUSABLE COMPONENTS ═══ */
function LiveClock(_a) {
    var theme = _a.t;
    var _b = (0, react_1.useState)(new Date()), now = _b[0], setNow = _b[1];
    (0, react_1.useEffect)(function () { var i = setInterval(function () { return setNow(new Date()); }, 1000); return function () { return clearInterval(i); }; }, []);
    return (<span className="mono" style={{ fontSize: 13, color: theme.gold, letterSpacing: "0.06em" }}>
      {now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>);
}
function BarMini(_a) {
    var value = _a.value, max = _a.max, theme = _a.t, color = _a.color;
    var pct = Math.min((value / max) * 100, 100);
    var isLow = value / max < 0.25;
    var c = color || (isLow ? theme.danger : pct < 50 ? theme.warning : theme.success);
    return (<div style={{ height: 4, background: theme.div, borderRadius: 2, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: "".concat(pct, "%"), background: c, borderRadius: 2, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }}/>
    </div>);
}
function Badge(_a) {
    var label = _a.label, color = _a.color, bg = _a.bg;
    return (<span className="mono" style={{ fontSize: 8, letterSpacing: "0.1em", fontWeight: 500, padding: "3px 9px", borderRadius: 4, color: color, background: bg, whiteSpace: "nowrap" }}>
      {label}
    </span>);
}
/* ═══════════════════════════════════════════════
   SECTIONS
   ═══════════════════════════════════════════════ */
function DashboardView(_a) {
    var t = _a.t;
    var totalItems = INVENTORY.frigo.length + INVENTORY.congelatore.length + INVENTORY.dispensa.length;
    var alertCount = ALERTS.filter(function (a) { return a.level === "critical"; }).length;
    var todayExpense = EXPENSES.filter(function (e) { return e.date === "25/02"; }).reduce(function (s, e) { return s + e.amount; }, 0);
    return (<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
            { label: "REFERENZE TOTALI", val: totalItems, sub: "articoli", icon: "◆" },
            { label: "ALERT ATTIVI", val: ALERTS.length, sub: "".concat(alertCount, " critici"), icon: "⚠", highlight: true },
            { label: "SPESA OGGI", val: "\u20AC".concat(todayExpense.toLocaleString()), sub: "3 fornitori", icon: "€" },
            { label: "PREPARAZIONI", val: PREPS.filter(function (p) { return p.status === "in_corso"; }).length, sub: "/ ".concat(PREPS.length, " totali"), icon: "◷" },
        ].map(function (kpi, i) { return (<div key={i} style={{
                padding: "20px 22px", borderRadius: 14,
                background: kpi.highlight ? t.accentGlow : t.bgCard,
                border: "1px solid ".concat(kpi.highlight ? t.accent + "20" : t.div),
                boxShadow: "0 2px 12px ".concat(t.shadow),
                transition: "all 0.3s",
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span className="mono" style={{ fontSize: 8, letterSpacing: "0.16em", color: t.inkFaint }}>{kpi.label}</span>
              <span style={{ fontSize: 16, color: t.goldDim, lineHeight: 1 }}>{kpi.icon}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 400, fontFamily: "var(--serif)", color: t.ink, lineHeight: 1 }}>{kpi.val}</span>
              <span className="mono" style={{ fontSize: 10, color: t.inkFaint }}>{kpi.sub}</span>
            </div>
          </div>); })}
      </div>

      {/* Alerts + AI */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Alerts */}
        <div style={{ background: t.bgCard, borderRadius: 14, border: "1px solid ".concat(t.div), boxShadow: "0 2px 12px ".concat(t.shadow), overflow: "hidden" }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid ".concat(t.div), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: t.inkMuted }}>ALLERTE ATTIVE</span>
            <Badge label={"".concat(ALERTS.length)} color={t.accent} bg={t.accentGlow}/>
          </div>
          <div style={{ padding: "8px 0" }}>
            {ALERTS.map(function (a, i) { return (<div key={a.id} style={{ padding: "12px 22px", display: "flex", alignItems: "center", gap: 14, borderBottom: i < ALERTS.length - 1 ? "1px solid ".concat(t.div) : "none", transition: "background 0.2s", cursor: "pointer" }} onMouseEnter={function (e) { return e.currentTarget.style.background = t.bgAlt; }} onMouseLeave={function (e) { return e.currentTarget.style.background = "transparent"; }}>
                <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: a.level === "critical" ? t.danger : a.level === "warning" ? t.warning : t.secondary,
                animation: a.level === "critical" ? "pulse 1.5s ease-in-out infinite" : "none",
                boxShadow: a.level === "critical" ? "0 0 8px ".concat(t.accentGlow) : "none",
            }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: t.ink, lineHeight: 1.4 }}>{a.msg}</div>
                  {a.type === "ai" && <span className="mono" style={{ fontSize: 8, color: t.secondary, letterSpacing: "0.08em" }}>🤖 AI INSIGHT</span>}
                </div>
                <span className="mono" style={{
                fontSize: 9, padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                color: a.level === "critical" ? "#fff" : t.inkSoft,
                background: a.level === "critical" ? t.accent : t.bgAlt,
                border: a.level !== "critical" ? "1px solid ".concat(t.div) : "none",
                fontWeight: 500, letterSpacing: "0.06em", whiteSpace: "nowrap",
            }}>{a.action}</span>
              </div>); })}
          </div>
        </div>

        {/* Recent Movements */}
        <div style={{ background: t.bgCard, borderRadius: 14, border: "1px solid ".concat(t.div), boxShadow: "0 2px 12px ".concat(t.shadow), overflow: "hidden" }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid ".concat(t.div), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: t.inkMuted }}>MOVIMENTI RECENTI</span>
            <span className="mono" style={{ fontSize: 9, color: t.inkFaint }}>OGGI</span>
          </div>
          <div style={{ padding: "8px 0" }}>
            {MOVEMENTS.map(function (m, i) { return (<div key={m.id} style={{ padding: "11px 22px", display: "flex", alignItems: "center", gap: 14, borderBottom: i < MOVEMENTS.length - 1 ? "1px solid ".concat(t.div) : "none" }}>
                <div style={{
                width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                background: m.type === "carico" ? "rgba(61,122,74,0.1)" : t.accentGlow,
                color: m.type === "carico" ? t.success : t.accent,
            }}>
                  {m.type === "carico" ? "↓" : "↑"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: t.ink, fontWeight: 500 }}>{m.item}</div>
                  <div className="mono" style={{ fontSize: 9, color: t.inkFaint }}>{m.from} → {m.to} · {m.chef}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 500, color: m.type === "carico" ? t.success : t.accent }}>
                    {m.type === "carico" ? "+" : "-"}{m.qty} {m.unit}
                  </div>
                  <div className="mono" style={{ fontSize: 9, color: t.inkFaint }}>{m.time}</div>
                </div>
              </div>); })}
          </div>
        </div>
      </div>
    </div>);
}
function InventoryView(_a) {
    var t = _a.t;
    var _b = (0, react_1.useState)("frigo"), zone = _b[0], setZone = _b[1];
    var zones = { frigo: { label: "Frigo", icon: "❄️", temp: "2-4°C" }, congelatore: { label: "Congelatore", icon: "🧊", temp: "-18°C" }, dispensa: { label: "Dispensa", icon: "🏺", temp: "Ambiente" } };
    var items = INVENTORY[zone];
    return (<div>
      {/* Zone tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {Object.entries(zones).map(function (_a) {
            var key = _a[0], z = _a[1];
            return (<button key={key} onClick={function () { return setZone(key); }} style={{
                    padding: "12px 24px", borderRadius: 12, border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10, transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                    background: zone === key ? "linear-gradient(135deg, ".concat(t.secondary, ", ").concat(t.secondaryDeep, ")") : t.bgCard,
                    color: zone === key ? "#fff" : t.inkMuted,
                    boxShadow: zone === key ? "0 4px 20px ".concat(t.shadow) : "0 1px 4px ".concat(t.shadow),
                    border: zone === key ? "none" : "1px solid ".concat(t.div),
                    fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", fontWeight: 500,
                    transform: zone === key ? "scale(1.02)" : "scale(1)",
                }}>
            <span style={{ fontSize: 16 }}>{z.icon}</span>
            {z.label}
            <span style={{ fontSize: 8, opacity: 0.7 }}>{z.temp}</span>
            <span style={{
                    background: zone === key ? "rgba(255,255,255,0.2)" : t.div,
                    padding: "2px 8px", borderRadius: 10, fontSize: 9,
                }}>{INVENTORY[key].length}</span>
          </button>);
        })}
      </div>

      {/* Items grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {items.map(function (item, idx) {
            var pct = (item.qty / item.max) * 100;
            var isLow = item.qty <= item.min;
            return (<div key={item.id} style={{
                    background: t.bgCard, borderRadius: 12, padding: "18px 22px",
                    border: "1px solid ".concat(item.alert ? t.accent + "30" : t.div),
                    boxShadow: item.alert ? "0 4px 20px ".concat(t.accentGlow) : "0 1px 6px ".concat(t.shadow),
                    animation: "cardIn 0.4s cubic-bezier(0.4,0,0.2,1) ".concat(idx * 0.04, "s both"),
                    transition: "all 0.3s",
                }} onMouseEnter={function (e) { return e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={function (e) { return e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: t.ink, fontFamily: "var(--serif)", marginBottom: 3 }}>{item.name}</div>
                  <div className="mono" style={{ fontSize: 9, color: t.inkFaint, letterSpacing: "0.04em" }}>
                    {item.cat}{item.exp ? " \u00B7 Scad. ".concat(item.exp) : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24, fontWeight: 300, fontFamily: "var(--serif)", color: isLow ? t.danger : t.ink, lineHeight: 1 }}>
                    {item.qty}
                  </div>
                  <span className="mono" style={{ fontSize: 9, color: t.inkFaint }}>{item.unit}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <BarMini value={item.qty} max={item.max} t={t}/>
                <span className="mono" style={{ fontSize: 8, color: t.inkFaint, minWidth: 50, textAlign: "right" }}>
                  min {item.min}
                </span>
              </div>
              {(item.alert || isLow) && (<div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                  {item.alert && <Badge label="⚠ SCADENZA" color={t.danger} bg={t.accentGlow}/>}
                  {isLow && <Badge label="↓ SCORTA BASSA" color={t.warning} bg={t.goldFaint}/>}
                </div>)}
            </div>);
        })}
      </div>
    </div>);
}
function PrepsView(_a) {
    var t = _a.t;
    var statusCfg = { in_corso: { label: "IN CORSO", color: t.secondary }, completata: { label: "COMPLETATA", color: t.success }, da_fare: { label: "DA FARE", color: t.inkFaint } };
    return (<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {PREPS.map(function (p, idx) {
            var sc = statusCfg[p.status];
            return (<div key={p.id} style={{
                    background: t.bgCard, borderRadius: 14, overflow: "hidden",
                    border: "1px solid ".concat(t.div), boxShadow: "0 2px 10px ".concat(t.shadow),
                    animation: "cardIn 0.4s cubic-bezier(0.4,0,0.2,1) ".concat(idx * 0.06, "s both"),
                    transition: "all 0.3s",
                }} onMouseEnter={function (e) { return e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={function (e) { return e.currentTarget.style.transform = "translateY(0)"; }}>
            {/* progress strip */}
            <div style={{ height: 4, background: t.bgAlt }}>
              <div style={{ height: "100%", width: "".concat(p.progress, "%"), background: "linear-gradient(90deg, ".concat(sc.color, ", ").concat(sc.color, "88)"), transition: "width 1s ease", borderRadius: 2 }}/>
            </div>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 500, color: t.ink, fontStyle: "italic" }}>{p.name}</div>
                  <div className="mono" style={{ fontSize: 9, color: t.inkFaint, marginTop: 4 }}>{p.station} · Chef {p.chef}</div>
                </div>
                <Badge label={sc.label} color={sc.color} bg={sc.color + "15"}/>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  <BarMini value={p.progress} max={100} t={t} color={sc.color}/>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 500, color: sc.color, minWidth: 36 }}>{p.progress}%</span>
                </div>
                <span className="mono" style={{ fontSize: 10, color: t.inkFaint, marginLeft: 14 }}>⏱ {p.time}</span>
              </div>
            </div>
          </div>);
        })}
    </div>);
}
function ExpensesView(_a) {
    var t = _a.t;
    var total = EXPENSES.reduce(function (s, e) { return s + e.amount; }, 0);
    return (<div>
      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        <div style={{ background: t.bgCard, borderRadius: 14, padding: "20px 28px", flex: 1, border: "1px solid ".concat(t.div), boxShadow: "0 2px 10px ".concat(t.shadow) }}>
          <span className="mono" style={{ fontSize: 8, letterSpacing: "0.16em", color: t.inkFaint }}>TOTALE SETTIMANA</span>
          <div style={{ fontSize: 36, fontFamily: "var(--serif)", fontWeight: 400, color: t.ink, marginTop: 8 }}>€{total.toLocaleString()}</div>
        </div>
        <div style={{ background: t.bgCard, borderRadius: 14, padding: "20px 28px", flex: 1, border: "1px solid ".concat(t.div), boxShadow: "0 2px 10px ".concat(t.shadow) }}>
          <span className="mono" style={{ fontSize: 8, letterSpacing: "0.16em", color: t.inkFaint }}>FORNITORI ATTIVI</span>
          <div style={{ fontSize: 36, fontFamily: "var(--serif)", fontWeight: 400, color: t.ink, marginTop: 8 }}>{new Set(EXPENSES.map(function (e) { return e.vendor; })).size}</div>
        </div>
        <div style={{ background: t.bgCard, borderRadius: 14, padding: "20px 28px", flex: 1, border: "1px solid ".concat(t.div), boxShadow: "0 2px 10px ".concat(t.shadow) }}>
          <span className="mono" style={{ fontSize: 8, letterSpacing: "0.16em", color: t.inkFaint }}>MEDIA / COPERTO</span>
          <div style={{ fontSize: 36, fontFamily: "var(--serif)", fontWeight: 400, color: t.ink, marginTop: 8 }}>€{Math.round(total / 42)}</div>
        </div>
      </div>
      <div style={{ background: t.bgCard, borderRadius: 14, border: "1px solid ".concat(t.div), boxShadow: "0 2px 10px ".concat(t.shadow), overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px", padding: "12px 22px", borderBottom: "1px solid ".concat(t.divStrong) }}>
          {["FORNITORE", "CATEGORIA", "ARTICOLI", "IMPORTO", ""].map(function (h, i) { return (<span key={i} className="mono" style={{ fontSize: 8, letterSpacing: "0.14em", color: t.inkFaint, fontWeight: 500 }}>{h}</span>); })}
        </div>
        {EXPENSES.map(function (e, i) { return (<div key={e.id} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px", padding: "14px 22px", alignItems: "center",
                borderBottom: i < EXPENSES.length - 1 ? "1px solid ".concat(t.div) : "none",
                transition: "background 0.2s", cursor: "pointer",
            }} onMouseEnter={function (ev) { return ev.currentTarget.style.background = t.bgAlt; }} onMouseLeave={function (ev) { return ev.currentTarget.style.background = "transparent"; }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: t.ink }}>{e.vendor}</div>
              <span className="mono" style={{ fontSize: 9, color: t.inkFaint }}>{e.date}</span>
            </div>
            <Badge label={e.cat} color={t.inkSoft} bg={t.bgAlt}/>
            <span className="mono" style={{ fontSize: 12, color: t.inkMuted }}>{e.items}</span>
            <span style={{ fontSize: 16, fontFamily: "var(--serif)", fontWeight: 500, color: t.ink }}>€{e.amount.toLocaleString()}</span>
            <span className="mono" style={{ fontSize: 9, color: t.secondary, cursor: "pointer", textAlign: "right" }}>Dettagli →</span>
          </div>); })}
      </div>
    </div>);
}
function MovementsView(_a) {
    var t = _a.t;
    return (<div style={{ background: t.bgCard, borderRadius: 14, border: "1px solid ".concat(t.div), boxShadow: "0 2px 10px ".concat(t.shadow), overflow: "hidden" }}>
      <div style={{ padding: "16px 22px", borderBottom: "1px solid ".concat(t.div), display: "flex", justifyContent: "space-between" }}>
        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: t.inkMuted }}>REGISTRO MOVIMENTI</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Badge label="CARICHI" color={t.success} bg={t.success + "15"}/>
          <Badge label="SCARICHI" color={t.accent} bg={t.accentGlow}/>
        </div>
      </div>
      {MOVEMENTS.map(function (m, i) { return (<div key={m.id} style={{
                padding: "16px 22px", display: "flex", alignItems: "center", gap: 16,
                borderBottom: i < MOVEMENTS.length - 1 ? "1px solid ".concat(t.div) : "none",
                animation: "cardIn 0.4s ease ".concat(i * 0.06, "s both"),
            }}>
          <div style={{
                width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                background: m.type === "carico" ? "linear-gradient(135deg, ".concat(t.success, ", ").concat(t.success, "CC)") : "linear-gradient(135deg, ".concat(t.accent, ", ").concat(t.accentDeep, ")"),
                color: "#fff", fontSize: 18, fontWeight: 300, boxShadow: "0 3px 10px ".concat(t.shadow),
            }}>
            {m.type === "carico" ? "+" : "−"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: t.ink, fontFamily: "var(--serif)" }}>{m.item}</div>
            <div className="mono" style={{ fontSize: 9, color: t.inkFaint, marginTop: 2 }}>
              {m.from} → {m.to} · {m.chef}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 16, fontWeight: 500, color: m.type === "carico" ? t.success : t.accent }}>
              {m.type === "carico" ? "+" : "−"}{m.qty} {m.unit}
            </div>
            <div className="mono" style={{ fontSize: 9, color: t.inkFaint }}>{m.time}</div>
          </div>
        </div>); })}
    </div>);
}
/* ═══════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════ */
function KitchenManagement() {
    var _a = (0, react_1.useState)("carta"), themeKey = _a[0], setThemeKey = _a[1];
    var _b = (0, react_1.useState)("dashboard"), section = _b[0], setSection = _b[1];
    var _c = (0, react_1.useState)(false), ready = _c[0], setReady = _c[1];
    var _d = (0, react_1.useState)(false), sideCollapsed = _d[0], setSideCollapsed = _d[1];
    var t = THEMES[themeKey];
    (0, react_1.useEffect)(function () { setTimeout(function () { return setReady(true); }, 60); }, []);
    var NAV = [
        { key: "dashboard", label: "Dashboard", icon: "◫" },
        { key: "giacenze", label: "Giacenze", icon: "❄" },
        { key: "preparazioni", label: "Preparazioni", icon: "◷" },
        { key: "movimenti", label: "Movimenti", icon: "⇄" },
        { key: "spese", label: "Spese", icon: "€" },
    ];
    var sectionTitle = { dashboard: "Command Center", giacenze: "Giacenze & Inventario", preparazioni: "Organizzazione Preparazioni", movimenti: "Carico / Scarico", spese: "Gestione Spese" };
    return (<div style={{ minHeight: "100vh", display: "flex", fontFamily: "var(--serif)", color: t.ink, background: t.bg, transition: "background 0.6s ease, color 0.4s ease" }}>
      <style>{"\n        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=JetBrains+Mono:wght@300;400;500;600&display=swap');\n        :root { --serif: 'Playfair Display', Georgia, serif; --mono: 'JetBrains Mono', monospace; }\n        * { margin:0; padding:0; box-sizing:border-box; }\n        .mono { font-family: var(--mono); }\n        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }\n        @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }\n        @keyframes fadeIn { from{opacity:0} to{opacity:1} }\n        ::-webkit-scrollbar { width:4px; }\n        ::-webkit-scrollbar-track { background:transparent; }\n        ::-webkit-scrollbar-thumb { background:".concat(t.goldDim, "; border-radius:2px; }\n      ")}</style>

      {/* ═══ SIDEBAR ═══ */}
      <aside style={{
            width: sideCollapsed ? 68 : 240,
            background: "linear-gradient(180deg, ".concat(t.secondary, ", ").concat(t.secondaryDeep, ")"),
            display: "flex", flexDirection: "column",
            transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
            position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 20,
            boxShadow: "4px 0 24px ".concat(t.shadowStrong),
            overflow: "hidden",
        }}>
        {/* Logo area */}
        <div style={{ padding: sideCollapsed ? "20px 12px" : "24px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42, height: 42, minWidth: 42, borderRadius: "50%",
            border: "2px solid ".concat(t.goldBright),
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.06)",
            boxShadow: "0 0 0 4px ".concat(t.goldFaint),
        }}>
            <span style={{ fontSize: 9, color: t.goldBright, fontFamily: "var(--mono)", fontWeight: 600 }}>★★★</span>
          </div>
          {!sideCollapsed && (<div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "0.12em", color: "#fff", textTransform: "uppercase", whiteSpace: "nowrap" }}>La Maison</div>
              <div className="mono" style={{ fontSize: 7, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>GESTIONE CUCINA</div>
            </div>)}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(function (n) {
            var active = section === n.key;
            return (<button key={n.key} onClick={function () { return setSection(n.key); }} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: sideCollapsed ? "12px 16px" : "12px 18px",
                    borderRadius: 10, border: "none", cursor: "pointer",
                    background: active ? "rgba(255,255,255,0.12)" : "transparent",
                    color: active ? "#fff" : "rgba(255,255,255,0.45)",
                    fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em",
                    transition: "all 0.25s", textAlign: "left", width: "100%",
                    borderLeft: active ? "3px solid ".concat(t.goldBright) : "3px solid transparent",
                }}>
                <span style={{ fontSize: 16, minWidth: 20, textAlign: "center" }}>{n.icon}</span>
                {!sideCollapsed && <span style={{ whiteSpace: "nowrap" }}>{n.label}</span>}
              </button>);
        })}
        </nav>

        {/* Theme switcher */}
        <div style={{ padding: sideCollapsed ? "12px 8px 16px" : "16px 14px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {!sideCollapsed && <div className="mono" style={{ fontSize: 7, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", marginBottom: 10, paddingLeft: 4 }}>TEMA</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: sideCollapsed ? "center" : "flex-start" }}>
            {Object.entries(THEMES).map(function (_a) {
            var key = _a[0], th = _a[1];
            return (<button key={key} onClick={function () { return setThemeKey(key); }} title={th.name} style={{
                    width: sideCollapsed ? 36 : 48, height: sideCollapsed ? 36 : 32,
                    borderRadius: 8, border: themeKey === key ? "2px solid ".concat(t.goldBright) : "2px solid rgba(255,255,255,0.1)",
                    background: th.bg, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: sideCollapsed ? 14 : 12,
                    transition: "all 0.3s", transform: themeKey === key ? "scale(1.08)" : "scale(1)",
                    boxShadow: themeKey === key ? "0 0 12px ".concat(t.goldFaint) : "none",
                }}>{th.icon}</button>);
        })}
          </div>
        </div>

        {/* Collapse toggle */}
        <button onClick={function () { return setSideCollapsed(!sideCollapsed); }} style={{
            padding: "14px", border: "none", background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            transition: "all 0.25s", fontFamily: "var(--mono)",
        }}>
          {sideCollapsed ? "→" : "← Comprimi"}
        </button>
      </aside>

      {/* ═══ MAIN AREA ═══ */}
      <div style={{ flex: 1, marginLeft: sideCollapsed ? 68 : 240, transition: "margin-left 0.4s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column" }}>
        {/* ── TOP BAR ── */}
        <header style={{
            padding: "16px 36px",
            background: t.bgGlass, backdropFilter: "blur(20px)",
            borderBottom: "1px solid ".concat(t.div),
            display: "flex", justifyContent: "space-between", alignItems: "center",
            position: "sticky", top: 0, zIndex: 10,
            transition: "background 0.4s",
        }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "0.06em", color: t.ink }}>{sectionTitle[section]}</div>
            <div className="mono" style={{ fontSize: 9, color: t.inkFaint, letterSpacing: "0.1em", marginTop: 3 }}>
              SERVIZIO SERALE · 38/42 COPERTI
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <LiveClock t={t}/>
            <div style={{ width: 1, height: 28, background: t.div }}/>
            <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 18px", borderRadius: 10,
            background: "linear-gradient(135deg, ".concat(t.accent, ", ").concat(t.accentDeep, ")"),
            boxShadow: "0 3px 14px ".concat(t.accentGlow),
        }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "pulse 1.2s ease-in-out infinite" }}/>
              <span className="mono" style={{ fontSize: 10, color: "#fff", fontWeight: 500, letterSpacing: "0.08em" }}>
                {ALERTS.filter(function (a) { return a.level === "critical"; }).length} ALERT
              </span>
            </div>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <main style={{ flex: 1, padding: "28px 36px 48px", overflow: "auto" }} key={section}>
          <div style={{ animation: ready ? "cardIn 0.45s cubic-bezier(0.4,0,0.2,1) both" : "none" }}>
            {section === "dashboard" && <DashboardView t={t}/>}
            {section === "giacenze" && <InventoryView t={t}/>}
            {section === "preparazioni" && <PrepsView t={t}/>}
            {section === "movimenti" && <MovementsView t={t}/>}
            {section === "spese" && <ExpensesView t={t}/>}
          </div>
        </main>
      </div>
    </div>);
}
