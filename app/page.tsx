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
}

export default function WelcomePage() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      // Set theme colors
      tg.setHeaderColor("#f9f9f9")
      tg.setBackgroundColor("#f9f9f9")

      // Get user data
      const userData = tg.initDataUnsafe?.user
      if (userData) {
        setUser(userData)
      }

      setIsLoading(false)
    } else {
      // Fallback for development
      setUser({
        id: 12345,
        first_name: "Test",
        last_name: "User",
      })
      setIsLoading(false)
    }
  }, [])

  const handleStart = () => {
    router.push("/home")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-[#0d6efd] rounded-full mx-auto mb-4"></div>
          <div className="text-center text-[#666666]">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* VS_LAB Logo */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#0d6efd] to-[#6610f2] rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">VS</span>
          </div>
          <h1 className="text-3xl font-bold text-[#111111] mb-2">VS_LAB</h1>
          <p className="text-[#666666] text-sm">Лаборатория Архитектурных Решений</p>
        </div>

        {/* Welcome Card */}
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-[#111111] mb-4">
              Добро пожаловать{user ? `, ${user.first_name}` : ""}!
            </h2>
            <p className="text-[#666666] mb-6 leading-relaxed">
              Цифровое пространство VS_LAB — место встречи архитектуры и технологий. Здесь вы найдете уникальные
              решения, ограниченные коллекции и знания.
            </p>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-[#666666]">
                <div className="w-2 h-2 bg-[#0d6efd] rounded-full mr-3"></div>
                Системное мышление
              </div>
              <div className="flex items-center text-sm text-[#666666]">
                <div className="w-2 h-2 bg-[#0d6efd] rounded-full mr-3"></div>
                Радикальная эстетика
              </div>
              <div className="flex items-center text-sm text-[#666666]">
                <div className="w-2 h-2 bg-[#0d6efd] rounded-full mr-3"></div>
                Простота без упрощения
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button
          onClick={handleStart}
          className="w-full bg-[#0d6efd] hover:bg-[#0b5ed7] text-white py-4 rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-[1.02]"
        >
          Войти в лабораторию
        </Button>

        <p className="text-xs text-[#666666] text-center">
          Гибрид физического и цифрового • Человеческое в технологичном
        </p>
      </div>
    </div>
  )
}
