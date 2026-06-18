import type { SessionOptions } from "iron-session"
import { cookies } from "next/headers"
import { getIronSession } from "iron-session"

export type SessionUser = {
  email: string
  role: "admin" | "panitia"
  panitiaId?: string
}

export type SessionData = {
  user?: SessionUser
}

const sessionPassword = process.env.SESSION_PASSWORD

const devPassword = "dev-secret-key-min-32-chars-long-for-session!!!"
const finalPassword = sessionPassword || devPassword

if (!sessionPassword || sessionPassword.length < 32) {
  console.warn(
    "[session] SESSION_PASSWORD not set or too short. Using fallback. " +
    "Set a strong SESSION_PASSWORD (min 32 chars) in production.",
  )
}

export const sessionOptions: SessionOptions = {
  password: finalPassword,
  cookieName: process.env.SESSION_COOKIE_NAME || "musyran_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
