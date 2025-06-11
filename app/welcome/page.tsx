"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

export default function WelcomePage() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    initializeTelegramWebApp()
  }, [])

  const initializeTelegramWebApp = async () => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      // Настройка темы VS_LAB
      tg.setHeaderColor("#f9f9f9")
      tg.setBackgroundColor("#f9f9f9")

      // Получение данных пользователя
      const userData = tg.initDataUnsafe?.user
      if (userData) {
        setUser(userData)
        await authenticateUser(tg.initData)
      }
    } else {
      // Fallback для разработки
      setUser({
        id: 12345,
        first_name: "Test",
        last_name: "User",
        username: "testuser",
      })
    }
    setIsLoading(false)
  }

  const authenticateUser = async (initData: string) => {
    try {
      setIsAuthenticating(true)
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ initData }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("vs_lab_token", data.token)
      }
    } catch (error) {
      console.error("Authentication error:", error)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleStart = () => {
    router.push("/home")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <div className="animate-pulse text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0d6efd] to-[#6610f2] rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">VS</span>
          </div>
          <div className="text-[#666666] font-medium">Инициализация...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 fade-in-up">
        {/* VS_LAB Branding */}
        <div className="text-center">
          <div className="w-28 h-28 bg-gradient-to-br from-[#0d6efd] to-[#6610f2] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-3xl">VS</span>
          </div>
          <h1 className="text-4xl font-bold text-[#111111] mb-3">VS_LAB</h1>
          <p className="text-[#666666] font-medium">Лаборатория Архитектурных Решений</p>
        </div>

        {/* Welcome Card */}
        <Card className="bg-white border-0 shadow-xl card-hover">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-[#111111] mb-4">
              Добро пожаловать{user ? `, ${user.first_name}` : ""}!
            </h2>
            <p className="text-[#666666] mb-8 leading-relaxed text-lg">
              Цифровое пространство VS_LAB — место встречи архитектуры и технологий. Здесь вы найдете уникальные
              решения, ограниченные коллекции и знания.
            </p>

            {/* VS_LAB Values */}
            <div className="space-y-4 mb-8">
              {[
                "Системное мышление",
                "Радикальная эстетика",
                "Простота без упрощения",
                "Гибрид физического и цифрового",
              ].map((value, index) => (
                <div key={index} className="flex items-center text-[#666666] font-medium">
                  <div className="w-3 h-3 bg-[#0d6efd] rounded-full mr-4 flex-shrink-0"></div>
                  {value}
                </div>
              ))}
            </div>

            {user && (
              <div className="bg-[#f8f9fa] rounded-xl p-4 mb-6">
                <p className="text-sm text-[#666666] mb-1">Пользователь Telegram</p>
                <p className="font-semibold text-[#111111]">
                  {user.first_name} {user.last_name || ""}
                  {user.username && <span className="text-[#666666]"> (@{user.username})</span>}
                </p>
                <p className="text-xs text-[#666666] mt-1">ID: {user.id}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button
          onClick={handleStart}
          disabled={isAuthenticating}
          className="w-full bg-[#0d6efd] hover:bg-[#0b5ed7] text-white py-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
        >
          {isAuthenticating ? "Авторизация..." : "Войти в лабораторию"}
        </Button>

        <p className="text-sm text-[#666666] text-center leading-relaxed">
          Человеческое в технологичном • Архитектура будущего
        </p>
      </div>
    </div>
  )
}
