import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Hero } from "@/components/site/hero";
import { Features } from "@/components/site/features";
import { Testimonials } from "@/components/site/testimonials";
import { CTA } from "@/components/site/cta";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("resolveai_admin_token")?.value;

  // Se está autenticado, redirecionar para o dashboard (visão geral)
  // Caso contrário, mostrar o site público
  if (token) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pt-20">
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
}

