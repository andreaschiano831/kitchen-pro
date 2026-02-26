from __future__ import annotations

import argparse
import datetime as dt
import json
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

MAPPING = {
    # store + types + data
    "kitchenStore.tsx": "src/store/kitchenStore.tsx",
    "freezer.ts": "src/types/freezer.ts",
    "catalog.ts": "src/data/catalog.ts",
    "catalog.user.json": "src/data/catalog.user.json",

    # components
    "StockIntake.tsx": "src/components/StockIntake.tsx",

    # pages
    "Members.tsx": "src/pages/Members.tsx",
    "Join.tsx": "src/pages/Join.tsx",
    "SwitchUser.tsx": "src/pages/SwitchUser.tsx",
    "Capture.tsx": "src/pages/Capture.tsx",
    "Dashboard.tsx": "src/pages/Dashboard.tsx",
    "MEP.tsx": "src/pages/MEP.tsx",
    "Search.tsx": "src/pages/Search.tsx",
    "Today.tsx": "src/pages/Today.tsx",

    # utils
    "export.ts": "src/utils/export.ts",
    "ledger.ts": "src/utils/ledger.ts",
    "parser.ts": "src/utils/parser.ts",
    "persistence.ts": "src/utils/persistence.ts",
    "reportDoc.ts": "src/utils/reportDoc.ts",
}

KITCHENPRO_SRC_NAME = "KitchenProFull.jsx"
KITCHENPRO_DST = "src/KitchenProFull.tsx"

CLEANUP_ROOT_FILES = [
    "KitchenProFull.jsx",
    "KitchenProFull.jsx.bak",
]


def die(msg: str, code: int = 1) -> None:
    print(f"\nERRORE: {msg}\n", file=sys.stderr)
    sys.exit(code)


def run(cmd: list[str], cwd: Path) -> None:
    print(f"\n$ {' '.join(cmd)}")
    p = subprocess.run(cmd, cwd=str(cwd))
    if p.returncode != 0:
        die(f"Comando fallito ({p.returncode}): {' '.join(cmd)}")


def find_patch_root(extracted: Path) -> Path:
    # Se lo zip contiene una singola cartella wrapper, usala come root
    children = [p for p in extracted.iterdir()]
    dirs = [p for p in children if p.is_dir()]
    files = [p for p in children if p.is_file()]
    if len(dirs) == 1 and len(files) == 0:
        return dirs[0]
    return extracted


def backup_file(project: Path, dst_rel: str, backup_dir: Path) -> None:
    dst = project / dst_rel
    if dst.exists():
        target = backup_dir / dst_rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(dst, target)


def copy_one(project: Path, patch_root: Path, src_name: str, dst_rel: str, backup_dir: Path) -> bool:
    # cerca il file nello zip (anche se sta in sotto-cartelle)
    matches = list(patch_root.rglob(src_name))
    if not matches:
        print(f"SKIP: {src_name} non trovato nello zip")
        return False
    src = matches[0]
    dst = project / dst_rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    backup_file(project, dst_rel, backup_dir)
    shutil.copy2(src, dst)
    print(f"OK: {src_name} -> {dst_rel}")
    return True


def validate_json(path: Path) -> None:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        die(f"JSON non valido in {path}: {e}")
    if not isinstance(data, list):
        die(f"{path} deve contenere un ARRAY JSON (lista), non un oggetto.")
    print(f"OK: JSON valido ({len(data)} items): {path}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", default=".", help="Root progetto (dove c'è package.json)")
    ap.add_argument("--patch-zip", required=True, help="Zip dei prompt (es: 'files (11).zip')")
    ap.add_argument("--run-install", action="store_true", help="Esegue npm install")
    ap.add_argument("--run-build", action="store_true", help="Esegue npm run build")
    ap.add_argument("--cleanup", action="store_true", help="Rimuove vecchi file root (KitchenProFull.jsx etc)")
    args = ap.parse_args()

    project = Path(args.project).resolve()
    if not (project / "package.json").exists():
        die(f"Non trovo package.json in {project}")
    if not (project / "src").exists():
        die(f"Non trovo la cartella src/ in {project}")

    patch_zip = Path(args.patch_zip).resolve()
    if not patch_zip.exists():
        die(f"Zip non trovato: {patch_zip}")

    stamp = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = project / f".backup_prompts_{stamp}"
    backup_dir.mkdir(parents=True, exist_ok=True)
    print(f"Backup in: {backup_dir}")

    with tempfile.TemporaryDirectory() as td:
        td_path = Path(td)
        with zipfile.ZipFile(patch_zip, "r") as z:
            z.extractall(td_path)
        patch_root = find_patch_root(td_path)
        print(f"Patch root: {patch_root}")

        # copia file mappati
        for src_name, dst_rel in MAPPING.items():
            copy_one(project, patch_root, src_name, dst_rel, backup_dir)

        # KitchenProFull: lo portiamo in src/ come TSX (contenuto invariato)
        kp_matches = list(patch_root.rglob(KITCHENPRO_SRC_NAME))
        if kp_matches:
            kp_src = kp_matches[0]
            kp_dst = project / KITCHENPRO_DST
            kp_dst.parent.mkdir(parents=True, exist_ok=True)
            backup_file(project, KITCHENPRO_DST, backup_dir)
            shutil.copy2(kp_src, kp_dst)
            print(f"OK: {KITCHENPRO_SRC_NAME} -> {KITCHENPRO_DST}")
        else:
            print(f"NOTE: {KITCHENPRO_SRC_NAME} non presente nello zip. Se lo hai, mettilo in root e rilancia.")

    # cleanup (opzionale)
    if args.cleanup:
        for name in CLEANUP_ROOT_FILES:
            p = project / name
            if p.exists():
                shutil.copy2(p, backup_dir / name)
                p.unlink()
                print(f"OK: cleanup rimosso {name} (backup salvato)")
        # anche versioni KitchenProV* in root: le archiviamo
        for p in project.glob("KitchenProV*.jsx"):
            (backup_dir / "archive").mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, backup_dir / "archive" / p.name)
            p.unlink()
            print(f"OK: cleanup rimosso {p.name} (backup in archive/)")

    # valida JSON catalogo
    catalog_json = project / "src/data/catalog.user.json"
    if catalog_json.exists():
        validate_json(catalog_json)

    # comandi npm (opzionali)
    if args.run_install:
        run(["npm", "install"], project)
    if args.run_build:
        run(["npm", "run", "build"], project)

    print("\nFATTO.")
    print("Se ora vuoi avviare: npm run dev")
    print("Se qualcosa va storto: ripristina dalla cartella backup stampata sopra.")


if __name__ == "__main__":
    main()
