"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { TokenRefreshProvider } from "@/components/auth/token-refresh-provider"
import { SessionManager } from "@/components/auth/session-manager"
import { FirebaseNotificationProvider } from "@/components/notifications/firebase-notification-provider"
import { Bell } from "lucide-react"

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
  const [unreadCount, setUnreadCount] = useState(0)

  // Update unread count from localStorage
  useEffect(() => {
    const updateUnreadCount = () => {
      if (typeof window === 'undefined' || userRole !== 'admin') return;
      try {
        const stored = localStorage.getItem('admin_notifications');
        if (stored) {
          const notifications = JSON.parse(stored);
          const unread = notifications.filter((n: { read: boolean }) => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Error reading notifications:', error);
      }
    };

    // Initial load
    updateUnreadCount();

    // Listen for storage changes (from other tabs)
    window.addEventListener('storage', updateUnreadCount);

    // Listen for BroadcastChannel (same tab)
    let broadcastChannel: BroadcastChannel | null = null;
    if (window.BroadcastChannel) {
      broadcastChannel = new BroadcastChannel('notifications');
      broadcastChannel.onmessage = () => {
        updateUnreadCount();
      };
    }

    // Listen for service worker messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK' && event.data.url) {
        router.push(event.data.url);
      }
      if (event.data && event.data.type === 'NEW_NOTIFICATION') {
        updateUnreadCount();
      }
    };
    
    navigator.serviceWorker?.addEventListener('message', handleMessage);

    // Poll for changes (fallback)
    const interval = setInterval(updateUnreadCount, 2000);

    return () => {
      window.removeEventListener('storage', updateUnreadCount);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      clearInterval(interval);
    };
  }, [router, userRole]);

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
    { href: "/dashboard/holidays", label: "Holidays", roles: ["student", "lecturer"] },
    { href: "/dashboard/recurring-bookings", label: "Recurring Bookings", roles: ["lecturer"] },
    { href: "/dashboard/department-reports", label: "Department Reports", roles: ["lecturer"] },
    { href: "/dashboard/history", label: "Booking History", roles: ["student", "lecturer"] },
    { href: "/dashboard/admin/campuses", label: "Manage Campuses", roles: ["admin"] },
    { href: "/dashboard/admin/facilities", label: "Manage Facilities", roles: ["admin"] },
    { href: "/dashboard/admin/facility-types", label: "Facility Types", roles: ["admin"] },
    { href: "/dashboard/admin/holidays", label: "Manage Holidays", roles: ["admin"] },
    { href: "/dashboard/admin/bookings", label: "Booking Approvals", roles: ["admin"] },
    { href: "/dashboard/admin/users", label: "User Management", roles: ["admin"] },
    { href: "/dashboard/admin/analytics", label: "Analytics", roles: ["admin"] },
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
          {/* System Title - Left Side */}
          <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="FPT" className="w-14 h-14 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-left">Facility Booking System</h1>
              <p className="text-xs text-primary-foreground/80 text-left">FPT University</p>
            </div>
          </Link>

          {/* Profile Container - Right Side */}
          <div className="flex items-center gap-4">
            {/* Notifications Button - Only for Admin */}
            {userRole === "admin" && (
              <Link href="/dashboard/notifications">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 hover:bg-white/20 text-primary-foreground bg-white/10 rounded-xl relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {/* Badge for unread count */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            
            <Link href="/dashboard/profile">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg cursor-pointer hover:bg-white/20 transition-all duration-200">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
                  {userInfo?.fullName ? userInfo.fullName.charAt(0).toUpperCase() : userRole.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{userInfo?.fullName || "User"}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span className="capitalize">{userRole}</span>
                    </span>
                    {userInfo?.campusName && (
                      <>
                        <span className="text-primary-foreground/40">•</span>
                        <span>{userInfo.campusName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-white/20 text-primary-foreground bg-white/10 rounded-xl"
              onClick={async () => {
                await authLogout()
                if (typeof window !== "undefined") {
                  window.location.href = "/"
                }
              }}
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
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
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg scale-105"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-1"
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8 bg-gradient-to-br from-background via-background to-muted/20 min-h-[calc(100vh-80px)]">
          <TokenRefreshProvider>
            <SessionManager />
            <FirebaseNotificationProvider userRole={userRole}>
              {children}
            </FirebaseNotificationProvider>
          </TokenRefreshProvider>
        </main>
      </div>
      <Toaster />
    </div>
  )
}

