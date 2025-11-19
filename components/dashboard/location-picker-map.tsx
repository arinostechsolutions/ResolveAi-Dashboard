"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, X, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCity } from "@/context/city-context";
import { CITY_COORDINATES } from "@/lib/constants";

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

const Marker = dynamic(
  async () => {
    const mod = await import("react-leaflet");
    return mod.Marker;
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
  });
}

// Função para formatar endereço simples (rua, bairro, cidade)
function formatSimpleAddress(data: any): string {
  const parts: string[] = [];
  
  // Rua
  if (data.address?.road) {
    parts.push(data.address.road);
  }
  
  // Bairro
  const bairro = data.address?.suburb || data.address?.neighbourhood || data.address?.quarter;
  if (bairro) {
    parts.push(bairro);
  }
  
  // Cidade
  const cidade = data.address?.city || data.address?.town || data.address?.municipality;
  if (cidade) {
    parts.push(cidade);
  }
  
  // Se não encontrou nada, usar display_name mas limitado
  if (parts.length === 0) {
    const displayName = data.display_name || "";
    // Pegar apenas as primeiras partes do display_name (geralmente rua, bairro, cidade)
    const displayParts = displayName.split(",").slice(0, 3);
    return displayParts.join(", ").trim();
  }
  
  return parts.join(", ");
}

type LocationPickerMapProps = {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
    bairro?: string;
    rua?: string;
  }) => void;
  initialLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
};

