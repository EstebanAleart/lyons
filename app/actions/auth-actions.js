"use server"

import { signIn, signOut } from "@/auth"

export async function handleSignIn() {
  await signIn("auth0", { redirectTo: "/dashboard" })
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" })
}