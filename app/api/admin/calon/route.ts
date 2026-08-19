import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin-sdk"
import { requireRole, apiError } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  const { user, error } = await requireRole(["admin"])
  if (error) return error

  try {
    const { action, data } = await request.json()

    switch (action) {
      case "create": {
        const { id, name, photo } = data
        if (!id || !name) return apiError("ID dan nama wajib diisi")
        await getAdminDb().collection("Data_Calon_Formatur").doc(id).set(
          { NamaCalonFormatur: name, FotoCalonFormatur: photo || "", JumlahVote: 0 },
          { merge: true },
        )
        return NextResponse.json({ success: true })
      }

      case "update": {
        const { id, name, photo } = data
        if (!id) return apiError("ID wajib diisi")
        const payload: Record<string, string> = {}
        if (name) payload.NamaCalonFormatur = name
        if (photo !== undefined) payload.FotoCalonFormatur = photo
        await getAdminDb().collection("Data_Calon_Formatur").doc(id).update(payload)
        return NextResponse.json({ success: true })
      }

      case "migrate": {
        const { oldId, newId, name, photo } = data
        if (!oldId || !newId) return apiError("oldId dan newId wajib diisi")
        const oldDoc = await getAdminDb().collection("Data_Calon_Formatur").doc(oldId).get()
        if (!oldDoc.exists) return apiError("Calon tidak ditemukan", 404)
        const oldData = oldDoc.data() || {}
        const batch = getAdminDb().batch()
        batch.set(getAdminDb().collection("Data_Calon_Formatur").doc(newId), {
          NamaCalonFormatur: name || oldData.NamaCalonFormatur || "",
          FotoCalonFormatur: photo !== undefined ? photo : (oldData.FotoCalonFormatur || ""),
          JumlahVote: oldData.JumlahVote || 0,
        })
        batch.delete(getAdminDb().collection("Data_Calon_Formatur").doc(oldId))
        const jabatanSnap = await getAdminDb().collection("JabatanFormatur").doc(oldId).get()
        if (jabatanSnap.exists) {
          batch.set(getAdminDb().collection("JabatanFormatur").doc(newId), jabatanSnap.data() || {})
          batch.delete(getAdminDb().collection("JabatanFormatur").doc(oldId))
        }
        await batch.commit()
        return NextResponse.json({ success: true })
      }

      case "delete": {
        const { id } = data
        if (!id) return apiError("ID wajib diisi")
        await getAdminDb().collection("Data_Calon_Formatur").doc(id).delete()
        return NextResponse.json({ success: true })
      }

      default:
        return apiError(`Unknown action: ${action}`)
    }
  } catch (err) {
    console.error("Admin calon API error:", err)
    return apiError("Gagal memproses request", 500)
  }
}
