"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";

const loginSchema = z.object({
  emailOrCpf: z.string().min(3, "Informe e-mail ou CPF"),
  password: z.string().min(6, "Senha inválida"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, admin, loading } = useAuth();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && admin) {
      router.replace("/");
    }
  }, [admin, loading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrCpf: "",
      password: "",
      remember: true,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    try {
      const payload = values.emailOrCpf.includes("@")
        ? { email: values.emailOrCpf, password: values.password }
        : {
            cpf: values.emailOrCpf.replace(/\D/g, ""),
            password: values.password,
          };

      const response = await apiClient.post("/api/admin/auth/login", payload);

      const { token, admin } = response.data;
      if (!token) {
        throw new Error("Resposta do servidor sem token.");
      }

      login(token, {
        userId: admin.userId,
        name: admin.name,
        email: admin.email,
        cpf: admin.cpf,
        allowedCities: admin.allowedCities ?? [],
        isSuperAdmin: admin.isSuperAdmin ?? false,
        lastLoginAt: admin.lastLoginAt,
      }, values.remember);

      router.push("/");
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      setErrorMessage("Credenciais inválidas ou usuário sem permissão.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-900/40 backdrop-blur">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">
              ResolveAI Dashboard
            </h1>
            <p className="text-sm text-slate-400">
              Área restrita para prefeituras. Informe suas credenciais.
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              E-mail ou CPF
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              placeholder="ex: prefeito@cidade.gov.br"
              autoComplete="username"
              {...register("emailOrCpf")}
            />
            {errors.emailOrCpf ? (
              <p className="text-xs text-rose-400">{errors.emailOrCpf.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Senha</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-xs text-rose-400">{errors.password.message}</p>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              className="size-4 rounded border border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400"
              {...register("remember")}
            />
            Manter conectado
          </label>

          {errorMessage ? (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Acessar
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Suporte ResolveAI · <Link href="mailto:contato@resolveai.com" className="text-emerald-300 hover:text-emerald-200">contato@resolveai.com</Link>
        </div>
      </div>
    </div>
  );
}


