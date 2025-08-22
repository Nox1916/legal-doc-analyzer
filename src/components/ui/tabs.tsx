"use client"

import * as React from "react"

type TabsContextValue = {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

type TabsProps = {
  value: string
  onValueChange: (value: string) => void
  className?: string
  children: React.ReactNode
}

export function Tabs({ value, onValueChange, className = "", children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={["inline-grid grid-flow-col auto-cols-fr gap-2 rounded-md bg-muted p-1", className].join(" ")}
      {...props}
    />
  )
}

export function TabsTrigger({ value, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  const isActive = ctx?.value === value
  const base = "px-3 py-1.5 text-sm rounded-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  const active = isActive ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={[base, active, className].join(" ")}
      onClick={() => ctx?.onValueChange(value)}
      {...props}
    />
  )
}

export function TabsContent({ value, className = "", ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  if (ctx?.value !== value) return null
  return <div className={className} {...props} />
}


