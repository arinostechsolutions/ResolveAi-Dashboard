"use client";

import { useState } from "react";
import { Phone, MapPin, Send } from "lucide-react";

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar mensagem");
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setError(error instanceof Error ? error.message : "Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl md:text-6xl">
            Entre em{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Contato
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
            Tem dúvidas ou quer saber mais sobre o ResolveAI? Estamos aqui para ajudar.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-slate-900 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-slate-100 sm:text-3xl">
                Informações de contato
              </h2>
              <p className="mt-4 text-slate-400">
                Entre em contato conosco através dos canais abaixo ou preencha o formulário.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Phone className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200">WhatsApp</h3>
                    <a
                      href="https://wa.me/5522992645933"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-slate-400 transition hover:text-emerald-400"
                    >
                      (22) 99264-5933
                    </a>
                    <p className="mt-1 text-sm text-slate-500">
                      Atendimento de segunda a sexta, das 9h às 18h
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                    <MapPin className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200">Localização</h3>
                    <p className="mt-1 text-slate-400">Brasil</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-xl border border-slate-800/50 bg-slate-950/50 p-8">
              <h2 className="text-2xl font-bold text-slate-100 sm:text-3xl">
                Envie sua mensagem
              </h2>
              <p className="mt-2 text-slate-400">
                Preencha o formulário abaixo e entraremos em contato em breve.
              </p>

              {submitted ? (
                <div className="mt-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-200">
                  Mensagem enviada com sucesso! Entraremos em contato em breve.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {error && (
                    <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                      {error}
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-slate-200"
                    >
                      Nome
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-200"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-slate-200"
                    >
                      Mensagem
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                      placeholder="Sua mensagem..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Enviar mensagem
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

