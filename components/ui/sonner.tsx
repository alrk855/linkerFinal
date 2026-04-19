"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-card group-[.toaster]:rounded-xl px-4 py-3 gap-3",
          description: "group-[.toast]:text-foreground-muted",
          actionButton:
            "group-[.toast]:bg-accent group-[.toast]:text-white font-medium rounded-md",
          cancelButton:
            "group-[.toast]:bg-surface-raised group-[.toast]:text-foreground-muted rounded-md",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