function MapController({
  onLocationSelect,
  initialLocation,
  onLoadingChange,
}: {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
    bairro?: string;
    rua?: string;
  }) => void;
  initialLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  onLoadingChange?: (loading: boolean) => void;
}) {
  // Importar useMap diretamente (só funciona dentro de MapContainer)
  const { useMap } = require("react-leaflet");
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  // Função para remover marcador atual
  const removeMarker = () => {
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  };

  useEffect(() => {
    if (!map) return;

    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Remover marcador anterior
      removeMarker();

      // Mostrar loading
      if (onLoadingChange) {
        onLoadingChange(true);
      }

      // Criar novo marcador temporário (sem ícone customizado)
      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: L.icon({
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      }).addTo(map);

      markerRef.current = marker;

      // Buscar endereço reverso
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        );
        const data = await response.json();

        const address = formatSimpleAddress(data);
        const bairro = data.address?.suburb || data.address?.neighbourhood || data.address?.quarter || "";
        const rua = data.address?.road || "";

        onLocationSelect({
          address: address || `${lat}, ${lng}`,
          lat,
          lng,
          bairro,
          rua,
        });
      } catch (error) {
        console.error("Erro ao buscar endereço:", error);
        onLocationSelect({
          address: `${lat}, ${lng}`,
          lat,
          lng,
        });
      } finally {
        // Esconder loading
        if (onLoadingChange) {
          onLoadingChange(false);
        }
      }

      // Permitir arrastar marcador
      marker.on("dragend", async (e) => {
        const position = e.target.getLatLng();
        
        // Mostrar loading durante geocodificação reversa
        if (onLoadingChange) {
          onLoadingChange(true);
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&addressdetails=1`
          );
          const data = await response.json();

          const address = formatSimpleAddress(data);
          const bairro = data.address?.suburb || data.address?.neighbourhood || data.address?.quarter || "";
          const rua = data.address?.road || "";

          onLocationSelect({
            address: address || `${position.lat}, ${position.lng}`,
            lat: position.lat,
            lng: position.lng,
            bairro,
            rua,
          });
        } catch (error) {
          console.error("Erro ao buscar endereço:", error);
        } finally {
          if (onLoadingChange) {
            onLoadingChange(false);
          }
        }
      });
    };

    map.on("click", handleMapClick);

    // Se houver localização inicial, adicionar marcador
    if (initialLocation) {
      removeMarker(); // Limpar qualquer marcador existente
      const marker = L.marker([initialLocation.lat, initialLocation.lng], {
        draggable: true,
        icon: L.icon({
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      }).addTo(map);
      markerRef.current = marker;
      map.setView([initialLocation.lat, initialLocation.lng], 15);
    }

    return () => {
      map.off("click", handleMapClick);
      removeMarker();
    };
  }, [map, onLocationSelect, initialLocation, onLoadingChange]);

  return null;
}

export function LocationPickerMap({
  onLocationSelect,
  initialLocation,
}: LocationPickerMapProps) {
  const { cityId } = useCity();
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [hasMarker, setHasMarker] = useState(false);
  
  // Calcular centro inicial baseado na cidade atual
  const initialMapCenter = useMemo((): [number, number] => {
    if (cityId && CITY_COORDINATES[cityId]) {
      const city = CITY_COORDINATES[cityId];
      return [city.lat, city.lng];
    }
    // Fallback para Campinas se cidade não encontrada
    return [-22.9099, -47.0626];
  }, [cityId]);
  
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialMapCenter);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | undefined>(initialLocation);
  const mapRef = useRef<L.Map | null>(null);

  // Atualizar centro quando cidade mudar (mas não sobrescrever se houver localização inicial)
  useEffect(() => {
    if (!initialLocation && cityId && CITY_COORDINATES[cityId]) {
      const city = CITY_COORDINATES[cityId];
      setMapCenter([city.lat, city.lng]);
      // Atualizar o mapa se já estiver criado
      if (mapRef.current) {
        mapRef.current.setView([city.lat, city.lng], city.zoom || 12);
      }
    }
  }, [cityId, initialLocation]);

  // Atualizar centro quando initialMapCenter mudar (se não houver localização inicial)
  useEffect(() => {
    if (!initialLocation) {
      setMapCenter(initialMapCenter);
    }
  }, [initialMapCenter, initialLocation]);

  useEffect(() => {
    if (initialLocation) {
      setMapCenter([initialLocation.lat, initialLocation.lng]);
      setHasMarker(true);
      setCurrentLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleRemoveMarker = () => {
    setHasMarker(false);
    setCurrentLocation(undefined);
    onLocationSelect({
      address: "",
      lat: 0,
      lng: 0,
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const address = formatSimpleAddress(result);
        const bairro = result.address?.suburb || result.address?.neighbourhood || result.address?.quarter || "";
        const rua = result.address?.road || "";

        setMapCenter([lat, lng]);
        setHasMarker(true);
        setCurrentLocation({ lat, lng, address });
        // Atualizar o mapa para mostrar o novo marcador
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }
        onLocationSelect({
          address: address || `${lat}, ${lng}`,
          lat,
          lng,
          bairro,
          rua,
        });
      } else {
        alert("Endereço não encontrado. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      alert("Erro ao buscar endereço. Tente novamente.");
    } finally {
      setSearching(false);
      setGeocoding(false);
    }
  };

  const handleLocationSelect = (location: {
    address: string;
    lat: number;
    lng: number;
    bairro?: string;
    rua?: string;
  }) => {
    if (location.lat !== 0 && location.lng !== 0) {
      setHasMarker(true);
    }
    onLocationSelect(location);
  };

  return (
    <div className="space-y-3">
      {/* Barra de Busca */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 size-4 -translate-y-1/2 ${searching ? "text-emerald-400" : "text-slate-400"}`} />
          {searching && (
            <Loader2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-emerald-400" />
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !searching) {
                handleSearch();
              }
            }}
            disabled={searching}
            placeholder="Buscar endereço (ex: Rua das Flores, 123, Campinas)"
            className={`w-full rounded-lg border pl-10 pr-10 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none ${
              searching
                ? "border-emerald-500/50 bg-slate-800/50"
                : "border-slate-700 bg-slate-800"
            }`}
          />
          {searchQuery && !searching && (
            <button
              onClick={() => {
                setSearchQuery("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="flex items-center gap-2 rounded-lg border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
        >
          {searching ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="size-4" />
              Buscar
            </>
          )}
        </button>
      </div>

      {/* Mapa */}
      <div className="relative h-96 w-full overflow-hidden rounded-lg border border-slate-700">
        {/* Loading Overlay */}
        {(searching || geocoding) && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-emerald-400" />
              <p className="text-sm font-medium text-slate-200">
                {searching ? "Buscando endereço..." : "Buscando localização..."}
              </p>
            </div>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={
            initialLocation
              ? 15
              : cityId && CITY_COORDINATES[cityId]?.zoom
              ? CITY_COORDINATES[cityId].zoom!
              : 12
          }
          style={{ height: "100%", width: "100%" }}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController
            key={currentLocation ? `${currentLocation.lat}-${currentLocation.lng}` : "no-location"}
            onLocationSelect={handleLocationSelect}
            initialLocation={currentLocation}
            onLoadingChange={setGeocoding}
          />
        </MapContainer>

        {/* Botão para remover marcador */}
        {hasMarker && (
          <button
            onClick={handleRemoveMarker}
            className="absolute bottom-4 right-4 z-[500] flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
            title="Remover localização"
          >
            <X className="size-4" />
            Remover
          </button>
        )}
      </div>

      <div className="flex items-start justify-between">
        <p className="text-xs text-slate-500">
          💡 Clique no mapa para marcar a localização ou arraste o marcador para ajustar
        </p>
        {hasMarker && (
          <button
            onClick={handleRemoveMarker}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Remover localização
          </button>
        )}
      </div>
    </div>
  );
}

