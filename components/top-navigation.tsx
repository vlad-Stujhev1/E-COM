"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, Home } from "lucide-react"
import { useEffect, useState } from "react"

export default function TopNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    updateCartCount()

    // Обновляем счетчик при изменении localStorage
    const handleStorageChange = () => updateCartCount()
    window.addEventListener("storage", handleStorageChange)

    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const updateCartCount = () => {
    const savedCart = localStorage.getItem("vs_lab_cart")
    if (savedCart) {
      const cart = JSON.parse(savedCart)
      setCartCount(cart.length)
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0d6efd] to-[#6610f2] rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">VS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#111111]">VS_LAB</h1>
              <p className="text-xs text-[#666666]">Витрина решений</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/home")}
              className={`p-2 ${
                isActive("/home")
                  ? "bg-[#0d6efd] text-white hover:bg-[#0b5ed7]"
                  : "text-[#666666] hover:text-[#111111] hover:bg-gray-100"
              }`}
            >
              <Home className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/cart")}
              className={`p-2 relative ${
                isActive("/cart")
                  ? "bg-[#0d6efd] text-white hover:bg-[#0b5ed7]"
                  : "text-[#666666] hover:text-[#111111] hover:bg-gray-100"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/profile")}
              className={`p-2 ${
                isActive("/profile")
                  ? "bg-[#0d6efd] text-white hover:bg-[#0b5ed7]"
                  : "text-[#666666] hover:text-[#111111] hover:bg-gray-100"
              }`}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Page Indicators */}
        <div className="flex justify-center mt-3 space-x-2">
          {["/home", "/cart", "/profile"].map((path, index) => (
            <div
              key={path}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                pathname === path ? "bg-[#0d6efd] w-6" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
