"use client";

import { ReactNode, useState, useCallback, useMemo } from "react";
import { Menu, X, UserCircle2, LayoutDashboard, BarChart3, Map, ClipboardCheck, User, MessageSquare, LogOut, Heart, Calendar, Receipt, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { SecretariaSelect } from "../selects/secretaria-select";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";
import { clsx } from "clsx";

type TopbarProps = {
  citySelect: ReactNode;
};

const iconComponents = {
  LayoutDashboard,
  BarChart3,
  Map,
  User,
  ClipboardCheck,
  MessageSquare,
  Heart,
  Calendar,
  Receipt,
  Sparkles,
  Settings: ClipboardCheck,
  TrendingUp: BarChart3,
  List: ClipboardCheck,
  Smartphone: User,
};

export function Topbar({ citySelect }: TopbarProps) {
  const { admin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const handleLogout = useCallback(() => {
    logout();
    setIsMenuOpen(false);
    router.push("/login");
  }, [logout, router]);

  const isSuperAdmin = admin?.isSuperAdmin ?? false;
  const isMayor = admin?.isMayor ?? false;
  const isSecretaria = Boolean(admin?.secretaria && !admin?.isSuperAdmin && !admin?.isMayor);
  const hasFullAccess = isSuperAdmin || isMayor;

  // Função para verificar se um item deve ser exibido
  const shouldShowItem = useCallback((item: NavItem): boolean => {
    if (item.superAdminOnly && item.mayorOnly) {
      return hasFullAccess || isMayor;
    }
    
    if (item.superAdminOnly && !hasFullAccess) return false;
    
    if (item.mayorOnly && !isMayor && !isSecretaria) return false;
    
    if (item.href === "/mobile-config") {
      return hasFullAccess || isMayor || isSecretaria;
    }
    
    if (item.href === "/events" || item.href?.startsWith("/events")) {
      return hasFullAccess || isMayor || isSecretaria;
    }
    
    if (item.href === "/iptu" || item.href?.startsWith("/iptu")) {
      return hasFullAccess || isMayor || isSecretaria;
    }
    
    if (item.href?.startsWith("/saude")) {
      return hasFullAccess || isMayor || isSecretaria;
    }
    
    if (item.href?.startsWith("/melhorias")) {
      return true;
    }
    
    return true;
  }, [hasFullAccess, isMayor, isSecretaria]);

  // Filtrar e processar itens do menu
  const navItemsWithIcons = useMemo(() => {
    const processItem = (item: NavItem): (NavItem & { Icon: any }) | null => {
      if (!shouldShowItem(item)) {
        return null;
      }

      const processedItem: NavItem & { Icon: any } = {
        ...item,
        Icon: iconComponents[item.icon as keyof typeof iconComponents] ?? LayoutDashboard,
      };

      if (item.children) {
        const processedChildren = item.children
          .map(processItem)
          .filter((child): child is NavItem & { Icon: any } => child !== null);
        
        if (processedChildren.length > 0) {
          processedItem.children = processedChildren;
        } else {
          return null;
        }
      }

      return processedItem;
    };

    return NAV_ITEMS.map(processItem)
      .filter((item): item is NavItem & { Icon: any } => item !== null);
  }, [shouldShowItem]);

  const isPathActive = useCallback((href?: string) => {
    if (!href) return false;
    if (pathname === href) return true;
    if (href !== "/" && href !== "/dashboard") {
      return pathname.startsWith(href + "/") || pathname === href;
    }
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return false;
  }, [pathname]);

  const hasActiveChild = useCallback((item: NavItem & { Icon: any }): boolean => {
    if (!item.children) return false;
    return item.children.some((child) => isPathActive(child.href));
  }, [isPathActive]);

  const toggleMenu = useCallback((title: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }, []);

  const renderNavItem = (item: NavItem & { Icon: any }, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.title);
    const childActive = hasActiveChild(item);

    if (hasChildren) {
      return (
        <div key={`menu-${item.title}`}>
          <button
            type="button"
            onClick={() => toggleMenu(item.title)}
            className={clsx(
              "w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors text-left",
              childActive
                ? "bg-gradient-to-r from-emerald-500/90 to-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white",
              level > 0 && "ml-4"
            )}
          >
            <div className="flex items-center gap-3">
              <item.Icon className="size-5" />
              <span>{item.title}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
          {isExpanded && item.children && (
            <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-2">
              {item.children.map((child) => {
                if (!child.href) return null;
                const childIsActive = isPathActive(child.href);
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={clsx(
                      "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                      childIsActive
                        ? "bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-500"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {(() => {
                      const ChildIcon = iconComponents[child.icon as keyof typeof iconComponents] ?? LayoutDashboard;
                      return <ChildIcon className="size-4" />;
                    })()}
                    <span>{child.title}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (!item.href) return null;

    const isActive = isPathActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={clsx(
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
          "hover:bg-slate-800 hover:text-white",
          isActive
            ? "bg-gradient-to-r from-emerald-500/90 to-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
            : "text-slate-300",
          level > 0 && "ml-4"
        )}
        onClick={() => setIsMenuOpen(false)}
      >
        <item.Icon className="size-5" />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <>
      <header className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/60 px-3 py-3 backdrop-blur sm:px-4 sm:py-4 lg:px-6 lg:flex-row lg:items-center lg:justify-between overflow-x-hidden">
        <div className="flex items-start justify-between min-w-0 gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-white tracking-tight sm:text-xl lg:text-2xl truncate">
              Monitoramento das Sugestões de Melhorias
            </h1>
            <p className="text-xs text-slate-400 sm:text-sm hidden sm:block">
              Acompanhe em tempo real a operação da ResolveAI junto à prefeitura.
            </p>
          </div>
          <button
            className="lg:hidden inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white shrink-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center min-w-0">
            {citySelect}
            <SecretariaSelect />
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-2 py-2 sm:px-3 text-sm text-slate-100 transition hover:border-emerald-400 hover:text-emerald-200 min-w-0"
          >
            <UserCircle2 className="size-4 sm:size-5 text-emerald-300 shrink-0" />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-medium text-xs sm:text-sm truncate">{admin?.name ?? "Administrador"}</span>
              <span className="text-xs text-slate-400 hidden sm:block">
                {admin?.isSuperAdmin ? "Super Admin" : admin?.isMayor ? "Prefeito" : "Administrador"}
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* Menu Mobile */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ease-in-out",
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      />
      <nav
        className={clsx(
          "fixed top-0 left-0 h-full w-64 bg-slate-900/95 backdrop-blur border-r border-slate-800 z-50 lg:hidden overflow-y-auto transition-transform duration-300 ease-in-out",
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <span className="font-semibold tracking-tight text-lg text-white">
            Menu
          </span>
          <button
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 p-2 hover:bg-slate-800 text-slate-300 transition-colors"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-1 px-3 py-4">
          {navItemsWithIcons.map((item) => renderNavItem(item))}
          
          {/* Botão de Logout no Mobile */}
          <div className="mt-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-red-500/10 hover:text-red-300 text-slate-300"
            >
              <LogOut className="size-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

