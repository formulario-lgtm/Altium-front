/** Only an opt-in username is remembered, never credentials or tokens. */
export const REMEMBERED_USERNAME_KEY = 'altium.auth.rememberedUsername';

export function readRememberedUsername(): string {
  if (typeof window === 'undefined') return '';
  window.localStorage.removeItem('altium.auth.rememberedEmail');
  return window.localStorage.getItem(REMEMBERED_USERNAME_KEY) ?? '';
}

export function saveRememberedUsername(username: string, remember: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('altium.auth.rememberedEmail');
  if (remember && username) window.localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
  else window.localStorage.removeItem(REMEMBERED_USERNAME_KEY);
}
