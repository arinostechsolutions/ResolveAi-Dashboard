"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Loader2, Calendar } from "lucide-react";
import { useCreatePositivePost, useUpdatePositivePost } from "@/hooks/use-positive-posts";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import { useCities } from "@/hooks/use-cities";
import { toast } from "react-hot-toast";
import { ImageUpload } from "./image-upload";
import { LocationPickerMap } from "./location-picker-map";
import type { PositivePost, PositivePostCategory, PositivePostStatus } from "@/types/positive-posts";

const CATEGORY_OPTIONS: { value: PositivePostCategory; label: string }[] = [
  { value: "obra_finalizada", label: "Obra Finalizada" },
  { value: "melhoria_urbana", label: "Melhoria Urbana" },
  { value: "evento_cultural", label: "Evento Cultural" },
  { value: "servico_publico", label: "Serviço Público" },
  { value: "infraestrutura", label: "Infraestrutura" },
  { value: "outro", label: "Outro" },
];

const STATUS_OPTIONS: { value: PositivePostStatus; label: string }[] = [
  { value: "rascunho", label: "Rascunho" },
  { value: "publicado", label: "Publicado" },
  { value: "arquivado", label: "Arquivado" },
];

type PositivePostFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  post?: PositivePost | null;
};

export function PositivePostFormModal({
  isOpen,
  onClose,
  post,
}: PositivePostFormModalProps) {
  const { cityId } = useCity();
  const { admin } = useAuth();
  const isSuperAdmin = admin?.isSuperAdmin ?? false;
  const { data: citiesData } = useCities(isSuperAdmin);
  
  // Obter o label correto da cidade atual
  const cityLabel = useMemo(() => {
    if (citiesData && citiesData.length > 0) {
      const city = citiesData.find((c) => c.id === cityId);
      if (city) {
        return city.label || city.id;
      }
    }
    // Fallback: formatar o cityId como label
    if (!cityId) return "";
    return cityId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [cityId, citiesData]);
  
  const createPost = useCreatePositivePost();
  const updatePost = useUpdatePositivePost();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState({
    address: "",
    bairro: "",
    rua: "",
    referencia: "",
    lat: 0,
    lng: 0,
  });
  const [category, setCategory] = useState<PositivePostCategory>("obra_finalizada");
  const [status, setStatus] = useState<PositivePostStatus>("rascunho");

  // Preencher formulário quando editar
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setDescription(post.description);
      setImages(post.images?.map((img) => img.url) || []);
      setEventDate(post.eventDate ? new Date(post.eventDate).toISOString().slice(0, 16) : "");
      
      const lat = post.location?.lat || post.location?.coordinates?.coordinates?.[1] || 0;
      const lng = post.location?.lng || post.location?.coordinates?.coordinates?.[0] || 0;
      
      setLocation({
        address: post.location?.address || "",
        bairro: post.location?.bairro || "",
        rua: post.location?.rua || "",
        referencia: post.location?.referencia || "",
        lat,
        lng,
      });
      setCategory(post.category);
      setStatus(post.status);
    } else {
      // Resetar formulário para novo post
      setTitle("");
      setDescription("");
      setImages([]);
      setEventDate("");
      setLocation({
        address: "",
        bairro: "",
        rua: "",
        referencia: "",
        lat: 0,
        lng: 0,
      });
      setCategory("obra_finalizada");
      setStatus("rascunho");
    }
  }, [post, isOpen]);

  const handleLocationSelect = (selectedLocation: {
    address: string;
    lat: number;
    lng: number;
    bairro?: string;
    rua?: string;
  }) => {
    setLocation({
      ...location,
      address: selectedLocation.address,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      bairro: selectedLocation.bairro || location.bairro,
      rua: selectedLocation.rua || location.rua,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Título e descrição são obrigatórios.");
      return;
    }

    if (images.length === 0) {
      toast.error("Adicione pelo menos uma imagem.");
      return;
    }

    if (!cityId || cityId.trim() === "") {
      toast.error("Selecione uma cidade.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      images: images.map((url, index) => ({ url, order: index })),
      eventDate: eventDate ? new Date(eventDate).toISOString() : new Date().toISOString(),
      location: {
        address: location.address.trim() || "",
        bairro: location.bairro.trim() || undefined,
        rua: location.rua.trim() || undefined,
        referencia: location.referencia.trim() || undefined,
        coordinates: location.lat && location.lng
          ? {
              lat: location.lat,
              lng: location.lng,
            }
          : undefined,
      },
      city: {
        id: cityId,
        label: cityLabel,
      },
      category,
      status,
    };

    try {
      if (post) {
        await updatePost.mutateAsync({ id: post._id, payload });
        toast.success("Post atualizado com sucesso!");
      } else {
        await createPost.mutateAsync(payload);
        toast.success("Post criado com sucesso!");
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao salvar post.");
    }
  };

  if (!isOpen) return null;

  const isLoading = createPost.isPending || updatePost.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-200">
            {post ? "Editar Post Positivo" : "Novo Post Positivo"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              placeholder="Ex: Nova Praça Inaugurada"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Descrição <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              placeholder="Descreva o post positivo..."
            />
            <p className="mt-1 text-xs text-slate-500">
              {description.length}/2000 caracteres
            </p>
          </div>

          {/* Imagens */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Imagens <span className="text-red-400">*</span> (máximo {8} imagens)
            </label>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={8}
            />
          </div>

          {/* Data do Evento */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Calendar className="size-4" />
              Data do Evento
            </label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Localização */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              Localização
            </label>
            <LocationPickerMap
              onLocationSelect={handleLocationSelect}
              initialLocation={
                location.lat && location.lng
                  ? { lat: location.lat, lng: location.lng, address: location.address }
                  : undefined
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={location.bairro}
                onChange={(e) => setLocation({ ...location, bairro: e.target.value })}
                placeholder="Bairro (preenchido automaticamente)"
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="text"
                value={location.rua}
                onChange={(e) => setLocation({ ...location, rua: e.target.value })}
                placeholder="Rua (preenchida automaticamente)"
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <input
              type="text"
              value={location.referencia}
              onChange={(e) => setLocation({ ...location, referencia: e.target.value })}
              placeholder="Referência (opcional)"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Categoria e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PositivePostCategory)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PositivePostStatus)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {post ? "Atualizar" : "Criar"} Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

