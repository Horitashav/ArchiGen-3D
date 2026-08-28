"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.username.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/login");
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-architect-500 text-white flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hidden sm:block">
          {user.username}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-lg py-1 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {user.full_name || user.username}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}