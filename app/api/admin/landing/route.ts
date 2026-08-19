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
      case "save": {
        const { landingContent, showResults, winner, rolesMap, roleLabels, adminEmail, changes } = data

        if (landingContent) {
          await getAdminDb().collection("LandingContent").doc("main").set(landingContent, { merge: true })
        }

        if (rolesMap && roleLabels) {
          const labelKeys = Object.keys(roleLabels)
          const validRoleKeys = Object.keys(rolesMap).filter((k) => rolesMap[k])
          if (validRoleKeys.length > 0) {
            const batch = getAdminDb().batch()
            validRoleKeys.forEach((key) => {
              const id = rolesMap[key]
              batch.set(
                getAdminDb().collection("JabatanFormatur").doc(id),
                { Jabatan: roleLabels[key] || key },
                { merge: true },
              )
            })
            await batch.commit()
          }
        }

        const settingsPayload: Record<string, any> = {
          showResults: showResults !== undefined ? showResults : true,
          winner: {
            Status: winner ? "true" : "false",
            Roles: rolesMap || {},
            RoleLabels: roleLabels || {},
          },
        }

        if (changes || adminEmail) {
          settingsPayload.editHistory = {
            akun: adminEmail || "admin",
            ApaYangDiEdit: changes || "Tidak ada perubahan",
            timestamp: firestore.FieldValue.serverTimestamp(),
          }
        }

        await getAdminDb().collection("LandingPage").doc("settings").set(settingsPayload, { merge: true })

        return NextResponse.json({ success: true })
      }

      default:
        return apiError(`Unknown action: ${action}`)
    }
  } catch (err) {
    console.error("Admin landing API error:", err)
    return apiError("Gagal memproses request", 500)
  }
}
