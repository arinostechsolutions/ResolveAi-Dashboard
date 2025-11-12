"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";
import { DEFAULT_CITY_ID } from "@/lib/constants";

type CityContextValue = {
  cityId: string;
  setCityId: Dispatch<SetStateAction<string>>;
};

const CityContext = createContext<CityContextValue | undefined>(undefined);

type CityProviderProps = {
  children: ReactNode;
  initialCity?: string;
};

export function CityProvider({ children, initialCity }: CityProviderProps) {
  const startCity = useMemo(
    () => initialCity ?? DEFAULT_CITY_ID,
    [initialCity],
  );
  const [cityId, setCityId] = useState(startCity);

  return (
    <CityContext.Provider value={{ cityId, setCityId }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) {
    throw new Error("useCity deve ser utilizado dentro de CityProvider");
  }
  return ctx;
}

