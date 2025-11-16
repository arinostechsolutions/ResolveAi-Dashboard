"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { clsx } from "clsx";

const testimonials = [
  {
    name: "Carlos A.",
    content:
      "A plataforma é extremamente intuitiva e fácil de usar. Os dashboards me dão uma visão clara de tudo que preciso acompanhar, e os relatórios são muito úteis para entender o que está acontecendo.",
    rating: 5,
  },
  {
    name: "José P.",
    content:
      "A visualização em mapas é incrível! Consigo ver tudo de forma visual e os filtros me ajudam a encontrar exatamente o que preciso rapidamente. A interface é muito bem pensada.",
    rating: 5,
  },
  {
    name: "Maria S.",
    content:
      "O que mais gosto é a facilidade de navegação. Tudo está bem organizado e acessível. Os gráficos e análises me ajudam muito a tomar decisões baseadas em dados reais.",
    rating: 5,
  },
  {
    name: "Roberto M.",
    content:
      "A plataforma é muito completa e profissional. Os recursos de análise são poderosos e me permitem identificar padrões importantes. A experiência de uso é fluida e agradável.",
    rating: 5,
  },
  {
    name: "Ana L.",
    content:
      "Adoro como tudo funciona de forma integrada. Posso acessar diferentes funcionalidades sem perder o contexto. A plataforma é estável e confiável, nunca tive problemas técnicos.",
    rating: 5,
  },
  {
    name: "Paulo R.",
    content:
      "A interface é moderna e responsiva. Funciona perfeitamente tanto no computador quanto no celular. Os dados são apresentados de forma clara e fácil de entender.",
    rating: 5,
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <section className="bg-slate-900 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl md:text-4xl">
            O que nossos clientes dizem
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Prefeituras de todo o Brasil confiam no ResolveAI para melhorar sua gestão urbana.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Carrossel Container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="min-w-full px-4 sm:px-6"
                >
                  <div className="mx-auto max-w-3xl">
                    <div className="rounded-2xl border border-slate-800/50 bg-slate-950/50 p-6 sm:p-8 md:p-12 backdrop-blur-sm">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                          <Quote className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-4 flex gap-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <svg
                                key={i}
                                className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-sm leading-7 sm:text-base sm:leading-8 md:text-lg text-slate-300">
                            "{testimonial.content}"
                          </p>
                          <div className="mt-6">
                            <p className="text-sm sm:text-base font-semibold text-slate-200">
                              {testimonial.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-slate-800/80 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-slate-800/80 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            aria-label="Próximo depoimento"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={clsx(
                  "h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "w-8 bg-emerald-500"
                    : "w-2 bg-slate-700 hover:bg-slate-600"
                )}
                aria-label={`Ir para depoimento ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

