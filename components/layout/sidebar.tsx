"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, BarChart3, Map, Menu, User, ClipboardCheck } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { useState } from "react";

const iconComponents = {
  LayoutDashboard,
  BarChart3,
  Map,
  User,
  ClipboardCheck,
};

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItemsWithIcons = NAV_ITEMS.map((item) => ({
    ...item,
    Icon: iconComponents[item.icon as keyof typeof iconComponents] ?? LayoutDashboard,
  }));

  return (
    <aside className="bg-slate-900/80 backdrop-blur border-r border-slate-800 text-slate-100">
      <div className="flex items-center justify-between px-6 py-5 lg:py-6">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          ResolveAI Dashboard
        </Link>
        <button
          className="lg:hidden inline-flex items-center justify-center rounded-lg border border-slate-700 p-2 hover:bg-slate-800"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <nav
        className={clsx(
          "flex flex-col gap-1 px-3 pb-6",
          isOpen ? "block" : "hidden lg:flex",
        )}
      >
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
              onClick={() => setIsOpen(false)}
            >
              <Icon className="size-5" />
              <span>{title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

