import { Target, Users, Zap, Award } from "lucide-react";

const values = [
  {
    name: "Missão",
    description:
      "Facilitar a comunicação entre cidadãos e prefeituras, tornando a gestão urbana mais transparente e eficiente.",
    icon: Target,
  },
  {
    name: "Visão",
    description:
      "Ser a plataforma líder em gestão de irregularidades urbanas no Brasil, conectando milhões de cidadãos com suas prefeituras.",
    icon: Zap,
  },
  {
    name: "Valores",
    description:
      "Transparência, eficiência, inovação e compromisso com o desenvolvimento urbano sustentável.",
    icon: Award,
  },
  {
    name: "Impacto",
    description:
      "Ajudamos prefeituras a resolverem problemas urbanos de forma mais rápida e organizada, melhorando a qualidade de vida nas cidades.",
    icon: Users,
  },
];

export default function SobrePage() {
  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl md:text-6xl">
            Sobre o{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              ResolveAI
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
            Somos uma plataforma inovadora que conecta cidadãos e prefeituras,
            facilitando a gestão de irregularidades urbanas através de
            tecnologia de ponta.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-slate-900 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
              Nossa essência
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Os princípios que guiam nosso trabalho e nossa visão de futuro.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-none">
            {values.map((value) => (
              <div
                key={value.name}
                className="rounded-xl border border-slate-800/50 bg-slate-950/50 p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                  <value.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-200">
                  {value.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
            Nossa história
          </h2>
          <div className="mt-8 space-y-6 text-lg text-slate-400">
            <p>
              O ResolveAI nasceu da necessidade de modernizar a comunicação
              entre cidadãos e prefeituras. Percebemos que muitas irregularidades
              urbanas poderiam ser resolvidas mais rapidamente com uma plataforma
              dedicada e intuitiva.
            </p>
            <p>
              Com mais de 3 anos de experiência no mercado de tecnologia da informação,
              nossa equipe traz expertise consolidada em engenharia de software,
              desenvolvendo soluções complexas e escaláveis para diversos segmentos.
            </p>
            <p>
              Nossa experiência internacional em engenharia de software nos permitiu
              trabalhar em projetos desafiadores, incluindo o desenvolvimento de
              sistemas complexos, e-commerces de grande escala, migrações de
              infraestrutura e arquiteturas modernas. Essa bagagem técnica nos
              capacita a entregar soluções robustas e confiáveis.
            </p>
            <p>
              Desenvolvemos uma solução completa que não apenas recebe relatórios,
              mas também oferece ferramentas poderosas de análise e gestão para
              que as prefeituras possam tomar decisões baseadas em dados.
            </p>
            <p>
              Hoje, ajudamos prefeituras de todo o Brasil a melhorarem sua gestão
              urbana, tornando as cidades mais organizadas e os cidadãos mais
              engajados com o desenvolvimento de suas comunidades.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

