// app2/app/lock-page.js — the page a paid lesson shows an account that does not hold the paid
// tier (Chapter 2 on: a guest, a free account). Not a 404: the lesson exists, the door is shut.
// The card mirrors the not-found card's shape (site.css .nf-*) so it reads as the same site.
import { auth } from './auth.js';
import { chapterOf, moduleOf } from '../content/index.js';
import { itemNumber } from './numbering.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The paid line the catalog shows on a locked chapter; one source for the lock page and the lists. */
export const PAID_LINE = 'Chapter 2 on is the paid tier: the house formatting, full model builds and the serious timed play. Chapter 1 stays free, personal bests and all.';

export function mountLockPage(root, ctx = {}) {
  const lesson = ctx.lesson || null;
  const ch = lesson ? chapterOf(lesson) : null;
  const n = lesson ? itemNumber(lesson, moduleOf(lesson)) : '';
  const signedIn = auth.state() === 'in';
  const el = document.createElement('div');
  el.className = 'page notfound locked';
  el.innerHTML = `<div class="nf-card lk-card">
      <div class="nf-cap">hotkey.gg · ${ch ? esc(ch.title) : 'paid tier'}</div>
      <div class="nf-body">
        <div class="nf-ref">=IF(paid, <b>open</b>, "locked") → <b>locked</b></div>
        <h1>${lesson ? `${n ? esc(n) + ' · ' : ''}${esc(lesson.title)}` : 'This lesson'} is in the paid tier.</h1>
        <p>${esc(PAID_LINE)}</p>
        <p>${signedIn ? 'This account does not hold it yet. A redeem code opens it on the Account page; pricing is on its own page.' : 'Sign in if your account holds it, or see the pricing.'}</p>
        <div class="nf-row">
          <a class="btn btn-primary" href="#/pricing">See pricing</a>
          ${signedIn ? '<a class="btn btn-ghost" href="#/account">Redeem a code</a>' : '<a class="btn btn-ghost" href="#/account">Sign in</a>'}
          <a class="btn btn-ghost" href="#/learn">Back to Learn</a>
        </div>
      </div>
    </div>`;
  root.appendChild(el);
  const a = el.querySelector('.btn-primary'); if (a) a.focus();
  return { destroy() { el.remove(); } };
}
