"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"

type AuthMode = "login" | "register"

export default function Home() {
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const router = useRouter()

  const handleLoginSuccess = () => {
    // Small delay to ensure localStorage is updated
    setTimeout(() => {
      // Get user role from localStorage
      const role = typeof window !== "undefined" ? localStorage.getItem("role") : null
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null
      
      // Try to get role from user object if available
      let finalRole = role
      if (!finalRole && userStr) {
        try {
          const user = JSON.parse(userStr)
          finalRole = user.role
        } catch (e) {
          // Ignore parse error
        }
      }
      
      // Redirect based on role (role from backend: "Admin", "Student", "Lecturer")
      // Use window.location for reliable redirect
      if (finalRole) {
        const roleLower = String(finalRole).toLowerCase().trim()
        if (roleLower === "admin") {
          window.location.href = "/dashboard/admin/users"
        } else if (roleLower === "lecturer") {
          // Lecturer goes to dashboard (can see pending approvals)
          window.location.href = "/dashboard"
        } else {
          // Student goes to dashboard
          window.location.href = "/dashboard"
        }
      } else {
        // Default to dashboard if role not found
        window.location.href = "/dashboard"
      }
    }, 200)
  }

  const handleRegisterSuccess = () => {
    // After registration, go back to login
    setAuthMode("login")
  }

  const handleBackToLogin = () => {
    setAuthMode("login")
  }

  if (authMode === "register") {
    return (
      <RegisterForm
        onRegisterSuccess={handleRegisterSuccess}
        onBackToLogin={handleBackToLogin}
      />
    )
  }

  // Login mode (default)
  return (
    <div className="relative">
      <LoginForm 
        onLoginSuccess={handleLoginSuccess} 
        onSwitchToRegister={() => setAuthMode("register")}
      />
    </div>
  )
}
