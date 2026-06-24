import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseEnvConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Object.values(firebaseEnvConfig).every(
  (value) => typeof value === "string" && value.trim().length > 0,
)

const firebaseConfig = {
  apiKey: firebaseEnvConfig.apiKey || "placeholder-api-key",
  authDomain: firebaseEnvConfig.authDomain || "placeholder.firebaseapp.com",
  projectId: firebaseEnvConfig.projectId || "placeholder-project",
  messagingSenderId: firebaseEnvConfig.messagingSenderId || "000000000000",
  appId: firebaseEnvConfig.appId || "1:000000000000:web:placeholder",
}

// Initialize Firebase with safe fallbacks so build-time prerender does not crash
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db, firebaseConfig }
