"use client";

import { useState } from "react";
import { usePositivePostsByCity } from "@/hooks/use-positive-posts";
import { useCity } from "@/context/city-context";
import { Loader2, Plus, Eye, Heart, Share2, Calendar, MapPin, Image as ImageIcon, Edit, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ImageViewerModal } from "./image-viewer-modal";
import { toast } from "react-hot-toast";
import { useDeletePositivePost } from "@/hooks/use-positive-posts";
import type { PositivePost, PositivePostCategory, PositivePostStatus } from "@/types/positive-posts";

const CATEGORY_LABELS: Record<PositivePostCategory, string> = {
  obra_finalizada: "Obra Finalizada",
  melhoria_urbana: "Melhoria Urbana",
  evento_cultural: "Evento Cultural",
  servico_publico: "Serviço Público",
  infraestrutura: "Infraestrutura",
  outro: "Outro",
};

const STATUS_LABELS: Record<PositivePostStatus, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  arquivado: "Arquivado",
};

const STATUS_COLORS: Record<PositivePostStatus, string> = {
  rascunho: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  publicado: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  arquivado: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

type PositivePostsListProps = {
  onCreateClick: () => void;
  onEditClick: (post: PositivePost) => void;
};

export function PositivePostsList({ onCreateClick, onEditClick }: PositivePostsListProps) {
  const { cityId } = useCity();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<PositivePostStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<PositivePostCategory | "all">("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data, isLoading, error } = usePositivePostsByCity({
    cityId,
    page,
    limit,
    status: statusFilter === "all" ? undefined : statusFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
  });

  const deletePost = useDeletePositivePost();

  const handleDelete = async (postId: string, title: string) => {
    if (!confirm(`Tem certeza que deseja deletar o post "${title}"?`)) {
      return;
    }

    try {
      await deletePost.mutateAsync(postId);
      toast.success("Post deletado com sucesso!");
    } catch (error) {
      toast.error("Erro ao deletar post");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
        Erro ao carregar posts positivos. Tente novamente.
      </div>
    );
  }

  const posts = data?.posts || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-4">
      {/* Header com filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            <Plus className="size-4" />
            Novo Post
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro de Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as PositivePostStatus | "all");
                setPage(1);
              }}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">Todos os Status</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Categoria */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as PositivePostCategory | "all");
                setPage(1);
              }}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">Todas as Categorias</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Posts */}
      {posts.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 text-center">
          <ImageIcon className="mx-auto mb-4 size-12 text-slate-500" />
          <p className="text-slate-400">Nenhum post positivo encontrado.</p>
          <button
            onClick={onCreateClick}
            className="mt-4 text-emerald-400 hover:text-emerald-300"
          >
            Criar primeiro post
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post._id}
                className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                {/* Imagem Principal */}
                {post.images && post.images.length > 0 && (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                    <button
                      onClick={() => setSelectedImage(post.images[0].url)}
                      className="h-full w-full"
                    >
                      <img
                        src={post.images[0].url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </button>
                    {post.images.length > 1 && (
                      <div className="absolute right-2 top-2 rounded-full bg-slate-900/80 px-2 py-1 text-xs text-slate-200">
                        +{post.images.length - 1}
                      </div>
                    )}
                  </div>
                )}

                {/* Conteúdo */}
                <div className="p-4">
                  {/* Status e Categoria */}
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={clsx(
                        "rounded-full border px-2 py-0.5 text-xs font-medium",
                        STATUS_COLORS[post.status]
                      )}
                    >
                      {STATUS_LABELS[post.status]}
                    </span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                      {CATEGORY_LABELS[post.category]}
                    </span>
                  </div>

                  {/* Título */}
                  <h3 className="mb-2 line-clamp-2 font-semibold text-slate-200">
                    {post.title}
                  </h3>

                  {/* Descrição */}
                  <p className="mb-3 line-clamp-2 text-sm text-slate-400">
                    {post.description}
                  </p>

                  {/* Informações */}
                  <div className="mb-3 space-y-1 text-xs text-slate-500">
                    {post.eventDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3" />
                        <span>
                          {format(new Date(post.eventDate), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    )}
                    {post.location?.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3" />
                        <span className="truncate">{post.location.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Métricas de Engajamento */}
                  <div className="mb-3 flex items-center gap-4 border-t border-slate-800 pt-3">
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Heart className="size-4 text-red-400" />
                      <span className="font-medium">{post.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Eye className="size-4 text-blue-400" />
                      <span className="font-medium">{post.viewsCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Share2 className="size-4 text-emerald-400" />
                      <span className="font-medium">{post.sharesCount || 0}</span>
                    </div>
                    <div className="ml-auto text-xs text-slate-500">
                      Score: {post.engagementScore?.toFixed(1) || "0.0"}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditClick(post)}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
                    >
                      <Edit className="mr-1.5 inline size-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(post._id, post.title)}
                      disabled={deletePost.isPending}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-400">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de Visualização de Imagem */}
      {selectedImage && (
        <ImageViewerModal
          isOpen={true}
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

