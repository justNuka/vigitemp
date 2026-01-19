"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { LicenseGateLoader } from "@/components/license/license-gate-loader";

export type LicenseInfo = {
  ok: boolean;
  reason: string;
  licenseId?: string;
  customerId?: string;
  edition?: string;
  concurrentAccess?: string;
  options?: string[];
  issuedAtRaw?: string;
  expiresAtUtc?: string | null;
};

type LicenseState = {
  loading: boolean;
  license: LicenseInfo | null;
  refresh: () => Promise<void>;
};

const LicenseContext = createContext<LicenseState | null>(null);

export function useLicense() {
  const ctx = useContext(LicenseContext);
  if (!ctx) {
    throw new Error("useLicense must be used within LicenseProvider");
  }
  return ctx;
}

async function fetchLicense(): Promise<LicenseInfo> {
  const res = await fetch("/api/license", { cache: "no-store" });
  if (!res.ok) {
    return {
      ok: false,
      reason: "license_fetch_failed",
    };
  }
  return res.json();
}

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchLicense();
      setLicense(payload);
    } catch {
      setLicense({ ok: false, reason: "license_fetch_failed" });
    } finally {
      setLoading(false);
      hasLoadedOnce.current = true;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      loading,
      license,
      refresh,
    }),
    [license, loading, refresh]
  );

  const showGate = loading && !hasLoadedOnce.current;

  return (
    <LicenseContext.Provider value={value}>
      {showGate && <LicenseGateLoader />}
      {children}
    </LicenseContext.Provider>
  );
}
