#!/usr/bin/env python3
"""r438 — resolve a dev/e2e-alt-paths.js cherry-pick conflict BY DRILL AUTHORITY.

Union-merging this file has broken the tree three times: a reworking agent DELETES the
stale entries for its own drill, and a union quietly resurrects them, so every worktree is
green and the merged tree is red.

The rule the campaign settled on: **for a given drill key, exactly one side is
authoritative, for additions and deletions alike** — the side that reworked that drill.
This applies it mechanically instead of by hand, which is where the mistakes came from.

    python3 dev/merge-altpaths.py <file> theirs:rollup,filterpass

Everything not named goes to OURS (already-integrated work). Non-entry lines — comments
between entries — follow OURS, since those are the integrated notes.
"""
import re
import sys

ENTRY = re.compile(r"\s*\{ key: '([a-z0-9_]+)'")
CONFLICT = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*\n', re.S)


def split_entries(block):
    """Split a conflict side into [{key, lines}], key=None for interstitial comment lines."""
    out, cur = [], None
    for line in block.split('\n'):
        m = ENTRY.match(line)
        if m:
            if cur:
                out.append(cur)
            cur = {'key': m.group(1), 'lines': [line]}
        elif cur is not None:
            cur['lines'].append(line)
        else:
            out.append({'key': None, 'lines': [line]})
    if cur:
        out.append(cur)
    return out


def main():
    path = sys.argv[1]
    theirs_keys = set()
    for arg in sys.argv[2:]:
        if arg.startswith('theirs:'):
            theirs_keys |= {k.strip() for k in arg[7:].split(',') if k.strip()}

    src = open(path).read()
    n = 0

    def resolve(m):
        nonlocal n
        n += 1
        ours, theirs = split_entries(m.group(1)), split_entries(m.group(2))
        keep = [e for e in ours if e['key'] not in theirs_keys]
        keep += [e for e in theirs if e['key'] in theirs_keys]
        got = [e['key'] for e in keep if e['key']]
        print(f'  hunk {n}: kept {got}')
        return '\n'.join(l for e in keep for l in e['lines']) + '\n'

    out = CONFLICT.sub(resolve, src)
    if not n:
        print('no conflict hunks found'); return 1
    open(path, 'w').write(out)

    counts = {}
    for k in re.findall(r"\{ key: '([a-z0-9_]+)'", out):
        counts[k] = counts.get(k, 0) + 1
    for k in sorted(theirs_keys):
        print(f'  {k}: {counts.get(k, 0)} entr{"y" if counts.get(k, 0) == 1 else "ies"} (>=2 required by C12)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
