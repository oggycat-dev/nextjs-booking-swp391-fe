"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"

interface LoginFormProps {
  onLoginSuccess: () => void
  onSwitchToRegister?: () => void
}

export function LoginForm({ onLoginSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login, isLoading, error: authError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email.trim() || !password) {
      setError("Please fill in all fields")
      return
    }

    const trimmed = email.trim()
    
    // Validate FPT email format
    if (!trimmed.includes("@fpt.edu.vn")) {
      setError("Please use your FPT email account (@fpt.edu.vn)")
      return
    }

    const result = await login({ email: trimmed, password })
    
    if (result) {
      // onLoginSuccess will handle routing based on role
      onLoginSuccess()
    } else {
      setError(authError || "Login failed. Please check your credentials.")
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url('/FPT layout.png')` }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <Card className="w-full max-w-md p-8 relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-3 mb-6">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center">
              <img src="/logo.png" alt="FPT" className="w-16 h-16 object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-muted-foreground">FPT Education</h2>
              <h1 className="text-2xl font-bold text-foreground mt-1">FPT UNIVERSITY</h1>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Login
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="block text-sm font-semibold text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@fpt.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-11 border-2 focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="block text-sm font-semibold text-foreground">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11 border-2 focus:border-primary transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42L21 21M12 12l.01.01" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border space-y-3">
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Please use your FPT email account (@fpt.edu.vn) to login
          </p>
          {onSwitchToRegister && (
            <p className="text-xs text-center text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-primary hover:text-primary/80 font-semibold transition-colors underline"
              >
                Register here
              </button>
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
