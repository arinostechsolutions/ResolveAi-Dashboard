"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useCity } from "@/context/city-context";
import { useCreateBlockade, type CreateBlockadeData, type BlockadeType } from "@/hooks/use-street-blockades";
import { toast } from "react-hot-toast";
import { X, MapPin, Calendar, AlertTriangle, Loader2, Search } from "lucide-react";
import { RouteDrawerMap } from "./route-drawer-map";
import apiClient from "@/lib/api-client";

interface CreateBlockadeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBlockadeModal({ isOpen, onClose }: CreateBlockadeModalProps) {
  const { cityId } = useCity();
  const createBlockade = useCreateBlockade();
  
  const [formData, setFormData] = useState<Partial<CreateBlockadeData>>({
    cityId: cityId || "",
    type: "obra",
    reason: "",
    startDate: "",
    endDate: "",
    route: {
      coordinates: [],
      streetName: "",
      neighborhood: "",
    },
    impact: {
      level: "medio",
    },
  });

  // Estados para autocomplete de endereço
  const [streetSearchQuery, setStreetSearchQuery] = useState("");
  const [neighborhoodSearchQuery, setNeighborhoodSearchQuery] = useState("");
  const [streetSearchResults, setStreetSearchResults] = useState<any[]>([]);
  const [showStreetResults, setShowStreetResults] = useState(false);
  const [isSearchingStreet, setIsSearchingStreet] = useState(false);
  const [isNeighborhoodAutoFilled, setIsNeighborhoodAutoFilled] = useState(false); // Rastreia se bairro foi preenchido pela API
  const [isStreetSelected, setIsStreetSelected] = useState(false); // Rastreia se rua foi preenchida por seleção (não deve chamar API)
  const streetSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streetResultsRef = useRef<HTMLDivElement | null>(null);

