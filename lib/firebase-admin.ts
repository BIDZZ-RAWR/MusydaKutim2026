import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missing.length) {
  throw new Error(`Missing Firebase env vars: ${missing.join(", ")}`)
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

let db: Firestore
try {
  db = initializeFirestore(app, { experimentalForceLongPolling: true, useFetchStreams: false })
} catch {
  db = getFirestore(app)
}

export { db }
