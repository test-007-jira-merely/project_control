import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./config"

export async function getRecentActivity(limitCount = 5) {
  try {
    const activityQuery = query(collection(db, "activity"), orderBy("timestamp", "desc"), limit(limitCount))

    const activitySnapshot = await getDocs(activityQuery)

    return activitySnapshot.docs.map((doc) => {
      const data = doc.data()

      return {
        id: doc.id,
        type: data.type,
        action: data.action,
        title: data.title,
        timestamp: data.timestamp.toDate(),
        user: data.user,
      }
    })
  } catch (error) {
    console.error("Error getting recent activity:", error)
    return []
  }
}

export async function logActivity(
  type: "project" | "task" | "user",
  action: "create" | "update" | "delete" | "complete",
  title: string,
  userId: string,
  userName: string,
) {
  try {
    const activityRef = collection(db, "activity")

    await addDoc(activityRef, {
      type,
      action,
      title,
      timestamp: serverTimestamp(),
      user: {
        id: userId,
        name: userName,
      },
    })

    return true
  } catch (error) {
    console.error("Error logging activity:", error)
    return false
  }
}
