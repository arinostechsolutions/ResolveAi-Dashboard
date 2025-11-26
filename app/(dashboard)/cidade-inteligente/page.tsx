import { StreetBlockadesManager } from "@/components/dashboard/street-blockades-manager";
import { SmartCityMenuConfig } from "@/components/dashboard/smart-city-menu-config";

export default function CidadeInteligentePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-200">Cidade Inteligente</h1>
        <p className="mt-1 text-sm text-slate-400">
          Gerencie interdições de ruas e pontos de interesse no mapa
        </p>
      </div>
      
      <SmartCityMenuConfig />
      
      <StreetBlockadesManager />
    </div>
  );
}

