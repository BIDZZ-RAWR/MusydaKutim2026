import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getAdminDb } from "@/lib/firebase-admin-sdk"
import { requireRole, apiError } from "@/lib/api-auth"
import * as firestore from "firebase-admin/firestore"

export async function POST(request: NextRequest) {
  const { user, error } = await requireRole(["admin"])
  if (error) return error

  try {
    const { action, data } = await request.json()

    switch (action) {
      case "createPanitia": {
        const { email, password } = data
        if (!email || !password) return apiError("Email dan password wajib diisi")
        const hashed = await bcrypt.hash(password, 10)
        const ref = await getAdminDb().collection("Data_Admin").add({ Email: email, Password: hashed, Role: "Panitia" })
        return NextResponse.json({ id: ref.id })
      }

      case "updatePanitia": {
        const { id, email, password } = data
        if (!id) return apiError("ID wajib diisi")
        const payload: Record<string, string> = {}
        if (email) payload.Email = email
        if (password) payload.Password = await bcrypt.hash(password, 10)
        await getAdminDb().collection("Data_Admin").doc(id).update(payload)
        return NextResponse.json({ success: true })
      }

      case "deletePanitia": {
        const { id } = data
        if (!id) return apiError("ID wajib diisi")
        await getAdminDb().collection("Data_Admin").doc(id).delete()
        return NextResponse.json({ success: true })
      }

      case "createBilik": {
        const { id, name, monitor, email, handphone } = data
        if (!id) return apiError("ID bilik wajib diisi")
        const payload: Record<string, any> = {
          name: name || "",
          status: "idle",
          activeVoterName: "",
          activeVoterNIB: "",
          Monitor: monitor || "",
          Email: email || "",
          Handphone: handphone || "",
          createdAt: firestore.FieldValue.serverTimestamp(),
          timestamp: firestore.FieldValue.serverTimestamp(),
        }
        await getAdminDb().collection("BilikVoting").doc(id).set(payload, { merge: true })
        return NextResponse.json({ success: true })
      }

      case "updateBilik": {
        const { id, name, monitor, email, handphone } = data
        if (!id) return apiError("ID bilik wajib diisi")
        const payload: Record<string, any> = {}
        if (name !== undefined) payload.name = name
        if (monitor !== undefined) payload.Monitor = monitor
        if (email !== undefined) payload.Email = email
        if (handphone !== undefined) payload.Handphone = handphone
        payload.timestamp = firestore.FieldValue.serverTimestamp()
        await getAdminDb().collection("BilikVoting").doc(id).update(payload)
        return NextResponse.json({ success: true })
      }

      case "deleteBilik": {
        const { id } = data
        if (!id) return apiError("ID bilik wajib diisi")
        await getAdminDb().collection("BilikVoting").doc(id).delete()
        return NextResponse.json({ success: true })
      }

      default:
        return apiError(`Unknown action: ${action}`)
    }
  } catch (err) {
    console.error("Admin panitia API error:", err)
    return apiError("Gagal memproses request", 500)
  }
}
