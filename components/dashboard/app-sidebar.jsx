"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, UserCheck, BookOpen, Activity, LogOut } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contactos", href: "/leads", icon: Users },
  { label: "Clientes", href: "/clientes", icon: UserCheck },
  { label: "Guía", href: "/guia", icon: BookOpen },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between px-2 py-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/images/logo-icon.png"
              alt="Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="font-bold text-base group-data-[collapsible=icon]:hidden">
              LeadFlow
            </span>
          </Link>
          <SidebarTrigger className="md:hidden" />
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/system"} tooltip="Salud del Sistema">
              <Link href="/system">
                <Activity />
                <span>Sistema</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Cerrar sesión">
              <Link href="/">
                <LogOut />
                <span>Cerrar sesión</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
