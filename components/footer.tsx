'use client';
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  
  if (pathname !== "/") {
    return null;
  }

  return (
    <footer className="bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Copyright © 2025 Toshinori BAN
        </div>
      </div>
    </footer>
  )
} 