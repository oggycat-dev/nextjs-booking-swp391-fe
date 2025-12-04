"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { useCampuses } from "@/hooks/use-campus"
import type { RegisterRequest } from "@/types"

interface RegisterFormProps {
  onRegisterSuccess: () => void
  onBackToLogin: () => void
}

export function RegisterForm({ onRegisterSuccess, onBackToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterRequest>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    campusId: "",
    role: "Student",
    department: "",
    major: "",
  })
  const [error, setError] = useState("")
  const router = useRouter()
  const { register, isLoading, error: authError } = useAuth()
  const { campuses, isLoading: campusesLoading } = useCampuses()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.fullName.trim()) {
      setError("Full name is required")
      return
    }

    if (!formData.email.trim() || !formData.email.includes("@fpt.edu.vn")) {
      setError("Please use your FPT email account (@fpt.edu.vn)")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required")
      return
    }

    if (!formData.campusId) {
      setError("Please select a campus")
      return
    }

    if (!formData.role || (formData.role !== "Student" && formData.role !== "Lecturer")) {
      setError("Please select a valid role")
      return
    }

    // Fix cứng major và department là undefined
    const registerData = {
      ...formData,
      department: undefined,
      major: undefined,
    }

    const result = await register(registerData)

    if (result) {
      // Show success message and redirect to login
      alert("Registration submitted successfully! Please wait for admin approval.")
      onBackToLogin()
    } else {
      setError(authError || "Registration failed. Please try again.")
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url('/FPT layout.png')` }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <Card className="w-full max-w-2xl p-8 relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-md max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <div className="w-32 h-32 rounded-2xl flex items-center justify-center">
              <img src="/logo.png" alt="FPT" className="w-28 h-28 object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Register
          </h1>
          <p className="text-sm text-muted-foreground">Create your account (requires admin approval)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nguyen Van A"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={isLoading}
                required
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email (@fpt.edu.vn) *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@fpt.edu.vn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                required
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                required
                minLength={8}
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={isLoading}
                required
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-semibold">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="0123456789"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                disabled={isLoading}
                required
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campus" className="text-sm font-semibold">Campus *</Label>
              <Select
                value={formData.campusId}
                onValueChange={(value) => setFormData({ ...formData, campusId: value })}
                disabled={isLoading || campusesLoading}
              >
                <SelectTrigger id="campus" className="h-11 border-2 focus:border-primary">
                  <SelectValue placeholder="Select campus" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.campusName} ({campus.campusCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as "Student" | "Lecturer" })}
                disabled={isLoading}
              >
                <SelectTrigger id="role" className="h-11 border-2 focus:border-primary">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Lecturer">Lecturer</SelectItem>
                </SelectContent>
              </Select>
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

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 border-2"
              onClick={onBackToLogin}
              disabled={isLoading}
            >
              Back to Login
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : (
                "Register"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            After registration, your account will be pending admin approval. You will be notified once approved.
          </p>
        </div>
      </Card>
    </div>
  )
}

