"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Search, X, Loader2, Trash2, Check } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCity } from "@/context/city-context";
import { CITY_COORDINATES } from "@/lib/constants";
import apiClient from "@/lib/api-client";

const MapContainer = dynamic(
  async () => {
    const mod = await import("react-leaflet");
    return mod.MapContainer;
  },
  { ssr: false }
);

const TileLayer = dynamic(
  async () => {
    const mod = await import("react-leaflet");
    return mod.TileLayer;
  },
  { ssr: false }
);

const Polyline = dynamic(
  async () => {
    const mod = await import("react-leaflet");
    return mod.Polyline;
  },
  { ssr: false }
);

const Marker = dynamic(
  async () => {
    const mod = await import("react-leaflet");
    return mod.Marker;
  },
  { ssr: false }
);

// Componente para definir a referência do mapa
const MapRefSetter = dynamic(
  async () => {
    const mod = await import("react-leaflet");
    const { useMap } = mod;
    return function MapRefSetter({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
      const map = useMap();
      React.useEffect(() => {
        mapRef.current = map;
      }, [map, mapRef]);
      return null;
    };
  },
  { ssr: false }
);

// Fix para ícones do Leaflet
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
  
  // Criar ícone padrão global para uso
  (window as any).defaultLeafletIcon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
}

type RouteDrawerMapProps = {
  onRouteChange: (coordinates: Array<{ lat: number; lng: number; order: number }>) => void;
  initialRoute?: Array<{ lat: number; lng: number; order: number }>;
  onStreetNameChange?: (streetName: string, neighborhood: string) => void;
};

