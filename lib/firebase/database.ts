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
  documentId,
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
  taskLink?: string
  members?: string[] // Додано для зберігання ID учасників проекту
  gitRepository?: string // Додано для зберігання посилання на репозиторій
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
  projectName?: string // Додано для зберігання назви проекту
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
export async function getTasksInReview(): Promise<Task[]> {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("User not authenticated")
    }

    // Отримуємо проекти, в яких користувач є учасником або власником
    const projectMembersQuery = query(collection(db, "projectMembers"), where("userId", "==", user.uid))
    const projectMembersSnapshot = await getDocs(projectMembersQuery)

    const projectIds = projectMembersSnapshot.docs.map((doc) => doc.data().projectId)

    // Якщо користувач не є учасником жодного проекту, повертаємо пустий масив
    if (projectIds.length === 0) {
      return []
    }

    // Отримуємо задачі зі статусом "review" з проектів, в яких користувач є учасником
    const tasksQuery = query(
      collection(db, "tasks"),
      where("projectId", "in", projectIds),
      where("status", "==", "review"),
    )

    const tasksSnapshot = await getDocs(tasksQuery)

    const tasks: Task[] = []

    // Отримуємо дані про проекти для відображення назви проекту
    const projectsSnapshot = await getDocs(query(collection(db, "projects"), where(documentId(), "in", projectIds)))

    const projectsMap = new Map()
    projectsSnapshot.forEach((doc) => {
      projectsMap.set(doc.id, doc.data().name)
    })

    tasksSnapshot.forEach((doc) => {
      const taskData = doc.data() as Task
      tasks.push({
        ...taskData,
        id: doc.id,
        projectName: projectsMap.get(taskData.projectId) || "Невідомий проект",
      })
    })

    // Сортуємо за датою оновлення (спочатку найновіші)
    return tasks.sort((a, b) => {
      const dateA = a.updatedAt?.seconds || a.createdAt.seconds
      const dateB = b.updatedAt?.seconds || b.createdAt.seconds
      return dateB - dateA
    })
  } catch (error) {
    console.error("Error getting tasks in review:", error)
    throw error
  }
}
export async function updateTaskStatus(taskId: string, status: string): Promise<void> {
  try {
    const taskRef = doc(db, "tasks", taskId)

    await updateDoc(taskRef, {
      status,
      updatedAt: serverTimestamp(),
    })

    // Додаємо запис про активність
    const user = auth.currentUser
    if (user) {
      await addDoc(collection(db, "activities"), {
        type: "task",
        action: status === "completed" ? "complete" : "update",
        taskId,
        userId: user.uid,
        userName: user.displayName || user.email,
        timestamp: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error updating task status:", error)
    throw error
  }
}


// Отримання учасників проекту
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  try {
    const membersQuery = query(
      collection(db, "projectMembers"),
      where("projectId", "==", projectId),
      orderBy("addedAt", "desc"),
    )

    const membersSnapshot = await getDocs(membersQuery)
    const members: ProjectMember[] = []

    membersSnapshot.forEach((doc) => {
      const data = doc.data()
      members.push({
        id: doc.id,
        projectId: data.projectId,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        role: data.role,
        addedAt: data.addedAt,
      })
    })

    return members
  } catch (error) {
    console.error("Error getting project members:", error)
    throw error
  }
}

// Пошук користувачів за email
export async function searchUsersByEmail(email: string): Promise<User[]> {
  try {
    // В реальному додатку тут має бути безпечний спосіб пошуку користувачів
    // Наприклад, через Cloud Functions або спеціальний API
    // Для демонстрації використаємо простий пошук за email

    const usersQuery = query(
      collection(db, "users"),
      where("email", ">=", email),
      where("email", "<=", email + "\uf8ff"),
    )
    const usersSnapshot = await getDocs(usersQuery)

    const users: User[] = []

    usersSnapshot.forEach((doc) => {
      const data = doc.data()
      users.push({
        id: doc.id,
        displayName: data.displayName || data.email,
        email: data.email,
        photoURL: data.photoURL,
      })
    })

    return users
  } catch (error) {
    console.error("Error searching users:", error)
    throw error
  }
}

// Додавання учасника до проекту
export async function addProjectMember(
  projectId: string,
  userData: { userId: string; userName: string; userEmail: string; role: "admin" | "member" },
): Promise<ProjectMember> {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("User not authenticated")
    }

    // Перевіряємо, чи користувач вже є учасником проекту
    const existingMemberQuery = query(
      collection(db, "projectMembers"),
      where("projectId", "==", projectId),
      where("userId", "==", userData.userId),
    )

    const existingMemberSnapshot = await getDocs(existingMemberQuery)

    if (!existingMemberSnapshot.empty) {
      throw new Error("Користувач вже є учасником проекту")
    }

    // Перевіряємо, чи має поточний користувач права для додавання учасників
    const currentUserMemberQuery = query(
      collection(db, "projectMembers"),
      where("projectId", "==", projectId),
      where("userId", "==", user.uid),
    )

    const currentUserMemberSnapshot = await getDocs(currentUserMemberQuery)

    if (currentUserMemberSnapshot.empty) {
      throw new Error("У вас немає прав для додавання учасників до цього проекту")
    }

    const currentUserRole = currentUserMemberSnapshot.docs[0].data().role

    if (currentUserRole !== "owner" && currentUserRole !== "admin") {
      throw new Error("У вас немає прав для додавання учасників до цього проекту")
    }

    // Додаємо нового учасника
    const memberData = {
      projectId,
      userId: userData.userId,
      userName: userData.userName,
      userEmail: userData.userEmail,
      role: userData.role,
      addedAt: serverTimestamp(),
    }

    const memberRef = await addDoc(collection(db, "projectMembers"), memberData)

    // Додаємо запис про активність
    await addDoc(collection(db, "activities"), {
      type: "user",
      action: "create",
      projectId,
      userId: user.uid,
      userName: user.displayName || user.email,
      targetUserId: userData.userId,
      targetUserName: userData.userName,
      timestamp: serverTimestamp(),
    })

    // Отримуємо дані про проект для повідомлення
    const projectDoc = await getDoc(doc(db, "projects", projectId))
    const projectName = projectDoc.exists() ? projectDoc.data().name : "Проект"

    return {
      id: memberRef.id,
      ...memberData,
      addedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as Timestamp,
    } as ProjectMember
  } catch (error) {
    console.error("Error adding project member:", error)
    throw error
  }
}

