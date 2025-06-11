"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Package, Calendar, ExternalLink, LogOut } from "lucide-react"

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
}

interface Order {
  id: number
  date: string
  total: number
  status: "pending" | "completed" | "cancelled" | "processing"
  items: Array<{
    id: number
    name: string
    quantity: number
    price: number
  }>
}

export default function ProfilePage() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    initializeUser()
    loadOrders()
  }, [])

  const initializeUser = () => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const userData = window.Telegram.WebApp.initDataUnsafe?.user
      if (userData) {
        setUser(userData)
      }
    } else {
      setUser({
        id: 12345,
        first_name: "Тест",
        last_name: "Пользователь",
        username: "testuser",
      })
    }
    setIsLoading(false)
  }

  const loadOrders = async () => {
    // Mock orders
    const mockOrders: Order[] = [
      {
        id: 1,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        total: 18500,
        status: "completed",
        items: [
          { id: 1, name: "Архитектурный скетчбук", quantity: 1, price: 2500 },
          { id: 2, name: "Цифровой курс: Системное мышление", quantity: 1, price: 15000 },
        ],
      },
      {
        id: 2,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        total: 3500,
        status: "processing",
        items: [{ id: 4, name: "VS_LAB Manifesto", quantity: 1, price: 3500 }],
      },
    ]
    setOrders(mockOrders)
  }

  const handleLogout = () => {
    const confirmLogout = () => {
      localStorage.clear()
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.close()
      } else {
        router.push("/welcome")
      }
    }

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showConfirm("Выйти из аккаунта?", (confirmed) => {
        if (confirmed) confirmLogout()
      })
    } else {
      if (confirm("Выйти из аккаунта?")) {
        confirmLogout()
      }
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Выполнен"
      case "processing":
        return "Обрабатывается"
      case "pending":
        return "Ожидает"
      case "cancelled":
        return "Отменен"
      default:
        return "Неизвестно"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const totalSpent = orders.filter((order) => order.status === "completed").reduce((sum, order) => sum + order.total, 0)

  if (isLoading) {
    return (
      <div className="vs-section vs-container text-center py-12">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-grey rounded-full mx-auto mb-4"></div>
          <div className="text-grey-dark">Загрузка профиля...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="vs-section">
      {/* User Profile */}
      <div className="vs-container">
        <div className="vs-profile-header">
          <div className="vs-profile-avatar">
            <User size={32} className="text-black" />
          </div>
          <h2 className="vs-profile-name">
            {user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Пользователь"}
          </h2>
          {user?.username && <p className="vs-profile-username">@{user.username}</p>}
          <div className="text-xs vs-text-mono vs-text-muted mt-2">ID: {user?.id || "12345"}</div>

          {/* Stats */}
          <div className="vs-profile-stats">
            <div className="vs-profile-stat">
              <div className="vs-profile-stat-value">{orders.length}</div>
              <div className="vs-profile-stat-label">Заказов</div>
            </div>
            <div className="vs-profile-stat">
              <div className="vs-profile-stat-value">{totalSpent.toLocaleString()}</div>
              <div className="vs-profile-stat-label">₽ потрачено</div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="vs-container">
        <div className="vs-card">
          <div className="p-4 border-b border-grey">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-grey-dark" />
              <h3 className="font-semibold">Мои заказы</h3>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="p-6 text-center">
              <Package size={32} className="text-grey-dark mx-auto mb-3" />
              <p className="text-grey-dark mb-4">Заказов пока нет</p>
              <button onClick={() => router.push("/home")} className="vs-button text-sm">
                Начать покупки
              </button>
            </div>
          ) : (
            <div className="divide-y divide-grey">
              {orders.map((order) => (
                <div key={order.id} className="vs-order-item">
                  <div className="vs-order-header">
                    <div>
                      <div className="vs-order-id">Заказ #{order.id}</div>
                      <div className="vs-order-date flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(order.date)}
                      </div>
                    </div>
                    <div>
                      <div className="vs-order-total">{order.total.toLocaleString()} ₽</div>
                      <div className={`vs-order-status ${order.status}`}>{getStatusText(order.status)}</div>
                    </div>
                  </div>

                  <div className="border-t border-grey pt-3">
                    <div className="text-xs vs-text-muted mb-2">Товары:</div>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span className="vs-text-mono">{(item.price * item.quantity).toLocaleString()} ₽</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="vs-container space-y-3">
        <div className="vs-card p-4 hover:bg-grey-light transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Канал VS_LAB</div>
              <div className="text-sm vs-text-muted">Новости и обновления</div>
            </div>
            <ExternalLink size={16} className="text-grey-dark" />
          </div>
        </div>

        <div className="vs-card p-4 hover:bg-grey-light transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Поддержка</div>
              <div className="text-sm vs-text-muted">Помощь и вопросы</div>
            </div>
            <ExternalLink size={16} className="text-grey-dark" />
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="vs-container">
        <button
          onClick={handleLogout}
          className="vs-button vs-button-outline w-full text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut size={16} className="mr-2" />
          Выйти из аккаунта
        </button>
      </div>

      {/* Bottom spacing */}
      <div className="h-20"></div>
    </div>
  )
}
