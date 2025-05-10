import { doc, getDoc, updateDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "./config"
import type { UserRole } from "@/context/auth-context"

export async function getUserRole(uid: string): Promise<UserRole> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))

    if (userDoc.exists()) {
      return userDoc.data().role as UserRole
    }

    return "guest"
  } catch (error) {
    console.error("Error getting user role:", error)
    return "guest"
  }
}

export async function updateUserRole(uid: string, role: UserRole) {
  try {
    await updateDoc(doc(db, "users", uid), {
      role,
      updatedAt: new Date(),
    })

    return true
  } catch (error) {
    console.error("Error updating user role:", error)
    throw error
  }
}

export async function getAllUsers() {
  try {
    const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"))

    const usersSnapshot = await getDocs(usersQuery)

    return usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting all users:", error)
    throw error
  }
}

export async function getPendingUsers() {
  try {
    const usersQuery = query(collection(db, "users"), where("role", "==", "guest"), orderBy("createdAt", "desc"))

    const usersSnapshot = await getDocs(usersQuery)

    return usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting pending users:", error)
    throw error
  }
}
