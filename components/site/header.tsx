"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { admin } = useAuth();
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-16 w-32 sm:h-20 sm:w-40">
            <Image
              src="/resolveai-fundo-transparente.png"
              alt="ResolveAI"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              pathname === "/"
                ? "bg-emerald-500 text-emerald-950 font-semibold shadow-lg shadow-emerald-500/30"
                : "text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50"
            )}
          >
            Início
          </Link>
          <Link
            href="/sobre"
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              pathname === "/sobre" || pathname.startsWith("/sobre/")
                ? "bg-emerald-500 text-emerald-950 font-semibold shadow-lg shadow-emerald-500/30"
                : "text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50"
            )}
          >
            Sobre
          </Link>
          <Link
            href="/recursos"
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              pathname === "/recursos" || pathname.startsWith("/recursos/")
                ? "bg-emerald-500 text-emerald-950 font-semibold shadow-lg shadow-emerald-500/30"
                : "text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50"
            )}
          >
            Recursos
          </Link>
          <Link
            href="/contato"
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              pathname === "/contato" || pathname.startsWith("/contato/")
                ? "bg-emerald-500 text-emerald-950 font-semibold shadow-lg shadow-emerald-500/30"
                : "text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50"
            )}
          >
            Contato
          </Link>
          {admin ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
            >
              Entrar
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-300 hover:text-emerald-400"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800/50 bg-slate-950/95 backdrop-blur-lg md:hidden">
          <div className="flex flex-col gap-2 px-4 py-6">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={clsx(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                pathname === "/"
                  ? "bg-emerald-500 text-emerald-950 font-semibold shadow-lg shadow-emerald-500/30"
                  : "text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50"
              )}
            >
              Início
            </Link>
            <Link
              href="/sobre"
              onClick={() => setMobileMenuOpen(false)}
              className={clsx(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                pathname === "/sobre" || pathname.startsWith("/sobre/")
                  ? "bg-emerald-500 text-emerald-950 font-semibold shadow-lg shadow-emerald-500/30"
                  : "text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50"
              )}
            >
              Sobre
            </Link>
            <Link
              href="/recursos"
              onClick={() => setMobileMenuOpen(false)}
              className={clsx(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                pathname === "/recursos" || pathname.startsWith("/recursos/")
                  ? "bg-emerald-500 text-emerald-950 font-semibold shadow-lg shadow-emerald-500/30"
                  : "text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50"
              )}
            >
              Recursos
            </Link>
            <Link
              href="/contato"
              onClick={() => setMobileMenuOpen(false)}
              className={clsx(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                pathname === "/contato" || pathname.startsWith("/contato/")
                  ? "bg-emerald-500 text-emerald-950 font-semibold shadow-lg shadow-emerald-500/30"
                  : "text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50"
              )}
            >
              Contato
            </Link>
            {admin ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-center text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-center text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

