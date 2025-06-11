"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface VSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

export function VSButton({ variant = "primary", size = "md", className, children, ...props }: VSButtonProps) {
  const baseClasses = "vs-button"

  const variantClasses = {
    primary: "",
    secondary: "vs-button-secondary",
    outline: "vs-button-outline",
    danger: "bg-black text-lime hover:bg-dark-grey",
  }

  const sizeClasses = {
    sm: "px-grid-2 py-grid text-xs min-h-[36px]",
    md: "px-grid-3 py-grid-2 text-sm min-h-[44px]",
    lg: "px-grid-4 py-grid-3 text-base min-h-[52px]",
  }

  return (
    <button className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)} {...props}>
      {children}
    </button>
  )
}
