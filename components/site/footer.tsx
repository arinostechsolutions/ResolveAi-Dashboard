import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800/50 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo e descrição */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="mb-4 inline-block">
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
            <p className="mt-4 max-w-sm text-sm text-slate-400">
              Plataforma inteligente para gestão de sugestões de melhorias urbanas.
              Conectando cidadãos e prefeituras para cidades mais organizadas.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Links Rápidos</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/sobre"
                  className="text-sm text-slate-400 transition hover:text-emerald-400"
                >
                  Sobre
                </Link>
              </li>
              <li>
                <Link
                  href="/recursos"
                  className="text-sm text-slate-400 transition hover:text-emerald-400"
                >
                  Recursos
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-sm text-slate-400 transition hover:text-emerald-400"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Contato</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="https://wa.me/5522992645933"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 transition hover:text-emerald-400"
                >
                  (22) 99264-5933
                </a>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-sm text-slate-400 transition hover:text-emerald-400"
                >
                  Área do Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800/50 pt-8">
          <p className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} ResolveAI. Todos os direitos reservados.
          </p>
          <p className="mt-2 text-center text-xs text-slate-500">
            CNPJ: 46.285.107/0001-24
          </p>
        </div>
      </div>
    </footer>
  );
}

