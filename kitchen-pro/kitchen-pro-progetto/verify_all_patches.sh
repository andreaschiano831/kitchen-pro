#!/usr/bin/env bash
# verify_all_patches.sh
# Applies kitchen-pro-unified.patch and verifies the full build + lint pipeline.
# Exit code 0 = everything OK. Exit code != 0 = failure with reason printed.
set -euo pipefail

PATCH_FILE="$(dirname "$0")/kitchen-pro-unified.patch"
PROJECT_DIR="$(dirname "$0")/kitchen-pro"   # adjust if your layout differs

# ── Colour helpers ─────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC}  $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*"; exit 1; }
info() { echo -e "${YELLOW}[INFO]${NC} $*"; }

# ── 1. package.json present in project root ─────────────────────────────────
info "Checking project structure..."
[[ -f "${PROJECT_DIR}/package.json" ]] \
  || fail "package.json not found in ${PROJECT_DIR}. Run this script from the repo root."
ok "package.json found"

# ── 2. Node / npm available ──────────────────────────────────────────────────
info "Checking Node.js and npm..."
command -v node >/dev/null 2>&1 || fail "node not found. Install Node.js >= 18."
command -v npm  >/dev/null 2>&1 || fail "npm not found."
NODE_VER=$(node --version)
NPM_VER=$(npm --version)
ok "node ${NODE_VER}  npm ${NPM_VER}"

# ── 3. Patch file present ────────────────────────────────────────────────────
info "Checking patch file..."
[[ -f "${PATCH_FILE}" ]] \
  || fail "Patch file not found: ${PATCH_FILE}"
ok "Patch file: ${PATCH_FILE}"

# ── 4. Apply patch (git apply) ───────────────────────────────────────────────
info "Applying kitchen-pro-unified.patch..."
# --check first (dry-run) so we get a clear error before modifying files
if ! git apply --check "${PATCH_FILE}" 2>&1; then
  fail "Patch does not apply cleanly (dry-run failed). Check for existing hunks or merge conflicts."
fi
git apply "${PATCH_FILE}" \
  || fail "git apply failed. Patch may already be applied or there are conflicts."
ok "Patch applied"

# ── 5. npm install ───────────────────────────────────────────────────────────
info "Running npm install in ${PROJECT_DIR}..."
(cd "${PROJECT_DIR}" && npm install) \
  || fail "npm install failed"
ok "npm install OK"

# ── 6. npm run build (tsc -b && vite build) ──────────────────────────────────
info "Running npm run build..."
(cd "${PROJECT_DIR}" && npm run build) \
  || fail "npm run build failed (TypeScript or Vite error)"
ok "npm run build OK"

# ── 7. npm run lint ───────────────────────────────────────────────────────────
info "Running npm run lint..."
LINT_OUTPUT=$(cd "${PROJECT_DIR}" && npm run lint 2>&1) || {
  echo "${LINT_OUTPUT}"
  # Count actual errors (lines that end with 'error')
  ERR_COUNT=$(echo "${LINT_OUTPUT}" | grep -c ' error ' || true)
  fail "npm run lint failed with ${ERR_COUNT} error(s). See output above."
}
ok "npm run lint OK"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN} All checks passed. Kitchen Pro build is clean.        ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
exit 0
