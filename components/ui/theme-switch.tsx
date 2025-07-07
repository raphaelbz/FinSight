'use client'

import React from 'react'
import { useTheme } from '@/components/providers/theme-provider'
import { Moon, Sun } from 'lucide-react'

export function ThemeSwitch() {
  const { theme, toggleTheme, isLoading } = useTheme()

  if (isLoading) {
    return (
      <div className="relative inline-flex h-10 w-20 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse">
        <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="group relative inline-flex h-10 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 p-1 transition-all duration-500 ease-in-out hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 theme-switch-glow"
      aria-label={`Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      {/* Track background */}
      <div className="absolute inset-1 rounded-full bg-white/50 dark:bg-gray-600/50 transition-all duration-500 ease-in-out"></div>
      
      {/* Sliding toggle */}
      <div 
        className={`absolute inset-y-1 h-8 w-8 rounded-full bg-white dark:bg-gray-200 shadow-lg transition-all duration-500 ease-in-out transform ${
          theme === 'light' 
            ? 'translate-x-0 left-1' 
            : 'translate-x-10 left-1'
        } group-hover:shadow-xl`}
      >
        {/* Sun icon */}
        <Sun 
          className={`absolute inset-0 h-full w-full p-2 text-amber-500 transition-all duration-500 ease-in-out ${
            theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-75'
          }`}
        />
        
        {/* Moon icon */}
        <Moon 
          className={`absolute inset-0 h-full w-full p-2 text-blue-600 transition-all duration-500 ease-in-out ${
            theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-75'
          }`}
        />
      </div>
      
      {/* Background gradient animation */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 dark:from-blue-900 dark:via-purple-900 dark:to-blue-900 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-30"></div>
      
      {/* Sparkle effects */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div className={`absolute h-1 w-1 rounded-full bg-amber-400 transition-all duration-700 ease-in-out ${
          theme === 'light' 
            ? 'top-2 left-3 opacity-100 animate-pulse' 
            : 'top-1 left-1 opacity-0'
        }`}></div>
        <div className={`absolute h-1 w-1 rounded-full bg-blue-400 transition-all duration-700 ease-in-out delay-100 ${
          theme === 'dark' 
            ? 'top-3 right-3 opacity-100 animate-pulse' 
            : 'top-1 right-1 opacity-0'
        }`}></div>
        <div className={`absolute h-0.5 w-0.5 rounded-full bg-purple-400 transition-all duration-700 ease-in-out delay-200 ${
          theme === 'dark' 
            ? 'top-2 right-5 opacity-100 animate-pulse' 
            : 'top-1 right-1 opacity-0'
        }`}></div>
      </div>
    </button>
  )
} 