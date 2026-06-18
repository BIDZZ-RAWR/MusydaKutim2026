import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase-admin"
import { getSession, sessionOptions } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 })
    }

    const q = query(collection(db, "Data_Admin"), where("Email", "==", email))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 })
    }

    const userDoc = snapshot.docs[0]
    const data = userDoc.data()
    const docId = userDoc.id

    const storedPassword = data.Password || ""
    const isPasswordValid = storedPassword.startsWith("$2")
      ? await bcrypt.compare(password, storedPassword)
      : password === storedPassword

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 })
    }

    const isAdmin = docId.toLowerCase() === "admin" || data?.Role?.toLowerCase() === "admin"
    const role = isAdmin ? ("admin" as const) : ("panitia" as const)
    const panitiaId = isAdmin
      ? undefined
      : (email.match(/\d+/)?.[0]?.padStart(2, "0") || "01")

    const session = await getSession()
    session.user = { email, role, panitiaId }
    await session.save()

    return NextResponse.json({ user: { email, role, panitiaId } })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
