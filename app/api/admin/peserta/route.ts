import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin-sdk"
import { requireRole, apiError } from "@/lib/api-auth"
import * as firestore from "firebase-admin/firestore"

export async function POST(request: NextRequest) {
  const { user, error } = await requireRole(["admin"])
  if (error) return error

  try {
    const { action, data } = await request.json()

    switch (action) {
      case "create": {
        const { Nama, Pimpinan, NIB } = data
        if (!Nama || !Pimpinan || !NIB) return apiError("Nama, Pimpinan, dan NIB wajib diisi")
        const ref = await getAdminDb().collection("Data_Peserta").add({
          NamaPeserta: Nama,
          Pimpinan,
          NIB,
          StatusVoting: "belum",
        })
        return NextResponse.json({ id: ref.id })
      }

      case "update": {
        const { id, Nama, Pimpinan, NIB } = data
        if (!id) return apiError("ID wajib diisi")
        const payload: Record<string, string> = {}
        if (Nama) payload.NamaPeserta = Nama
        if (Pimpinan) payload.Pimpinan = Pimpinan
        if (NIB) payload.NIB = NIB
        await getAdminDb().collection("Data_Peserta").doc(id).update(payload)
        return NextResponse.json({ success: true })
      }

      case "delete": {
        const { id } = data
        if (!id) return apiError("ID wajib diisi")
        await getAdminDb().collection("Data_Peserta").doc(id).delete()
        return NextResponse.json({ success: true })
      }

      case "bulkDelete": {
        const { ids } = data
        if (!ids || !Array.isArray(ids) || ids.length === 0) return apiError("IDS wajib diisi")
        const batch = getAdminDb().batch()
        ids.forEach((id: string) => batch.delete(getAdminDb().collection("Data_Peserta").doc(id)))
        await batch.commit()
        return NextResponse.json({ deleted: ids.length })
      }

      case "bulkImport": {
        const { items } = data
        if (!items || !Array.isArray(items) || items.length === 0) return apiError("Data wajib diisi")
        const batch = getAdminDb().batch()
        const ids: string[] = []
        items.forEach((item: { Nama: string; Pimpinan: string; NIB: string }) => {
          const ref = getAdminDb().collection("Data_Peserta").doc()
          batch.set(ref, {
            NamaPeserta: item.Nama,
            Pimpinan: item.Pimpinan,
            NIB: item.NIB,
            StatusVoting: "belum",
          })
          ids.push(ref.id)
        })
        await batch.commit()
        return NextResponse.json({ ids })
      }

      default:
        return apiError(`Unknown action: ${action}`)
    }
  } catch (err) {
    console.error("Admin peserta API error:", err)
    return apiError("Gagal memproses request", 500)
  }
}
