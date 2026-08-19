import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin-sdk"
import { requireRole, apiError } from "@/lib/api-auth"
import * as firestore from "firebase-admin/firestore"

export async function POST(request: NextRequest) {
  const { user, error } = await requireRole(["admin", "panitia"])
  if (error) return error

  try {
    const { voterId, candidateId } = await request.json()
    if (!voterId || !candidateId) return apiError("voterId dan candidateId wajib diisi")

    const batch = getAdminDb().batch()
    const participantRef = getAdminDb().collection("Data_Peserta").doc(voterId)
    batch.update(participantRef, { StatusVoting: "sudah" })

    const candidateRef = getAdminDb().collection("Data_Calon_Formatur").doc(candidateId)
    batch.update(candidateRef, { JumlahVote: firestore.FieldValue.increment(1) })

    batch.update(getAdminDb().collection("TotalSudahVoting").doc("Total"), {
      TotalSudahVoting: firestore.FieldValue.increment(1),
    })
    batch.update(getAdminDb().collection("TotalBelumVoting").doc("Total"), {
      TotalBelumVoting: firestore.FieldValue.increment(-1),
    })

    await batch.commit()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Emergency vote API error:", err)
    return apiError("Gagal memproses voting darurat", 500)
  }
}
