import { signIn, signOut, auth } from "@/auth"

export async function SignIn() {
  const session = await auth()
  
  if (session?.user) {
    return (
      <form
        action={async () => {
          "use server"
          await signOut()
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    )
  }
  
  return (
    <form
      action={async () => {
        "use server"
        await signIn("auth0")
      }}
    >
      <button type="submit">Sign In with Auth0</button>
    </form>
  )
}
