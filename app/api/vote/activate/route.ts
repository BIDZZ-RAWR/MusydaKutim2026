import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin-sdk"
import { requireRole, apiError } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  const { user, error } = await requireRole(["admin", "panitia"])
  if (error) return error

  try {
    const { bilikId, voterNIB, voterName } = await request.json()
    if (!bilikId || !voterNIB || !voterName) return apiError("bilikId, voterNIB, voterName wajib diisi")

    await getAdminDb().collection("BilikVoting").doc(bilikId).update({
      activeVoterNIB: voterNIB,
      activeVoterName: voterName,
      status: "voting_active",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Activate API error:", err)
    return apiError("Gagal mengaktifkan bilik", 500)
  }
}
