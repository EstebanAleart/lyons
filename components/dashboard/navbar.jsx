"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, UserCheck, LogOut, Activity } from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Contactos",
    href: "/leads",
    icon: Users,
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: UserCheck,
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/images/logo-icon.png"
            alt="Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span className="font-bold text-lg text-foreground hidden sm:block">
            LeadFlow
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "gap-2",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-1">
          {/* Link discreto a System Health - solo icono */}
          <Link href="/system">
            <Button 
              variant={pathname === "/system" ? "default" : "ghost"} 
              size="icon" 
              className={cn(
                pathname === "/system" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Salud del Sistema"
            >
              <Activity className="h-4 w-4" />
              <span className="sr-only">Sistema</span>
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Cerrar sesión</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
