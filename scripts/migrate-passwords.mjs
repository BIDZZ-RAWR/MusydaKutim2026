/**
 * Run with: node scripts/migrate-passwords.mjs
 * Requires: FIREBASE_SERVICE_ACCOUNT env var or firebase-admin setup
 * 
 * This script reads all panitia accounts from Firestore, checks if passwords
 * are already hashed (start with $2), and if not, hashes them with bcrypt.
 * 
 * IMPORTANT: This uses the Firebase REST API directly via fetch to avoid
 * requiring firebase-admin SDK installation.
 */

const { initializeApp } = await import("firebase/app")
const { getFirestore, collection, getDocs, doc, updateDoc } = await import("firebase/firestore")
const bcrypt = await import("bcryptjs")

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k)

if (missing.length) {
  console.error(`Missing env vars: ${missing.join(", ")}`)
  console.error("Create a .env file with the above variables or set them in your environment.")
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function migrate() {
  console.log("Fetching panitia accounts...")
  const snapshot = await getDocs(collection(db, "Data_Admin"))
  let migrated = 0
  let skipped = 0

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data()
    const password = data.Password

    if (!password) {
      console.log(`  SKIP ${docSnap.id}: no password field`)
      skipped++
      continue
    }

    if (password.startsWith("$2")) {
      console.log(`  SKIP ${docSnap.id}: already hashed`)
      skipped++
      continue
    }

    console.log(`  HASH ${docSnap.id}: ${password.substring(0, 10)}... -> bcrypt`)
    const hashed = await bcrypt.hash(password, 12)
    await updateDoc(doc(db, "Data_Admin", docSnap.id), { Password: hashed })
    migrated++
  }

  console.log(`\nDone! Migrated: ${migrated}, Skipped: ${skipped}`)
}

migrate().catch(console.error)
