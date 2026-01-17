"use client"

import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"
import { ac, roles } from "./permissions"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    organizationClient({
      ac,
      roles,
    }),
  ],
})

// Export hooks and methods for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  organization,
} = authClient
