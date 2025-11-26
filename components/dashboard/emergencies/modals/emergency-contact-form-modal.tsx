"use client";

import { useState, useEffect } from "react";
import { X, Loader2, MapPin, Phone } from "lucide-react";
import { useCreateEmergencyContact, useUpdateEmergencyContact, type EmergencyContact, type CreateEmergencyContactPayload } from "@/hooks/use-emergencies";
import { useCity } from "@/context/city-context";
import { toast } from "react-hot-toast";
import { LocationPickerMap } from "@/components/dashboard/location-picker-map";

const TYPE_OPTIONS: { value: EmergencyContact["type"]; label: string }[] = [
  { value: "policia", label: "Polícia" },
  { value: "bombeiro", label: "Bombeiro" },
  { value: "defesa_civil", label: "Defesa Civil" },
  { value: "disk_denuncia", label: "Disk Denúncia" },
  { value: "violencia_mulher", label: "Violência contra Mulher" },
  { value: "samu", label: "SAMU" },
  { value: "outro", label: "Outro" },
];

type EmergencyContactFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contact?: EmergencyContact | null;
};

export function EmergencyContactFormModal({
  isOpen,
  onClose,
  contact,
}: EmergencyContactFormModalProps) {
  const { cityId } = useCity();
  const createContact = useCreateEmergencyContact();
  const updateContact = useUpdateEmergencyContact();

  const [name, setName] = useState("");
  const [type, setType] = useState<EmergencyContact["type"]>("outro");
  const [phone, setPhone] = useState("");
  const [alternativePhone, setAlternativePhone] = useState("");
  const [description, setDescription] = useState("");
  const [hasLocation, setHasLocation] = useState(false);
  const [location, setLocation] = useState<{
    address?: string;
    bairro?: string;
    rua?: string;
    lat?: number;
    lng?: number;
  } | null>(null);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Preencher formulário quando editar
  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setType(contact.type);
      setPhone(contact.phone);
      setAlternativePhone(contact.alternativePhone || "");
      setDescription(contact.description || "");
      setDisplayOrder(contact.displayOrder);
      setIsActive(contact.isActive);
      
      if (contact.location && contact.location.lat && contact.location.lng) {
        setHasLocation(true);
        setLocation({
          address: contact.location.address,
          bairro: contact.location.bairro,
          rua: contact.location.rua,
          lat: contact.location.lat,
          lng: contact.location.lng,
        });
      } else {
        setHasLocation(false);
        setLocation(null);
      }
    } else {
      // Resetar formulário
      setName("");
      setType("outro");
      setPhone("");
      setAlternativePhone("");
      setDescription("");
      setHasLocation(false);
      setLocation(null);
      setDisplayOrder(0);
      setIsActive(true);
    }
  }, [contact, isOpen]);

  const handleLocationSelect = (selectedLocation: {
    address: string;
    lat: number;
    lng: number;
    bairro?: string;
    rua?: string;
  }) => {
    setLocation({
      address: selectedLocation.address,
      bairro: selectedLocation.bairro,
      rua: selectedLocation.rua,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    });
    setHasLocation(true);
  };

  const handleRemoveLocation = () => {
    setLocation(null);
    setHasLocation(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cityId) {
      toast.error("Selecione uma cidade");
      return;
    }

    if (!name.trim()) {
      toast.error("O nome é obrigatório");
      return;
    }

    if (!phone.trim()) {
      toast.error("O telefone é obrigatório");
      return;
    }

    const payload: CreateEmergencyContactPayload = {
      name: name.trim(),
      type,
      phone: phone.trim(),
      alternativePhone: alternativePhone.trim() || undefined,
      description: description.trim() || undefined,
      cityId,
      displayOrder,
      location: hasLocation && location && location.lat !== undefined && location.lng !== undefined ? {
        address: location.address,
        bairro: location.bairro,
        rua: location.rua,
        lat: location.lat,
        lng: location.lng,
      } : undefined,
    };

    try {
      if (contact) {
        await updateContact.mutateAsync({
          id: contact._id,
          payload: {
            ...payload,
            isActive,
          },
        });
      } else {
        await createContact.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-200">
            {contact ? "Editar Telefone de Emergência" : "Criar Telefone de Emergência"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nome do Serviço *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Polícia Militar"
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-slate-200 placeholder-slate-500"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EmergencyContact["type"])}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-slate-200"
              required
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Telefones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Telefone Principal *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: (22) 99999-9999"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 pl-10 pr-4 py-2 text-slate-200 placeholder-slate-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Telefone Alternativo (opcional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  type="tel"
                  value={alternativePhone}
                  onChange={(e) => setAlternativePhone(e.target.value)}
                  placeholder="Ex: (22) 99999-9999"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 pl-10 pr-4 py-2 text-slate-200 placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Informações adicionais sobre o serviço"
              rows={3}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-slate-200 placeholder-slate-500 resize-none"
            />
          </div>

          {/* Localização (opcional) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Localização (opcional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLocation}
                    onChange={(e) => {
                      setHasLocation(e.target.checked);
                      if (!e.target.checked) {
                        handleRemoveLocation();
                      }
                    }}
                    className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-300">Adicionar localização</span>
                </label>
              </div>
            </div>
            
            {hasLocation && (
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-600 bg-slate-900/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="size-4 text-emerald-400" />
                    <span className="text-sm font-medium text-slate-300">
                      Clique no mapa para selecionar a localização
                    </span>
                  </div>
                  {isLocationLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="size-5 animate-spin text-emerald-400" />
                    </div>
                  )}
                  <div className="h-64 rounded-lg overflow-hidden border border-slate-600">
                    <LocationPickerMap
                      onLocationSelect={handleLocationSelect}
                      initialLocation={location?.lat !== undefined && location?.lng !== undefined ? {
                        lat: location.lat,
                        lng: location.lng,
                        address: location.address,
                      } : undefined}
                    />
                  </div>
                  {isLocationLoading && (
                    <div className="mt-2 flex items-center justify-center">
                      <Loader2 className="size-4 animate-spin text-emerald-400" />
                      <span className="ml-2 text-xs text-slate-400">Carregando endereço...</span>
                    </div>
                  )}
                  {location && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-800 border border-slate-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-slate-200 font-medium">{location.address}</p>
                          {location.bairro && (
                            <p className="text-xs text-slate-400 mt-1">Bairro: {location.bairro}</p>
                          )}
                          {location.lat !== undefined && location.lng !== undefined && (
                            <p className="text-xs text-slate-400 mt-1">
                              Coordenadas: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveLocation}
                          className="ml-3 text-red-400 hover:text-red-300"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ordem de exibição e Status (apenas ao editar) */}
          {contact && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ordem de Exibição
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-slate-200"
                  min="0"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-7">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-300">Ativo</span>
                </label>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createContact.isPending || updateContact.isPending}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(createContact.isPending || updateContact.isPending) ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  {contact ? "Atualizar" : "Criar"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

