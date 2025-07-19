// src/utils/sessionUtils.ts
export function checkJustLoggedOut(): boolean {
    const flag = sessionStorage.getItem("justLoggedOut");
    if (flag) sessionStorage.removeItem("justLoggedOut");
    return Boolean(flag);
  }