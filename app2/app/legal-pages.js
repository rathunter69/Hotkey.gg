// app2/app/legal-pages.js — Terms, Privacy, EULA and Contact (all DRAFT until legal review),
// About, and the 404 view. Placeholder sections follow the launch checklist in REBUILD_PLAN §5.
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const LEGAL = {
  terms: { title: 'Terms of Service', intro: 'The agreement between you and the company that operates hotkey.gg. The final text is written in the LLC’s name and reviewed by a lawyer before launch.',
    sections: [
      ['The service', 'What hotkey.gg is: a learning platform with an in-browser spreadsheet, lessons, timed drills and boards.'],
      ['Free and paid', 'Chapter 1 is free. The paid tier is $9 a month or $90 a year; students $7 a month or $70 a year. No trial.'],
      ['Guarantee, cancellation and refunds', 'A 14-day money-back guarantee on the first payment. Cancel any time; access runs to the end of the paid period.'],
      ['Accounts', 'Minimum age, one account per person, your handle on public boards, and what happens when you delete your account.'],
      ['Fair play', 'Timed runs with help or mouse use on the workspace set no personal best and no board entry. Boards may remove entries that break the rules.'],
      ['Content and trademarks', 'Excel is a registered trademark of Microsoft Corporation. hotkey.gg is independent and not affiliated with or endorsed by Microsoft. No Microsoft visual assets are used.'],
      ['Liability and changes', 'Standard limitations, governing law, and how changes to these terms are announced.'],
    ] },
  privacy: { title: 'Privacy Policy', intro: 'What hotkey.gg stores, why, and what is public. The final text is reviewed before launch.',
    sections: [
      ['On this device', 'As a guest, progress and settings live in your browser’s storage. Nothing is sent to a server until you create an account.'],
      ['With an account', 'Email, handle, platform, theme, lesson attempts and times. Progress, XP and records are derived from attempts on the server.'],
      ['What is public', 'Handle, level, rank, featured achievements and best times, on boards and your profile. School and desk only if you opt in. Everything else is private.'],
      ['Analytics', 'First-party events only (landing, lesson 1, signup, chapter complete, paid) and a lightweight client error log. No third-party scripts.'],
      ['Payments', 'Handled by a merchant of record. hotkey.gg never sees card numbers.'],
      ['Exporting and deleting your data', 'Export your data at any time. Deleting your account removes your private data and your board entries.'],
    ] },
  eula: { title: 'End User Licence Agreement', intro: 'The licence for the software that runs in your browser. Drafted with the Terms; reviewed before launch.',
    sections: [
      ['Licence', 'A personal, non-transferable licence to use hotkey.gg for learning and practice.'],
      ['Restrictions', 'No scraping, automation of runs, or resale of access. Group access is per seat.'],
      ['Group access', 'One code or link, a seat count, one end date, and an organiser progress view. Seats are not shared.'],
      ['Termination', 'What ends the licence and what survives it.'],
    ] },
  contact: { title: 'Contact', intro: 'How to reach hotkey.gg. Addresses are added at launch once the support mailbox is set up.',
    sections: [
      ['Support', 'A support address for account, billing and refund questions, with a reply target of two working days.'],
      ['Group access', 'Requests from the Teams page reach us by email once the server side lands. Until then, use the support address.'],
      ['Report a problem', 'A broken lesson, a wrong answer from the engine, a board entry that should not be there.'],
      ['Company', 'The LLC’s legal name and postal address.'],
    ] },
};

export function mountLegalPage(root, kind) {
  const L = LEGAL[kind] || LEGAL.terms;
  const el = document.createElement('div');
  el.className = 'page legal';
  el.innerHTML = `<div class="draft-banner" role="status"><b>DRAFT</b> This page is a draft until legal review. It is not yet in force.</div>
    <div class="page-head"><h1>${esc(L.title)}</h1><p class="page-sub">${esc(L.intro)}</p></div>
    <div class="legal-body">${L.sections.map(([h, p], i) => `<section class="legal-sec"><h2>${i + 1}. ${esc(h)}</h2><p>${esc(p)}</p><p class="placeholder">Final wording pending review.</p></section>`).join('')}</div>
    <p class="page-fine">Last updated: draft. Questions go to the <a href="#/contact">contact page</a>.</p>`;
  root.appendChild(el);
  return { destroy() { el.remove(); } };
}

export function mountAboutPage(root) {
  const el = document.createElement('div');
  el.className = 'page about';
  el.innerHTML = `<div class="page-head"><h1>About</h1><p class="page-sub">hotkey.gg is a learning-first Excel platform with a real spreadsheet in the browser.</p></div>
    <div class="legal-body">
      <section class="legal-sec"><h2>The loop</h2><p>Read, do it guided, do it solo, race the clock. Speed and competition are the layer you graduate into, not the entry point. Nobody is dropped in the deep end.</p></section>
      <section class="legal-sec"><h2>Who it is for</h2><p>Anyone who never got taught Excel properly, through to finance and IB analysts and MBAs. Longer term, pre-onboarding for banks and training providers.</p></section>
      <section class="legal-sec"><h2>How it grades</h2><p>The engine grades the end state of the sheet and accepts any legitimate route. Where a live formula is required, it perturbs an input and checks the result moves.</p></section>
      <section class="legal-sec"><h2>Free and paid</h2><p>Chapter 1 is free in full. Paid covers advanced Excel, full model builds, and serious timed play: $9 a month or $90 a year, students $7 or $70. <a href="#/pricing">Pricing</a>.</p></section>
      <section class="legal-sec"><h2>Independence</h2><p>Excel is a registered trademark of Microsoft Corporation. hotkey.gg is independent and not affiliated with or endorsed by Microsoft.</p></section>
    </div>`;
  root.appendChild(el);
  return { destroy() { el.remove(); } };
}

export function mountNotFound(root) {
  const el = document.createElement('div');
  el.className = 'page notfound';
  el.innerHTML = `<div class="nf-card">
      <div class="nf-cap">hotkey.gg · cell reference check</div>
      <div class="nf-body">
        <div class="nf-ref">=IFERROR(this_page, <b>#REF!</b>)</div>
        <h1>That reference does not resolve.</h1>
        <p>The page you asked for was moved, renamed, or never existed. The sheet itself is fine.</p>
        <div class="nf-row"><a class="btn btn-primary" href="#/">Home</a><a class="btn btn-ghost" href="#/learn">Learn</a><a class="btn btn-ghost" href="#/practice">Practice</a><a class="btn btn-ghost" href="#/contact">Report a broken link</a></div>
      </div>
    </div>`;
  root.appendChild(el);
  const a = el.querySelector('.btn-primary'); if (a) a.focus();
  return { destroy() { el.remove(); } };
}
