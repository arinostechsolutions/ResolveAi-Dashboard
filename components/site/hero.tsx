import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
      
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl md:text-6xl lg:text-7xl">
            Transforme sua cidade com{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              inteligência
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
            Plataforma completa para gestão de irregularidades urbanas. Conecte
            cidadãos e prefeituras em uma solução moderna e eficiente.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/admin/login"
              className="group flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-400"
            >
              Começar agora
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/sobre"
              className="rounded-lg border border-slate-700 bg-slate-900/50 px-6 py-3 text-base font-semibold text-slate-200 transition hover:border-emerald-500/50 hover:bg-slate-800/50"
            >
              Saiba mais
            </Link>
          </div>
        </div>

        {/* Features rápidas */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-6 backdrop-blur-sm">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-200">
              Gestão Inteligente
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Dashboard completo para monitoramento e análise de relatórios
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-6 backdrop-blur-sm">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-200">
              Visualização em Tempo Real
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Mapas interativos e análises em tempo real das irregularidades
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-6 backdrop-blur-sm">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-200">
              Relatórios Detalhados
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Gere relatórios completos e exporte dados para análise
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

