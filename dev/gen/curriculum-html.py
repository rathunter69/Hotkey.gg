# Generates dev/CURRICULUM_V5.md and dev/curriculum-v5.html from dev/gen/curriculum_v51_data.py (one source).
import html, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from curriculum_v51_data import CHAPTERS

def keycap_html(items):
    out=[]
    for it in items:
        cls='key' if re.match(r'^(Ctrl|Alt|Shift|F\d|Delete|=|the name box|point mode|minus signs|yellow|values|formats|transpose|multiply|add\b|top |bottom |outside |all |thick|double|highlight|data bars|clear|manage|field list|rows|structured|error alert|date rule|list source|number format)', it) else 'fn'
        out.append(f'<span class="{cls}">{html.escape(it)}</span>')
    return ''.join(out)

total=sum(len(c['drills']) for c in CHAPTERS)
caps=sum(1 for c in CHAPTERS for d in c['drills'] if 'capstone' in d['tag'])
engine_items=sorted({e for c in CHAPTERS for d in c['drills'] for e in d.get('engine',[])})

# ---------- markdown ----------
md=[f"""# CURRICULUM V5.1 — the whole of desk Excel, drill by drill (conceptual)

_2026-09-04 · a concept document, no code; generated from `dev/gen/curriculum_v51_data.py` (edit that, not this).
Rewritten to the seven rules in `dev/DRILLS_WOLF_LIKED.md`: full 20×10 page with one story · three steps of three
to four outcomes, 60–150 s for a skilled player · rebuild not retype · un-maxable randomness · loud cues, desk
language · the ☆ is a choice · variety inside the drill. The eight chapters are kept; the drills inside them are
the rethink. Charts excluded. `engine:` marks what the site cannot grade yet (see `dev/ENGINE_GAP_MATRIX.md`)._

**{total} drills · 8 chapters · {caps} capstones · free = chapters 1–4 · PRO = chapters 5–8**

"""]
for c in CHAPTERS:
    md.append(f"## Chapter {c['n']} · {c['name']} ({c['tier']}) — {len(c['drills'])} drills\n\n_{c['intro']}_\n\n")
    for i,d in enumerate(c['drills'],1):
        md.append(f"### {c['n']}.{i} {d['title']}" + (f" *({d['tag']})*" if d['tag'] else '') + "\n")
        md.append(f"- **Why.** {d['why']}\n")
        md.append(f"- **Functions & keys.** {' · '.join(d['fn'])}\n")
        md.append(f"- **On the grid.** {d['grid']}\n")
        md.append(f"- **Random.** {d['random']}\n")
        for sn,(name,outs) in enumerate(d['steps'],1):
            md.append(f"- **Step {sn} — {name}.** " + ' · '.join(outs) + "\n")
        md.append(f"- **☆** {d['star']}\n")
        if d.get('engine'): md.append(f"- `engine:` {', '.join(d['engine'])}\n")
        md.append("\n")
md.append(f"""---

## Counts and the engine

| chapter | drills | needs engine work |
|---|---|---|
""")
for c in CHAPTERS:
    eng=sorted({e for d in c['drills'] for e in d.get('engine',[])})
    md.append(f"| {c['n']} {c['name']} | {len(c['drills'])} | {', '.join(eng) or '—'} |\n")
md.append(f"| **total** | **{total}** | {', '.join(engine_items)} |\n\n")
md.append("""## What to decide

1. **The count.** Every drill is now a full page with three steps; sibling mechanics share a page. Say if any chapter still reads thin or any drill reads padded.
2. **The engine-work order.** By teaching value per day: named ranges → tables & validation → conditional formatting → remove duplicates → sheets → freeze / protect / print → goal seek & data table → pivot → trace / evaluate. Drills that need one are built after it lands; everything else can start now.
3. **Build order.** Foundations tutorials 2–4 first, then chapter by chapter, five drills per PR, the variety guards flipped to failures at the end.
""")
open('dev/CURRICULUM_V5.md','w').write(''.join(md))

