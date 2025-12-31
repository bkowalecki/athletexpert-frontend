// src/util/sessionUtils.ts

const JUST_LOGGED_OUT_KEY = "justLoggedOut";

export function setJustLoggedOut(): void {
  sessionStorage.setItem(JUST_LOGGED_OUT_KEY, "1");
}

/**
 * Returns true once (and clears the flag).
 * Used to avoid a redundant session check immediately after logging out.
 */
export function checkJustLoggedOut(): boolean {
  const flag = sessionStorage.getItem(JUST_LOGGED_OUT_KEY);
  if (flag) sessionStorage.removeItem(JUST_LOGGED_OUT_KEY);
  return Boolean(flag);
}