// Видалення учасника з проекту
export async function removeProjectMember(memberId: string): Promise<void> {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("User not authenticated")
    }

    // Отримуємо дані про учасника
    const memberDoc = await getDoc(doc(db, "projectMembers", memberId))

    if (!memberDoc.exists()) {
      throw new Error("Учасника не знайдено")
    }

    const memberData = memberDoc.data()
    const projectId = memberData.projectId

    // Перевіряємо, чи має поточний користувач права для видалення учасників
    const currentUserMemberQuery = query(
      collection(db, "projectMembers"),
      where("projectId", "==", projectId),
      where("userId", "==", user.uid),
    )

    const currentUserMemberSnapshot = await getDocs(currentUserMemberQuery)

    if (currentUserMemberSnapshot.empty) {
      throw new Error("У вас немає прав для видалення учасників з цього проекту")
    }

    const currentUserRole = currentUserMemberSnapshot.docs[0].data().role

    // Власник може видаляти будь-кого, адміністратор може видаляти тільки звичайних учасників
    if (currentUserRole !== "owner" && (currentUserRole !== "admin" || memberData.role !== "member")) {
      throw new Error("У вас немає прав для видалення цього учасника")
    }

    // Не дозволяємо видаляти власника проекту
    if (memberData.role === "owner") {
      throw new Error("Неможливо видалити власника проекту")
    }

    // Видаляємо учасника
    await deleteDoc(doc(db, "projectMembers", memberId))

    // Додаємо запис про активність
    await addDoc(collection(db, "activities"), {
      type: "user",
      action: "delete",
      projectId,
      userId: user.uid,
      userName: user.displayName || user.email,
      targetUserId: memberData.userId,
      targetUserName: memberData.userName,
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error removing project member:", error)
    throw error
  }
}

// Оновлення ролі учасника проекту
export async function updateProjectMemberRole(memberId: string, newRole: "admin" | "member"): Promise<void> {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("User not authenticated")
    }

    // Отримуємо дані про учасника
    const memberDoc = await getDoc(doc(db, "projectMembers", memberId))

    if (!memberDoc.exists()) {
      throw new Error("Учасника не знайдено")
    }

    const memberData = memberDoc.data()
    const projectId = memberData.projectId

    // Перевіряємо, чи має поточний користувач права для зміни ролей
    const currentUserMemberQuery = query(
      collection(db, "projectMembers"),
      where("projectId", "==", projectId),
      where("userId", "==", user.uid),
    )

    const currentUserMemberSnapshot = await getDocs(currentUserMemberQuery)

    if (currentUserMemberSnapshot.empty) {
      throw new Error("У вас немає прав для зміни ролей учасників цього проекту")
    }

    const currentUserRole = currentUserMemberSnapshot.docs[0].data().role

    // Тільки власник може змінювати ролі
    if (currentUserRole !== "owner") {
      throw new Error("Тільки власник проекту може змінювати ролі учасників")
    }

    // Не дозволяємо змінювати роль власника
    if (memberData.role === "owner") {
      throw new Error("Неможливо змінити роль власника проекту")
    }

    // Оновлюємо роль
    await updateDoc(doc(db, "projectMembers", memberId), {
      role: newRole,
    })

    // Додаємо запис про активність
    await addDoc(collection(db, "activities"), {
      type: "user",
      action: "update",
      projectId,
      userId: user.uid,
      userName: user.displayName || user.email,
      targetUserId: memberData.userId,
      targetUserName: memberData.userName,
      details: `Роль змінено на ${newRole === "admin" ? "Адміністратор" : "Учасник"}`,
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating project member role:", error)
    throw error
  }
}