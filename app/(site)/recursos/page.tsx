import {
  BarChart3,
  MapPin,
  FileText,
  TrendingUp,
  Shield,
  Users,
  Bell,
  Download,
  Filter,
  Search,
} from "lucide-react";

const resources = [
  {
    category: "Dashboard e Analytics",
    items: [
      {
        name: "Dashboard Completo",
        description:
          "Visualize todas as métricas importantes em um único lugar com gráficos interativos e atualizações em tempo real.",
        icon: BarChart3,
      },
      {
        name: "Análise de Tendências",
        description:
          "Identifique padrões e tendências com análises avançadas que ajudam na tomada de decisões estratégicas.",
        icon: TrendingUp,
      },
      {
        name: "Relatórios Personalizados",
        description:
          "Gere relatórios detalhados e exporte dados em diferentes formatos para análise externa.",
        icon: FileText,
      },
    ],
  },
  {
    category: "Visualização e Mapeamento",
    items: [
      {
        name: "Mapas Interativos",
        description:
          "Explore irregularidades geograficamente com mapas interativos que mostram a localização exata de cada relatório.",
        icon: MapPin,
      },
      {
        name: "Filtros Avançados",
        description:
          "Filtre relatórios por data, status, tipo, bairro e muito mais para encontrar exatamente o que precisa.",
        icon: Filter,
      },
      {
        name: "Busca Inteligente",
        description:
          "Encontre relatórios rapidamente com nossa busca avançada que pesquisa em todos os campos.",
        icon: Search,
      },
    ],
  },
  {
    category: "Gestão e Controle",
    items: [
      {
        name: "Gestão de Status",
        description:
          "Controle completo sobre o status dos relatórios, desde a criação até a resolução, com histórico completo.",
        icon: FileText,
      },
      {
        name: "Sistema de Permissões",
        description:
          "Controle de acesso robusto com diferentes níveis para prefeitos, secretários e administradores.",
        icon: Shield,
      },
      {
        name: "Notificações",
        description:
          "Receba notificações em tempo real sobre novos relatórios e atualizações importantes.",
        icon: Bell,
      },
    ],
  },
  {
    category: "Engajamento e Comunidade",
    items: [
      {
        name: "Ranking de Engajamento",
        description:
          "Veja quais cidadãos e bairros estão mais engajados na melhoria da cidade.",
        icon: Users,
      },
      {
        name: "Exportação de Dados",
        description:
          "Exporte dados para análise externa ou integração com outros sistemas.",
        icon: Download,
      },
    ],
  },
];

export default function RecursosPage() {
  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl md:text-6xl">
            Recursos{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Completos
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
            Tudo que você precisa para gerenciar irregularidades urbanas de
            forma eficiente e profissional.
          </p>
        </div>
      </section>

      {/* Resources Section */}
      <section className="bg-slate-900 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {resources.map((category, categoryIndex) => (
            <div key={category.category} className={categoryIndex > 0 ? "mt-24" : ""}>
              <h2 className="text-2xl font-bold text-slate-100 sm:text-3xl">
                {category.category}
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <div
                    key={item.name}
                    className="group rounded-xl border border-slate-800/50 bg-slate-950/50 p-6 transition hover:border-emerald-500/50 hover:bg-slate-900/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                      <item.icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-200">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

