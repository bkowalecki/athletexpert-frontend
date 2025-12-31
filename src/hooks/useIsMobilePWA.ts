import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

const getIsMobilePWA = (): boolean => {
  if (typeof window === "undefined") return false;

  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone;

  return isMobile && isStandalone;
};

const useIsMobilePWA = (): boolean => {
  const [isMobilePWA, setIsMobilePWA] = useState(getIsMobilePWA);

  useEffect(() => {
    const update = () => setIsMobilePWA(getIsMobilePWA());

    window.addEventListener("resize", update);
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    mediaQuery.addEventListener("change", update);

    return () => {
      window.removeEventListener("resize", update);
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return isMobilePWA;
};

export default useIsMobilePWA;
