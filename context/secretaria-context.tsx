"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

type SecretariaContextValue = {
  secretariaId: string | null;
  setSecretariaId: Dispatch<SetStateAction<string | null>>;
};

const SecretariaContext = createContext<SecretariaContextValue | undefined>(undefined);

type SecretariaProviderProps = {
  children: ReactNode;
};

export function SecretariaProvider({ children }: SecretariaProviderProps) {
  const [secretariaId, setSecretariaId] = useState<string | null>(null);

  return (
    <SecretariaContext.Provider value={{ secretariaId, setSecretariaId }}>
      {children}
    </SecretariaContext.Provider>
  );
}

export function useSecretariaFilter() {
  const ctx = useContext(SecretariaContext);
  if (!ctx) {
    throw new Error("useSecretariaFilter deve ser utilizado dentro de SecretariaProvider");
  }
  return ctx;
}



