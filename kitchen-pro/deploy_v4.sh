#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
#  Kitchen Pro v4 — Deploy Script
#  Uso: bash deploy_v4.sh /percorso/KitchenProFull_v4.jsx
# ═══════════════════════════════════════════════════════════

TARGET="/workspaces/kitchen-pro/kitchen-pro/src/pages/KitchenProFull.tsx"
SOURCE="${1:-./KitchenProFull_v4.jsx}"

if [ ! -f "$SOURCE" ]; then
  echo "❌ File sorgente non trovato: $SOURCE"
  exit 1
fi

echo "📦 Backup del file corrente..."
cp "$TARGET" "${TARGET%.tsx}.bak_pre_v4_$(date +%Y%m%d_%H%M).tsx"

echo "📝 Copia nuova versione..."
cp "$SOURCE" "$TARGET"

echo "🔨 Build..."
cd /workspaces/kitchen-pro/kitchen-pro
npm run build 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Build completata con successo!"
  echo ""
  echo "🚀 Deploy su Netlify..."
  netlify deploy --prod --dir=dist
else
  echo "❌ Build fallita. Ripristino backup..."
  cp "${TARGET%.tsx}.bak_pre_v4_$(date +%Y%m%d_*.tsx 2>/dev/null | head -1)" "$TARGET" 2>/dev/null || echo "Backup non trovato — ripristino manuale necessario"
fi
