"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useMemo,
  useEffect,
} from "react";

type CityContextValue = {
  cityId: string | undefined;
  setCityId: Dispatch<SetStateAction<string | undefined>>;
};

const CityContext = createContext<CityContextValue | undefined>(undefined);

type CityProviderProps = {
  children: ReactNode;
  initialCity?: string;
};

export function CityProvider({ children, initialCity }: CityProviderProps) {
  const [cityId, setCityId] = useState<string | undefined>(initialCity);

  // Atualizar cityId quando initialCity mudar
  useEffect(() => {
    if (initialCity) {
      setCityId(initialCity);
    }
  }, [initialCity]);

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

