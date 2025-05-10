import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  addDoc,
  type Timestamp,
  setDoc,
} from "firebase/firestore"
import { db, auth } from "./config"
import { logActivity } from "./activity"

// Типи даних
export interface Project {
  id?: string
  name: string
  description: string
  status: "planning" | "active" | "completed" | "archived"
  startDate: Date | null
  endDate: Date | null
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Task {
  id?: string
  projectId: string
  title: string
  description: string
  status: "todo" | "in-progress" | "review" | "completed"
  priority: "low" | "medium" | "high" | "urgent"
  assignedTo: string | null
  dueDate: Date | null
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ProjectMember {
  id?: string
  projectId: string
  userId: string
  role: "owner" | "admin" | "member" | "viewer"
  joinedAt: Timestamp
}

// Функції для роботи з проектами
export async function createProject(projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "createdBy">) {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Користувач не авторизований")

    const projectRef = collection(db, "projects")

    const newProject = {
      ...projectData,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(projectRef, newProject)

    // Додаємо користувача як власника проекту
    await addDoc(collection(db, "projectMembers"), {
      projectId: docRef.id,
      userId: user.uid,
      role: "owner",
      joinedAt: serverTimestamp(),
    })

    // Логуємо активність
    await logActivity("project", "create", projectData.name, user.uid, user.displayName || "Користувач")

    return { id: docRef.id, ...newProject }
  } catch (error) {
    console.error("Error creating project:", error)
    throw error
  }
}

export async function getProject(projectId: string) {
  try {
    const projectDoc = await getDoc(doc(db, "projects", projectId))

    if (!projectDoc.exists()) {
      throw new Error("Проект не знайдено")
    }

    const projectData = projectDoc.data() as Project

    // Конвертуємо Timestamp в Date
    return {
      id: projectDoc.id,
      ...projectData,
      startDate: projectData.startDate ? new Date(projectData.startDate.seconds * 1000) : null,
      endDate: projectData.endDate ? new Date(projectData.endDate.seconds * 1000) : null,
      createdAt: projectData.createdAt,
      updatedAt: projectData.updatedAt,
    }
  } catch (error) {
    console.error("Error getting project:", error)
    throw error
  }
}

export async function updateProject(
  projectId: string,
  projectData: Partial<Omit<Project, "id" | "createdAt" | "updatedAt" | "createdBy">>,
) {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Користувач не авторизований")

    const projectRef = doc(db, "projects", projectId)

    // Перевіряємо, чи існує проект
    const projectDoc = await getDoc(projectRef)
    if (!projectDoc.exists()) {
      throw new Error("Проект не знайдено")
    }

    // Оновлюємо проект
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: serverTimestamp(),
    })

    // Логуємо активність
    await logActivity("project", "update", projectDoc.data().name, user.uid, user.displayName || "Користувач")

    return { id: projectId, ...projectDoc.data(), ...projectData }
  } catch (error) {
    console.error("Error updating project:", error)
    throw error
  }
}

export async function deleteProject(projectId: string) {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Користувач не авторизований")

    const projectRef = doc(db, "projects", projectId)

    // Перевіряємо, чи існує проект
    const projectDoc = await getDoc(projectRef)
    if (!projectDoc.exists()) {
      throw new Error("Проект не знайдено")
    }

    // Видаляємо проект
    await deleteDoc(projectRef)

    // Видаляємо всіх учасників проекту
    const membersQuery = query(collection(db, "projectMembers"), where("projectId", "==", projectId))
    const membersSnapshot = await getDocs(membersQuery)

    const deletePromises = membersSnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    // Логуємо активність
    await logActivity("project", "delete", projectDoc.data().name, user.uid, user.displayName || "Користувач")

    return true
  } catch (error) {
    console.error("Error deleting project:", error)
    throw error
  }
}

