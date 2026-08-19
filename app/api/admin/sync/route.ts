import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin-sdk"
import { requireRole, apiError } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  const { user, error } = await requireRole(["admin"])
  if (error) return error

  try {
    const pesertaSnap = await getAdminDb().collection("Data_Peserta").count().get()
    const total = pesertaSnap.data().count || 0

    const belumQuery = getAdminDb().collection("Data_Peserta").where("StatusVoting", "==", "belum")
    const belumSnap = await belumQuery.count().get()
    const belum = belumSnap.data().count || 0
    const sudah = Math.max(total - belum, 0)

    const batch = getAdminDb().batch()
    batch.set(getAdminDb().collection("TotalSudahVoting").doc("Total"), { TotalSudahVoting: sudah }, { merge: true })
    batch.set(getAdminDb().collection("TotalBelumVoting").doc("Total"), { TotalBelumVoting: belum }, { merge: true })
    await batch.commit()

    return NextResponse.json({ total, sudah, belum })
  } catch (err) {
    console.error("Sync API error:", err)
    return apiError("Gagal sync data", 500)
  }
}
