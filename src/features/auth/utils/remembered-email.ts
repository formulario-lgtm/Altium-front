/** Only the email is remembered — never passwords, tokens or session data. */
export const REMEMBERED_EMAIL_KEY = 'altium.auth.rememberedEmail';

export function readRememberedEmail(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '';
}

export function saveRememberedEmail(email: string, remember: boolean): void {
  if (typeof window === 'undefined') return;
  if (remember && email) {
    window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
  } else {
    window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  }
}
