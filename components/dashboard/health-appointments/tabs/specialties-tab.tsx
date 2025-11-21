import { useState } from "react";
import { Loader2, Plus, Edit, Trash2, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useSpecialties,
  useCreateSpecialty,
  useUpdateSpecialty,
  useDeleteSpecialty,
  type Specialty,
} from "@/hooks/use-health-appointments";
import { SpecialtyForm } from "../forms/specialty-form";

interface SpecialtiesTabProps {
  cityId: string;
  serviceId: string;
}

export function SpecialtiesTab({
  cityId,
  serviceId,
}: SpecialtiesTabProps) {
  const { data, isLoading } = useSpecialties(cityId, serviceId);
  const createMutation = useCreateSpecialty();
  const updateMutation = useUpdateSpecialty();
  const deleteMutation = useDeleteSpecialty();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    label: "",
    availableDays: [] as string[],
    morningLimit: 0,
    afternoonLimit: 0,
  });

  const handleCreate = () => {
    if (!formData.id || !formData.label || formData.availableDays.length === 0) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    createMutation.mutate(
      {
        cityId,
        serviceId,
        payload: {
          id: formData.id,
          label: formData.label,
          availableDays: formData.availableDays,
          morningLimit: formData.morningLimit,
          afternoonLimit: formData.afternoonLimit,
        },
      },
      {
        onSuccess: () => {
          setIsCreating(false);
          setFormData({
            id: "",
            label: "",
            availableDays: [],
            morningLimit: 0,
            afternoonLimit: 0,
          });
        },
      }
    );
  };

  const handleUpdate = (specialty: Specialty) => {
    updateMutation.mutate(
      {
        cityId,
        serviceId,
        specialtyId: specialty.id,
        payload: {
          label: formData.label || undefined,
          availableDays: formData.availableDays.length > 0 ? formData.availableDays : undefined,
          morningLimit: formData.morningLimit || undefined,
          afternoonLimit: formData.afternoonLimit || undefined,
        },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setFormData({
            id: "",
            label: "",
            availableDays: [],
            morningLimit: 0,
            afternoonLimit: 0,
          });
        },
      }
    );
  };

  const handleDelete = (specialtyId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta especialidade?")) {
      return;
    }

    deleteMutation.mutate({ cityId, serviceId, specialtyId });
  };

  const toggleDay = (day: string) => {
    if (formData.availableDays.includes(day)) {
      setFormData({
        ...formData,
        availableDays: formData.availableDays.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        availableDays: [...formData.availableDays, day],
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const specialties = data?.specialties || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">
          Especialidades ({specialties.length})
        </h3>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setFormData({
              id: "",
              label: "",
              availableDays: [],
              morningLimit: 0,
              afternoonLimit: 0,
            });
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
        >
          <Plus className="size-4" />
          Criar Especialidade
        </button>
      </div>

      {isCreating && (
        <SpecialtyForm
          formData={formData}
          setFormData={setFormData}
          onSave={handleCreate}
          onCancel={() => {
            setIsCreating(false);
            setFormData({
              id: "",
              label: "",
              availableDays: [],
              morningLimit: 0,
              afternoonLimit: 0,
            });
          }}
          isLoading={createMutation.isPending}
          toggleDay={toggleDay}
        />
      )}

      {specialties.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-center">
          <p className="text-slate-400">
            Nenhuma especialidade cadastrada. Clique em "Criar Especialidade" para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {specialties.map((specialty) => (
            <div
              key={specialty.id}
              className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
            >
              {editingId === specialty.id ? (
                <SpecialtyForm
                  formData={formData}
                  setFormData={setFormData}
                  onSave={() => handleUpdate(specialty)}
                  onCancel={() => {
                    setEditingId(null);
                    setFormData({
                      id: "",
                      label: "",
                      availableDays: [],
                      morningLimit: 0,
                      afternoonLimit: 0,
                    });
                  }}
                  isLoading={updateMutation.isPending}
                  toggleDay={toggleDay}
                  isEdit={true}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-200">
                      {specialty.label}
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {specialty.operatingHours.availableDays.map((day) => (
                        <span
                          key={day}
                          className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-400"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-slate-500">
                      <span>
                        <Clock className="inline-block size-3 mr-1" />
                        Manhã: {specialty.operatingHours.shifts.morning.dailyLimit} vagas
                      </span>
                      <span>
                        <Clock className="inline-block size-3 mr-1" />
                        Tarde: {specialty.operatingHours.shifts.afternoon.dailyLimit} vagas
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(specialty.id);
                        setIsCreating(false);
                        setFormData({
                          id: specialty.id,
                          label: specialty.label,
                          availableDays: specialty.operatingHours.availableDays,
                          morningLimit: specialty.operatingHours.shifts.morning.dailyLimit,
                          afternoonLimit: specialty.operatingHours.shifts.afternoon.dailyLimit,
                        });
                      }}
                      className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
                    >
                      <Edit className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(specialty.id)}
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

