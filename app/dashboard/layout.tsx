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
import { Bell, MessageCircle, ChevronDown, User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { storage } from "@/lib/storage-manager"

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
    // Check for user with a small delay to ensure storage is ready
    const checkUser = () => {
      // Use storage manager instead of localStorage directly (supports sessionStorage)
      const token = storage.getItem("token")
      
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
        // If token exists but no user, try to get role from storage directly
        const roleFromStorage = storage.getItem("role")
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
              const roleFromStorage2 = storage.getItem("role")
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
    { href: "/dashboard/history", label: "Booking History", roles: ["student", "lecturer"] },
    { href: "/dashboard/admin/campuses", label: "Manage Campuses", roles: ["admin"] },
    { href: "/dashboard/admin/facilities", label: "Manage Facilities", roles: ["admin"] },
    { href: "/dashboard/admin/facility-types", label: "Facility Types", roles: ["admin"] },
    { href: "/dashboard/admin/holidays", label: "Manage Holidays", roles: ["admin"] },
    { href: "/dashboard/admin/bookings", label: "Booking Approvals", roles: ["admin"] },
    { href: "/dashboard/admin/issues", label: "Issue Reports", roles: ["admin"] },
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
      <nav className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-sm sticky top-0 z-50 border-b border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center">
          {/* Logo and Title - Left Side */}
          <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0">
            <img src="/logo.png" alt="FPT" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-left text-primary-foreground">
                Facility Booking System
              </h1>
              <p className="text-xs text-left text-primary-foreground/80">
                FPT University
              </p>
            </div>
          </Link>

          {/* Navigation Links - Center (only for Student/Lecturer) */}
          {userRole !== "admin" && (
            <div className="flex items-center gap-1 flex-1 justify-center">
              <Link href="/dashboard">
                <button
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    pathname === "/dashboard"
                      ? "bg-white/20 text-primary-foreground"
                      : "text-primary-foreground/90 hover:bg-white/10"
                  }`}
                >
                  Home
                </button>
              </Link>
              <Link href="/dashboard/search">
                <button
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    pathname?.startsWith("/dashboard/search")
                      ? "bg-white/20 text-primary-foreground"
                      : "text-primary-foreground/90 hover:bg-white/10"
                  }`}
                >
                  Search Facilities
                </button>
              </Link>
              <Link href="/dashboard/bookings">
                <button
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    pathname === "/dashboard/bookings"
                      ? "bg-white/20 text-primary-foreground"
                      : "text-primary-foreground/90 hover:bg-white/10"
                  }`}
                >
                  My Bookings
                </button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg flex items-center gap-1 ${
                      pathname?.startsWith("/dashboard/calendar") || pathname?.startsWith("/dashboard/history") || pathname?.startsWith("/dashboard/holidays")
                        ? "bg-white/20 text-primary-foreground"
                        : "text-primary-foreground/90 hover:bg-white/10"
                    }`}
                  >
                    More
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/calendar" className="cursor-pointer">
                      Calendar View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/history" className="cursor-pointer">
                      Booking History
                    </Link>
                  </DropdownMenuItem>
                  {userRole === "lecturer" && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/holidays" className="cursor-pointer">
                        Holidays
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Profile Container - Right Side */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
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
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            
            {/* User Profile Dropdown - Student/Lecturer/Admin */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm text-primary-foreground">
                    {userInfo?.fullName ? userInfo.fullName.charAt(0).toUpperCase() : userRole.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-primary-foreground">
                      {userInfo?.fullName || (userRole === "admin" ? "System Administrator" : "User")}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="capitalize text-primary-foreground/80">{userRole}</span>
                      </span>
                      {userInfo?.campusName && userRole !== "admin" && (
                        <>
                          <span className="text-primary-foreground/40">•</span>
                          <span className="text-primary-foreground/80">{userInfo.campusName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-primary-foreground/60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={async () => {
                    await authLogout()
                    if (typeof window !== "undefined") {
                      window.location.href = "/"
                    }
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Sidebar for Admin, Topbar for Student/Lecturer */}
      {userRole === "admin" ? (
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
       ) : (
         <div className="flex flex-col">
           <main className="flex-1 px-16 py-8 bg-gradient-to-br from-background via-background to-muted/20 min-h-[calc(100vh-73px)]">
             <TokenRefreshProvider>
               <SessionManager />
               <FirebaseNotificationProvider userRole={userRole}>
            {children}
               </FirebaseNotificationProvider>
          </TokenRefreshProvider>
        </main>
      </div>
       )}
      <Toaster />
    </div>
  )
}

