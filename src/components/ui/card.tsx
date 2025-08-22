"use client"

import * as React from "react"

type DivProps = React.HTMLAttributes<HTMLDivElement>

export function Card(props: DivProps) {
  return (
    <div
      className={[
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors",
        "hover:border-primary/30 hover:shadow-md",
        props.className,
      ].join(" ")}
      {...props}
    />
  )
}

export function CardHeader(props: DivProps) {
  return <div className={["flex flex-col space-y-1.5 p-6", props.className].join(" ")} {...props} />
}

export function CardTitle({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={["text-2xl font-semibold leading-none tracking-tight", className].join(" ")} {...props} />
}

export function CardDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={["text-sm text-muted-foreground", props.className].join(" ")} {...props} />
}

export function CardContent(props: DivProps) {
  return <div className={["p-6 pt-0", props.className].join(" ")} {...props} />
}


