"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export function ServiceUnavailable({ 
  message = "Serviço indisponível no momento",
  onRetry,
  showHomeButton = true 
}: {
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Ícone */}
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-500/20 p-6">
            <AlertTriangle className="size-12 text-amber-400" />
          </div>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-200">
            Serviço Indisponível
          </h2>
          <p className="text-slate-400">
            {message}
          </p>
        </div>

        {/* Mensagem adicional */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <p className="text-sm text-slate-300">
            Por favor, tente novamente em alguns instantes. Se o problema persistir, entre em contato com o suporte.
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              <RefreshCw className="size-4" />
              Tentar Novamente
            </button>
          )}
          {showHomeButton && (
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
            >
              <Home className="size-4" />
              Voltar ao Início
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

