#!/usr/bin/env bash
# COMMITTED-SECRET SCAN (A2, r414-review Segment A). Dependency-free grep for
# value-shaped secrets in tracked files. Patterns are tight enough that prose
# mentions ("the sk_live_ key", "sbp_...") don't match — only real values do.
# The Supabase publishable/anon key (sb_publishable_… / legacy anon JWT) is
# public-by-design and intentionally NOT flagged.
# Run: bash dev/check-secrets.sh
set -u
self='dev/check-secrets.sh'
# Extended-regex alternation of value-shaped secret patterns.
pat='sbp_[0-9a-f]{40}'
pat+='|sk_(live|test)_[0-9A-Za-z]{20,}'
pat+='|rk_live_[0-9A-Za-z]{20,}'
pat+='|whsec_[0-9A-Za-z]{20,}'
pat+='|xox[baprs]-[0-9A-Za-z-]{10,}'
pat+='|AKIA[0-9A-Z]{16}'
pat+='|-----BEGIN [A-Z ]*PRIVATE KEY-----'
pat+='|SUPABASE_SERVICE_ROLE_KEY[[:space:]]*[:=][[:space:]]*.?ey[A-Za-z0-9_-]{20,}'

hits=0
while IFS= read -r f; do
  [ "$f" = "$self" ] && continue
  [ -f "$f" ] || continue
  if grep -nEI "$pat" "$f" >/dev/null 2>&1; then
    echo "SECRET? $f"
    grep -nEI "$pat" "$f" | sed 's/\(.\{12\}\).*/\1…[redacted]/' | head -3
    hits=$((hits+1))
  fi
done < <(git ls-files)

if [ "$hits" -gt 0 ]; then
  echo "COMMITTED-SECRET SCAN: $hits file(s) with a value-shaped secret — rotate + remove"
  exit 1
fi
echo "COMMITTED-SECRET SCAN: clean"
