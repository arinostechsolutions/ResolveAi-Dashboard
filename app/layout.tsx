import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-client-provider";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResolveAI - Gestão Inteligente de Sugestões de Melhorias Urbanas",
  description: "Plataforma completa para gestão de sugestões de melhorias urbanas. Conecte cidadãos e prefeituras em uma solução moderna e eficiente.",
  verification: {
    google: "SSNXjM5FYkB0zng3IPWAEfI7MzEjshwPBiB5Li2St20",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.variable} bg-slate-950 text-slate-100 antialiased h-full`}>
        <AuthProvider>
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#0f172a",
                  color: "#f8fafc",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                },
                success: {
                  iconTheme: {
                    primary: "#34d399",
                    secondary: "#0f172a",
                  },
                },
              }}
            />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
