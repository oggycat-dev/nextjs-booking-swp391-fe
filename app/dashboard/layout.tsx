"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { TokenRefreshProvider } from "@/components/auth/token-refresh-provider"
import { SessionManager } from "@/components/auth/session-manager"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { getCurrentUser, logout: authLogout } = useAuth()
  const [userRole, setUserRole] = useState("student") // default to student
  const [userInfo, setUserInfo] = useState<{ fullName?: string; campusName?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for user with a small delay to ensure localStorage is ready
    const checkUser = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      
      if (!token) {
        // If no token, redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/"
        }
        return
      }
      
      const user = getCurrentUser()
      
      if (user) {
        // Role can be string from backend or UserRole type - handle both
        let roleStr = ""
        if (typeof user.role === "string") {
          roleStr = user.role.toLowerCase()
        } else {
          roleStr = String(user.role).toLowerCase()
        }
        
        setUserRole(roleStr || "student")
        setUserInfo({
          fullName: user.fullName,
          campusName: user.campusName || undefined,
        })
        setIsLoading(false)
      } else {
        // If token exists but no user, try to get role from localStorage directly
        const roleFromStorage = typeof window !== "undefined" ? localStorage.getItem("role") : null
        if (roleFromStorage) {
          setUserRole(roleFromStorage.toLowerCase())
          setIsLoading(false)
        } else {
          // Wait a bit and try again
          setTimeout(() => {
            const retryUser = getCurrentUser()
            if (retryUser) {
              let roleStr = ""
              if (typeof retryUser.role === "string") {
                roleStr = retryUser.role.toLowerCase()
              } else {
                roleStr = String(retryUser.role).toLowerCase()
              }
              setUserRole(roleStr || "student")
              setUserInfo({
                fullName: retryUser.fullName,
                campusName: retryUser.campusName || undefined,
              })
            } else {
              // Still no user, but we have token, so allow access
              const roleFromStorage2 = typeof window !== "undefined" ? localStorage.getItem("role") : null
              setUserRole(roleFromStorage2?.toLowerCase() || "student")
            }
            setIsLoading(false)
          }, 300)
        }
      }
    }
    
    checkUser()
  }, [getCurrentUser, router])

  const navItems = [
    { href: "/dashboard", label: "Dashboard", roles: ["student", "lecturer", "admin"] },
    { href: "/dashboard/search", label: "Search Facilities", roles: ["student", "lecturer"] },
    { href: "/dashboard/bookings", label: "My Bookings", roles: ["student", "lecturer"] },
    { href: "/dashboard/calendar", label: "Calendar View", roles: ["student", "lecturer"] },
    { href: "/dashboard/recurring-bookings", label: "Recurring Bookings", roles: ["lecturer"] },
    { href: "/dashboard/department-reports", label: "Department Reports", roles: ["lecturer"] },
    { href: "/dashboard/history", label: "Booking History", roles: ["student", "lecturer"] },
    { href: "/dashboard/profile", label: "Profile", roles: ["student", "lecturer", "admin"] },
    { href: "/dashboard/admin/campuses", label: "Manage Campuses", roles: ["admin"] },
    { href: "/dashboard/admin/facilities", label: "Manage Facilities", roles: ["admin"] },
    { href: "/dashboard/admin/bookings", label: "Booking Approvals", roles: ["admin"] },
    { href: "/dashboard/admin/users", label: "User Management", roles: ["admin"] },
    { href: "/dashboard/admin/analytics", label: "Analytics", roles: ["admin"] },
    { href: "/dashboard/admin/settings", label: "Settings", roles: ["admin"] },
  ]

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-xl sticky top-0 z-50 border-b border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
              <img src="/logo.png" alt="FPT" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Facility Booking System</h1>
              <p className="text-xs text-primary-foreground/80">FPT University</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              {userInfo?.campusName && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">{userInfo.campusName}</span>
                </div>
              )}
              <span className="text-primary-foreground/60">|</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium capitalize">{userRole}</span>
              </div>
              {userInfo?.fullName && (
                <>
                  <span className="text-primary-foreground/60">|</span>
                  <span className="text-sm">{userInfo.fullName}</span>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-primary-foreground border-primary-foreground/30 hover:bg-white/10 bg-white/5 backdrop-blur-sm"
              onClick={async () => {
                await authLogout()
                if (typeof window !== "undefined") {
                  window.location.href = "/"
                }
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border min-h-[calc(100vh-80px)] p-6 shadow-lg">
          <nav className="space-y-1.5">
            {filteredNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ${
                    pathname === item.href
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg scale-105"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-1"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                  {item.label}
                </button>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8 bg-gradient-to-br from-background via-background to-muted/20 min-h-[calc(100vh-80px)]">
          <TokenRefreshProvider>
            <SessionManager />
            {children}
          </TokenRefreshProvider>
        </main>
      </div>
    </div>
  )
}

