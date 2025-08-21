"use client"

import * as React from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed inset-x-0 bottom-0 z-[100] flex max-h-screen w-full flex-col gap-3 p-4 sm:right-0 sm:inset-x-auto md:bottom-4 md:right-4 md:max-w-[420px] pointer-events-none",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  [
    "group pointer-events-auto relative w-full overflow-hidden",
    // Softer glass in light mode; unchanged richness in dark mode
    "rounded-2xl border border-white/15 bg-white/12 dark:bg-black/20 backdrop-blur-md",
    // layout
    "flex items-start gap-3 p-4 pr-10 shadow-[0_8px_32px_rgba(2,6,23,0.12)] dark:shadow-[0_12px_48px_rgba(2,6,23,0.35)]",
    // aurora accent bar (less intense in light)
    "before:absolute before:inset-y-0 before:left-0 before:w-1.5",
    "before:bg-gradient-to-b before:from-blue-500 before:via-indigo-400 before:to-violet-400",
    "before:opacity-55 dark:before:opacity-80",
    // open/close & swipe animations
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
    "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-8",
    "data-[state=open]:slide-in-from-bottom-6 sm:data-[state=open]:slide-in-from-bottom-4 md:data-[state=open]:slide-in-from-right-6",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "text-slate-800 dark:text-white ring-1 ring-inset ring-white/10 dark:ring-white/15",
        destructive: cn(
          "text-rose-900 dark:text-rose-50",
          "border-rose-300/30 bg-rose-500/12 dark:bg-rose-500/25",
          "before:from-rose-500 before:via-rose-400 before:to-red-500",
          "shadow-[0_8px_28px_rgba(225,29,72,0.18)]"
        ),
      },
    },
    defaultVariants: { variant: "default" },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
))
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      [
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md px-3 text-xs md:text-sm font-medium",
        // Softer glass button for light; richer for dark
        "border border-white/20 bg-white/15 dark:bg-white/10 backdrop-blur-md",
        "text-slate-800 dark:text-white",
        "transition-colors hover:bg-white/22 dark:hover:bg-white/15 focus:outline-none focus:ring-1 focus:ring-white/25",
        "group-[.destructive]:border-white/25 group-[.destructive]:bg-white/12 group-[.destructive]:hover:bg-white/18",
      ].join(" "),
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      [
        "absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full",
        "text-slate-700/80 hover:text-slate-900 dark:text-slate-200/85 dark:hover:text-white",
        "bg-white/70 hover:bg-white/85 dark:bg-white/10 dark:hover:bg-white/20",
        "border border-white/35 backdrop-blur-md",
        "opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100 focus:outline-none",
      ].join(" "),
      className
    )}
    toast-close=""
    {...props}
  >
    <Cross2Icon className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      "text-sm md:text-base font-semibold leading-snug text-slate-800 dark:text-white",
      className
    )}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn(
      "text-xs md:text-sm leading-relaxed text-slate-600 dark:text-slate-300",
      className
    )}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
