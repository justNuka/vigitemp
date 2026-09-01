import { cookies } from "next/headers"

import { verifyToken } from "@/lib/jwt"

export async function getServerAuthenticatedUserId(): Promise<number | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value ?? cookieStore.get("auth-token")?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload?.userId) return null

  return payload.userId
}