export async function getUserProjects(userId: string) {
  try {
    // Отримуємо всі проекти, де користувач є учасником
    const membershipQuery = query(collection(db, "projectMembers"), where("userId", "==", userId))

    const membershipSnapshot = await getDocs(membershipQuery)
    const projectIds = membershipSnapshot.docs.map((doc) => doc.data().projectId)

    if (projectIds.length === 0) {
      return []
    }

    // Отримуємо проекти за їх ID
    const projects: Project[] = []

    for (const projectId of projectIds) {
      try {
        const project = await getProject(projectId)
        projects.push(project as Project)
      } catch (error) {
        console.error(`Error getting project ${projectId}:`, error)
      }
    }

    return projects
  } catch (error) {
    console.error("Error getting user projects:", error)
    throw error
  }
}

export async function getAllProjects() {
  try {
    const projectsQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"))

    const projectsSnapshot = await getDocs(projectsQuery)

    return projectsSnapshot.docs.map((doc) => {
      const data = doc.data() as Project
      return {
        id: doc.id,
        ...data,
        startDate: data.startDate ? new Date(data.startDate.seconds * 1000) : null,
        endDate: data.endDate ? new Date(data.endDate.seconds * 1000) : null,
      }
    })
  } catch (error) {
    console.error("Error getting all projects:", error)
    throw error
  }
}

// Функції для роботи з задачами
export async function createTask(taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy">) {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Користувач не авторизований")

    const taskRef = collection(db, "tasks")

    const newTask = {
      ...taskData,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(taskRef, newTask)

    // Логуємо активність
    await logActivity("task", "create", taskData.title, user.uid, user.displayName || "Користувач")

    return { id: docRef.id, ...newTask }
  } catch (error) {
    console.error("Error creating task:", error)
    throw error
  }
}

export async function getTask(taskId: string) {
  try {
    const taskDoc = await getDoc(doc(db, "tasks", taskId))

    if (!taskDoc.exists()) {
      throw new Error("Задачу не знайдено")
    }

    const taskData = taskDoc.data() as Task

    return {
      id: taskDoc.id,
      ...taskData,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate.seconds * 1000) : null,
      createdAt: taskData.createdAt,
      updatedAt: taskData.updatedAt,
    }
  } catch (error) {
    console.error("Error getting task:", error)
    throw error
  }
}

export async function updateTask(
  taskId: string,
  taskData: Partial<Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy">>,
) {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Користувач не авторизований")

    const taskRef = doc(db, "tasks", taskId)

    // Перевіряємо, чи існує задача
    const taskDoc = await getDoc(taskRef)
    if (!taskDoc.exists()) {
      throw new Error("Задачу не знайдено")
    }

    // Оновлюємо задачу
    await updateDoc(taskRef, {
      ...taskData,
      updatedAt: serverTimestamp(),
    })

    // Логуємо активність
    await logActivity("task", "update", taskDoc.data().title, user.uid, user.displayName || "Користувач")

    return { id: taskId, ...taskDoc.data(), ...taskData }
  } catch (error) {
    console.error("Error updating task:", error)
    throw error
  }
}

export async function deleteTask(taskId: string) {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Користувач не авторизований")

    const taskRef = doc(db, "tasks", taskId)

    // Перевіряємо, чи існує задача
    const taskDoc = await getDoc(taskRef)
    if (!taskDoc.exists()) {
      throw new Error("Задачу не знайдено")
    }

    // Видаляємо задачу
    await deleteDoc(taskRef)

    // Логуємо активність
    await logActivity("task", "delete", taskDoc.data().title, user.uid, user.displayName || "Користувач")

    return true
  } catch (error) {
    console.error("Error deleting task:", error)
    throw error
  }
}

export async function getProjectTasks(projectId: string) {
  try {
    const tasksQuery = query(collection(db, "tasks"), where("projectId", "==", projectId), orderBy("createdAt", "desc"))

    const tasksSnapshot = await getDocs(tasksQuery)

    return tasksSnapshot.docs.map((doc) => {
      const data = doc.data() as Task
      return {
        id: doc.id,
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate.seconds * 1000) : null,
      }
    })
  } catch (error) {
    console.error("Error getting project tasks:", error)
    throw error
  }
}

