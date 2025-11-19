export const NAV_ITEMS = [
  {
    title: "Visão Geral",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: "BarChart3",
  },
  {
    title: "Mapa",
    href: "/map",
    icon: "Map",
  },
  {
    title: "Ações",
    href: "/actions",
    icon: "ClipboardCheck",
  },
  {
    title: "Cadastros",
    href: "/admin/secretarias",
    icon: "Settings",
    superAdminOnly: true,
  },
  {
    title: "Observações",
    href: "/observations",
    icon: "MessageSquare",
    mayorOnly: true,
  },
  {
    title: "Posts Positivos",
    href: "/positive-posts",
    icon: "Sparkles",
  },
  {
    title: "Gráficos",
    href: "/analytics",
    icon: "TrendingUp",
  },
  {
    title: "Perfil",
    href: "/profile",
    icon: "User",
  },
];

export const DEFAULT_CITY_ID =
  process.env.NEXT_PUBLIC_DEFAULT_CITY_ID ?? "campinas";

type CityCenter = {
  lat: number;
  lng: number;
  zoom?: number;
};

export const CITY_COORDINATES: Record<string, CityCenter> = {
  "araruama-rj": {
    lat: -22.8697,
    lng: -42.3311,
    zoom: 12,
  },
  campinas: {
    lat: -22.9099,
    lng: -47.0626,
    zoom: 12,
  },
  "piracicaba": {
    lat: -22.7253,
    lng: -47.6492,
    zoom: 12,
  },
};