# ---------- html ----------
toc=[]; cards=[]
for c in CHAPTERS:
    n=str(c['n']); tier=c['tier']
    toc.append(f'<a href="#ch{n}"><b>{n}</b> {html.escape(c["name"])} <i>{len(c["drills"])}</i></a>')
    cards.append(f'<section class="chapter" id="ch{n}"><header class="ch-head"><div class="ch-num">Chapter {n}</div><h2>{html.escape(c["name"])}</h2><span class="tier {tier.lower()}">{tier}</span><p>{html.escape(c["intro"])}</p></header>')
    for i,d in enumerate(c['drills'],1):
        k=f'{n}.{i}'
        tags=''
        if 'tutorial' in d['tag']: tags+='<span class="tag">tutorial</span>'
        if 'capstone' in d['tag']: tags+='<span class="tag cap">capstone</span>'
        if 'built' in d['tag']: tags+='<span class="tag built">built</span>'
        if d.get('engine'): tags+='<span class="tag eng" title="'+html.escape(', '.join(d['engine']))+'">needs engine work: '+html.escape(', '.join(d['engine']))+'</span>'
        steps_html=''.join(f'<li><b>{html.escape(name)}</b><ol>'+''.join(f'<li>{html.escape(o)}</li>' for o in outs)+'</ol></li>' for name,outs in d['steps'])
        nout=sum(len(o) for _,o in d['steps'])
        cards.append(f'''<article class="drill" id="d-{d['key']}">
<div class="d-head"><span class="d-num">{k}</span><h3>{html.escape(d['title'])}</h3>{tags}</div>
<p class="why">{html.escape(d['why'])}</p>
<dl>
<dt>Functions &amp; keys tested</dt><dd class="fns">{keycap_html(d['fn'])}</dd>
<dt>What is on the grid</dt><dd>{html.escape(d['grid'])}<p class="rnd"><b>Changes every run:</b> {html.escape(d['random'])}</p></dd>
<dt>How it is gamified</dt><dd><p>Three steps, {nout} outcomes, each graded on the finished state of the page, never on a keypress. The next step's part of the page appears when the previous one is done; the clock runs from the first key and the run posts to the drill's board.</p><p class="star">★ <b>The pro move:</b> {html.escape(d['star'])}</p></dd>
<dt>The player&#8217;s steps</dt><dd><ol class="steps">{steps_html}</ol></dd>
</dl></article>''')
    cards.append('</section>')

