"use client";

import { useEffect } from "react";

/**
 * Affiche une confirmation native du navigateur lors de la fermeture/rechargement de l'onglet.
 * Note: le texte du message n'est plus personnalisable sur la plupart des navigateurs.
 */
export function BeforeUnloadGuard() {
  useEffect(() => {
    const isEnabled =
      process.env.NEXT_PUBLIC_ENABLE_CLOSE_CONFIRMATION !== "false";

    if (!isEnabled) return;

    // Évite de déclencher la confirmation lors de navigations internes qui font
    // (parfois) un vrai reload (liens <a> non-Next, window.location, etc.).
    let ignoreNextBeforeUnload = false;
    const armIgnore = () => {
      ignoreNextBeforeUnload = true;
      setTimeout(() => {
        ignoreNextBeforeUnload = false;
      }, 1000);
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (ignoreNextBeforeUnload) return;
      event.preventDefault();
      event.returnValue = "";
    };

    const handleDocumentClick = (event: MouseEvent) => {
      // N'ignore pas si l'utilisateur ouvre un nouvel onglet / une nouvelle fenêtre.
      if (event.defaultPrevented) return;
      if (event.button !== 0) return; // left click only
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#")) return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin === window.location.origin) {
          armIgnore();
        }
      } catch {
        // ignore
      }
    };

    const handlePopState = () => {
      // Boutons "retour/avance" : certaines transitions peuvent provoquer un unload.
      armIgnore();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, { capture: true });
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, { capture: true } as any);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
}
