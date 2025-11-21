"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash2, Calendar, MapPin, Image as ImageIcon, Users } from "lucide-react";
import { useCreateEvent, useUpdateEvent, type Event } from "@/hooks/use-events";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { LocationPickerMap } from "@/components/dashboard/location-picker-map";
import { toast } from "react-hot-toast";
import moment from "moment-timezone";

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  cityId: string;
}

export function EventFormModal({
  isOpen,
  onClose,
  event,
  cityId,
}: EventFormModalProps) {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [address, setAddress] = useState<Event["address"]>({});
  const [sponsors, setSponsors] = useState<Event["sponsors"]>([]);
  const [schedule, setSchedule] = useState<Event["schedule"]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preencher formulário quando editar
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setStartDate(moment(event.startDate).format("YYYY-MM-DDTHH:mm"));
      setEndDate(moment(event.endDate).format("YYYY-MM-DDTHH:mm"));
      setImages(event.images || []);
      setAddress(event.address || {});
      setSponsors(event.sponsors || []);
      setSchedule(event.schedule || []);
    } else {
      // Reset form
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setImages([]);
      setAddress({});
      setSponsors([]);
      setSchedule([]);
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !startDate || !endDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (moment(endDate).isBefore(moment(startDate))) {
      toast.error("A data de término deve ser posterior à data de início");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        cityId,
        title: title.trim(),
        description: description.trim(),
        startDate: moment.tz(startDate, "America/Sao_Paulo").toISOString(),
        endDate: moment.tz(endDate, "America/Sao_Paulo").toISOString(),
        images,
        address,
        sponsors,
        schedule: schedule.map((item) => ({
          ...item,
          date: moment.tz(item.date, "America/Sao_Paulo").toISOString(),
        })),
      };

      if (event) {
        await updateEvent.mutateAsync({ id: event._id, payload });
      } else {
        await createEvent.mutateAsync(payload);
      }

      onClose();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSponsor = () => {
    setSponsors([...sponsors, { name: "", logo: "" }]);
  };

  const handleRemoveSponsor = (index: number) => {
    setSponsors(sponsors.filter((_, i) => i !== index));
  };

  const handleUpdateSponsor = (index: number, field: "name" | "logo", value: string) => {
    const updated = [...sponsors];
    updated[index] = { ...updated[index], [field]: value };
    setSponsors(updated);
  };

  const handleAddScheduleItem = () => {
    setSchedule([...schedule, { date: startDate, title: "", subtitle: "" }]);
  };

  const handleRemoveScheduleItem = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleUpdateScheduleItem = (
    index: number,
    field: "date" | "title" | "subtitle",
    value: string
  ) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="rounded-lg border border-slate-700 bg-slate-800 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Header fixo */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 flex-shrink-0">
          <h3 className="text-xl font-semibold text-slate-200">
            {event ? "Editar Evento" : "Criar Evento"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <form id="event-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
          {/* Título e Descrição */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Festival de Inverno 2025"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Descrição *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o evento..."
                rows={4}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500 resize-none"
                required
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="inline-block size-4 mr-1" />
                Data de Início *
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="inline-block size-4 mr-1" />
                Data de Término *
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200"
                required
              />
            </div>
          </div>

          {/* Imagens */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <ImageIcon className="inline-block size-4 mr-1" />
              Imagens do Evento
            </label>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={10}
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <MapPin className="inline-block size-4 mr-1" />
              Localização do Evento
            </label>
            <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4">
              <LocationPickerMap
                onLocationSelect={(location) => {
                  setAddress({
                    street: location.rua,
                    number: "",
                    neighborhood: location.bairro,
                    city: "",
                    state: "",
                    zipCode: "",
                    coordinates: {
                      latitude: location.lat,
                      longitude: location.lng,
                    },
                  });
                }}
                initialLocation={
                  address?.coordinates
                    ? {
                        lat: address.coordinates.latitude,
                        lng: address.coordinates.longitude,
                        address: `${address.street || ""} ${address.number || ""}`.trim(),
                      }
                    : undefined
                }
              />
              {address?.coordinates && (
                <div className="mt-4 p-3 rounded-lg bg-slate-800 text-sm text-slate-300">
                  <p>
                    <strong>Coordenadas:</strong> {address.coordinates.latitude.toFixed(6)},{" "}
                    {address.coordinates.longitude.toFixed(6)}
                  </p>
                  {address.street && (
                    <p>
                      <strong>Rua:</strong> {address.street}
                    </p>
                  )}
                  {address.neighborhood && (
                    <p>
                      <strong>Bairro:</strong> {address.neighborhood}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Patrocinadores */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                <Users className="inline-block size-4 mr-1" />
                Patrocinadores
              </label>
              <button
                type="button"
                onClick={handleAddSponsor}
                className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="size-4" />
                Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {sponsors.map((sponsor, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start p-3 rounded-lg border border-slate-600 bg-slate-700/50"
                >
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={sponsor.name}
                      onChange={(e) =>
                        handleUpdateSponsor(index, "name", e.target.value)
                      }
                      placeholder="Nome do patrocinador"
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500"
                    />
                    <input
                      type="url"
                      value={sponsor.logo || ""}
                      onChange={(e) =>
                        handleUpdateSponsor(index, "logo", e.target.value)
                      }
                      placeholder="URL do logo (opcional)"
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSponsor(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              {sponsors.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhum patrocinador adicionado
                </p>
              )}
            </div>
          </div>

          {/* Programação */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                <Calendar className="inline-block size-4 mr-1" />
                Programação
              </label>
              <button
                type="button"
                onClick={handleAddScheduleItem}
                className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="size-4" />
                Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {schedule.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-slate-600 bg-slate-700/50 space-y-2"
                >
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={moment(item.date).format("YYYY-MM-DDTHH:mm")}
                      onChange={(e) =>
                        handleUpdateScheduleItem(index, "date", e.target.value)
                      }
                      className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveScheduleItem(index)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      handleUpdateScheduleItem(index, "title", e.target.value)
                    }
                    placeholder="Título da programação"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500"
                  />
                  <input
                    type="text"
                    value={item.subtitle || ""}
                    onChange={(e) =>
                      handleUpdateScheduleItem(index, "subtitle", e.target.value)
                    }
                    placeholder="Subtítulo (opcional)"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500"
                  />
                </div>
              ))}
              {schedule.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhuma programação adicionada
                </p>
              )}
            </div>
          </div>

          </div>
        </form>

        {/* Footer fixo com botões */}
        <div className="flex gap-3 justify-end p-6 border-t border-slate-700 flex-shrink-0 bg-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="event-form"
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="inline-block size-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Evento"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

