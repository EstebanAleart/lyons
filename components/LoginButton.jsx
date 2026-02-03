export default function LoginButton() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  if (session) return null;
  return (
    <button
      onClick={() => signIn("auth0")}
      className="inline-block rounded bg-[#eb5424] px-6 py-3 text-white font-bold shadow hover:bg-[#d53e1a] transition"
    >
      Iniciar sesión con Auth0
    </button>
  );
}
