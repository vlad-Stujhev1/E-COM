"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface VSCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function VSCard({ children, className, hover = true }: VSCardProps) {
  return <div className={cn("vs-card", hover && "hover:shadow-grid-lime", className)}>{children}</div>
}

interface VSCardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function VSCardHeader({ children, className }: VSCardHeaderProps) {
  return <div className={cn("border-b border-black pb-grid-2 mb-grid-2", className)}>{children}</div>
}

interface VSCardContentProps {
  children: React.ReactNode
  className?: string
}

export function VSCardContent({ children, className }: VSCardContentProps) {
  return <div className={cn("space-y-grid-2", className)}>{children}</div>
}

interface VSCardTitleProps {
  children: React.ReactNode
  className?: string
}

export function VSCardTitle({ children, className }: VSCardTitleProps) {
  return (
    <h3 className={cn("font-mono text-lg font-bold uppercase tracking-wider text-black", className)}>{children}</h3>
  )
}
