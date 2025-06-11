import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Script from "next/script"
import { VSNavigation } from "@/components/vs-navigation"
import SwipeNavigation from "@/components/swipe-navigation"

export const metadata: Metadata = {
  title: "VS_LAB | Архитектурные решения",
  description: "Цифровое пространство VS_LAB — лаборатория архитектурных решений",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="bg-white text-black overflow-x-hidden">
        <div className="min-h-screen">
          <VSNavigation />
          <SwipeNavigation>
            <main className="safe-bottom">{children}</main>
          </SwipeNavigation>
        </div>
      </body>
    </html>
  )
}
