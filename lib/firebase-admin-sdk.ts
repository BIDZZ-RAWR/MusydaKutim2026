import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

function getAdminApp() {
  if (getApps().length) return getApps()[0]

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error(
      "Firebase Admin SDK not configured. Set FIREBASE_ADMIN_CLIENT_EMAIL, " +
      "FIREBASE_ADMIN_PRIVATE_KEY in .env.local"
    )
  }

  const serviceAccount: ServiceAccount = {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  }

  return initializeApp({ credential: cert(serviceAccount) }, "admin")
}

let _adminDb: ReturnType<typeof getFirestore> | null = null

export function getAdminDb() {
  if (!_adminDb) {
    _adminDb = getFirestore(getAdminApp())
  }
  return _adminDb
}
