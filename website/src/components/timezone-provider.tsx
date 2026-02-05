"use client";

import { createContext, useContext } from "react";

const DEFAULT_TIMEZONE = "Europe/Paris";

const TimezoneContext = createContext<string>(DEFAULT_TIMEZONE);

export function TimezoneProvider({
  timezone,
  children,
}: {
  timezone?: string | null;
  children: React.ReactNode;
}) {
  return (
    <TimezoneContext.Provider value={timezone || DEFAULT_TIMEZONE}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useAppTimezone() {
  return useContext(TimezoneContext);
}
