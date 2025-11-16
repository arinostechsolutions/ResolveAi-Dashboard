/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import type { ReportsMapResponse } from "@/types/dashboard";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { CITY_COORDINATES } from "@/lib/constants";

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

type ReportsMapProps = {
  data?: ReportsMapResponse;
  cityId?: string;
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

export function ReportsMap({ data, cityId }: ReportsMapProps) {
  const center = useMemo(() => {
    if (!data || data.reports.length === 0) {
      if (cityId && CITY_COORDINATES[cityId]) {
        const target = CITY_COORDINATES[cityId];
        return [target.lat, target.lng] as [number, number];
      }
      return DEFAULT_CENTER;
    }

    const [first] = data.reports;
    return [first.location.lat, first.location.lng] as [number, number];
  }, [data, cityId]);

  const zoom = useMemo(() => {
    if (cityId && CITY_COORDINATES[cityId]?.zoom) {
      return CITY_COORDINATES[cityId].zoom as number;
    }
    return 12;
  }, [cityId]);

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
          {markers.map(({ report, icon }) => (
            <Marker
              key={report.id}
              position={[report.location.lat, report.location.lng]}
              icon={icon ?? undefined}
            >
              <Popup
                maxWidth={400}
                className="mobile-popup"
              >
                <article className="space-y-2 text-xs sm:text-sm text-slate-100 rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-950/90 p-3 sm:p-4 backdrop-blur max-h-[70vh] sm:max-h-none overflow-y-auto">
                  <header className="space-y-1">
                    <strong className="block text-sm sm:text-base font-semibold text-white">
                      {report.reportType}
                    </strong>
                    <p className="text-xs sm:text-sm">{report.address}</p>
                    <p className="text-xs text-slate-400">
                      Status: {report.status}
                    </p>
                  </header>

                  {report.imageUrl ? (
                    <a
                      href={report.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group block overflow-hidden rounded-lg sm:rounded-xl border border-slate-800 bg-black"
                    >
                      <img
                        src={report.imageUrl}
                        alt={report.reportType}
                        className="max-h-32 sm:max-h-64 w-full object-contain transition duration-200 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                      <span className="mt-1 block text-center text-[10px] sm:text-xs text-emerald-300 group-hover:text-emerald-200">
                        Abrir foto em nova aba
                      </span>
                    </a>
                  ) : null}
                </article>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}

