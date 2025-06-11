"use client"

import { useEffect, useState } from "react"
import { VSProductCard } from "@/components/vs-product-card"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  limited?: boolean
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState("Все")

  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: 1,
        name: "Архитектурный скетчбук",
        description: "Лимитированная серия блокнотов для архитектурных зарисовок с уникальной разметкой",
        price: 2500,
        image: "/placeholder.svg?height=200&width=200",
        category: "Инструменты",
        limited: true,
      },
      {
        id: 2,
        name: "Цифровой курс: Системное мышление",
        description: "Онлайн-курс по развитию системного подхода в проектировании от основателя VS_LAB",
        price: 15000,
        image: "/placeholder.svg?height=200&width=200",
        category: "Знания",
      },
      {
        id: 3,
        name: "Модульная система хранения",
        description: "Концептуальное решение для организации пространства на основе принципов VS_LAB",
        price: 45000,
        image: "/placeholder.svg?height=200&width=200",
        category: "Решения",
      },
      {
        id: 4,
        name: "VS_LAB Manifesto",
        description: "Книга о философии и методологии лаборатории. Ограниченный тираж 500 экземпляров",
        price: 3500,
        image: "/placeholder.svg?height=200&width=200",
        category: "Знания",
        limited: true,
      },
      {
        id: 5,
        name: "Конструктор модулей",
        description: "Физический набор для понимания принципов модульного дизайна",
        price: 8500,
        image: "/placeholder.svg?height=200&width=200",
        category: "Инструменты",
      },
      {
        id: 6,
        name: "Коллекция цифровых решений",
        description: "Кураторская подборка цифровых архитектурных решений и шаблонов",
        price: 12000,
        image: "/placeholder.svg?height=200&width=200",
        category: "Коллекции",
      },
    ]

    setProducts(mockProducts)
  }, [])

  const addToCart = (product: Product) => {
    const savedCart = localStorage.getItem("vs_lab_cart")
    const cart = savedCart ? JSON.parse(savedCart) : []

    const existingItem = cart.find((item: any) => item.id === product.id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }

    localStorage.setItem("vs_lab_cart", JSON.stringify(cart))

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(`${product.name} добавлен в корзину`)
    }

    window.dispatchEvent(new Event("storage"))
  }

  const categories = ["Все", "Инструменты", "Знания", "Решения", "Коллекции"]

  const filteredProducts =
    selectedCategory === "Все" ? products : products.filter((product) => product.category === selectedCategory)

  return (
    <div className="vs-section">
      {/* Categories */}
      <div className="px-4 py-4 border-b border-grey">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                category === selectedCategory
                  ? "bg-lime text-black"
                  : "bg-grey text-grey-dark hover:bg-grey-dark hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="vs-product-grid">
        {filteredProducts.map((product) => (
          <VSProductCard key={product.id} product={product} onAddToCart={addToCart} />
        ))}
      </div>

      {/* Bottom spacing */}
      <div className="h-20"></div>
    </div>
  )
}
