import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "bordered";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-200",
        variant === "default" && "bg-white dark:bg-surface-900 shadow-sm",
        variant === "glass" && "glass shadow-lg",
        variant === "bordered" && "bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        padding === "none" && "p-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}