"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, BarChart3, Map, Menu, User, ClipboardCheck, Settings, MessageSquare, ChevronLeft, ChevronRight, TrendingUp, LogOut, Sparkles, Smartphone } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { useState, useCallback } from "react";
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
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { admin } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const isSuperAdmin = admin?.isSuperAdmin ?? false;
  const isMayor = admin?.isMayor ?? false;
  const isSecretaria = Boolean(admin?.secretaria && !admin?.isSuperAdmin && !admin?.isMayor);
  // Prefeitos também têm acesso completo (mas apenas à sua cidade)
  const hasFullAccess = isSuperAdmin || isMayor;
  
  // Debug: log para verificar permissões
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("🔍 Sidebar Debug:", {
      isSuperAdmin,
      isMayor,
      hasFullAccess,
      admin: admin ? { isSuperAdmin: admin.isSuperAdmin, isMayor: admin.isMayor } : null,
    });
  }
  
  // Contar observações não lidas apenas para secretarias
  const unreadCount = useUnreadObservationsCount(isSecretaria);

  const navItemsWithIcons = NAV_ITEMS.filter(
    (item) => {
      // Se o item requer ambos (superAdminOnly E mayorOnly), verificar primeiro
      if (item.superAdminOnly && item.mayorOnly) {
        return hasFullAccess || isMayor;
      }
      
      // Se o item requer super admin, verificar se tem acesso completo
      if (item.superAdminOnly && !hasFullAccess) return false;
      
      // Se o item requer prefeito, verificar se é prefeito ou secretaria
      if (item.mayorOnly && !isMayor && !isSecretaria) return false;
      
      return true;
    }
  ).map((item) => ({
    ...item,
    Icon: iconComponents[item.icon as keyof typeof iconComponents] ?? LayoutDashboard,
  }));

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
          {navItemsWithIcons.map(({ title, href, Icon }) => {
            // Lógica melhorada para detectar rota ativa
            const isActive = (() => {
              // Match exato sempre funciona
              if (pathname === href) return true;
             
              // Para rotas específicas, verificar se o pathname começa com o href seguido de "/"
              // Isso evita falsos positivos (ex: /admin não deve ser ativo quando está em /administer)
              if (href !== "/" && href !== "/dashboard") {
                return pathname.startsWith(href + "/") || pathname === href;
              }
             
              // Para /dashboard, apenas match exato (não queremos que seja ativo em subrotas)
              if (href === "/dashboard") {
                return pathname === "/dashboard";
              }
             
              return false;
            })();
            
            const showBadge = href === "/observations" && unreadCount > 0;

            return (
              <button
                key={href}
                type="button"
                onClick={() => handleNavClick(href)}
                className={clsx(
                  "w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 text-left relative",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? title : undefined}
              >
                <div className={clsx(
                  "flex items-center gap-3",
                  isCollapsed && "gap-0"
                )}>
                  <Icon className="size-5 shrink-0" />
                  {!isCollapsed && <span>{title}</span>}
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
          })}
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

