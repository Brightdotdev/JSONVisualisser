"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 12,   // gap to the right of parent
  alignOffset = -4,   // nudge downward
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        side="right"             // lock to right side
        align="center"           // vertical middle
        sideOffset={sideOffset}  // horizontal gap
        alignOffset={alignOffset} // vertical nudge
        avoidCollisions={false}  // don’t auto-flip
        className={cn(
          "bg-card text-foreground animate-in fade-in-0 zoom-in-95 " +
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 " +
          "data-[state=closed]:zoom-out-95 data-[side=right]:slide-in-from-left-2 " +
          "z-50 max-w-sm max-h-64 overflow-auto rounded-md px-3 py-1.5 text-xs text-balance shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}



export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
