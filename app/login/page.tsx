"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TrendingUp, Mail, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simple authentication - check for test/test
    if (email === "test" && password === "test") {
      // Simulate loading
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } else {
      setIsLoading(false)
      setError("Identifiants incorrects. Utilisez: test / test")
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false
      })
      
      if (result?.error) {
        setError("Erreur lors de la connexion avec Google")
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      setError("Erreur lors de la connexion avec Google")
    }
  }

  const handleBackToHome = () => {
    console.log("Retour clicked") // Debug
    window.location.href = "/"
  }
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* Back to home button */}
      <div className="absolute top-6 left-6 z-50">
        <Button 
          variant="ghost" 
          onClick={handleBackToHome}
          type="button"
          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200 cursor-pointer border border-transparent hover:border-gray-200 rounded-lg px-3 py-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour</span>
        </Button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Logo section */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
                <div className="absolute inset-0 bg-blue-400/20 rounded-xl blur-sm animate-pulse-subtle"></div>
              </div>
              <h1 className="text-2xl font-bold gradient-text-hero">FinSight</h1>
            </div>
            <p className="text-gray-600 text-sm">Connectez-vous à votre tableau de bord</p>
          </div>

          {/* Login card */}
          <Card className="p-8 animate-fade-in-up border-gray-200 shadow-lg bg-white">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Se connecter</h2>
                <p className="text-sm text-gray-600">Choisissez votre méthode de connexion</p>
              </div>

              {/* Google Sign In */}
              <Button 
                variant="outline" 
                onClick={handleGoogleSignIn}
                className="w-full h-12 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-gray-700 font-medium">Continuer avec Google</span>
                </div>
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">ou</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Nom d'utilisateur
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="test"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="test"
                      required
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-500 text-center p-2 bg-blue-50 rounded-lg">
                  💡 Utilisez <strong>test</strong> / <strong>test</strong> pour vous connecter
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-gray-600">Se souvenir de moi</span>
                  </label>
                  <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
                    Mot de passe oublié ?
                  </a>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>

              {/* Sign up link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Pas encore de compte ?{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                    Créer un compte
                  </a>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 