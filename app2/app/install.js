// app2/app/install.js — "Install as app" (experience pass, decision 7): the web manifest and
// icons make the site installable; Chromium fires `beforeinstallprompt` once it agrees, and
// this module keeps that event so the prompt can be shown at the right moment — once, after
// the second lesson completes (lesson-view.js). Browsers without the event (Safari, Firefox)
// never see the card. Costs: manifest.webmanifest, four PNG icons (~22 KB), this file.
//
//   captureInstall()          call once at boot (main.js)
//   installAvailable()        true while a deferred prompt is held
//   promptInstall()           → Promise<'accepted' | 'dismissed' | 'unavailable'>
//   shouldOfferInstall(prefs, completedCount)  pure: once, after lesson 2

let deferred = null;

export function captureInstall() {
  try {
    if (typeof window === 'undefined') return;
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
    window.addEventListener('appinstalled', () => { deferred = null; });
  } catch (e) { /* no DOM */ }
}

export function installAvailable() { return !!deferred; }

export async function promptInstall() {
  const ev = deferred; if (!ev) return 'unavailable';
  deferred = null;
  try { ev.prompt(); const r = await ev.userChoice; return r && r.outcome === 'accepted' ? 'accepted' : 'dismissed'; }
  catch (e) { return 'dismissed'; }
}

/** Offer once, after the second completed lesson, never again once shown (installPromptAt is a timestamp). Pure. */
export function shouldOfferInstall(prefsRec, completedCount, available = true) {
  if (!available) return false;
  if (!prefsRec || prefsRec.installPromptAt) return false;
  return completedCount >= 2;
}
