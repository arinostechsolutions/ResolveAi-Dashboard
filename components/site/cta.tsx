import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="bg-gradient-to-r from-emerald-500/10 via-emerald-600/10 to-emerald-500/10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
          Pronto para transformar sua cidade?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
          Junte-se às prefeituras que já estão usando ResolveAI para melhorar
          a gestão urbana e o engajamento cidadão.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/admin/login"
            className="group flex items-center gap-2 rounded-lg bg-emerald-500 px-8 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            Acessar Dashboard
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/contato"
            className="rounded-lg border border-slate-700 bg-slate-900/50 px-8 py-3 text-base font-semibold text-slate-200 transition hover:border-emerald-500/50 hover:bg-slate-800/50"
          >
            Falar com vendas
          </Link>
        </div>
      </div>
    </section>
  );
}

