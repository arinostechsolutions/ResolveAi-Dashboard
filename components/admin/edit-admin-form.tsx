"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { AdminUser, useUpdateAdminUser } from "@/hooks/use-admin-users";
import { useSecretarias } from "@/hooks/use-secretarias";
import { toast } from "react-hot-toast";

// Função para aplicar máscara de CPF
function maskCPF(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  } else {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }
}

// Função para validar CPF
function validateCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, "");
  
  if (numbers.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(numbers)) {
    return false;
  }

  let sum = 0;
  let remainder: number;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(9, 10))) {
    return false;
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(10, 11))) {
    return false;
  }

  return true;
}

type EditAdminFormProps = {
  admin: AdminUser;
  cityId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export function EditAdminForm({
  admin,
  cityId,
  onSuccess,
  onCancel,
}: EditAdminFormProps) {
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email || "");
  const [cpf, setCpf] = useState(admin.cpf ? maskCPF(admin.cpf) : "");
  const [phone, setPhone] = useState(admin.phone || "");
  const [birthDate, setBirthDate] = useState(
    admin.birthDate ? new Date(admin.birthDate).toISOString().split("T")[0] : ""
  );
  const [bairro, setBairro] = useState(admin.address?.bairro || "");
  const [rua, setRua] = useState(admin.address?.rua || "");
  const [numero, setNumero] = useState(admin.address?.numero || "");
  const [selectedSecretaria, setSelectedSecretaria] = useState<string>(
    admin.secretaria || ""
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateMutation = useUpdateAdminUser();
  const { data: secretariasData } = useSecretarias(cityId);

  useEffect(() => {
    setName(admin.name);
    setEmail(admin.email || "");
    setCpf(admin.cpf ? maskCPF(admin.cpf) : "");
    setPhone(admin.phone || "");
    setBirthDate(
      admin.birthDate ? new Date(admin.birthDate).toISOString().split("T")[0] : ""
    );
    setBairro(admin.address?.bairro || "");
    setRua(admin.address?.rua || "");
    setNumero(admin.address?.numero || "");
    setSelectedSecretaria(admin.secretaria || "");
    setPassword("");
    setConfirmPassword("");
  }, [admin]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskCPF(e.target.value);
    setCpf(maskedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }

    // Validar CPF se foi informado
    if (cpf.trim()) {
      const cpfNumbers = cpf.replace(/\D/g, "");
      if (cpfNumbers.length !== 11) {
        toast.error("CPF deve conter 11 dígitos.");
        return;
      }
      if (!validateCPF(cpfNumbers)) {
        toast.error("CPF inválido. Verifique os dígitos informados.");
        return;
      }
    }

    // Validar senha se fornecida
    if (password) {
      if (password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("As senhas não coincidem.");
        return;
      }
    }

    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim() || null,
        cpf: cpf.replace(/\D/g, "") || null,
        phone: phone.replace(/\D/g, "") || null,
        birthDate: birthDate || undefined,
        address: {
          bairro: bairro.trim(),
          rua: rua.trim() || null,
          numero: numero.trim() || null,
        },
      };

      // Apenas atualizar secretaria se não for super admin nem prefeito
      if (!admin.isSuperAdmin && !admin.isMayor) {
        payload.secretaria = selectedSecretaria || null;
      }

      // Incluir senha apenas se foi fornecida
      if (password) {
        payload.password = password;
      }

      await updateMutation.mutateAsync({
        userId: admin.userId,
        payload,
      });
      onSuccess();
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  const availableSecretarias = secretariasData?.secretarias || [];

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Editar Administrador
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {admin.isMayor
              ? "Prefeito"
              : admin.isSuperAdmin
              ? "Super Administrador"
              : "Administrador de Secretaria"}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1 text-slate-400 hover:text-white"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Nome Completo *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              CPF
            </label>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            />
            {cpf && cpf.replace(/\D/g, "").length === 11 && !validateCPF(cpf.replace(/\D/g, "")) && (
              <p className="mt-1 text-xs text-red-400">
                CPF inválido
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Telefone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Bairro
          </label>
          <input
            type="text"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Rua
            </label>
            <input
              type="text"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Número
            </label>
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>
        </div>

        {!admin.isSuperAdmin && !admin.isMayor && availableSecretarias.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Secretaria
            </label>
            <select
              value={selectedSecretaria}
              onChange={(e) => setSelectedSecretaria(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            >
              <option value="">Nenhuma</option>
              {availableSecretarias.map((secretaria) => (
                <option key={secretaria.id} value={secretaria.id}>
                  {secretaria.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
          <p className="mb-3 text-sm font-medium text-slate-300">
            Alterar Senha (opcional)
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Nova Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                minLength={6}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                minLength={6}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Deixe em branco para manter a senha atual
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            <Check className="size-4" />
            {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}

