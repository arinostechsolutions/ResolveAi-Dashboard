"use client";

import { useState } from "react";
import { MessageSquare, Send, Check, X, CheckCircle2 } from "lucide-react";
import { useObservations, useCreateObservation, useMarkObservationAsRead } from "@/hooks/use-observations";
import { useSecretarias } from "@/hooks/use-secretarias";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";

type ObservationsPanelProps = {
  secretariaId?: string;
};

export function ObservationsPanel({ secretariaId }: ObservationsPanelProps) {
  const { admin } = useAuth();
  const { cityId } = useCity();
  const isMayor = admin?.isMayor && !admin?.isSuperAdmin;
  const isSecretaria = admin?.secretaria && !admin?.isSuperAdmin && !admin?.isMayor;

  const { data: observationsData, isLoading } = useObservations(
    isSecretaria ? undefined : secretariaId
  );
  const { data: secretariasData } = useSecretarias(isMayor ? cityId : undefined);
  const createMutation = useCreateObservation();
  const markAsReadMutation = useMarkObservationAsRead();

  const [selectedSecretaria, setSelectedSecretaria] = useState<string>(secretariaId || "");
  const [message, setMessage] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  const observations = observationsData?.observations || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSecretaria || !message.trim()) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        secretariaId: selectedSecretaria,
        message: message.trim(),
      });
      setMessage("");
      setShowForm(false);
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  const handleMarkAsRead = async (observationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(observationId);
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  if (!isMayor && !isSecretaria) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="size-4 sm:size-5 text-emerald-300 shrink-0" />
          <h2 className="text-base sm:text-lg font-semibold text-white truncate">
            {isMayor ? "Observações para Secretarias" : "Observações Recebidas"}
          </h2>
        </div>
        {isMayor && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto rounded-xl bg-emerald-500 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            {showForm ? "Cancelar" : "Nova Observação"}
          </button>
        )}
      </div>

      {isMayor && showForm && (
        <form onSubmit={handleSubmit} className="mb-4 sm:mb-6 space-y-3 sm:space-y-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-3 sm:p-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Secretaria
            </label>
            <select
              value={selectedSecretaria}
              onChange={(e) => setSelectedSecretaria(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              required
            >
              <option value="">Selecione uma secretaria</option>
              {secretariasData?.secretarias.map((secretaria) => (
                <option key={secretaria.id} value={secretaria.id}>
                  {secretaria.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Mensagem
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              placeholder="Digite sua observação..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || !selectedSecretaria || !message.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="size-4" />
            {createMutation.isPending ? "Enviando..." : "Enviar Observação"}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-slate-400">Carregando observações...</div>
      ) : observations.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          {isMayor ? "Nenhuma observação enviada ainda." : "Nenhuma observação recebida ainda."}
        </div>
      ) : (
        <div className="space-y-3">
          {observations.map((observation) => (
            <div
              key={observation._id}
              className={`rounded-2xl border p-4 ${
                observation.read
                  ? "border-slate-800 bg-slate-900/40"
                  : "border-emerald-500/50 bg-emerald-500/10"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-slate-300">
                      {isMayor ? observation.secretariaLabel : observation.mayorName}
                    </span>
                    {!observation.read && isSecretaria && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                        Nova
                      </span>
                    )}
                    {observation.read && isMayor && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-400">
                        <CheckCircle2 className="size-3" />
                        Lida
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">
                    {observation.message}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span>{new Date(observation.createdAt).toLocaleString("pt-BR")}</span>
                    {observation.read && observation.readAt && (
                      <span className="text-slate-500">
                        • Lida em {new Date(observation.readAt).toLocaleString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
                {isSecretaria && !observation.read && (
                  <button
                    onClick={() => handleMarkAsRead(observation._id)}
                    disabled={markAsReadMutation.isPending}
                    className="ml-4 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-2 text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                    title="Marcar como lida"
                  >
                    <Check className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

