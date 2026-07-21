#!/usr/bin/env bash
# Run a SQL file against prod via the Supabase Management API.
# Usage: bash dev/sbp-query.sh <file.sql>
# Token is NEVER stored in the repo: read from $SUPABASE_MGMT_TOKEN
# or the session scratchpad file provided at runtime.
set -euo pipefail
SQL_FILE="${1:?usage: bash dev/sbp-query.sh <file.sql>}"
TOKEN="${SUPABASE_MGMT_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  for f in /tmp/claude-0/*/*/scratchpad/.sbp_token; do
    [ -f "$f" ] && TOKEN="$(cat "$f")" && break
  done
fi
[ -z "$TOKEN" ] && { echo "no management token found"; exit 1; }
python3 - "$SQL_FILE" "$TOKEN" <<'PY'
import json,sys,urllib.request,ssl
sql=open(sys.argv[1]).read()
ctx=ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')
req=urllib.request.Request(
  'https://api.supabase.com/v1/projects/vshtftzrlepedydmkcnm/database/query',
  data=json.dumps({'query':sql}).encode(),
  headers={'Authorization':'Bearer '+sys.argv[2],'Content-Type':'application/json'},method='POST')
try:
    with urllib.request.urlopen(req,context=ctx) as r:
        print('OK',r.status,r.read().decode()[:300])
except urllib.error.HTTPError as e:
    print('ERR',e.code,e.read().decode()[:400]); sys.exit(1)
PY
