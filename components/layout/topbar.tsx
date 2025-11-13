"use client";

import { ReactNode, useState } from "react";
import { Menu, X, UserCircle2, LayoutDashboard, BarChart3, Map, ClipboardCheck, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
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
};

export function Topbar({ citySelect }: TopbarProps) {
  const { admin } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItemsWithIcons = NAV_ITEMS.map((item) => ({
    ...item,
    Icon: iconComponents[item.icon as keyof typeof iconComponents] ?? LayoutDashboard,
  }));

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-slate-800 bg-slate-900/60 px-3 py-4 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between overflow-x-hidden">
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-white tracking-tight sm:text-2xl">
              Monitoramento das Irregularidades
            </h1>
            <p className="text-xs text-slate-400 sm:text-sm">
              Acompanhe em tempo real a operação da ResolveAI junto à prefeitura.
            </p>
          </div>
          <button
            className="lg:hidden inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center min-w-0">
          {citySelect}
          <Link
            href="/profile"
            className="inline-flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 transition hover:border-emerald-400 hover:text-emerald-200"
          >
            <UserCircle2 className="size-5 text-emerald-300" />
            <div className="flex flex-col leading-tight">
              <span className="font-medium">{admin?.name ?? "Administrador"}</span>
              <span className="text-xs text-slate-400">
                {admin?.isSuperAdmin ? "Super Admin" : "Prefeituras"}
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
        </div>
      </nav>
    </>
  );
}

