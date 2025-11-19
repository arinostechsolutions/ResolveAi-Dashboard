"use client";

import { ReactNode, useState, useCallback } from "react";
import { Menu, X, UserCircle2, LayoutDashboard, BarChart3, Map, ClipboardCheck, User, MessageSquare, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { SecretariaSelect } from "../selects/secretaria-select";
import { NAV_ITEMS } from "@/lib/constants";
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
};

export function Topbar({ citySelect }: TopbarProps) {
  const { admin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    setIsMenuOpen(false);
    router.push("/login");
  }, [logout, router]);

  const navItemsWithIcons = NAV_ITEMS.map((item) => ({
    ...item,
    Icon: iconComponents[item.icon as keyof typeof iconComponents] ?? LayoutDashboard,
  }));

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
          {navItemsWithIcons.map(({ title, href, Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  "hover:bg-slate-800 hover:text-white",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/90 to-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "text-slate-300",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="size-5" />
                <span>{title}</span>
              </Link>
            );
          })}
          
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

