#!/usr/bin/env python3
"""
fix_duplicate_keys.py
=====================
Fix chirurgico per 2 warning in KitchenPro.tsx:

1. Riga ~7094: duplicate key "dispensa" in locMap object
2. Riga ~7025: duplicate key "border" in style object

NON tocca nient'altro. Build deve rimanere verde.
"""

from pathlib import Path
import sys

FILE = Path("/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx")

if not FILE.exists():
    print(f"ERRORE: file non trovato: {FILE}")
    sys.exit(1)

src = FILE.read_text(encoding="utf-8")
original = src

fixes = []

# ─────────────────────────────────────────────────────────────────────────────
# FIX 1: duplicate "dispensa" in locMap (riga ~7094)
# Rimuove il secondo dispensa:"dry" ridondante
# ─────────────────────────────────────────────────────────────────────────────
OLD1 = 'const locMap:{[k:string]:string}={frigo:"fridge",frigorifico:"fridge",fridge:"fridge",freezer:"freezer",congelatore:"freezer",dispensa:"dry",dispensa:"dry",secco:"dry",banco:"counter",servizio:"counter"};'
NEW1 = 'const locMap:{[k:string]:string}={frigo:"fridge",frigorifico:"fridge",fridge:"fridge",freezer:"freezer",congelatore:"freezer",dispensa:"dry",secco:"dry",banco:"counter",servizio:"counter"};'
fixes.append(("FIX 1 — duplicate key 'dispensa' in locMap", OLD1, NEW1))

# ─────────────────────────────────────────────────────────────────────────────
# FIX 2: duplicate "border" in style object (riga ~7025)
# Il pattern è: border:`1px solid ${t.div}`, seguito da altro border
# Cerchiamo il blocco esatto con il contesto delle righe 7023-7026
# ─────────────────────────────────────────────────────────────────────────────
OLD2 = (
    'background:(state.selectedKitchenId||state.kitchens[0]?.id)===k.id'
    '?`linear-gradient(135deg,${t.gold},${t.goldBright})`:`${t.bgAlt}`,'
    '\n                  color:(state.selectedKitchenId||state.kitchens[0]?.id)===k.id?"#fff":t.inkMuted,'
    '\n                  border:`1px solid ${t.div}`,'
    '\n                  ^'
)

# Approccio più sicuro: cerca il pattern duplicato nel contesto reale
# Trova tutte le occorrenze di border duplicato vicino al kitchen selector
import re

# Cerca il blocco style del kitchen selector button
pattern = re.compile(
    r'(background:\(state\.selectedKitchenId\|'
    r'\|state\.kitchens\[0\]\?\.id\)===k\.id'
    r'\?`linear-gradient\(135deg,\$\{t\.gold\},\$\{t\.goldBright\}\)`:`\$\{t\.bgAlt\}`,'
    r'\s*color:\(state\.selectedKitchenId\|'
    r'\|state\.kitchens\[0\]\?\.id\)===k\.id\?"#fff":t\.inkMuted,)'
    r'(\s*border:`1px solid \$\{t\.div\}`,)'
    r'(\s*border:`1px solid \$\{t\.div\}`,)'
)

match = pattern.search(src)
if match:
    # Rimuove il secondo border duplicato
    old_block = match.group(0)
    new_block = match.group(1) + match.group(2)  # solo il primo border
    fixes.append(("FIX 2 — duplicate key 'border' in kitchen selector style", old_block, new_block))
else:
    # Fallback: cerca pattern più semplice
    OLD2_SIMPLE = 'border:`1px solid ${t.div}`,\n                  border:`1px solid ${t.div}`,'
    NEW2_SIMPLE = 'border:`1px solid ${t.div}`,'
    if OLD2_SIMPLE in src:
        fixes.append(("FIX 2 — duplicate key 'border' (fallback)", OLD2_SIMPLE, NEW2_SIMPLE))
    else:
        print("⚠  FIX 2: pattern 'border' duplicato non trovato con regex — skip")
        print("   Controlla manualmente riga ~7025")

# ─────────────────────────────────────────────────────────────────────────────
# APPLICA
# ─────────────────────────────────────────────────────────────────────────────
ok = True
for label, old, new in fixes:
    count = src.count(old)
    if count == 0:
        print(f"⚠  {label}: pattern NON trovato — skip")
        ok = False
    elif count > 1:
        print(f"⚠  {label}: trovato {count} volte — ambiguo, skip")
        ok = False
    else:
        src = src.replace(old, new)
        print(f"✓  {label}")

if src != original:
    FILE.write_text(src, encoding="utf-8")
    print(f"\n✅ File aggiornato ({FILE.name})")
    print("   Esegui: npm run build")
else:
    print("\nℹ  Nessuna modifica applicata.")
    if not ok:
        print("   Alcuni pattern non trovati — il file potrebbe essere già corretto")
        print("   o il testo è leggermente diverso da quello atteso.")
