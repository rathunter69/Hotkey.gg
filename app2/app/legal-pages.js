// app2/app/legal-pages.js — Terms, Privacy, EULA and Contact, plus About and the 404 view.
// The four legal pages are real plain-English drafts (SITE_SPEC §13): good enough to be live
// for a free guest product, clearly marked DRAFT until a lawyer has reviewed them.
// The flip of LEGAL_STATUS.reviewed to true happens only in a commit Wolf approves. **WOLF**
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const LEGAL_STATUS = { reviewed: false, updated: '2026-09-22' };

const MS_DISCLAIMER = 'Excel is a registered trademark of Microsoft Corporation. hotkey.gg is an independent product and is not affiliated with, sponsored by, or endorsed by Microsoft. No Microsoft software or visual assets are used; the spreadsheet you practise on is our own.';

export const LEGAL = {
  terms: { title: 'Terms of Service', intro: 'The agreement between you and hotkey.gg. Plain English on purpose: if something here is unclear, that is a bug — tell us.',
    sections: [
      ['What hotkey.gg is', 'hotkey.gg is a learning platform for Excel: guided lessons, timed drills, leaderboards and progress tracking, all on a spreadsheet that runs in your browser. By using the site you accept these terms. If you do not accept them, do not use the site.'],
      ['Free, paid and early access', 'Chapter 1 (Foundations) is free, no account required. Later chapters are part of a paid tier that is not yet on sale; while it is not on sale, nothing on this site takes payment. When the paid tier launches it is planned at $9 a month or $90 a year, with student pricing at $7 a month or $70 a year, no free trial, and a 14-day money-back guarantee on your first payment. Those paid terms take effect only when checkout actually exists, and will be stated again at the point of purchase.'],
      ['Your account', 'You can use the free chapter without an account; your progress then lives only in your browser. If you create an account, give a working email address and keep your sign-in method to yourself. You must be at least 13 years old to create an account (younger learners can use guest mode with a parent or teacher). One account per person. You can delete your account at any time from the account page, which removes your private data and your leaderboard entries.'],
      ['Your handle and public boards', 'Your handle appears on public leaderboards and, if you allow it, on a public profile showing your level, rank, featured achievements and best times. Pick a handle that is not offensive, misleading or impersonating someone else; we can reset handles that are. Everything not listed as public stays private.'],
      ['Fair play', 'Timed runs are meant to be your own keyboard work. Using help or the mouse on the workspace during a timed run simply means no personal best and no board entry — that is not a punishment, it is what the clock measures. Automating runs, tampering with submitted times, or otherwise gaming the boards may get entries removed or an account closed.'],
      ['Acceptable use', 'Do not attack, overload or probe the service, scrape it, resell access to it, or use it to store or spread anything unlawful. We can suspend or close accounts that do.'],
      ['Content and trademarks', MS_DISCLAIMER + ' The lessons, drills, site design and software are ours or our licensors’ and are protected by copyright; the licence to use them is in the EULA.'],
      ['The service can change', 'hotkey.gg is in active development. Features may change, be added or be removed, and the site may occasionally be unavailable. We will not remove progress you have legitimately earned, and if we ever discontinue the service while you have paid for time on it, the money-back terms above apply to the unused period.'],
      ['Liability', 'hotkey.gg is provided "as is", for learning and practice. To the extent the law allows, we are not liable for indirect or consequential losses from using the site, and our total liability is capped at the greater of $100 or what you paid us in the last 12 months. Nothing here limits liability that cannot lawfully be limited.'],
      ['Governing law and changes to these terms', 'These terms are governed by the law of the United States state in which the operating company is registered (named on the contact page). If we change these terms in a way that matters, we will say so on the site before the change takes effect; the date at the bottom of this page always tells you when it last changed.'],
    ] },
  privacy: { title: 'Privacy Policy', intro: 'What hotkey.gg stores, why, what is public, and how to get your data out. The short version: guest progress never leaves your browser, accounts store what you would expect and nothing more, and we never sell data or run third-party trackers.',
    sections: [
      ['As a guest', 'Without an account, your lesson progress, settings and theme are stored in your browser’s local storage on your device. They are not sent to a server. Clearing your browser data deletes them; so does the "Delete local data" button on the account page.'],
      ['With an account', 'If you create an account we store: your email address, your handle, your platform and theme preferences, and your lesson and drill attempts (which lesson, mode, time, keystroke count, whether help or the mouse was used). Progress, XP, level and records are calculated from those attempts on the server. When you sign up you can carry over the progress from your device, once; the site shows you exactly what will be carried before it happens.'],
      ['What is public', 'Public leaderboards and profiles show your handle, level, rank, featured achievements and best times. Your school or desk (group) appears only if you opt in. Your email address and everything else are private and are enforced as private in the database, not just hidden by the interface.'],
      ['Analytics and error logs', 'We record first-party product events (for example: landing page viewed, first lesson completed, account created, chapter completed) and a lightweight log of client errors, to see where the product is failing people. No third-party analytics, advertising or tracking scripts run on this site. Event rows are deleted after 90 days.'],
      ['Payments', 'There is no checkout yet, so we hold no payment data at all. When the paid tier launches, payment will be handled by a payment provider acting as merchant of record; hotkey.gg will never see or store card numbers. This policy will be updated before that launches.'],
      ['Where your data lives and who processes it', 'Account data is stored with our database provider (Supabase) and the site is served by Cloudflare. Both act as processors for us; neither is allowed to use your data for their own purposes.'],
      ['Email', 'We send the emails an account needs: sign-in links, confirmations and receipts. Anything beyond that (like a progress recap) will be optional, with a working unsubscribe link on every send.'],
      ['Export and deletion', 'You can export everything we hold about you from the account page, any time, as a file you keep. Deleting your account removes your profile, attempts and board entries. For data questions or requests, write to privacy@hotkey.gg.'],
      ['Children', 'Accounts require a minimum age of 13. Guest mode stores nothing on our servers and is fine for supervised younger learners.'],
    ] },
  eula: { title: 'End User Licence Agreement', intro: 'The licence for the hotkey.gg software that runs in your browser. It is deliberately short.',
    sections: [
      ['Licence', 'We grant you a personal, non-exclusive, non-transferable licence to use the hotkey.gg application, lessons and drills for your own learning and practice, for as long as you comply with the Terms of Service.'],
      ['What you may not do', 'Do not copy, resell or redistribute the lessons or drills; do not reverse-engineer the service or build a competing dataset by scraping it; do not automate runs or submissions; do not share one account between people.'],
      ['Group access', 'Group access (for teams, classes and organisations) is licensed per seat: one code or link, a set number of seats, one end date. Seats are for named individuals and are not shared or pooled.'],
      ['Termination', 'The licence ends if your account is closed for breaking these terms, or when you stop using the service. Sections that by their nature should survive (ownership, liability limits) survive.'],
      ['Trademarks', MS_DISCLAIMER],
    ] },
  contact: { title: 'Contact', intro: 'A real person reads these. Plain email, no ticket portal.',
    sections: [
      ['Support', 'Account, progress and general questions: hello@hotkey.gg. We aim to reply within two working days.'],
      ['Report a problem', 'A broken lesson, a wrong answer from the grading engine, a board entry that should not be there: hello@hotkey.gg with the lesson or drill name and what you expected. Security vulnerabilities: security@hotkey.gg.'],
      ['Privacy and data requests', 'Export, correction or deletion questions: privacy@hotkey.gg. Legal notices: legal@hotkey.gg.'],
      ['Teams and schools', 'Desks, group access, classes and pilots: teams@hotkey.gg, or use the form on the Teams page.'],
      ['Company', 'hotkey.gg is operated by a United States limited liability company. The registered legal name and postal address will be listed here when these pages complete legal review.'],
    ] },
};

