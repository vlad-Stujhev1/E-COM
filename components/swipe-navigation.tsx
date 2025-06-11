"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface SwipeNavigationProps {
  children: React.ReactNode
}

export default function SwipeNavigation({ children }: SwipeNavigationProps) {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [translateX, setTranslateX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Определяем порядок страниц для свайпов
  const pages = ["/home", "/cart", "/profile"]
  const currentPageIndex = pages.indexOf(pathname)

  const handleTouchStart = (e: TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setCurrentX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return

    setCurrentX(e.touches[0].clientX)
    const deltaX = e.touches[0].clientX - startX

    // Ограничиваем перемещение
    const maxTranslate = 100
    const limitedDelta = Math.max(-maxTranslate, Math.min(maxTranslate, deltaX))
    setTranslateX(limitedDelta)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    const deltaX = currentX - startX
    const threshold = 50 // Минимальное расстояние для срабатывания свайпа

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && currentPageIndex > 0) {
        // Свайп вправо - предыдущая страница
        router.push(pages[currentPageIndex - 1])
      } else if (deltaX < 0 && currentPageIndex < pages.length - 1) {
        // Свайп влево - следующая страница
        router.push(pages[currentPageIndex + 1])
      }
    }

    setIsDragging(false)
    setTranslateX(0)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("touchstart", handleTouchStart, { passive: true })
    container.addEventListener("touchmove", handleTouchMove, { passive: true })
    container.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, startX, currentPageIndex])

  return (
    <div
      ref={containerRef}
      className="h-full transition-transform duration-200 ease-out"
      style={{
        transform: `translateX(${translateX}px)`,
        opacity: isDragging ? 0.9 : 1,
      }}
    >
      {children}
    </div>
  )
}
