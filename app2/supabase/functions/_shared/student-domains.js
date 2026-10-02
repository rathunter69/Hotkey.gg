// app2/supabase/functions/_shared/student-domains.js — the school-email check behind the student
// price (docs/phases/E-checkout.md, decision 4 and section 5). Plain JS so the edge functions (Deno)
// and the fast check (node) import the same file. Adding a country is one more suffix here.

/** The domain suffixes that get the student price. */
export const STUDENT_SUFFIXES = ['.edu', '.ac.uk', '.edu.au', '.ac.nz', '.edu.sg', '.edu.hk', '.ac.jp', '.ac.in', '.ac.za', '.ac.il', '.edu.mx'];

/** The lower-cased domain of an email address, or '' when it isn't one. Pure. */
export function emailDomain(email) {
  const s = String(email == null ? '' : email).trim().toLowerCase();
  const at = s.lastIndexOf('@');
  if (at < 1 || at === s.length - 1) return '';
  const d = s.slice(at + 1).replace(/\.+$/, '');
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d) ? d : '';
}

/** Is this a school email? The domain must END in a suffix, as a whole label ("x.edu", never "xedu" or "edu.example.com"). Pure. */
export function isStudentEmail(email, suffixes = STUDENT_SUFFIXES) {
  const d = emailDomain(email);
  if (!d) return false;
  return suffixes.some(sfx => d.endsWith(sfx) && d.length > sfx.length);
}
