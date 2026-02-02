"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, TrendingUp, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f2d4c] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo-icon.png"
            alt="Logo"
            width={48}
            height={48}
            className="h-12 w-auto"
          />
          <span className="text-white font-bold text-xl hidden sm:block">LeadFlow</span>
        </div>
        <Link href="/dashboard">
          <Button className="bg-[#f7a90c] text-[#0f2d4c] hover:bg-[#f7a90c]/90 font-semibold">
            Iniciar Sesión
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <Image
            src="/images/logo-icon.png"
            alt="Logo LeadFlow"
            width={120}
            height={120}
            className="mx-auto h-28 w-auto"
          />
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-balance">
            Gestión Inteligente de{" "}
            <span className="text-[#f7a90c]">Leads Educativos</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto text-pretty">
            Transforma tus prospectos en estudiantes. Sistema completo de seguimiento, 
            análisis y reactivación de leads para instituciones educativas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="bg-[#f7a90c] text-[#0f2d4c] hover:bg-[#f7a90c]/90 font-semibold px-8"
              >
                Acceder al Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-16 max-w-4xl mx-auto">
          <FeatureCard 
            icon={<BarChart3 className="h-6 w-6" />} 
            title="Métricas en Tiempo Real" 
          />
          <FeatureCard 
            icon={<Users className="h-6 w-6" />} 
            title="Gestión de Contactos" 
          />
          <FeatureCard 
            icon={<TrendingUp className="h-6 w-6" />} 
            title="Análisis de Conversión" 
          />
          <FeatureCard 
            icon={<Shield className="h-6 w-6" />} 
            title="Seguimiento Seguro" 
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-white/50 text-sm">
        © 2026 LeadFlow. Todos los derechos reservados.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title }) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
      <div className="text-[#f7a90c]">{icon}</div>
      <span className="text-white/80 text-sm font-medium text-center">{title}</span>
    </div>
  );
}
