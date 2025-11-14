"use client";

import { useState } from "react";
import { X, Check, UserPlus } from "lucide-react";
import { Secretaria } from "@/hooks/use-secretarias";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
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
  
  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(numbers)) {
    return false;
  }

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder: number;

  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(9, 10))) {
    return false;
  }

  // Valida segundo dígito verificador
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

type CreateAdminFormProps = {
  secretaria: Secretaria;
  cityId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

type CreateAdminPayload = {
  name: string;
  email?: string;
  cpf?: string;
  phone: string;
  birthDate: string;
  address: {
    bairro: string;
    rua?: string;
    numero?: string;
    complemento?: string;
  };
  password: string;
  adminCities: string[];
  secretaria: string;
};

async function createAdmin(payload: CreateAdminPayload) {
  const response = await apiClient.post("/api/admin/users", payload);
  return response.data;
}

export function CreateAdminForm({
  secretaria,
  cityId,
  onSuccess,
  onCancel,
}: CreateAdminFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      // Invalidar queries para atualizar a lista de secretarias com o novo contador
      queryClient.invalidateQueries({ queryKey: ["secretarias", cityId] });
      toast.success("Administrador criado com sucesso!");
      setName("");
      setEmail("");
      setCpf("");
      setPhone("");
      setBirthDate("");
      setBairro("");
      setRua("");
      setNumero("");
      setPassword("");
      setConfirmPassword("");
      onSuccess();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao criar administrador.";
      toast.error(message);
    },
  });

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskCPF(e.target.value);
    setCpf(maskedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !birthDate || !bairro.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!email.trim() && !cpf.trim()) {
      toast.error("Informe e-mail ou CPF.");
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

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        email: email.trim() || undefined,
        cpf: cpf.replace(/\D/g, "") || undefined,
        phone: phone.replace(/\D/g, ""),
        birthDate,
        address: {
          bairro: bairro.trim(),
          rua: rua.trim() || undefined,
          numero: numero.trim() || undefined,
        },
        password,
        adminCities: [cityId],
        secretaria: secretaria.id,
      });
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Criar Administrador
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Secretaria: {secretaria.label}
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
              Telefone *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Data de Nascimento *
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Bairro *
          </label>
          <input
            type="text"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            required
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Senha *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Confirmar Senha *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            <UserPlus className="size-4" />
            {createMutation.isPending ? "Criando..." : "Criar Administrador"}
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

