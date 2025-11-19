/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { ReportsMapResponse } from "@/types/dashboard";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { CITY_COORDINATES } from "@/lib/constants";
import { formatStatusLabel } from "@/lib/utils";

const MapContainer = dynamic(
  async () => {
    const mod = await import("react-leaflet");
    return mod.MapContainer;
  },
  { ssr: false },
);

const TileLayer = dynamic(
  async () => {
    const mod = await import("react-leaflet");
    return mod.TileLayer;
  },
  { ssr: false },
);

const Marker = dynamic(
  async () => {
    const mod = await import("react-leaflet");
    return mod.Marker;
  },
  { ssr: false },
);

const Popup = dynamic(
  async () => {
    const mod = await import("react-leaflet");
    return mod.Popup;
  },
  { ssr: false },
);

const useMap = dynamic(
  async () => {
    const mod = await import("react-leaflet");
    return { default: mod.useMap };
  },
  { ssr: false },
) as any;

type ReportsMapProps = {
  data?: ReportsMapResponse;
  cityId?: string;
  focusedReportId?: string | null;
};

const DEFAULT_CENTER: [number, number] = [-22.8697, -42.3311]; // Araruama-RJ
const iconCache = new Map<string, L.Icon>();

function createReportIcon(imageUrl?: string | null) {
  if (!imageUrl) return null;

  if (iconCache.has(imageUrl)) {
    return iconCache.get(imageUrl)!;
  }

  const icon = L.icon({
    iconUrl: imageUrl,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -22],
    className: "report-marker-icon",
  });

  iconCache.set(imageUrl, icon);
  return icon;
}

// Componente para controlar o foco no mapa
function MapFocusController({
  focusedReport,
  mapRef,
}: {
  focusedReport: ReportsMapResponse["reports"][number] | null;
  mapRef: React.MutableRefObject<L.Map | null>;
}) {
  const { useMap } = require("react-leaflet");
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    mapRef.current = map;

    if (focusedReport) {
      // Focar no report com zoom alto
      map.setView(
        [focusedReport.location.lat, focusedReport.location.lng],
        18,
        { animate: true, duration: 0.5 }
      );
    }
  }, [map, focusedReport, mapRef]);

  return null;
}

// Componente Marker com controle de popup
function MarkerWithPopup({
  report,
  icon,
  isFocused,
}: {
  report: ReportsMapResponse["reports"][number];
  icon: L.Icon | null;
  isFocused: boolean;
}) {
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (isFocused && markerRef.current) {
      // Aguardar um pouco para garantir que o mapa já focou e o marker está renderizado
      const timer = setTimeout(() => {
        // react-leaflet v5: tentar diferentes formas de acessar o elemento Leaflet
        const marker = markerRef.current;
        if (marker) {
          // Tentar getInstance() primeiro (react-leaflet v5)
          let leafletMarker = null;
          if (typeof marker.getInstance === 'function') {
            leafletMarker = marker.getInstance();
          } else if (marker.leafletElement) {
            leafletMarker = marker.leafletElement;
          } else if (marker.contextValue?.map) {
            // Tentar através do contexto
            leafletMarker = marker;
          }
          
          if (leafletMarker && typeof leafletMarker.openPopup === 'function') {
            leafletMarker.openPopup();
          }
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isFocused]);

  return (
    <Marker
      position={[report.location.lat, report.location.lng]}
      icon={icon ?? undefined}
      ref={markerRef}
      eventHandlers={{
        add: (e) => {
          // Quando o marker é adicionado ao mapa, se for focado, abrir popup
          if (isFocused) {
            setTimeout(() => {
              const marker = e.target;
              if (marker && typeof marker.openPopup === 'function') {
                marker.openPopup();
              }
            }, 800);
          }
        },
      }}
    >
      <Popup
        maxWidth={320}
        className="mobile-popup"
      >
        <article className="space-y-2 text-xs text-slate-100 rounded-xl border border-slate-800 bg-slate-950/90 p-2.5 sm:p-3 backdrop-blur max-h-[45vh] sm:max-h-[60vh] overflow-y-auto">
          <header className="space-y-1">
            <strong className="block text-xs sm:text-sm font-semibold text-white">
              {report.reportType}
            </strong>
            <p className="text-xs leading-tight">{report.address}</p>
            <p className="text-xs text-slate-400">
              Status: {formatStatusLabel(report.status)}
            </p>
          </header>

          {report.imageUrl ? (
            <a
              href={report.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden rounded-lg border border-slate-800 bg-black"
            >
              <img
                src={report.imageUrl}
                alt={report.reportType}
                className="max-h-24 sm:max-h-32 w-full object-contain transition duration-200 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <span className="mt-1 block text-center text-[10px] text-emerald-300 group-hover:text-emerald-200">
                Abrir foto em nova aba
              </span>
            </a>
          ) : null}
        </article>
      </Popup>
    </Marker>
  );
}

export function ReportsMap({ data, cityId, focusedReportId }: ReportsMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Encontrar o report focado
  const focusedReport = useMemo(() => {
    if (!focusedReportId || !data) return null;
    return data.reports.find((r) => r.id === focusedReportId);
  }, [focusedReportId, data]);

  const center = useMemo(() => {
    // Se houver report focado, usar suas coordenadas
    if (focusedReport) {
      return [focusedReport.location.lat, focusedReport.location.lng] as [number, number];
    }

    if (!data || data.reports.length === 0) {
      if (cityId && CITY_COORDINATES[cityId]) {
        const target = CITY_COORDINATES[cityId];
        return [target.lat, target.lng] as [number, number];
      }
      return DEFAULT_CENTER;
    }

    const [first] = data.reports;
    return [first.location.lat, first.location.lng] as [number, number];
  }, [data, cityId, focusedReport]);

  const zoom = useMemo(() => {
    // Se houver report focado, usar zoom alto para mostrar a rua
    if (focusedReport) {
      return 18;
    }

    if (cityId && CITY_COORDINATES[cityId]?.zoom) {
      return CITY_COORDINATES[cityId].zoom as number;
    }
    return 12;
  }, [cityId, focusedReport]);

  const markers = useMemo(() => {
    if (!data) return [];
    return data.reports.map((report) => ({
      report,
      icon: createReportIcon(report.imageUrl),
    }));
  }, [data]);

  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x.src,
      iconUrl: markerIcon.src,
      shadowUrl: markerShadow.src,
    });
  }, []);

  if (!data) {
    return (
      <div className="flex h-[28rem] w-full items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
        Carregando mapa...
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-900/30 overflow-hidden">
      <header className="flex items-center justify-between px-3 py-3 sm:px-6 sm:py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white sm:text-lg">
            Distribuição geográfica ({data.total})
          </h2>
          <p className="text-xs text-slate-400 sm:text-sm">
            Visualize onde estão concentradas as demandas da população.
          </p>
        </div>
      </header>
      <div className="h-[20rem] sm:h-[28rem] w-full relative">
        <MapContainer
          key={cityId ?? "default-map"}
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFocusController focusedReport={focusedReport || null} mapRef={mapRef} />
          {markers.map(({ report, icon }) => {
            const isFocused = focusedReportId === report.id;
            return (
              <MarkerWithPopup
                key={report.id}
                report={report}
                icon={icon}
                isFocused={isFocused}
              />
            );
          })}
        </MapContainer>
      </div>
    </section>
  );
}