// Componente para controlar o mapa e desenhar a rota
function MapController({
  onRouteChange,
  initialRoute,
  onStreetNameChange,
}: {
  onRouteChange: (coordinates: Array<{ lat: number; lng: number; order: number }>) => void;
  initialRoute?: Array<{ lat: number; lng: number; order: number }>;
  onStreetNameChange?: (streetName: string, neighborhood: string) => void;
}) {
  const { useMap } = require("react-leaflet");
  const map = useMap();
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const isInitialLoadRef = useRef(false);
  const hasCalledStreetNameChangeRef = useRef(false);
  const initialRouteLoadedRef = useRef(false);

  // Função para limpar marcadores e linha
  const clearRoute = useCallback(() => {
    markersRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current = [];
    
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
  }, [map]);

  // Função para atualizar a linha baseada nos marcadores
  const updatePolyline = useCallback(async () => {
    // Sempre atualizar as coordenadas, mesmo com menos de 2 marcadores
    const coordinates = markersRef.current.map((marker, index) => {
      const latlng = marker.getLatLng();
      return {
        lat: latlng.lat,
        lng: latlng.lng,
        order: index,
      };
    });
    
    // Sempre chamar onRouteChange, mesmo com menos de 2 pontos
    onRouteChange(coordinates);
    
    if (markersRef.current.length < 2) {
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
      return;
    }

    // Remover linha anterior
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    // Criar nova linha apenas se houver 2+ marcadores
    const latlngs = coordinates.map((c) => [c.lat, c.lng] as [number, number]);
    const polyline = L.polyline(latlngs, {
      color: "#ef4444",
      weight: 6,
      opacity: 0.8,
    }).addTo(map);
    
    polylineRef.current = polyline;

    // Buscar nome da rua APENAS se onStreetNameChange for fornecido E não for carregamento inicial
    // E apenas quando o usuário adiciona um novo ponto (não durante o carregamento)
    if (onStreetNameChange && coordinates.length > 0 && !isInitialLoadRef.current) {
      // Usar debounce para evitar múltiplas chamadas
      if (hasCalledStreetNameChangeRef.current) {
        return;
      }
      
      hasCalledStreetNameChangeRef.current = true;
      
      // Reset após delay
      setTimeout(() => {
        hasCalledStreetNameChangeRef.current = false;
      }, 2000);
      
      try {
        const response = await apiClient.get("/api/geocoding/reverse", {
          params: {
            lat: coordinates[0].lat,
            lng: coordinates[0].lng,
          },
        });
        
        if (response.data.results && response.data.results.length > 0) {
          const result = response.data.results[0];
          onStreetNameChange(result.rua || "", result.bairro || "");
        }
      } catch (error) {
        console.error("Erro ao buscar nome da rua:", error);
      }
    }
  }, [map, onRouteChange, onStreetNameChange]);

  useEffect(() => {
    if (!map) return;

    // Carregar rota inicial se existir (apenas uma vez)
    if (initialRoute && initialRoute.length > 0 && !initialRouteLoadedRef.current) {
      initialRouteLoadedRef.current = true;
      isInitialLoadRef.current = true;
      clearRoute();
      
      initialRoute.forEach((coord, index) => {
        const marker = L.marker([coord.lat, coord.lng], {
          draggable: true,
          icon: L.icon({
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
        }).addTo(map);
        
        // Permitir deletar marcador com duplo clique
        marker.on("dblclick", () => {
          console.log("🗑️ Removendo marcador (carregado inicialmente)");
          map.removeLayer(marker);
          markersRef.current = markersRef.current.filter((m) => m !== marker);
          updatePolyline();
        });
        
        // Atualizar linha quando arrastar
        marker.on("dragend", () => {
          isInitialLoadRef.current = false; // Após arrastar, não é mais carregamento inicial
          updatePolyline();
        });
        
        // Adicionar popup para debug
        marker.bindPopup(`Ponto ${index + 1}<br/>Lat: ${coord.lat.toFixed(6)}<br/>Lng: ${coord.lng.toFixed(6)}`);
        
        markersRef.current.push(marker);
      });
      
      // Atualizar polyline sem chamar onStreetNameChange no carregamento inicial
      const coordinates = markersRef.current.map((marker, index) => {
        const latlng = marker.getLatLng();
        return {
          lat: latlng.lat,
          lng: latlng.lng,
          order: index,
        };
      });
      
      onRouteChange(coordinates);
      
      if (markersRef.current.length >= 2) {
        const latlngs = coordinates.map((c) => [c.lat, c.lng] as [number, number]);
        const polyline = L.polyline(latlngs, {
          color: "#ef4444",
          weight: 6,
          opacity: 0.8,
        }).addTo(map);
        polylineRef.current = polyline;
      }
      
      // Marcar como carregamento inicial concluído após um delay
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 1000);
    } else if (!initialRoute) {
      // Se não há initialRoute, resetar flags
      initialRouteLoadedRef.current = false;
      isInitialLoadRef.current = false;
    }

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      console.log("🗺️ Clique no mapa detectado:", { lat, lng });

      // Criar ícone customizado (usar sempre um novo para garantir que funciona)
      const markerIcon = L.icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41],
      });

      // Criar novo marcador
      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: markerIcon,
        zIndexOffset: 1000, // Garantir que o marcador fique acima de outros elementos
      });

      // Adicionar ao mapa PRIMEIRO
      marker.addTo(map);
      
      // Adicionar ao array DEPOIS
      markersRef.current.push(marker);
      
      // Verificar se o marcador foi adicionado corretamente
      const isOnMap = map.hasLayer(marker);
      console.log("📍 Marcador criado e adicionado ao mapa:", marker.getLatLng());
      console.log("📍 Marcador está no mapa?", isOnMap);
      console.log("📍 Total de marcadores:", markersRef.current.length);
      
      // Verificar se o elemento está visível e forçar visibilidade
      const markerElement = marker.getElement();
      if (markerElement) {
        // Forçar estilos para garantir visibilidade
        (markerElement as HTMLElement).style.display = "block";
        (markerElement as HTMLElement).style.visibility = "visible";
        (markerElement as HTMLElement).style.opacity = "1";
        (markerElement as HTMLElement).style.zIndex = "1000";
        (markerElement as HTMLElement).style.position = "absolute";
        
        // Aguardar um frame para garantir que o DOM foi atualizado
        requestAnimationFrame(() => {
          const element = marker.getElement();
          if (element) {
            console.log("📍 Elemento HTML do marcador após RAF:", element);
            console.log("📍 Posição calculada:", window.getComputedStyle(element).transform);
            console.log("📍 Elemento visível?", element.offsetParent !== null);
            
            // Verificar se o elemento está realmente no DOM
            const isInDOM = document.body.contains(element) || map.getContainer().contains(element);
            console.log("📍 Elemento está no DOM?", isInDOM);
            
            // Se não estiver visível, tentar forçar novamente
            if (!isInDOM || element.offsetParent === null) {
              console.warn("⚠️ Marcador não está visível, tentando corrigir...");
              // Remover e readicionar
              map.removeLayer(marker);
              marker.addTo(map);
              map.invalidateSize();
              
              // Forçar estilos novamente
              const el = marker.getElement();
              if (el) {
                (el as HTMLElement).style.display = "block";
                (el as HTMLElement).style.visibility = "visible";
                (el as HTMLElement).style.opacity = "1";
                (el as HTMLElement).style.zIndex = "1000";
              }
            }
          }
        });
      } else {
        console.error("❌ Elemento do marcador não encontrado!");
      }

      // Permitir deletar marcador com duplo clique
      marker.on("dblclick", () => {
        console.log("🗑️ Removendo marcador");
        map.removeLayer(marker);
        markersRef.current = markersRef.current.filter((m) => m !== marker);
        updatePolyline();
      });

      // Atualizar linha quando arrastar
      marker.on("dragend", () => {
        isInitialLoadRef.current = false; // Após arrastar, não é mais carregamento inicial
        updatePolyline();
      });

      // Adicionar popup para debug
      marker.bindPopup(`Ponto ${markersRef.current.length}<br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}`);

      // Atualizar polyline após um pequeno delay para garantir que o marcador foi renderizado
      // Quando usuário adiciona novo ponto, não é mais carregamento inicial
      isInitialLoadRef.current = false;
      setTimeout(() => {
        updatePolyline();
        map.invalidateSize();
      }, 100);
    };

    // Adicionar listener de clique no mapa
    map.on("click", handleMapClick);
    
    // Garantir que o mapa está habilitado para receber cliques
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.disable();
    
    // Forçar atualização do mapa após um pequeno delay
    const invalidateTimer = setTimeout(() => {
      map.invalidateSize();
      console.log("🗺️ Mapa invalidado e pronto para receber cliques");
    }, 300);

    return () => {
      map.off("click", handleMapClick);
      clearTimeout(invalidateTimer);
      // NÃO limpar a rota no cleanup - apenas remover o listener
      // clearRoute(); // Comentado para não remover marcadores ao re-renderizar
    };
  }, [map, initialRoute, clearRoute, updatePolyline]);

  return null;
}