/**
 * The rendered inner HTML of a legal page — pure, so the tests can assert the DRAFT banner
 * appears exactly while `status.reviewed` is false, without a DOM.
 */
export function renderLegal(kind, status = LEGAL_STATUS) {
  const L = LEGAL[kind] || LEGAL.terms;
  const banner = status.reviewed ? '' : `<div class="draft-banner" role="status"><b>DRAFT</b> This page is a plain-English draft awaiting legal review. It states our real intent but is not yet the final text.</div>\n    `;
  return `${banner}<div class="page-head"><h1>${esc(L.title)}</h1><p class="page-sub">${esc(L.intro)}</p></div>
    <div class="legal-body">${L.sections.map(([h, p], i) => `<section class="legal-sec"><h2>${i + 1}. ${esc(h)}</h2><p>${esc(p)}</p></section>`).join('')}</div>
    <p class="page-fine">Last updated ${esc(status.updated)}${status.reviewed ? '' : ' (draft, pre-review)'}. ${esc(MS_DISCLAIMER)} Questions go to the <a href="#/contact">contact page</a>.</p>`;
}

export function mountLegalPage(root, kind) {
  const el = document.createElement('div');
  el.className = 'page legal';
  el.innerHTML = renderLegal(kind);
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
      <section class="legal-sec"><h2>Independence</h2><p>${esc(MS_DISCLAIMER)}</p></section>
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
