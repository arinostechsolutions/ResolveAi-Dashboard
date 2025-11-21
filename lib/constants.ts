export type NavItem = {
  title: string;
  href?: string;
  icon: string;
  superAdminOnly?: boolean;
  mayorOnly?: boolean;
  children?: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Cadastros",
    href: "/admin/secretarias",
    icon: "Settings",
    superAdminOnly: true,
  },
  {
    title: "Configuração Mobile",
    href: "/mobile-config",
    icon: "Smartphone",
  },
  {
    title: "Saúde",
    icon: "Heart",
    children: [
      {
        title: "Gerenciar",
        href: "/saude/gerenciar",
        icon: "Settings",
      },
      {
        title: "Relatórios",
        href: "/saude/relatorios",
        icon: "BarChart3",
      },
      {
        title: "Gráficos",
        href: "/saude/graficos",
        icon: "TrendingUp",
      },
    ],
  },
  {
    title: "Eventos",
    href: "/events",
    icon: "Calendar",
  },
  {
    title: "IPTU",
    href: "/iptu",
    icon: "Receipt",
  },
  {
    title: "Melhorias",
    icon: "ClipboardCheck",
    children: [
      {
        title: "Visão Geral",
        href: "/melhorias/visao-geral",
        icon: "LayoutDashboard",
      },
      {
        title: "Relatórios",
        href: "/melhorias/relatorios",
        icon: "BarChart3",
      },
      {
        title: "Mapa",
        href: "/melhorias/mapa",
        icon: "Map",
      },
      {
        title: "Ações",
        href: "/melhorias/acoes",
        icon: "ClipboardCheck",
      },
      {
        title: "Gráficos",
        href: "/melhorias/graficos",
        icon: "TrendingUp",
      },
      {
        title: "Tipos de Sugestões",
        href: "/melhorias/tipos-de-sugestoes",
        icon: "List",
      },
    ],
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

