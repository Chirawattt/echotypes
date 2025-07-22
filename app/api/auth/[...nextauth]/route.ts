// This file handles NextAuth.js authentication for the API routes
// NextAuth v4 with Next.js 15 requires this specific import pattern

// eslint-disable-next-line @typescript-eslint/no-require-imports
const NextAuth = require("next-auth").default
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }