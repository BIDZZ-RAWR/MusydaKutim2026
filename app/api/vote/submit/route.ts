import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin-sdk"
import { requireRole, apiError } from "@/lib/api-auth"
import * as firestore from "firebase-admin/firestore"

export async function POST(request: NextRequest) {
  const { user, error } = await requireRole(["admin", "panitia"])
  if (error) return error

  try {
    const { bilikId, voterId, candidateIds } = await request.json()
    if (!bilikId || !voterId || !candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return apiError("bilikId, voterId, candidateIds wajib diisi")
    }
    if (candidateIds.length !== 1) {
      return apiError("Harus memilih tepat 1 calon")
    }

    const batch = getAdminDb().batch()
    const participantRef = getAdminDb().collection("Data_Peserta").doc(voterId)
    batch.update(participantRef, { StatusVoting: "sudah" })

    candidateIds.forEach((candId: string) => {
      const candidateRef = getAdminDb().collection("Data_Calon_Formatur").doc(candId)
      batch.update(candidateRef, { JumlahVote: firestore.FieldValue.increment(1) })
    })

    batch.update(getAdminDb().collection("TotalSudahVoting").doc("Total"), {
      TotalSudahVoting: firestore.FieldValue.increment(1),
    })
    batch.update(getAdminDb().collection("TotalBelumVoting").doc("Total"), {
      TotalBelumVoting: firestore.FieldValue.increment(-1),
    })

    const bilikRef = getAdminDb().collection("BilikVoting").doc(bilikId)
    batch.update(bilikRef, {
      status: "idle",
      activeVoterName: "",
      activeVoterNIB: "",
    })

    await batch.commit()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Submit vote API error:", err)
    return apiError("Gagal memproses voting", 500)
  }
}
