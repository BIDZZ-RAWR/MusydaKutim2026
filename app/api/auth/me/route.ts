import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session.user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }
    return NextResponse.json({ user: session.user })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Gagal memeriksa session" }, { status: 500 })
  }
}
