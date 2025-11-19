export function formatStatusLabel(status: string | null | undefined) {
  if (!status) return "—";
  
  // Mapeamento de status para labels formatados
  const statusMap: Record<string, string> = {
    nao_inicado: "Não iniciado",
    pendente: "Pendente",
    resolvido: "Resolvido",
    em_andamento: "Em andamento",
    cancelado: "Cancelado",
  };
  
  // Se existe no mapeamento, retorna o label formatado
  const normalizedStatus = status.toLowerCase().trim();
  if (statusMap[normalizedStatus]) {
    return statusMap[normalizedStatus];
  }
  
  // Fallback: formata automaticamente separando por underscore
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\p{L}/gu, (match) => match.toUpperCase());
}

export function normalizeStatusValue(status: string) {
  return status.trim();
}





