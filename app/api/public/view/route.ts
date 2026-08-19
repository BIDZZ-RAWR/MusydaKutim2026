import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin-sdk"
import { apiError } from "@/lib/api-auth"
import * as firestore from "firebase-admin/firestore"

export async function POST(request: NextRequest) {
  try {
    await getAdminDb().collection("LandingPage").doc("settings").set(
      {
        views: {
          Jumlah: firestore.FieldValue.increment(1),
          lastView: firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("View count API error:", err)
    return apiError("Gagal mencatat kunjungan", 500)
  }
}
