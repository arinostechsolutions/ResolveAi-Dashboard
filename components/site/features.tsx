import {
  BarChart3,
  MapPin,
  Shield,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";

const features = [
  {
    name: "Dashboard Analítico",
    description:
      "Visualize métricas importantes, tendências e estatísticas em tempo real com gráficos interativos e relatórios detalhados.",
    icon: BarChart3,
  },
  {
    name: "Mapas Interativos",
    description:
      "Explore sugestões de melhorias geograficamente com mapas interativos que mostram a localização exata de cada relatório.",
    icon: MapPin,
  },
  {
    name: "Gestão de Status",
    description:
      "Controle completo sobre o status dos relatórios, desde a criação até a resolução, com histórico completo de ações.",
    icon: FileText,
  },
  {
    name: "Análise de Tendências",
    description:
      "Identifique padrões e tendências com análises avançadas que ajudam na tomada de decisões estratégicas.",
    icon: TrendingUp,
  },
  {
    name: "Controle de Acesso",
    description:
      "Sistema robusto de permissões com diferentes níveis de acesso para prefeitos, secretários e administradores.",
    icon: Shield,
  },
  {
    name: "Engajamento Cidadão",
    description:
      "Rankings de engajamento e métricas que mostram o envolvimento da comunidade na melhoria da cidade.",
    icon: Users,
  },
];

export function Features() {
  return (
    <section className="bg-slate-900 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
            Recursos poderosos para sua gestão
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Tudo que você precisa para gerenciar sugestões de melhorias urbanas de
            forma eficiente e profissional.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="group rounded-xl border border-slate-800/50 bg-slate-950/50 p-6 transition hover:border-emerald-500/50 hover:bg-slate-900/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                <feature.icon className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-200">
                {feature.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

