"use client";

import { Edit, Trash2, Eye, Calendar, Tag } from "lucide-react";
import { type News } from "@/hooks/use-news";
import { clsx } from "clsx";

interface NewsListProps {
  news: News[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  onEdit: (news: News) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
}

const getStatusColor = (status: News["status"]) => {
  const colors = {
    rascunho: "bg-yellow-500/10 text-yellow-300 border-yellow-500/50",
    publicado: "bg-emerald-500/10 text-emerald-300 border-emerald-500/50",
    arquivado: "bg-slate-500/10 text-slate-300 border-slate-500/50",
  };
  return colors[status] || colors.rascunho;
};

const getStatusLabel = (status: News["status"]) => {
  const labels = {
    rascunho: "Rascunho",
    publicado: "Publicado",
    arquivado: "Arquivado",
  };
  return labels[status] || status;
};

const getCategoryLabel = (category: News["category"]) => {
  const labels = {
    geral: "Geral",
    saude: "Saúde",
    educacao: "Educação",
    infraestrutura: "Infraestrutura",
    eventos: "Eventos",
    servicos: "Serviços",
    outro: "Outro",
  };
  return labels[category] || category;
};

export function NewsList({ news, pagination, onEdit, onDelete, onPageChange }: NewsListProps) {
  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <p>Nenhuma notícia encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {news.map((item) => (
          <div
            key={item._id}
            className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 hover:bg-slate-900/70 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-slate-200 truncate">{item.title}</h4>
                  {item.isHighlighted && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
                      Destaque
                    </span>
                  )}
                </div>
                {item.summary && (
                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">{item.summary}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className={clsx("px-2 py-1 rounded border", getStatusColor(item.status))}>
                    {getStatusLabel(item.status)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="size-3" />
                    {getCategoryLabel(item.category)}
                  </span>
                  {item.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(item.publishedAt).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="size-3" />
                    {item.views || 0} visualizações
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 rounded-lg border border-sky-500/50 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition-colors"
                >
                  <Edit className="size-4" />
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="p-2 rounded-lg border border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-400">
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}


