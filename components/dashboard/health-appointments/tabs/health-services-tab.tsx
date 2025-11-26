import { useState } from "react";
import { Loader2, Plus, Edit, Trash2, Save, X, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useHealthServices,
  useCreateHealthService,
  useUpdateHealthService,
  useDeleteHealthService,
  type HealthService,
} from "@/hooks/use-health-appointments";
import { EditServiceForm } from "../forms/edit-service-form";

interface HealthServicesTabProps {
  cityId: string;
  onSelectService: (id: string | null) => void;
  selectedServiceId: string | null;
}

export function HealthServicesTab({
  cityId,
  onSelectService,
  selectedServiceId,
}: HealthServicesTabProps) {
  const { data, isLoading } = useHealthServices(cityId);
  const createMutation = useCreateHealthService();
  const updateMutation = useUpdateHealthService();
  const deleteMutation = useDeleteHealthService();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    address: "",
  });

  const handleCreate = () => {
    if (!formData.id || !formData.name || !formData.address) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    createMutation.mutate(
      { cityId, payload: formData },
      {
        onSuccess: () => {
          setIsCreating(false);
          setFormData({ id: "", name: "", address: "" });
        },
      }
    );
  };

  const handleUpdate = (service: HealthService) => {
    if (!formData.name && !formData.address) {
      toast.error("Preencha pelo menos um campo para atualizar.");
      return;
    }

    updateMutation.mutate(
      {
        cityId,
        serviceId: service.id,
        payload: {
          name: formData.name || undefined,
          address: formData.address || undefined,
        },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setFormData({ id: "", name: "", address: "" });
        },
      }
    );
  };

  const handleDelete = (serviceId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta unidade de saúde?")) {
      return;
    }

    deleteMutation.mutate({ cityId, serviceId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const services = data?.healthServices || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">
          Unidades de Saúde ({services.length})
        </h3>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setFormData({ id: "", name: "", address: "" });
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
        >
          <Plus className="size-4" />
          Criar Unidade
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <h4 className="mb-4 font-medium text-slate-200">Nova Unidade de Saúde</h4>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">ID *</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => {
                  // Converter espaços em traços e manter apenas letras minúsculas, números, traços e underscores
                  const formatted = e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9_-]/g, "");
                  setFormData({ ...formData, id: formatted });
                }}
                placeholder="Ex: ubs-central"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: UBS Central"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Endereço *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Ex: Rua Principal, 123"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Salvar
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ id: "", name: "", address: "" });
                }}
                className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
              >
                <X className="size-4" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-center">
          <p className="text-slate-400">
            Nenhuma unidade de saúde cadastrada. Clique em "Criar Unidade" para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className={`rounded-lg border p-4 transition-colors ${
                selectedServiceId === service.id
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-slate-700 bg-slate-800/50"
              }`}
            >
              {editingId === service.id ? (
                <EditServiceForm
                  service={service}
                  formData={formData}
                  setFormData={setFormData}
                  onSave={() => handleUpdate(service)}
                  onCancel={() => {
                    setEditingId(null);
                    setFormData({ id: "", name: "", address: "" });
                  }}
                  isLoading={updateMutation.isPending}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-slate-200">
                        {service.name}
                      </h4>
                      <span className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-400">
                        {service.id}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {service.address}
                    </p>
                    <div className="mt-2 flex gap-4 text-xs text-slate-500">
                      <span>
                        {service.availableSpecialties?.length || 0} especialidades
                      </span>
                      <span>
                        {service.availableExams?.length || 0} exames
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectService(service.id)}
                      className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(service.id);
                        setIsCreating(false);
                        setFormData({
                          id: service.id,
                          name: service.name,
                          address: service.address,
                        });
                      }}
                      className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
                    >
                      <Edit className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