export async function getUserTasks(userId: string) {
  try {
    const tasksQuery = query(collection(db, "tasks"), where("assignedTo", "==", userId), orderBy("createdAt", "desc"))

    const tasksSnapshot = await getDocs(tasksQuery)

    return tasksSnapshot.docs.map((doc) => {
      const data = doc.data() as Task
      return {
        id: doc.id,
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate.seconds * 1000) : null,
      }
    })
  } catch (error) {
    console.error("Error getting user tasks:", error)
    throw error
  }
}

// Функції для роботи з учасниками проекту
// Змінюємо функцію addProjectMember
export async function addProjectMember(projectId: string, userId: string, role: ProjectMember["role"]) {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Користувач не авторизований")

    // Створюємо ID у форматі userId_projectId
    const memberId = `${userId}_${projectId}`

    // Перевіряємо, чи користувач вже є учасником проекту
    const memberDoc = await getDoc(doc(db, "projectMembers", memberId))

    if (memberDoc.exists()) {
      // Якщо користувач вже є учасником, оновлюємо його роль
      await updateDoc(doc(db, "projectMembers", memberId), {
        role,
      })

      return { id: memberId, ...memberDoc.data(), role }
    }

    // Додаємо нового учасника
    const newMember = {
      projectId,
      userId,
      role,
      joinedAt: serverTimestamp(),
    }

    await setDoc(doc(db, "projectMembers", memberId), newMember)

    // Отримуємо інформацію про користувача
    const userDoc = await getDoc(doc(db, "users", userId))
    const userData = userDoc.data()

    // Логуємо активність
    await logActivity(
      "user",
      "create",
      `${userData?.displayName || "Користувач"} доданий до проекту`,
      user.uid,
      user.displayName || "Користувач",
    )

    return { id: memberId, ...newMember }
  } catch (error) {
    console.error("Error adding project member:", error)
    throw error
  }
}

// Змінюємо функцію removeProjectMember
export async function removeProjectMember(projectId: string, userId: string) {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Користувач не авторизований")

    // Створюємо ID у форматі userId_projectId
    const memberId = `${userId}_${projectId}`

    // Перевіряємо, чи існує запис
    const memberDoc = await getDoc(doc(db, "projectMembers", memberId))

    if (!memberDoc.exists()) {
      throw new Error("Учасника не знайдено")
    }

    // Видаляємо учасника
    await deleteDoc(doc(db, "projectMembers", memberId))

    // Отримуємо інформацію про користувача
    const userDoc = await getDoc(doc(db, "users", userId))
    const userData = userDoc.data()

    // Логуємо активність
    await logActivity(
      "user",
      "delete",
      `${userData?.displayName || "Користувач"} видалений з проекту`,
      user.uid,
      user.displayName || "Користувач",
    )

    return true
  } catch (error) {
    console.error("Error removing project member:", error)
    throw error
  }
}

// Змінюємо функцію getProjectMembers
export async function getProjectMembers(projectId: string) {
  try {
    const membersQuery = query(collection(db, "projectMembers"), where("projectId", "==", projectId))

    const membersSnapshot = await getDocs(membersQuery)

    const members = []

    for (const memberDoc of membersSnapshot.docs) {
      const memberData = memberDoc.data()

      // Отримуємо інформацію про користувача
      const userDoc = await getDoc(doc(db, "users", memberData.userId))
      const userData = userDoc.data()

      members.push({
        id: memberDoc.id,
        ...memberData,
        user: {
          id: memberData.userId,
          displayName: userData?.displayName || "Користувач",
          email: userData?.email || "",
          role: userData?.role || "guest",
        },
      })
    }

    return members
  } catch (error) {
    console.error("Error getting project members:", error)
    throw error
  }
}

// Змінюємо функцію getUserProjectRole
export async function getUserProjectRole(projectId: string, userId: string) {
  try {
    // Створюємо ID у форматі userId_projectId
    const memberId = `${userId}_${projectId}`

    const memberDoc = await getDoc(doc(db, "projectMembers", memberId))

    if (!memberDoc.exists()) {
      return null
    }

    return memberDoc.data().role
  } catch (error) {
    console.error("Error getting user project role:", error)
    throw error
  }
}
