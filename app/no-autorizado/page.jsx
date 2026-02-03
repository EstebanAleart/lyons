import Image from "next/image";
import { Button } from "@/components/ui/button";
import { handleSignOut } from "../actions/auth-actions";
import { auth } from "@/auth";

export default async function NoAutorizado() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#0f2d4c] flex flex-col items-center justify-center px-6">
      <div className="max-w-md mx-auto text-center space-y-6">
        <Image
          src="/images/logo-icon.png"
          alt="Logo"
          width={80}
          height={80}
          className="mx-auto"
        />
        
        <h1 className="text-3xl font-bold text-white">
          Acceso No Autorizado
        </h1>
        
        <p className="text-white/70 text-lg">
          Tu cuenta está pendiente de activación.
        </p>
        
        <p className="text-white/60">
          Contacta al administrador para obtener acceso al dashboard.
        </p>
        
        {session?.user && (
          <div className="pt-4 space-y-2">
            <p className="text-white/50 text-sm">
              Usuario: {session.user.email}
            </p>
            <p className="text-white/50 text-sm">
              Estado: Inactivo
            </p>
          </div>
        )}
        
        <form action={handleSignOut} className="pt-4">
          <Button className="bg-[#f7a90c] text-[#0f2d4c] hover:bg-[#f7a90c]/90 font-semibold">
            Cerrar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
