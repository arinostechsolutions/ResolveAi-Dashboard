"use client";

import { useState } from "react";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import { useNewsList, useCreateNews, useUpdateNews, useDeleteNews, type News } from "@/hooks/use-news";
import { useMobileConfig, useUpdateMobileConfig } from "@/hooks/use-mobile-config";
import { useCityMenu, useUpdateCityMenu, type MenuItem } from "@/hooks/use-city-menu";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Settings,
  Heart,
  HeartOff,
  AlertCircle,
  Newspaper,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { NewsFormModal } from "./news/modals/news-form-modal";
import { NewsList } from "./news/news-list";
import { DeleteNewsModal } from "./news/modals/delete-news-modal";

export function NewsManager() {
  const { cityId } = useCity();
  const { admin } = useAuth();
  
  const [showNewsFormModal, setShowNewsFormModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  
  const { data: mobileConfigData } = useMobileConfig(cityId);
  const updateMobileConfigMutation = useUpdateMobileConfig();
  const { data: menuData } = useCityMenu(cityId);
  const updateMenuMutation = useUpdateCityMenu();
  
  const { data: newsData, isLoading } = useNewsList(cityId, {
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit: 20,
    includeDrafts: true,
  });
  
  const deleteNewsMutation = useDeleteNews();
  
  const hasNews = Boolean(newsData?.news && newsData.news.length > 0);
  const isModuleEnabled = mobileConfigData?.showNews || false;
  const newsMenuItem = menuData?.find((item) => item.id === "news");
  const canToggleModule = admin?.isSuperAdmin || admin?.isMayor;

  const handleCreateNews = () => {
    setEditingNews(null);
    setShowNewsFormModal(true);
  };

  const handleEditNews = (news: News) => {
    setEditingNews(news);
    setShowNewsFormModal(true);
  };

  const handleDeleteNews = (newsId: string) => {
    const news = newsData?.news.find((n) => n._id === newsId);
    if (news) {
      setNewsToDelete(news);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!newsToDelete) return;
    
    try {
      await deleteNewsMutation.mutateAsync(newsToDelete._id);
      setShowDeleteModal(false);
      setNewsToDelete(null);
      toast.success("Notícia excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar notícia:", error);
      toast.error("Erro ao excluir notícia.");
    }
  };

  const handleToggleModule = async (enabled: boolean) => {
    if (!cityId) return;
    
    if (enabled && !hasNews) {
      toast.error("Cadastre pelo menos uma notícia antes de habilitar o módulo.");
      return;
    }
    
    try {
      await updateMobileConfigMutation.mutateAsync({
        cityId,
        payload: { showNews: enabled },
      });
    } catch (error) {
      console.error("Erro ao alterar módulo:", error);
    }
  };

  const hasPermission = admin?.isMayor || admin?.isSuperAdmin || (admin?.secretaria && !admin?.isMayor && !admin?.isSuperAdmin);

  if (!hasPermission) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-red-400 font-medium">
          Acesso negado. Apenas administradores podem acessar esta funcionalidade.
        </p>
      </div>
    );
  }

  if (!cityId) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-center">
        <p className="text-slate-400">Selecione uma cidade para gerenciar notícias.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-200">Gerenciar Notícias do Município</h1>
        <p className="mt-1 text-sm text-slate-400">
          Cadastre e gerencie notícias da cidade para o aplicativo mobile
        </p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Settings className="size-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Configuração do Módulo de Notícias</h3>
              <p className="text-sm text-slate-400">
                {isModuleEnabled
                  ? "Módulo habilitado - aparece no app mobile"
                  : "Módulo desabilitado - não aparece no app mobile"}
              </p>
            </div>
          </div>
          {canToggleModule && (
            <button
              onClick={() => handleToggleModule(!isModuleEnabled)}
              disabled={!hasNews && !isModuleEnabled}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isModuleEnabled
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              } ${!hasNews && !isModuleEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isModuleEnabled ? (
                <>
                  <HeartOff className="size-4" />
                  Desabilitar Módulo
                </>
              ) : (
                <>
                  <Heart className="size-4" />
                  Habilitar Módulo
                </>
              )}
            </button>
          )}
        </div>
        
        {!hasNews && !isModuleEnabled && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-300">
              Para habilitar o módulo, você precisa cadastrar pelo menos uma notícia.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">
            Notícias ({newsData?.pagination.total || 0})
          </h3>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-200"
            >
              <option value="all">Todos</option>
              <option value="rascunho">Rascunho</option>
              <option value="publicado">Publicado</option>
              <option value="arquivado">Arquivado</option>
            </select>
            <button
              onClick={handleCreateNews}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            >
              <Plus className="size-4" />
              Criar Notícia
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <NewsList
            news={newsData?.news || []}
            pagination={newsData?.pagination}
            onEdit={handleEditNews}
            onDelete={handleDeleteNews}
            onPageChange={setPage}
          />
        )}
      </div>

      {showNewsFormModal && (
        <NewsFormModal
          isOpen={showNewsFormModal}
          onClose={() => {
            setShowNewsFormModal(false);
            setEditingNews(null);
          }}
          news={editingNews}
          cityId={cityId!}
        />
      )}

      {showDeleteModal && (
        <DeleteNewsModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setNewsToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          news={newsToDelete}
          isDeleting={deleteNewsMutation.isPending}
        />
      )}
    </div>
  );
}

