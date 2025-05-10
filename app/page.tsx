"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase/config"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/auth/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  // Показуємо завантажувач, поки перевіряємо стан аутентифікації
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Завантаження...</h1>
        <p className="text-muted-foreground">Перевіряємо ваш обліковий запис</p>
      </div>
    </div>
  )
}
