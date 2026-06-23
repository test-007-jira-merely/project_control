import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Доступ заборонено</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          У вас немає прав для доступу до цієї сторінки. Зверніться до адміністратора для отримання доступу.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/dashboard">Повернутися на головну</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
