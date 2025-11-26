"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useCity } from "@/context/city-context";
import { useUpdateBlockade, type BlockadeType, type StreetBlockade } from "@/hooks/use-street-blockades";
import { toast } from "react-hot-toast";
import { X, MapPin, Calendar, Loader2 } from "lucide-react";
import { RouteDrawerMap } from "./route-drawer-map";

interface EditBlockadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockade: StreetBlockade | null;
}

export function EditBlockadeModal({ isOpen, onClose, blockade }: EditBlockadeModalProps) {
  const { cityId } = useCity();
  const updateBlockade = useUpdateBlockade();
  
  const [formData, setFormData] = useState<{
    type: BlockadeType;
    reason: string;
    startDate: string;
    endDate: string;
    route: {
      coordinates: Array<{ lat: number; lng: number; order: number }>;
      streetName: string;
      neighborhood: string;
    };
    impact: {
      level: "baixo" | "medio" | "alto" | "total";
    };
  } | null>(null);

  const [streetSearchQuery, setStreetSearchQuery] = useState("");
  const [neighborhoodSearchQuery, setNeighborhoodSearchQuery] = useState("");
  const hasInitializedRef = useRef(false);

  // Inicializar form apenas uma vez quando o modal abre com um blockade
  useEffect(() => {
    if (isOpen && blockade && !hasInitializedRef.current) {
      const startDate = new Date(blockade.startDate).toISOString().slice(0, 16);
      const endDate = blockade.endDate ? new Date(blockade.endDate).toISOString().slice(0, 16) : "";
      
      setFormData({
        type: blockade.type,
        reason: blockade.reason,
        startDate: startDate,
        endDate: endDate,
        route: {
          coordinates: (blockade.route.coordinates || []).map((coord, index) => ({
            lat: coord.lat,
            lng: coord.lng,
            order: coord.order ?? index,
          })),
          streetName: blockade.route.streetName || "",
          neighborhood: blockade.route.neighborhood || "",
        },
        impact: blockade.impact || { level: "medio" },
      });
      
      setStreetSearchQuery(blockade.route.streetName || "");
      setNeighborhoodSearchQuery(blockade.route.neighborhood || "");
      hasInitializedRef.current = true;
    }
  }, [isOpen, blockade]);

  // Reset quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
      setFormData(null);
      setStreetSearchQuery("");
      setNeighborhoodSearchQuery("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !cityId || !blockade) {
      toast.error("Dados inválidos");
      return;
    }

    if (!formData.route?.streetName || !formData.route?.neighborhood) {
      toast.error("Preencha o nome da rua e bairro");
      return;
    }

    if (!formData.reason || !formData.startDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!formData.route?.coordinates || formData.route.coordinates.length < 2) {
      toast.error("Adicione pelo menos 2 pontos no mapa para definir o trecho");
      return;
    }

    try {
      const payload: any = {
        route: {
          coordinates: formData.route.coordinates || [],
          streetName: formData.route.streetName,
          neighborhood: formData.route.neighborhood,
        },
        type: formData.type as BlockadeType,
        reason: formData.reason,
        startDate: formData.startDate,
        impact: formData.impact,
      };
      
      // Incluir endDate apenas se fornecido
      if (formData.endDate && formData.endDate.trim() !== "") {
        payload.endDate = formData.endDate;
      } else {
        payload.endDate = null;
      }

      await updateBlockade.mutateAsync({
        id: blockade._id,
        ...payload,
      });
      
      toast.success("Interdição atualizada com sucesso!");
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao atualizar interdição");
    }
  };

  if (!isOpen || !blockade || !formData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-200">Editar Interdição de Rua</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
            disabled={updateBlockade.isPending}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Interdição */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de Interdição <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as BlockadeType })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              required
            >
              <option value="evento">Evento</option>
              <option value="obra">Obra</option>
              <option value="emergencia">Emergência</option>
              <option value="manutencao">Manutenção</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Motivo da Interdição <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Descreva o motivo da interdição..."
              required
            />
          </div>

          {/* Mapa para desenhar trecho */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <MapPin className="inline-block size-4 mr-1" />
              Trecho Interditado
            </label>
            <RouteDrawerMap
              initialRoute={formData.route.coordinates}
              onRouteChange={(coordinates) => {
                setFormData((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    route: {
                      ...prev.route,
                      coordinates: coordinates,
                    },
                  };
                });
              }}
              onStreetNameChange={undefined}
            />
            {formData.route?.coordinates && formData.route.coordinates.length > 0 && (
              <p className="mt-2 text-xs text-emerald-400">
                ✓ {formData.route.coordinates.length} ponto(s) adicionado(s) ao trecho
              </p>
            )}
          </div>

          {/* Rua */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nome da Rua <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={streetSearchQuery}
              onChange={(e) => {
                setStreetSearchQuery(e.target.value);
                setFormData((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    route: {
                      ...prev.route,
                      streetName: e.target.value,
                      coordinates: prev.route.coordinates || [],
                    },
                  };
                });
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              placeholder="Ex: Rua das Flores"
              required
            />
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bairro <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={neighborhoodSearchQuery}
              onChange={(e) => {
                setNeighborhoodSearchQuery(e.target.value);
                setFormData((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    route: {
                      ...prev.route,
                      neighborhood: e.target.value,
                      coordinates: prev.route.coordinates || [],
                    },
                  };
                });
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              placeholder="Ex: Centro"
              required
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="inline-block size-4 mr-1" />
                Data/Hora de Início <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="inline-block size-4 mr-1" />
                Data/Hora de Término <span className="text-xs text-slate-500">(opcional)</span>
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                Deixe em branco se não houver prazo definido
              </p>
            </div>
          </div>

          {/* Impacto */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nível de Impacto
            </label>
            <select
              value={formData.impact?.level}
              onChange={(e) => setFormData({
                ...formData,
                impact: { ...formData.impact!, level: e.target.value as any }
              })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="baixo">Baixo</option>
              <option value="medio">Médio</option>
              <option value="alto">Alto</option>
              <option value="total">Total</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={updateBlockade.isPending}
              className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateBlockade.isPending}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateBlockade.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Atualizar Interdição"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