export function RouteDrawerMap({
  onRouteChange,
  initialRoute,
  onStreetNameChange,
}: RouteDrawerMapProps) {
  const { cityId } = useCity();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Garantir que o mapa seja invalidado quando o componente montar (para modais)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        // Forçar o mapa a atualizar após invalidar
        mapRef.current.setView(
          mapRef.current.getCenter(),
          mapRef.current.getZoom(),
          { animate: false }
        );
      }
    }, 500); // Aumentar delay para garantir que modal está totalmente renderizado

    return () => clearTimeout(timer);
  }, []);

  // Calcular centro inicial
  const initialMapCenter = useMemo((): [number, number] => {
    if (cityId && CITY_COORDINATES[cityId]) {
      const city = CITY_COORDINATES[cityId];
      return [city.lat, city.lng];
    }
    return [-22.9099, -47.0626]; // Campinas
  }, [cityId]);

  // Função de busca com debounce
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await apiClient.get("/api/geocoding/search", {
        params: {
          q: query,
          limit: 5,
          ...(cityId && { cityId }), // Incluir cityId se disponível
        },
      });
      
      setSearchResults(response.data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error("Erro ao buscar endereços:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [cityId]);

  // Debounce da busca
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300); // 300ms de debounce
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, handleSearch]);

  const handleSelectAddress = (result: any) => {
    setSearchQuery(result.address);
    setShowResults(false);
    
    // Centralizar mapa no endereço selecionado
    if (result.coordinates) {
      const newCenter: [number, number] = [result.coordinates.lat, result.coordinates.lng];
      setMapCenter(newCenter);
      
      if (mapRef.current) {
        mapRef.current.setView(newCenter, 16, { animate: true, duration: 0.5 });
      }
    }
    
    // Atualizar nome da rua e bairro
    if (onStreetNameChange) {
      onStreetNameChange(result.rua || "", result.bairro || "");
    }
  };

  return (
    <div className="space-y-3">
      {/* Busca com autocomplete */}
      <div className="relative">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 size-4 -translate-y-1/2 ${isSearching ? "text-emerald-400" : "text-slate-400"}`} />
          {isSearching && (
            <Loader2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-emerald-400" />
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
            placeholder="Buscar endereço para centralizar o mapa..."
            className={`w-full rounded-lg border pl-10 pr-10 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none ${
              isSearching
                ? "border-emerald-500/50 bg-slate-800/50"
                : "border-slate-700 bg-slate-800"
            }`}
          />
          {searchQuery && !isSearching && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Dropdown de resultados */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 shadow-xl max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={result.id || index}
                type="button"
                onClick={() => handleSelectAddress(result)}
                className="w-full px-4 py-3 text-left hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-b-0"
              >
                <p className="text-sm font-medium text-slate-200">{result.address}</p>
                {result.rua && (
                  <p className="text-xs text-slate-400 mt-1">
                    {result.rua}
                    {result.bairro && `, ${result.bairro}`}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="relative h-96 w-full overflow-hidden rounded-lg border border-slate-700" style={{ zIndex: 1 }}>
        <MapContainer
          key={mapCenter ? `map-${mapCenter[0]}-${mapCenter[1]}` : `map-${cityId || "default"}`}
          center={mapCenter || initialMapCenter}
          zoom={mapCenter ? 16 : (cityId && CITY_COORDINATES[cityId]?.zoom ? CITY_COORDINATES[cityId].zoom! : 12)}
          style={{ height: "100%", width: "100%", position: "relative", zIndex: 1 }}
          scrollWheelZoom={true}
          doubleClickZoom={false}
        >
          <MapRefSetter mapRef={mapRef} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController
            onRouteChange={onRouteChange}
            initialRoute={initialRoute}
            onStreetNameChange={onStreetNameChange}
          />
        </MapContainer>

        {/* Instruções e controles */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] space-y-2 pointer-events-none">
          <div className="rounded-lg border border-slate-700 bg-slate-900/90 backdrop-blur-sm p-3">
            <p className="text-xs text-slate-300">
              💡 <strong>Clique no mapa</strong> para adicionar pontos do trecho interditado. 
              <strong> Arraste</strong> os marcadores para ajustar. 
              <strong> Duplo clique</strong> em um marcador para removê-lo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

