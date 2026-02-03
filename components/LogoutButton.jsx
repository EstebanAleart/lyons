export default function LogoutButton() {
  const { data: session, status } = useSession();
  if (status === "loading" || !session) return null;
  return (
    <button
      onClick={() => signOut()}
      className="inline-block rounded bg-gray-700 px-6 py-3 text-white font-bold shadow hover:bg-gray-900 transition"
    >
      Cerrar sesión
    </button>
  );
}
