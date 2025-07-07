"use client"

import { Button } from "@/components/ui/button"
import { TrendingUp, Menu } from "lucide-react"
import Link from "next/link"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/95 border-b border-gray-100 animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        
        <div className="flex items-center justify-between h-20 relative z-10">
          {/* Logo */}
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl group-hover:rounded-2xl transition-all duration-500 group-hover:shadow-lg group-hover:shadow-blue-600/25 group-hover:scale-105">
              <TrendingUp className="h-6 w-6 text-white transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-60 transition-all duration-500 -z-10 blur-lg scale-110"></div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md animate-pulse-subtle"></div>
              <div className="absolute inset-0 rounded-xl bg-blue-400/20 opacity-50 blur-sm animate-pulse-subtle"></div>
            </div>
            <div className="flex flex-col group-hover:translate-x-1 transition-transform duration-300">
              <span className="text-xl font-bold font-poppins text-gray-900 group-hover:text-blue-600 transition-all duration-300 group-hover:tracking-wide">
                FinSight
              </span>
              <span className="text-xs text-gray-500 font-medium group-hover:text-blue-500 transition-colors duration-300">Finance IA</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <a href="#features" className="relative group px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <span className="relative z-10">Fonctionnalités</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></div>
              <div className="absolute inset-0 bg-blue-600/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </a>
            <a href="#about" className="relative group px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <span className="relative z-10">À propos</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></div>
              <div className="absolute inset-0 bg-blue-600/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </a>
            <a href="#pricing" className="relative group px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <span className="relative z-10">Tarifs</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></div>
              <div className="absolute inset-0 bg-blue-600/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </a>
            <a href="#contact" className="relative group px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <span className="relative z-10">Contact</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></div>
              <div className="absolute inset-0 bg-blue-600/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden md:flex text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors duration-200">
                Se connecter
              </Button>
            </Link>
            
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 font-medium transition-all duration-200 hover:shadow-lg">
              Essai gratuit
            </Button>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="lg:hidden p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 