"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ShoppingCart, User, Home } from "lucide-react"

export function VSNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    updateCartCount()
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
    <nav className="vs-nav safe-top">
      <div className="vs-nav-content">
        {/* Logo */}
        <div className="vs-logo">VS_LAB</div>

        {/* Navigation Actions */}
        <div className="vs-nav-actions">
          <button onClick={() => router.push("/home")} className={`vs-nav-button ${isActive("/home") ? "active" : ""}`}>
            <Home size={20} />
          </button>

          <button
            onClick={() => router.push("/cart")}
            className={`vs-nav-button relative ${isActive("/cart") ? "active" : ""}`}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="vs-badge">{cartCount}</span>}
          </button>

          <button
            onClick={() => router.push("/profile")}
            className={`vs-nav-button ${isActive("/profile") ? "active" : ""}`}
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </nav>
  )
}
