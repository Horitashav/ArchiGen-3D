import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variant === "default" && "bg-surface-100 text-zinc-700 dark:bg-surface-800 dark:text-zinc-300",
        variant === "success" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        variant === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        variant === "error" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        variant === "info" && "bg-architect-100 text-architect-800 dark:bg-architect-900/30 dark:text-architect-400",
        className
      )}
    >
      {children}
    </span>
  );
}