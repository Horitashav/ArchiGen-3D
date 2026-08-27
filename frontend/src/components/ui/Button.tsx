import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantStyles = {
  primary:
    "bg-architect-500 text-white hover:bg-architect-600 active:bg-architect-700 shadow-lg shadow-architect-500/25",
  secondary:
    "bg-surface-100 text-zinc-900 hover:bg-surface-200 dark:bg-surface-800 dark:text-zinc-100 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700",
  ghost:
    "bg-transparent text-zinc-600 hover:bg-surface-100 dark:text-zinc-400 dark:hover:bg-surface-800",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-8 py-3.5 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-architect-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";