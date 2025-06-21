import { useState, useEffect } from "react";

const useIsMobilePWA = (): boolean => {
  const [isMobilePWA, setIsMobilePWA] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone;
    return isMobile && isStandalone;
  });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone;
      setIsMobilePWA(isMobile && isStandalone);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobilePWA;
};

export default useIsMobilePWA;