  // Reset form quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        cityId: cityId || "",
        type: "obra",
        reason: "",
        startDate: "",
        endDate: "",
        route: {
          coordinates: [],
          streetName: "",
          neighborhood: "",
        },
        impact: {
          level: "medio",
        },
      });
      setStreetSearchQuery("");
      setNeighborhoodSearchQuery("");
      setStreetSearchResults([]);
      setShowStreetResults(false);
      setIsNeighborhoodAutoFilled(false);
      setIsStreetSelected(false);
    }
  }, [isOpen, cityId]);

  // Função de busca de endereços com debounce (apenas para rua/CEP)
  const searchAddresses = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setStreetSearchResults([]);
      setShowStreetResults(false);
      return;
    }

    setIsSearchingStreet(true);

    try {
      const response = await apiClient.get("/api/geocoding/search", {
        params: {
          q: query,
          limit: 5,
          ...(cityId && { cityId }), // Incluir cityId se disponível
        },
      });

      const results = response.data.results || [];
      
      // Mapear todos os resultados, priorizando rua mas aceitando outros tipos
      const streetResults = results.map((r: any) => {
        // Se for CEP, usar o endereço completo
        if (r.type === "postcode" || r.cep) {
          return {
            ...r,
            display: r.address || r.text,
            rua: r.rua || r.text || "",
          };
        }
        // Se tiver rua, usar rua
        if (r.rua) {
          return {
            ...r,
            display: r.rua,
          };
        }
        // Caso contrário, usar o texto do endereço
        return {
          ...r,
          display: r.text || r.address || "",
          rua: r.text || r.address || "",
        };
      }).filter((r: any) => r.display && r.display.trim() !== ""); // Remover apenas vazios
      
      setStreetSearchResults(streetResults);
      // Só mostrar dropdown se houver resultados E o usuário estiver digitando (não selecionou)
      if (!isStreetSelected && streetResults.length > 0) {
        setShowStreetResults(true);
      }
    } catch (error) {
      console.error("Erro ao buscar endereços:", error);
    } finally {
      setIsSearchingStreet(false);
    }
  }, [cityId]);

  // Debounce para busca de rua (só busca se não foi selecionado)
  useEffect(() => {
    // Se foi selecionado, não chamar API
    if (isStreetSelected) {
      setIsStreetSelected(false); // Reset flag para próxima digitação
      return;
    }

    if (streetSearchTimeoutRef.current) {
      clearTimeout(streetSearchTimeoutRef.current);
    }

    if (streetSearchQuery.trim().length >= 2) {
      streetSearchTimeoutRef.current = setTimeout(() => {
        searchAddresses(streetSearchQuery);
      }, 300);
    } else {
      setStreetSearchResults([]);
      setShowStreetResults(false);
    }

    return () => {
      if (streetSearchTimeoutRef.current) {
        clearTimeout(streetSearchTimeoutRef.current);
      }
    };
  }, [streetSearchQuery, searchAddresses, isStreetSelected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cityId) {
      toast.error("Selecione uma cidade");
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

    console.log("🔍 Validando coordenadas antes de enviar:", formData.route?.coordinates);
    console.log("🔍 Número de coordenadas:", formData.route?.coordinates?.length);
    
    if (!formData.route?.coordinates || formData.route.coordinates.length < 2) {
      toast.error("Adicione pelo menos 2 pontos no mapa para definir o trecho");
      return;
    }

    try {
      const payload = {
        cityId,
        route: {
          coordinates: formData.route.coordinates || [],
          streetName: formData.route.streetName,
          neighborhood: formData.route.neighborhood,
        },
        type: formData.type as BlockadeType,
        reason: formData.reason,
        startDate: formData.startDate,
        endDate: formData.endDate && formData.endDate.trim() !== "" ? formData.endDate : undefined,
        impact: formData.impact,
      } as CreateBlockadeData;

      await createBlockade.mutateAsync(payload);
      toast.success("Interdição criada com sucesso!");
      
      // Reset form
      setFormData({
        cityId: cityId || "",
        type: "obra",
        reason: "",
        startDate: "",
        endDate: "",
        route: {
          coordinates: [],
          streetName: "",
          neighborhood: "",
        },
        impact: {
          level: "medio",
        },
      });
      
      // Reset autocomplete states
      setStreetSearchQuery("");
      setNeighborhoodSearchQuery("");
      setStreetSearchResults([]);
      setShowStreetResults(false);
      setIsNeighborhoodAutoFilled(false);
      setIsStreetSelected(false);
      
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao criar interdição");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-200">Nova Interdição de Rua</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
            disabled={createBlockade.isPending}
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
              onRouteChange={(coordinates) => {
                setFormData((prev) => ({
                  ...prev,
                  route: {
                    ...prev.route!,
                    coordinates: coordinates,
                  },
                }));
              }}
              onStreetNameChange={(streetName, neighborhood) => {
                // Marcar como selecionado quando vem do mapa para evitar chamar API
                setIsStreetSelected(true);
                setStreetSearchResults([]);
                setShowStreetResults(false);
                
                setFormData((prev) => ({
                  ...prev,
                  route: {
                    ...prev.route!,
                    streetName: streetName || prev.route?.streetName || "",
                    neighborhood: neighborhood || prev.route?.neighborhood || "",
                    coordinates: prev.route?.coordinates || [] // Preservar coordenadas
                  },
                }));
                setStreetSearchQuery(streetName || "");
                if (neighborhood) {
                  setNeighborhoodSearchQuery(neighborhood);
                  setIsNeighborhoodAutoFilled(true); // Marcar como preenchido automaticamente quando vem do mapa
                } else {
                  setIsNeighborhoodAutoFilled(false);
                }
              }}
            />
            {formData.route?.coordinates && formData.route.coordinates.length > 0 && (
              <p className="mt-2 text-xs text-emerald-400">
                ✓ {formData.route.coordinates.length} ponto(s) adicionado(s) ao trecho
              </p>
            )}
          </div>

          {/* Rua com autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nome da Rua <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 size-4 -translate-y-1/2 ${isSearchingStreet ? "text-emerald-400" : "text-slate-400"}`} />
              {isSearchingStreet && (
                <Loader2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-emerald-400" />
              )}
              <input
                type="text"
                value={streetSearchQuery}
                onChange={(e) => {
                  setIsStreetSelected(false); // Reset flag quando usuário digita
                  setStreetSearchQuery(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    route: { 
                      ...prev.route!,
                      streetName: e.target.value,
                      coordinates: prev.route?.coordinates || [] // Preservar coordenadas
                    }
                  }));
                }}
                onBlur={() => {
                  // Delay para permitir clique no resultado
                  setTimeout(() => {
                    if (!streetResultsRef.current?.contains(document.activeElement)) {
                      setShowStreetResults(false);
                    }
                  }, 200);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 pl-10 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="Ex: Rua das Flores ou CEP (12345-678)"
                required
              />
            </div>
            {/* Dropdown de resultados */}
            {showStreetResults && streetSearchResults.length > 0 && (
              <div 
                ref={streetResultsRef}
                className="absolute z-50 mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 shadow-xl max-h-48 overflow-y-auto"
                onMouseDown={(e) => e.preventDefault()} // Prevenir blur ao clicar
              >
                {streetSearchResults.map((result, index) => (
                  <button
                    key={result.id || index}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const selectedRua = result.rua || result.display || result.text || result.address || "";
                      const selectedBairro = result.bairro || result.cidade || "";
                      
                      // Marcar como selecionado ANTES de atualizar o estado para evitar chamar API
                      setIsStreetSelected(true);
                      
                      // Limpar resultados e fechar dropdown primeiro
                      setStreetSearchResults([]);
                      setShowStreetResults(false);
                      
                      // Preencher rua
                      setStreetSearchQuery(selectedRua);
                      
                      // Preencher bairro automaticamente se disponível
                      if (selectedBairro) {
                        setNeighborhoodSearchQuery(selectedBairro);
                        setIsNeighborhoodAutoFilled(true); // Marcar como preenchido automaticamente
                        setFormData((prev) => ({
                          ...prev,
                          route: {
                            ...prev.route!,
                            streetName: selectedRua,
                            neighborhood: selectedBairro,
                            coordinates: prev.route?.coordinates || [] // Preservar coordenadas
                          },
                        }));
                      } else {
                        // Se não tiver bairro, permitir edição manual
                        setIsNeighborhoodAutoFilled(false);
                        setFormData((prev) => ({
                          ...prev,
                          route: {
                            ...prev.route!,
                            streetName: selectedRua,
                            neighborhood: prev.route?.neighborhood || "",
                            coordinates: prev.route?.coordinates || [] // Preservar coordenadas
                          },
                        }));
                      }
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-slate-200">{result.display || result.rua || result.address}</p>
                    {(result.bairro || result.cidade || result.cep) && (
                      <p className="text-xs text-slate-400 mt-1">
                        {result.cep && `CEP: ${result.cep}`}
                        {result.cep && (result.bairro || result.cidade) && " • "}
                        {result.bairro && `Bairro: ${result.bairro}`}
                        {!result.bairro && result.cidade && `Cidade: ${result.cidade}`}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bairro - apenas preenchimento manual ou automático */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bairro <span className="text-red-400">*</span>
              {isNeighborhoodAutoFilled && (
                <span className="ml-2 text-xs text-emerald-400">(Preenchido automaticamente)</span>
              )}
            </label>
            <input
              type="text"
              value={neighborhoodSearchQuery}
              onChange={(e) => {
                setNeighborhoodSearchQuery(e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  route: { 
                    ...prev.route!,
                    neighborhood: e.target.value,
                    coordinates: prev.route?.coordinates || [] // Preservar coordenadas
                  }
                }));
                // Se usuário editar manualmente, remover flag de preenchido automaticamente
                if (isNeighborhoodAutoFilled) {
                  setIsNeighborhoodAutoFilled(false);
                }
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
              disabled={createBlockade.isPending}
              className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createBlockade.isPending}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createBlockade.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Interdição"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

