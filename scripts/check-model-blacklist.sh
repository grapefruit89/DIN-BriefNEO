#!/usr/bin/env bash
# =============================================================================
# scripts/check-model-blacklist.sh — KI-Modell Blacklist Check
# DIN-BriefNEO · v4 Core V13 | SPEC-038
# =============================================================================
# PRINZIP: Blacklist statt Whitelist.
#   Neue Modelle brauchen keine manuelle Freischaltung.
#   Veraltete Modelle werden via Regex-Pattern gefiltert.
#
# USAGE:
#   bash scripts/check-model-blacklist.sh "gpt-3.5-turbo"
#   → exit 1 wenn Modell geblockt
#   → exit 0 wenn Modell erlaubt
# =============================================================================

set -euo pipefail
MODEL="${1:-}"
if [[ -z "$MODEL" ]]; then echo "Usage: $0 <model-id>" >&2; exit 2; fi

BLACKLIST=(
  "gpt-3\.5"
  "gpt-4-0314"
  "gpt-4-0613"
  "text-davinci"
  "claude-1\."
  "claude-2\.0$"
  "-preview$"
  "instruct$"
  "vision-preview"
)

BLOCKED=0; REASON=""
for pattern in "${BLACKLIST[@]}"; do
  if echo "$MODEL" | grep -qiE "$pattern"; then
    BLOCKED=1; REASON="Matches: $pattern"; break
  fi
done

if [[ "$BLOCKED" -eq 1 ]]; then
  echo "BLOCKED: $MODEL — $REASON"; exit 1
else
  echo "OK: $MODEL"; exit 0
fi
