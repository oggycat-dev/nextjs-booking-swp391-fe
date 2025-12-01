"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const userRole = "student" // In real app, get from context/auth
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { href: "/dashboard", label: "Dashboard", roles: ["student", "lecturer", "admin"] },
    { href: "/search", label: "Search Facilities", roles: ["student", "lecturer"] },
    { href: "/bookings", label: "My Bookings", roles: ["student", "lecturer"] },
    { href: "/calendar", label: "Calendar View", roles: ["student", "lecturer"] },
    { href: "/recurring-bookings", label: "Recurring Bookings", roles: ["lecturer"] },
    { href: "/department-reports", label: "Department Reports", roles: ["lecturer"] },
    { href: "/history", label: "Booking History", roles: ["student", "lecturer"] },
    { href: "/notifications", label: "Notifications", roles: ["student", "lecturer", "admin"] },
    { href: "/profile", label: "Profile", roles: ["student", "lecturer", "admin"] },
    { href: "/admin/facilities", label: "Manage Facilities", roles: ["admin"] },
    { href: "/admin/bookings", label: "Booking Approvals", roles: ["admin"] },
    { href: "/admin/users", label: "User Management", roles: ["admin"] },
    { href: "/admin/analytics", label: "Analytics", roles: ["admin"] },
    { href: "/admin/settings", label: "Settings", roles: ["admin"] },
  ]

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole))

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-foreground text-primary rounded-lg flex items-center justify-center font-bold text-sm">
              FPT
            </div>
            <h1 className="text-xl font-bold">Facility Booking</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Campus: FPT HCM | Role: {userRole}</span>
            <Link href="/notifications" className="relative">
              <Button
                variant="outline"
                size="sm"
                className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              >
                Notifications
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen p-4">
          <nav className="space-y-2">
            {filteredNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
