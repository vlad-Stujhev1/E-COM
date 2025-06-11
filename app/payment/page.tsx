"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Smartphone, CheckCircle, AlertCircle } from "lucide-react"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
  category: string
}

export default function PaymentPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [selectedMethod, setSelectedMethod] = useState("telegram")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    loadCartData()
  }, [])

  const loadCartData = () => {
    const savedCart = localStorage.getItem("vs_lab_cart")
    if (savedCart) {
      const cart = JSON.parse(savedCart)
      setCartItems(cart)
      const totalAmount = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0)
      setTotal(totalAmount)
    } else {
      router.push("/home")
    }
  }

  const processPayment = async () => {
    if (cartItems.length === 0) return

    setIsProcessing(true)
    setPaymentStatus("processing")
    setErrorMessage("")

    try {
      // Имитация обработки платежа
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Успешная оплата
      setPaymentStatus("success")
      localStorage.removeItem("vs_lab_cart")

      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert("Оплата прошла успешно!")
      }

      setTimeout(() => {
        router.push("/profile")
      }, 2000)
    } catch (error) {
      setPaymentStatus("error")
      setErrorMessage("Ошибка обработки платежа")
    } finally {
      setIsProcessing(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Инструменты":
        return "🔧"
      case "Знания":
        return "📚"
      case "Решения":
        return "💡"
      case "Коллекции":
        return "📦"
      default:
        return "📄"
    }
  }

  if (paymentStatus === "success") {
    return (
      <div className="vs-section vs-container flex items-center justify-center min-h-[60vh]">
        <div className="vs-card p-8 text-center max-w-sm">
          <CheckCircle size={64} className="text-lime mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Оплата успешна!</h2>
          <p className="vs-text-muted mb-4">Спасибо за покупку в VS_LAB</p>
          <p className="text-sm vs-text-muted">Перенаправление в профиль...</p>
        </div>
      </div>
    )
  }

  if (paymentStatus === "error") {
    return (
      <div className="vs-section vs-container flex items-center justify-center min-h-[60vh]">
        <div className="vs-card p-8 text-center max-w-sm">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Ошибка оплаты</h2>
          <p className="vs-text-muted mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <button onClick={() => setPaymentStatus("idle")} className="vs-button w-full">
              Попробовать снова
            </button>
            <button onClick={() => router.push("/cart")} className="vs-button vs-button-outline w-full">
              Вернуться в корзину
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="vs-section">
      {/* Header */}
      <div className="px-4 py-3 border-b border-grey">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-grey-light rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-lg">Оплата</h1>
            <p className="text-sm vs-text-muted">Завершение заказа</p>
          </div>
        </div>
      </div>

      <div className="vs-container space-y-6">
        {/* Order Summary */}
        <div className="vs-card">
          <div className="p-4 border-b border-grey">
            <h3 className="font-semibold">Ваш заказ</h3>
          </div>
          <div className="p-4 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-grey-light rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{getCategoryIcon(item.category)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs vs-text-muted">Количество: {item.quantity}</p>
                </div>
                <span className="vs-text-mono font-bold text-lime">
                  {(item.price * item.quantity).toLocaleString()} ₽
                </span>
              </div>
            ))}
            <div className="border-t border-grey pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Итого:</span>
                <span className="vs-text-mono font-bold text-xl">{total.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="vs-card">
          <div className="p-4 border-b border-grey">
            <h3 className="font-semibold">Способ оплаты</h3>
          </div>
          <div className="p-4 space-y-3">
            <div
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedMethod === "telegram" ? "border-lime bg-lime/10" : "border-grey hover:border-grey-dark"
              }`}
              onClick={() => setSelectedMethod("telegram")}
            >
              <Smartphone size={20} className="mr-3 text-grey-dark" />
              <div className="flex-1">
                <p className="font-medium">Telegram Payments</p>
                <p className="text-sm vs-text-muted">Быстрая и безопасная оплата</p>
              </div>
              <div
                className={`w-5 h-5 border-2 rounded-full ${
                  selectedMethod === "telegram" ? "border-lime bg-lime" : "border-grey-dark"
                }`}
              >
                {selectedMethod === "telegram" && <div className="w-full h-full bg-white rounded-full scale-50"></div>}
              </div>
            </div>

            <div className="flex items-center p-3 border border-grey rounded-lg opacity-50">
              <CreditCard size={20} className="mr-3 text-grey-dark" />
              <div className="flex-1">
                <p className="font-medium">Банковская карта</p>
                <p className="text-sm vs-text-muted">Скоро будет доступно</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="vs-card border-red-200 bg-red-50">
            <div className="p-4 flex items-center">
              <AlertCircle size={20} className="text-red-500 mr-2" />
              <p className="text-red-800 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={processPayment}
          disabled={isProcessing || cartItems.length === 0}
          className="vs-button w-full py-4 text-lg disabled:opacity-50"
        >
          {paymentStatus === "processing" ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
              Обработка платежа...
            </div>
          ) : (
            `Оплатить ${total.toLocaleString()} ₽`
          )}
        </button>

        <p className="text-xs vs-text-muted text-center leading-relaxed">
          Нажимая "Оплатить", вы соглашаетесь с условиями использования VS_LAB
        </p>
      </div>

      {/* Bottom spacing */}
      <div className="h-20"></div>
    </div>
  )
}
