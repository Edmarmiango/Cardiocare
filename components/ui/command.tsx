"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {}
const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("border rounded-lg bg-white p-2 shadow-sm border-primary/40", className)}
        {...props}
      />
    )
  },
)
Command.displayName = "Command"

interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void
  value?: string
}
const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, onValueChange, value, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        placeholder="Pesquisar..."
        className={cn(
          "w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary border-primary/40 rounded-lg",
          className,
        )}
        {...props}
      />
    )
  },
)
CommandInput.displayName = "CommandInput"

interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}
const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-2 max-h-60 overflow-auto rounded-md border border-primary/40 rounded-lg", className)}
        {...props}
      />
    )
  },
)
CommandList.displayName = "CommandList"

interface CommandItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  onSelect?: () => void
}
const CommandItem = React.forwardRef<HTMLLIElement, CommandItemProps>(
  ({ children, className, onSelect, ...props }, ref) => {
    return (
      <li
        ref={ref}
        onClick={(e) => {
          e.preventDefault() // <-- ESSENCIAL para não submeter o formulário
          onSelect?.()
        }}
        className={cn(
          "cursor-pointer px-3 py-2 text-sm hover:bg-blue-100",
          className,
        )}
        {...props}
      >
        {children}
      </li>
    )
  },
)
CommandItem.displayName = "CommandItem"

export { Command, CommandInput, CommandList, CommandItem }
