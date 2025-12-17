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
import { CheckCircle2 } from "lucide-react"

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const router = useRouter()
  const { register, isLoading, error: authError } = useAuth()
  const { campuses, isLoading: campusesLoading } = useCampuses()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation - matching backend RegisterCommandValidator
    // Full Name validation
    if (!formData.fullName.trim()) {
      setError("Full name is required")
      return
    }
    if (formData.fullName.length > 100) {
      setError("Full name cannot exceed 100 characters")
      return
    }

    // Email validation
    if (!formData.email.trim()) {
      setError("Email is required")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format")
      return
    }
    if (!formData.email.toLowerCase().endsWith("@fpt.edu.vn")) {
      setError("Email must be @fpt.edu.vn domain")
      return
    }

    // Password validation
    if (!formData.password) {
      setError("Password is required")
      return
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter")
      return
    }
    if (!/[a-z]/.test(formData.password)) {
      setError("Password must contain at least one lowercase letter")
      return
    }
    if (!/[0-9]/.test(formData.password)) {
      setError("Password must contain at least one number")
      return
    }
    if (!/[@$!%*?&#]/.test(formData.password)) {
      setError("Password must contain at least one special character (@$!%*?&#)")
      return
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      setError("Confirm password is required")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required")
      return
    }
    if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      setError("Phone number must be 10-11 digits")
      return
    }

    // Campus validation
    if (!formData.campusId) {
      setError("Campus is required")
      return
    }

    // Role validation
    if (!formData.role) {
      setError("Role is required")
      return
    }
    if (formData.role !== "Student" && formData.role !== "Lecturer") {
      setError("Role must be either Student or Lecturer")
      return
    }

    // Major validation - required for students
    if (formData.role === "Student" && !formData.major?.trim()) {
      setError("Major is required for students")
      return
    }

    // Prepare registration data
    const registerData = {
      ...formData,
      department: formData.role === "Lecturer" ? formData.department || undefined : undefined,
      major: formData.role === "Student" ? formData.major || undefined : undefined,
    }

    const result = await register(registerData)

    if (result) {
      // Show success modal instead of browser alert
      setShowSuccessModal(true)
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
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
                maxLength={100}
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  required
                  minLength={8}
                  className="h-11 border-2 focus:border-primary transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must contain: A-Z, a-z, 0-9, and special character (@$!%*?&#)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                  required
                  className="h-11 border-2 focus:border-primary transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-transparent select-none">
                &nbsp;
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-semibold">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="0123456789 (10-11 digits)"
                value={formData.phoneNumber}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, phoneNumber: value })
                }}
                disabled={isLoading}
                required
                maxLength={11}
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

          {formData.role === "Student" && (
            <div className="space-y-2">
              <Label htmlFor="major" className="text-sm font-semibold">Major *</Label>
              <Input
                id="major"
                type="text"
                placeholder="Software Engineering"
                value={formData.major || ""}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                disabled={isLoading}
                required
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>
          )}

          {formData.role === "Lecturer" && (
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-semibold">Department</Label>
              <Input
                id="department"
                type="text"
                placeholder="Computer Science"
                value={formData.department || ""}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={isLoading}
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>
          )}

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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
            setShowSuccessModal(false)
            onBackToLogin()
          }} />

          {/* Modal */}
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-in fade-in zoom-in duration-300">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
              Registration Successful!
            </h2>

            {/* Message */}
            <p className="text-center text-gray-600 mb-6">
              Your account has been submitted successfully. Please wait for admin approval. You will be notified via email once your account is approved.
            </p>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6" />

            {/* Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-800">
                  This process usually takes 1-2 business days. Please check your email regularly for updates.
                </p>
              </div>
            </div>

            {/* Button */}
            <Button
              onClick={() => {
                setShowSuccessModal(false)
                onBackToLogin()
              }}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Back to Login
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

