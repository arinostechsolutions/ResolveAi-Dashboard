"use client";

import { ObservationsPanel } from "./observations-panel";
import { useSecretariaFilter } from "@/context/secretaria-context";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ObservationsPage() {
  const { admin } = useAuth();
  const { secretariaId } = useSecretariaFilter();
  const router = useRouter();
  const isMayor = admin?.isMayor && !admin?.isSuperAdmin;
  const isSecretaria = admin?.secretaria && !admin?.isSuperAdmin && !admin?.isMayor;

  useEffect(() => {
    if (!isMayor && !isSecretaria) {
      router.replace("/dashboard");
    }
  }, [isMayor, isSecretaria, router]);

  if (!isMayor && !isSecretaria) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
          Observações
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {isMayor 
            ? "Envie observações para as secretarias e acompanhe o histórico de comunicações."
            : "Visualize as observações recebidas do prefeito e marque como lidas quando necessário."}
        </p>
      </header>
      <ObservationsPanel secretariaId={secretariaId || undefined} />
    </div>
  );
}



