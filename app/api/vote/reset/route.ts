import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin-sdk"
import { requireRole, apiError } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  const { user, error } = await requireRole(["admin", "panitia"])
  if (error) return error

  try {
    const { bilikId } = await request.json()
    if (!bilikId) return apiError("bilikId wajib diisi")

    await getAdminDb().collection("BilikVoting").doc(bilikId).update({
      status: "idle",
      activeVoterName: "",
      activeVoterNIB: "",
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Reset bilik API error:", err)
    return apiError("Gagal mereset bilik", 500)
  }
}