page=f'''<title>hotkey.gg Curriculum v5</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Serif:wght@500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
:root{{--bg:#f5f4ef;--surface:#fffdf8;--ink:#1c1f23;--muted:#5d646d;--line:#d9d6cc;--accent:#158f52;--accent-ink:#0e6b3c;--key-bg:#ffffff;--key-line:#c7ccd2;--fn-bg:#e8f5ec;--pro:#8a5a12;--pro-bg:#fbf1df;--star:#a8730d;--eng:#7a4b9c;--eng-bg:#f1e9f7;}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#16181c;--surface:#1e2126;--ink:#e8e6df;--muted:#a3a8b0;--line:#33383f;--accent:#3fbf7a;--accent-ink:#7bd9a3;--key-bg:#262a30;--key-line:#464c55;--fn-bg:#1f3a2b;--pro:#e0b26a;--pro-bg:#3a2f1c;--star:#e2b660;--eng:#c9a6e6;--eng-bg:#31263c;}}}}
:root[data-theme="dark"]{{--bg:#16181c;--surface:#1e2126;--ink:#e8e6df;--muted:#a3a8b0;--line:#33383f;--accent:#3fbf7a;--accent-ink:#7bd9a3;--key-bg:#262a30;--key-line:#464c55;--fn-bg:#1f3a2b;--pro:#e0b26a;--pro-bg:#3a2f1c;--star:#e2b660;--eng:#c9a6e6;--eng-bg:#31263c;}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font-family:"IBM Plex Sans",system-ui,sans-serif;font-size:15px;line-height:1.55}}
a{{color:var(--accent-ink)}}
.wrap{{display:grid;grid-template-columns:240px minmax(0,1fr);gap:40px;max-width:1180px;margin:0 auto;padding:36px 24px 80px}}
@media (max-width:860px){{.wrap{{grid-template-columns:1fr}} nav.toc{{position:static}}}}
nav.toc{{position:sticky;top:24px;align-self:start;display:flex;flex-direction:column;gap:2px;font-size:13.5px}}
nav.toc a{{display:flex;gap:8px;align-items:baseline;padding:6px 8px;border-radius:4px;color:var(--ink);text-decoration:none}}
nav.toc a:hover,nav.toc a:focus-visible{{background:var(--surface);outline:none}}
nav.toc a b{{font-family:"JetBrains Mono",monospace;color:var(--accent-ink);font-weight:500;width:14px}}
nav.toc a i{{margin-left:auto;font-style:normal;color:var(--muted);font-family:"JetBrains Mono",monospace;font-size:12px}}
nav.toc .legend{{margin-top:14px;padding-top:12px;border-top:1px solid var(--line);color:var(--muted);font-size:12.5px;line-height:1.6}}
header.top{{grid-column:1/-1;border-bottom:2px solid var(--ink);padding-bottom:18px;margin-bottom:8px}}
header.top .eyebrow{{font-family:"JetBrains Mono",monospace;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-ink)}}
header.top h1{{font-family:"IBM Plex Serif",Georgia,serif;font-weight:600;font-size:34px;margin:6px 0 8px;text-wrap:balance;line-height:1.15}}
header.top p{{max-width:70ch;margin:0 0 6px;color:var(--muted)}}
.rules{{max-width:70ch;margin:10px 0 0;padding-left:20px;color:var(--muted);font-size:14px}}
.rules li{{margin:2px 0}}
.stats{{display:flex;flex-wrap:wrap;gap:18px;margin-top:14px;font-family:"JetBrains Mono",monospace;font-size:12.5px;color:var(--muted)}}
.stats b{{color:var(--ink);font-weight:500}}
main{{min-width:0}}
.chapter{{margin:0 0 44px}}
.ch-head{{display:grid;grid-template-columns:auto 1fr auto;gap:6px 14px;align-items:baseline;border-top:2px solid var(--ink);padding-top:14px;margin-bottom:18px}}
.ch-num{{font-family:"JetBrains Mono",monospace;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-ink)}}
.ch-head h2{{font-family:"IBM Plex Serif",Georgia,serif;font-weight:600;font-size:26px;margin:0;grid-column:2}}
.ch-head p{{grid-column:1/-1;margin:4px 0 0;max-width:72ch;color:var(--muted)}}
.tier{{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.1em;padding:3px 8px;border:1px solid var(--accent);color:var(--accent-ink);border-radius:3px;align-self:center}}
.tier.pro{{border-color:var(--pro);color:var(--pro);background:var(--pro-bg)}}
.drill{{background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:18px 22px 14px;margin:0 0 14px}}
.d-head{{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;margin-bottom:6px}}
.d-num{{font-family:"JetBrains Mono",monospace;font-size:12.5px;color:var(--accent-ink);font-weight:500}}
.d-head h3{{margin:0;font-size:19px;font-weight:600}}
.tag{{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:2px 7px;border-radius:3px;background:var(--fn-bg);color:var(--accent-ink)}}
.tag.cap{{background:var(--pro-bg);color:var(--pro)}}
.tag.built{{background:var(--key-bg);border:1px solid var(--key-line);color:var(--muted)}}
.tag.eng{{background:var(--eng-bg);color:var(--eng);text-transform:none;letter-spacing:0}}
.why{{margin:0 0 12px;color:var(--muted);max-width:72ch}}
dl{{display:grid;grid-template-columns:150px minmax(0,1fr);gap:8px 18px;margin:0}}
dt{{font-family:"JetBrains Mono",monospace;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding-top:4px}}
dd{{margin:0;max-width:72ch}}
dd p{{margin:0 0 6px}}
dd p:last-child{{margin-bottom:0}}
.rnd{{color:var(--muted);font-size:13.5px;margin-top:6px}}
.fns{{display:flex;flex-wrap:wrap;gap:6px}}
.key,.fn{{font-family:"JetBrains Mono",monospace;font-size:12.5px;padding:2px 8px;border-radius:4px;white-space:nowrap}}
.key{{background:var(--key-bg);border:1px solid var(--key-line);box-shadow:0 1.5px 0 var(--key-line)}}
.fn{{background:var(--fn-bg);color:var(--accent-ink)}}
.star{{color:var(--star)}}
ol.steps{{margin:0;padding-left:0;list-style:none;display:grid;gap:8px}}
ol.steps>li>b{{display:block;font-family:"JetBrains Mono",monospace;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--accent-ink);margin-bottom:2px}}
ol.steps ol{{margin:0;padding-left:22px}}
ol.steps ol li{{margin:1px 0}}
@media (max-width:640px){{dl{{grid-template-columns:1fr}} dt{{padding-top:6px}}}}
@media (prefers-reduced-motion:no-preference){{html{{scroll-behavior:smooth}}}}
</style>
<div class="wrap">
<header class="top"><div class="eyebrow">hotkey.gg · curriculum v5.1 · concept for review</div>
<h1>Every drill, in plain English</h1>
<p>Eight chapters, {total} drills, each one a full page of work. For every drill: what it tests, what sits on the 20×10 grid when the page opens, how the run is scored and rewarded, and the player's steps. Nothing here is built except drills 1.1 and 1.8.</p>
<ol class="rules"><li>One full page, one story a real person would do this week; the finished page is sendable.</li><li>Three steps of three to four outcomes; 60 to 150 seconds for a skilled player.</li><li>Rebuild, don't retype; consequences visible on the page.</li><li>Layout and the broken cells change every run.</li><li>Red cues where the player must act; desk language throughout.</li><li>The star is a skippable habit that saves time, never something earned by finishing.</li><li>Three uses of the same key are three different stories.</li></ol>
<div class="stats"><span><b>{total}</b> drills</span><span><b>8</b> chapters</span><span><b>{caps}</b> capstones</span><span>free: chapters 1–4 · PRO: chapters 5–8</span><span>charts excluded</span><span>engine work pending: {len(engine_items)} features</span></div>
</header>
<nav class="toc">{''.join(toc)}<div class="legend"><span class="key">key</span> = a keyboard route &nbsp;·&nbsp; <span class="fn">FN</span> = a function or concept<br>★ the hidden pro move that earns the star</div></nav>
<main>{''.join(cards)}</main>
</div>
'''
open('dev/curriculum-v5.html','w').write(page)
print('drills', total, 'capstones', caps, 'engine', len(engine_items), 'bytes', len(page))
