#!/usr/bin/env python3
"""
Installer "kitchen-pro" — Patch P1A (Tailwind) + P1B (Routing/Layout).
- Scrive/aggiorna file in /src
- Crea tailwind.config.js e postcss.config.cjs in root
- Installa dipendenze (npm/pnpm/yarn) e verifica build

USO:
1) apri questo file e imposta PROJECT_DIR
2) esegui: python3 installa_kitchen_pro_p1a_p1b.py

Nota Windows:
- usa stringa raw: r"C:\percorso\kitchen-pro"
- oppure forward slashes: "C:/percorso/kitchen-pro"
"""
from __future__ import annotations

import json
import os
import subprocess
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple

# === 1) METTI QUI IL PERCORSO DELLA ROOT DEL PROGETTO (dove c'è package.json) ===
PROJECT_DIR = "/workspaces/kitchen-pro"

STAMP = datetime.now().strftime("%Y%m%d-%H%M%S")

def die(msg: str, code: int = 1) -> None:
    print(f"\n[ERRORE] {msg}\n")
    raise SystemExit(code)

def info(msg: str) -> None:
    print(f"[OK] {msg}")

def warn(msg: str) -> None:
    print(f"[WARN] {msg}")

def run(cmd: list[str], cwd: Path) -> None:
    print(f"\n$ {' '.join(cmd)}")
    p = subprocess.run(cmd, cwd=str(cwd))
    if p.returncode != 0:
        die(f"Comando fallito (exit {p.returncode}): {' '.join(cmd)}")

def detect_pkg_manager(root: Path) -> Tuple[str, list[str]]:
    # ritorna (name, runner_prefix)
    if (root / "pnpm-lock.yaml").exists():
        return "pnpm", ["pnpm"]
    if (root / "yarn.lock").exists():
        return "yarn", ["yarn"]
    return "npm", ["npm"]

def backup_if_exists(path: Path) -> None:
    if path.exists():
        bak = path.with_suffix(path.suffix + f".bak.{STAMP}")
        bak.write_bytes(path.read_bytes())
        warn(f"Backup creato: {bak.relative_to(path.parents[3] if len(path.parents) > 3 else path.parent)}")

def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

def write_file(path: Path, content: str) -> None:
    ensure_parent(path)
    backup_if_exists(path)
    path.write_text(content, encoding="utf-8")
    info(f"Scritto: {path}")

# -------------------------
# Contenuti PATCH P1A
# -------------------------
INDEX_CSS = """@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
body { @apply bg-zinc-50 text-zinc-900; }
"""

TAILWIND_CONFIG = """/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
"""

POSTCSS_CONFIG = """module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
"""

# -------------------------
# Contenuti PATCH P1B
# -------------------------
MAIN_TSX = """import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
"""

APP_TSX = """export default function App() {
  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-semibold p-4">Kitchen Pro</h1>
    </div>
  )
}
"""

ROUTES_INDEX = """import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import PrepList from "../pages/PrepList";
import Stock from "../pages/Stock";
import Orders from "../pages/Orders";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/prep", element: <PrepList /> },
      { path: "/stock", element: <Stock /> },
      { path: "/orders", element: <Orders /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
"""

LAYOUT_TSX = """import { NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/", label: "Home" },
  { to: "/prep", label: "Preparazioni" },
  { to: "/stock", label: "Giacenze" },
  { to: "/orders", label: "Ordini" },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Kitchen Pro</div>
          <nav className="flex gap-2">
            {nav.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={({ isActive }) =>
                  "px-3 py-1 rounded text-sm " +
                  (isActive ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100")
                }
              >
                {i.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 text-xs text-zinc-500">
          v0.1 • local-first
        </div>
      </footer>
    </div>
  );
}
"""

HOME_TSX = """export default function Home() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <p className="text-zinc-700">
        Benvenuto. Usa la barra in alto per navigare tra Preparazioni, Giacenze e Ordini.
      </p>
    </div>
  );
}
"""

PREP_TSX = """export default function PrepList() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Preparazioni</h2>
      <div className="rounded border bg-white p-4 text-zinc-700">
        Placeholder: qui inseriremo checklist, batch, scadenze e rigenerazioni.
      </div>
    </div>
  );
}
"""

STOCK_TSX = """export default function Stock() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Giacenze</h2>
      <div className="rounded border bg-white p-4 text-zinc-700">
        Placeholder: qui inseriremo carico/scarico, unità, inventario, alert.
      </div>
    </div>
  );
}
"""

ORDERS_TSX = """export default function Orders() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Ordini</h2>
      <div className="rounded border bg-white p-4 text-zinc-700">
        Placeholder: qui inseriremo fornitori, liste ordine, export.
      </div>
    </div>
  );
}
"""

def main() -> None:
    root = Path(PROJECT_DIR).expanduser().resolve()

    if not root.exists():
        die(f"PROJECT_DIR non esiste: {root}")
    pkg = root / "package.json"
    src = root / "src"
    if not pkg.exists():
        die(f"Non trovo package.json in: {root}\nApri in VS Code la cartella giusta (root progetto).")
    if not src.exists():
        die(f"Non trovo /src in: {root}")

    info(f"Root progetto: {root}")

    # 1) Scrittura file Tailwind
    write_file(root / "tailwind.config.js", TAILWIND_CONFIG)
    write_file(root / "postcss.config.cjs", POSTCSS_CONFIG)
    write_file(root / "src" / "index.css", INDEX_CSS)

    # 2) Scrittura file Routing/Layout
    write_file(root / "src" / "main.tsx", MAIN_TSX)
    write_file(root / "src" / "App.tsx", APP_TSX)
    write_file(root / "src" / "routes" / "index.tsx", ROUTES_INDEX)
    write_file(root / "src" / "components" / "Layout.tsx", LAYOUT_TSX)
    write_file(root / "src" / "pages" / "Home.tsx", HOME_TSX)
    write_file(root / "src" / "pages" / "PrepList.tsx", PREP_TSX)
    write_file(root / "src" / "pages" / "Stock.tsx", STOCK_TSX)
    write_file(root / "src" / "pages" / "Orders.tsx", ORDERS_TSX)

    # 3) Install deps + build
    pm, runner = detect_pkg_manager(root)
    info(f"Package manager: {pm}")

    # install deps
    if pm == "npm":
        run(["npm", "i", "-D", "tailwindcss", "postcss", "autoprefixer"], cwd=root)
        run(["npm", "i", "react-router-dom"], cwd=root)
        run(["npm", "run", "build"], cwd=root)
    elif pm == "pnpm":
        run(["pnpm", "add", "-D", "tailwindcss", "postcss", "autoprefixer"], cwd=root)
        run(["pnpm", "add", "react-router-dom"], cwd=root)
        run(["pnpm", "run", "build"], cwd=root)
    else:  # yarn
        run(["yarn", "add", "-D", "tailwindcss", "postcss", "autoprefixer"], cwd=root)
        run(["yarn", "add", "react-router-dom"], cwd=root)
        run(["yarn", "build"], cwd=root)

    info("Patch applicate e build GREEN ✅")
    print("\nProva in dev:\n  npm run dev   (oppure pnpm dev / yarn dev)\n")

if __name__ == "__main__":
    main()

