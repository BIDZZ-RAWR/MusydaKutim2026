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
      heartbeat: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Heartbeat API error:", err)
    return apiError("Gagal update heartbeat", 500)
  }
}
