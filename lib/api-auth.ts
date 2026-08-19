import { NextResponse } from "next/server"
import { getSession, type SessionUser } from "@/lib/session"

export async function requireRole(roles: ("admin" | "panitia")[]): Promise<{
  user: SessionUser
  error: NextResponse | null
}> {
  const session = await getSession()
  const user = session.user

  if (!user) {
    return { user: null as unknown as SessionUser, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  if (!roles.includes(user.role)) {
    return { user: null as unknown as SessionUser, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { user, error: null }
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
