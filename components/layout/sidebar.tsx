"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, BarChart3, Map, Menu, User, ClipboardCheck, Settings, MessageSquare, ChevronLeft, ChevronRight, ChevronDown, TrendingUp, LogOut, Sparkles, Smartphone, Heart, List, Calendar, Receipt } from "lucide-react";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";
import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { useUnreadObservationsCount } from "@/hooks/use-observations";
import { useSidebar } from "@/context/sidebar-context";

const iconComponents = {
  LayoutDashboard,
  BarChart3,
  Map,
  User,
  ClipboardCheck,
  Settings,
  MessageSquare,
  TrendingUp,
  Sparkles,
  Smartphone,
  Heart,
  List,
  Calendar,
  Receipt,
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const { admin } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const isSuperAdmin = admin?.isSuperAdmin ?? false;
  const isMayor = admin?.isMayor ?? false;
  const isSecretaria = Boolean(admin?.secretaria && !admin?.isSuperAdmin && !admin?.isMayor);
  const hasFullAccess = isSuperAdmin || isMayor;

  // Contar observações não lidas apenas para secretarias
  const unreadCount = useUnreadObservationsCount(isSecretaria);

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
      return true; // Melhorias são acessíveis a todos
    }
    
    return true;
  }, [hasFullAccess, isMayor, isSecretaria]);

  // Filtrar e mapear itens do menu
  const navItemsWithIcons = useMemo(() => {
    const processItem = (item: NavItem): NavItem | null => {
      if (!shouldShowItem(item)) {
        return null;
      }

      const processedItem: NavItem = {
        ...item,
        icon: item.icon,
      };

      // Processar filhos recursivamente
      if (item.children) {
        const processedChildren = item.children
          .map(processItem)
          .filter((child): child is NavItem => child !== null);
        
        if (processedChildren.length > 0) {
          processedItem.children = processedChildren;
        } else {
          // Se não há filhos visíveis, não mostrar o item pai
          return null;
        }
      }

      return processedItem;
    };

    return NAV_ITEMS.map(processItem)
      .filter((item): item is NavItem => item !== null)
      .map((item) => ({
        ...item,
        Icon: iconComponents[item.icon as keyof typeof iconComponents] ?? LayoutDashboard,
      }));
  }, [shouldShowItem]);

  // Verificar se um menu está expandido
  const isMenuExpanded = useCallback((title: string) => {
    return expandedMenus.has(title);
  }, [expandedMenus]);

  // Alternar expansão de menu
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

  // Verificar se um caminho está ativo
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

  // Verificar se algum filho está ativo
  const hasActiveChild = useCallback((item: NavItem): boolean => {
    if (!item.children) return false;
    return item.children.some((child) => isPathActive(child.href));
  }, [isPathActive]);

  // Auto-expandir menus com filhos ativos
  useMemo(() => {
    navItemsWithIcons.forEach((item) => {
      if (item.children && hasActiveChild(item)) {
        setExpandedMenus((prev) => new Set(prev).add(item.title));
      }
    });
  }, [pathname, navItemsWithIcons, hasActiveChild]);

  const { logout } = useAuth();

  const handleNavClick = useCallback((href: string) => {
    setIsOpen(false);
    if (pathname !== href) {
      router.push(href);
    }
  }, [pathname, router]);

  const handleLogout = useCallback(() => {
    logout();
    setIsOpen(false);
    router.push("/login");
  }, [logout, router]);

  const renderNavItem = (item: NavItem & { Icon: any }, level: number = 0) => {
    const isActive = item.href ? isPathActive(item.href) : false;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = isMenuExpanded(item.title);
    const childActive = hasActiveChild(item);
    const showBadge = item.href === "/observations" && unreadCount > 0;

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            type="button"
            onClick={() => toggleMenu(item.title)}
            className={clsx(
              "w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 text-left",
              childActive
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 font-semibold"
                : "text-slate-300 hover:bg-slate-800 hover:text-white",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? item.title : undefined}
          >
            <div className={clsx(
              "flex items-center gap-3",
              isCollapsed && "gap-0"
            )}>
              <item.Icon className="size-5 shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown className={clsx(
                "size-4 transition-transform duration-200",
                isExpanded && "rotate-180"
              )} />
            )}
          </button>
          {!isCollapsed && isExpanded && item.children && (
            <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-2">
              {item.children.map((child) => {
                const ChildIcon = iconComponents[child.icon as keyof typeof iconComponents] ?? LayoutDashboard;
                const childIsActive = isPathActive(child.href);
                return (
                  <button
                    key={child.href}
                    type="button"
                    onClick={() => handleNavClick(child.href!)}
                    className={clsx(
                      "w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 text-left",
                      childIsActive
                        ? "bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-500"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    )}
                  >
                    <ChildIcon className="size-4 shrink-0" />
                    <span>{child.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.href}
        type="button"
        onClick={() => item.href && handleNavClick(item.href)}
        className={clsx(
          "w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 text-left relative",
          isActive
            ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 font-semibold"
            : "text-slate-300 hover:bg-slate-800 hover:text-white",
          isCollapsed && "justify-center px-2"
        )}
        title={isCollapsed ? item.title : undefined}
      >
        <div className={clsx(
          "flex items-center gap-3",
          isCollapsed && "gap-0"
        )}>
          <item.Icon className="size-5 shrink-0" />
          {!isCollapsed && <span>{item.title}</span>}
        </div>
        {showBadge && !isCollapsed && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500 text-xs font-semibold text-emerald-950">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        {showBadge && isCollapsed && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-emerald-500 text-[10px] font-semibold text-emerald-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className={clsx(
      "relative z-50 bg-slate-900/80 backdrop-blur border-r border-slate-800 text-slate-100 transition-all duration-300",
      isCollapsed ? "lg:w-16" : "lg:w-64 xl:w-72"
    )}>
      <div className={clsx(
        "flex items-center py-5 lg:py-6",
        isCollapsed ? "justify-center px-2" : "justify-between px-6"
      )}>
        {!isCollapsed && (
          <Link href="/dashboard" className="font-semibold tracking-tight text-lg">
            ResolveAI Dashboard
          </Link>
        )}
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden inline-flex items-center justify-center rounded-lg border border-slate-700 p-2 hover:bg-slate-800"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
          <button
            className="hidden lg:inline-flex items-center justify-center rounded-lg border border-slate-700 p-2 hover:bg-slate-800 transition-colors"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="size-5" />
            ) : (
              <ChevronLeft className="size-5" />
            )}
          </button>
        </div>
      </div>

      <nav
        className={clsx(
          "flex flex-col gap-1 px-3 pb-6",
          isOpen ? "block" : "hidden lg:flex",
        )}
      >
        <div className="flex-1">
          {navItemsWithIcons.map((item) => renderNavItem(item))}
        </div>
        
        {/* Botão de Logout */}
        <div className="mt-auto pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className={clsx(
              "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors text-left",
              "hover:bg-red-500/10 hover:text-red-300 text-slate-300",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Sair" : undefined}
          >
            <LogOut className="size-5 shrink-0" />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}
