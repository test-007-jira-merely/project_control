import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./config"

// ВАЖЛИВО: Видаляємо імпорт cookies з next/headers
// import { cookies } from "next/headers" - ЦЕЙ РЯДОК ПОТРІБНО ВИДАЛИТИ

export async function signUp(email: string, password: string, name: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Оновлюємо профіль користувача
    await updateProfile(user, {
      displayName: name,
    })

    // Створюємо документ користувача в Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: name,
      role: "guest", // За замовчуванням користувач має роль "guest"
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return user
  } catch (error) {
    console.error("Error signing up:", error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Клієнтська функція для отримання поточного користувача
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser
}
