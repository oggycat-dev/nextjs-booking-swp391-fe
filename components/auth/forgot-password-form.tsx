"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"

interface ForgotPasswordFormProps {
  onSuccess: (email: string) => void
  onBackToLogin: () => void
}

export function ForgotPasswordForm({ onSuccess, onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [validationError, setValidationError] = useState("")
  const { forgotPassword, isLoading, error: authError, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError("")
    clearError()
    
    if (!email.trim()) {
      setValidationError("Please enter your email address")
      return
    }

    const trimmed = email.trim()
    
    // Validate FPT email format
    if (!trimmed.includes("@fpt.edu.vn")) {
      setValidationError("Please use your FPT email account (@fpt.edu.vn)")
      return
    }

    const success = await forgotPassword({ email: trimmed })
    
    if (success) {
      // Success - move to reset password step
      onSuccess(trimmed)
    }
  }

  const error = validationError || authError

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url('/FPT layout.png')` }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <Card className="w-full max-w-md p-8 relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <div className="w-32 h-32 rounded-2xl flex items-center justify-center">
              <img src="/logo.png" alt="FPT" className="w-28 h-28 object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Forgot Password
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your email address and we'll send you a verification code to reset your password.
          </p>
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
                Sending code...
              </span>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border space-y-3">
          <p className="text-xs text-center text-muted-foreground">
            Remember your password?{" "}
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-primary hover:text-primary/80 font-semibold transition-colors underline"
            >
              Back to Login
            </button>
          </p>
        </div>
      </Card>
    </div>
  )
}

