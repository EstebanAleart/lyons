import Auth0Landing from "./auth0-landing";
import { getSession } from "@/lib/nextauth";

export default async function Auth0TestPage() {
  const session = await getSession();
  const user = session?.user;
  return <Auth0Landing user={user} />;
}
