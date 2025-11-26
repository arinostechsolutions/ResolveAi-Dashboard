"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { useCreateNews, useUpdateNews, type News, type NewsStatus, type NewsCategory } from "@/hooks/use-news";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { toast } from "react-hot-toast";

interface NewsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  news?: News | null;
  cityId: string;
}

export function NewsFormModal({ isOpen, onClose, news, cityId }: NewsFormModalProps) {
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<NewsStatus>("rascunho");
  const [category, setCategory] = useState<NewsCategory>("geral");
  const [tags, setTags] = useState<string>("");
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");

  useEffect(() => {
    if (news) {
      setTitle(news.title);
      setContent(news.content);
      setSummary(news.summary || "");
      setImageUrl(news.imageUrl || "");
      setImages(news.imageUrl ? [news.imageUrl] : []);
      setStatus(news.status);
      setCategory(news.category);
      setTags(news.tags.join(", "));
      setIsHighlighted(news.isHighlighted);
      setPublishedAt(news.publishedAt ? new Date(news.publishedAt).toISOString().slice(0, 16) : "");
    } else {
      setTitle("");
      setContent("");
      setSummary("");
      setImageUrl("");
      setImages([]);
      setStatus("rascunho");
      setCategory("geral");
      setTags("");
      setIsHighlighted(false);
      setPublishedAt("");
    }
  }, [news, isOpen]);

  // Sincronizar images com imageUrl quando images mudar
  useEffect(() => {
    if (images.length > 0) {
      setImageUrl(images[0]);
    } else {
      setImageUrl("");
    }
  }, [images]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Preencha título e conteúdo");
      return;
    }

    try {
      const payload: any = {
        cityId,
        title: title.trim(),
        content: content.trim(),
        summary: summary.trim() || undefined,
        imageUrl: imageUrl || undefined,
        status,
        category,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        isHighlighted,
      };

      // Só incluir publishedAt na edição, não na criação
      if (news) {
        payload.publishedAt = publishedAt ? new Date(publishedAt).toISOString() : undefined;
        await updateNews.mutateAsync({ _id: news._id, ...payload });
      } else {
        // Na criação, não enviar publishedAt - será definido automaticamente no backend
        await createNews.mutateAsync(payload);
      }

      onClose();
    } catch (error) {
      console.error("Erro ao salvar notícia:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-lg border border-slate-800 bg-slate-900 shadow-xl overflow-hidden flex flex-col">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4 z-10">
          <h2 className="text-xl font-semibold text-slate-200">
            {news ? "Editar Notícia" : "Criar Notícia"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 outline-none"
              placeholder="Título da notícia"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Resumo
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 outline-none resize-none"
              placeholder="Resumo curto da notícia (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Conteúdo <span className="text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 outline-none resize-none"
              placeholder="Conteúdo completo da notícia"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NewsStatus)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 outline-none"
              >
                <option value="rascunho">Rascunho</option>
                <option value="publicado">Publicado</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NewsCategory)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 outline-none"
              >
                <option value="geral">Geral</option>
                <option value="saude">Saúde</option>
                <option value="educacao">Educação</option>
                <option value="infraestrutura">Infraestrutura</option>
                <option value="eventos">Eventos</option>
                <option value="servicos">Serviços</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 outline-none"
              placeholder="ex: educação, escola, reforma"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Imagem de Capa
            </label>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={1}
            />
            <div className="mt-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Ou cole a URL da imagem diretamente:
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  const url = e.target.value;
                  setImageUrl(url);
                  setImages(url ? [url] : []);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 outline-none"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {news && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data de Publicação
                </label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 outline-none"
                />
              </div>
            )}

            <div className={`flex items-end ${news ? '' : 'col-span-2'}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHighlighted}
                  onChange={(e) => setIsHighlighted(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-400"
                />
                <span className="text-sm text-slate-300">Destacar na lista</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createNews.isPending || updateNews.isPending}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {(createNews.isPending || updateNews.isPending) && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {news ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

