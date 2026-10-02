// app2/ui/components/consent.js — the line under every form that collects personal data (liability
// checklist, R9: form consents and the age statement). One component, used by each form:
//
//   consentHtml('account')   sign-in, sign-up, magic link, the sign-in pop-out, checkout's sign-in:
//                            agreeing to the Terms and the Privacy Policy by continuing, what the
//                            email is used for (no marketing), and the minimum age of 13
//   consentHtml('teams')     the group access request: what the details are used for
//
// The policy links open in a new tab, so a half-filled form is never lost. Every word is a site.csv
// row; the links are filled into the escaped line, so the copy itself never carries markup.
import { siteCopy } from '../../content/copy/apply.js';
import { esc, fill } from './format.js';

const t = (k, fb) => siteCopy(k, fb);
const link = (href, label) => `<a href="${href}" target="_blank" rel="noopener">${esc(label)}</a>`;

/** The consent line for a form. Pure. */
export function consentHtml(kind = 'account', { id = '' } = {}) {
  const links = { terms: link('#/terms', t('consent_terms_link', 'Terms of Use')), privacy: link('#/privacy', t('consent_privacy_link', 'Privacy Policy')) };
  const lines = kind === 'teams'
    ? [fill(esc(t('consent_teams', 'We use these details only to reply about your team. See the {privacy}.')), links)]
    : [fill(esc(t('consent_account', 'By continuing you agree to the {terms} and the {privacy}.')), links),
      esc(t('consent_email_use', 'We use your email to sign you in and for the emails your account needs, never for marketing.')),
      esc(t('consent_age', 'You must be 13 or older to make an account.'))];
  return `<p class="fine consent"${id ? ` id="${esc(id)}"` : ''}>${lines.join(' ')}</p>`;
}
