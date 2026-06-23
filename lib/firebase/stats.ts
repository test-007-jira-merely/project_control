import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "./config"
import { auth } from "./config"

export async function getProjectStats() {
  try {
    const projectsRef = collection(db, "projects")
    const projectsSnapshot = await getDocs(projectsRef)

    const total = projectsSnapshot.size

    const activeQuery = query(projectsRef, where("status", "==", "active"))
    const activeSnapshot = await getDocs(activeQuery)
    const active = activeSnapshot.size

    const completedQuery = query(projectsRef, where("status", "==", "completed"))
    const completedSnapshot = await getDocs(completedQuery)
    const completed = completedSnapshot.size

    const planningQuery = query(projectsRef, where("status", "==", "planning"))
    const planningSnapshot = await getDocs(planningQuery)
    const planning = planningSnapshot.size

    const archivedQuery = query(projectsRef, where("status", "==", "archived"))
    const archivedSnapshot = await getDocs(archivedQuery)
    const archived = archivedSnapshot.size

    return { total, active, completed, planning, archived }
  } catch (error) {
    console.error("Error getting project stats:", error)
    return { total: 0, active: 0, completed: 0, planning: 0, archived: 0 }
  }
}

export async function getTaskStats() {
  try {
    const tasksRef = collection(db, "tasks")
    const tasksSnapshot = await getDocs(tasksRef)

    const total = tasksSnapshot.size

    const todoQuery = query(tasksRef, where("status", "==", "todo"))
    const todoSnapshot = await getDocs(todoQuery)
    const todo = todoSnapshot.size

    const inProgressQuery = query(tasksRef, where("status", "==", "in-progress"))
    const inProgressSnapshot = await getDocs(inProgressQuery)
    const inProgress = inProgressSnapshot.size

    const reviewQuery = query(tasksRef, where("status", "==", "review"))
    const reviewSnapshot = await getDocs(reviewQuery)
    const review = reviewSnapshot.size

    const completedQuery = query(tasksRef, where("status", "==", "completed"))
    const completedSnapshot = await getDocs(completedQuery)
    const completed = completedSnapshot.size

    return { total, todo, inProgress, review, completed }
  } catch (error) {
    console.error("Error getting task stats:", error)
    return { total: 0, todo: 0, inProgress: 0, review: 0, completed: 0 }
  }
}

export async function getUserStats() {
  try {
    const user = auth.currentUser

    if (!user) {
      return {
        tasksCompleted: 0,
        tasksAssigned: 0,
        projectsInvolved: 0,
        completionRate: 0,
      }
    }

    // Отримуємо задачі, призначені користувачу
    const tasksQuery = query(collection(db, "tasks"), where("assignedTo", "==", user.uid))
    const tasksSnapshot = await getDocs(tasksQuery)
    const tasksAssigned = tasksSnapshot.size

    // Отримуємо завершені задачі
    const completedTasksQuery = query(
      collection(db, "tasks"),
      where("assignedTo", "==", user.uid),
      where("status", "==", "completed"),
    )
    const completedTasksSnapshot = await getDocs(completedTasksQuery)
    const tasksCompleted = completedTasksSnapshot.size

    // Отримуємо проекти, в яких бере участь користувач
    const projectsQuery = query(collection(db, "projectMembers"), where("userId", "==", user.uid))
    const projectsSnapshot = await getDocs(projectsQuery)
    const projectsInvolved = projectsSnapshot.size

    // Обчислюємо відсоток виконання
    const completionRate = tasksAssigned > 0 ? (tasksCompleted / tasksAssigned) * 100 : 0

    return {
      tasksCompleted,
      tasksAssigned,
      projectsInvolved,
      completionRate,
    }
  } catch (error) {
    console.error("Error getting user stats:", error)
    return {
      tasksCompleted: 0,
      tasksAssigned: 0,
      projectsInvolved: 0,
      completionRate: 0,
    }
  }
}
