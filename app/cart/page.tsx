"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  category: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const router = useRouter()

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    const savedCart = localStorage.getItem("vs_lab_cart")
    if (savedCart) {
      const cart = JSON.parse(savedCart)
      setCartItems(cart)
      calculateTotal(cart)
    }
  }

  const calculateTotal = (items: CartItem[]) => {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotal(totalAmount)
  }

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id)
      return
    }

    const updatedCart = cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))

    setCartItems(updatedCart)
    localStorage.setItem("vs_lab_cart", JSON.stringify(updatedCart))
    calculateTotal(updatedCart)
    window.dispatchEvent(new Event("storage"))
  }

  const removeItem = (id: number) => {
    const updatedCart = cartItems.filter((item) => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem("vs_lab_cart", JSON.stringify(updatedCart))
    calculateTotal(updatedCart)
    window.dispatchEvent(new Event("storage"))
  }

  const proceedToPayment = () => {
    if (cartItems.length === 0) return
    router.push("/payment")
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

  return (
    <div className="vs-section">
      {cartItems.length === 0 ? (
        <div className="vs-container text-center py-12">
          <div className="w-20 h-20 bg-grey rounded-full mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag size={32} className="text-grey-dark" />
          </div>
          <h3 className="text-xl font-bold mb-2">Корзина пуста</h3>
          <p className="text-grey-dark mb-6">Добавьте товары из каталога</p>
          <button onClick={() => router.push("/home")} className="vs-button">
            Перейти к покупкам
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="vs-container space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="vs-cart-item">
                {/* Item Image */}
                <div className="vs-cart-image">
                  <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                </div>

                {/* Item Content */}
                <div className="vs-cart-content">
                  <h4 className="vs-cart-title">{item.name}</h4>
                  <div className="vs-cart-price">{item.price.toLocaleString()} ₽</div>
                  <div className="text-xs text-grey-dark">{item.category}</div>
                </div>

                {/* Quantity Controls */}
                <div className="vs-cart-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="vs-quantity-btn">
                    <Minus size={14} />
                  </button>
                  <span className="vs-quantity">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="vs-quantity-btn">
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="vs-quantity-btn text-red-500 hover:text-red-700 ml-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total & Checkout */}
          <div className="vs-container">
            <div className="vs-card p-6 bg-lime">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Итого:</span>
                <span className="vs-text-mono font-bold text-2xl">{total.toLocaleString()} ₽</span>
              </div>
              <button onClick={proceedToPayment} className="vs-button vs-button-secondary w-full">
                Перейти к оплате
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom spacing */}
      <div className="h-20"></div>
    </div>
  )
}
