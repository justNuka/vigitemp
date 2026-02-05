"use client";

import { LazyMotion, domAnimation, m } from "motion/react";

export function LicenseGateLoader() {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LazyMotion features={domAnimation}>
        <m.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-muted/40 bg-card/80 px-8 py-6 shadow-xl"
        >
          <m.div
            className="h-12 w-12 rounded-full border-2 border-primary/40 border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Vigitemp</p>
            <p className="text-xs text-muted-foreground">Vérification de la licence...</p>
          </div>
        </m.div>
      </LazyMotion>
    </div>
  );
}
