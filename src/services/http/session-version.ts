import { clearRequestLoading } from './loading';

/** Local generation of the authenticated session; never persisted or sent to the API. */
let sessionVersion = 0;

export function getSessionVersion(): number {
  return sessionVersion;
}

export function advanceSessionVersion(): void {
  sessionVersion += 1;
  clearRequestLoading();
}
