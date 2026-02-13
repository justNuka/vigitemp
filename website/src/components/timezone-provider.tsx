"use client";

import { createContext, useContext } from "react";

const TimezoneContext = createContext<string | undefined>(undefined);

export function TimezoneProvider({
  timezone,
  children,
}: {
  timezone?: string | null;
  children: React.ReactNode;
}) {
  return (
    <TimezoneContext.Provider value={timezone ?? undefined}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useAppTimezone() {
  return useContext(TimezoneContext);
}


