"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface LoginFormProps {
  campus: string
  onLoginSuccess: () => void
}

export function LoginForm({ campus, onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validate FPT email
    if (!email.includes("@fpt") && !email.includes("@student.fpt")) {
      setError("Please use your FPT email account (@fpt or @student.fpt)")
      setIsLoading(false)
      return
    }

    // Simulate login
    setTimeout(() => {
      if (email && password) {
        onLoginSuccess()
      } else {
        setError("Please fill in all fields")
      }
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold">
              FPT
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">Login</h1>
          <p className="text-sm text-muted-foreground">Campus: {campus}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              placeholder="your.email@fpt.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-4">Demo: Use any @fpt email with any password</p>
      </Card>
    </div>
  )
}
