"use client";

import { useState, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { useSendMessage } from "@/hooks/use-send-message";
import { toast } from "react-hot-toast";

type SendMessageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportType?: string;
  userName?: string;
};

export function SendMessageModal({
  isOpen,
  onClose,
  reportId,
  reportType,
  userName,
}: SendMessageModalProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"feedback" | "atualizacao" | "solicitacao" | "outro">("feedback");
  
  const sendMessageMutation = useSendMessage();

  // Resetar formulário quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setMessage("");
      setType("feedback");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    sendMessageMutation.mutate(
      {
        reportId,
        title: title.trim(),
        message: message.trim(),
        type,
      },
      {
        onSuccess: () => {
          toast.success("Mensagem enviada com sucesso!");
          onClose();
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.message || "Erro ao enviar mensagem. Tente novamente.";
          toast.error(errorMessage);
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Enviar Mensagem ao Usuário
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {userName && `Enviando para: ${userName}`}
              {reportType && ` • Report: ${reportType}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            disabled={sendMessageMutation.isPending}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de mensagem */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Tipo de Mensagem
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              disabled={sendMessageMutation.isPending}
            >
              <option value="feedback">Feedback</option>
              <option value="atualizacao">Atualização</option>
              <option value="solicitacao">Solicitação</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Atualização sobre seu report"
              maxLength={200}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              disabled={sendMessageMutation.isPending}
              required
            />
            <p className="text-xs text-slate-500">
              {title.length}/200 caracteres
            </p>
          </div>

          {/* Mensagem */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Mensagem <span className="text-red-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              rows={6}
              maxLength={2000}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 resize-none"
              disabled={sendMessageMutation.isPending}
              required
            />
            <p className="text-xs text-slate-500">
              {message.length}/2000 caracteres
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
              disabled={sendMessageMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={sendMessageMutation.isPending || !title.trim() || !message.trim()}
            >
              {sendMessageMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Enviar Mensagem
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}





