"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { HeroSection } from "@/components/dashboard/hero-section"
import { StatCard } from "@/components/dashboard/stat-card"
import { useAuth } from "@/hooks/use-auth"
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Building2, 
  FileCheck,
  AlertCircle,
  BarChart3
} from "lucide-react"

// Student/Lecturer Dashboard Component
function StudentLecturerDashboard() {
  // TODO: Fetch real data from API
  const upcomingBookings = [
    {
      id: 1,
      facilityName: "Meeting Room 301",
      date: "2025-12-05",
      time: "10:00 - 11:30",
      status: "Approved",
    },
  ]

  const statistics = {
    totalBookings: 5,
    noShowCount: 0,
    favoriteCount: 3,
    upcomingCount: 1,
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Search */}
      <HeroSection 
        title="Discover & Book Facilities"
        subtitle="Find the perfect space for your study sessions, group meetings, and academic activities"
        showSearch={true}
        backgroundImage="/FPT layout.png"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={statistics.totalBookings}
          icon={Calendar}
          description="All time bookings"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Upcoming"
          value={statistics.upcomingCount}
          icon={Clock}
          description="Scheduled bookings"
        />
        <StatCard
          title="Completed"
          value={statistics.totalBookings - statistics.noShowCount}
          icon={CheckCircle2}
          description="Successfully used"
        />
        <StatCard
          title="No-show Count"
          value={statistics.noShowCount}
          icon={TrendingUp}
          description="Missed bookings"
          className={statistics.noShowCount > 0 ? "border-orange-200 bg-orange-50/50" : ""}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Upcoming Bookings</h2>
                <p className="text-sm text-muted-foreground mt-1">Your next facility reservations</p>
              </div>
              <Link href="/dashboard/bookings">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                <Link href="/dashboard/search">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Book a Facility
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/20 rounded-lg">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{booking.facilityName}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {booking.date} • {booking.time}
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions & Features */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/dashboard/search" className="block">
                <Button className="w-full justify-start h-auto py-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold">Search Facilities</span>
                    <span className="text-xs opacity-90">Find and book facilities</span>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/bookings" className="block">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold">My Bookings</span>
                    <span className="text-xs text-muted-foreground">View all bookings</span>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/calendar" className="block">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold">Calendar View</span>
                    <span className="text-xs text-muted-foreground">See your schedule</span>
                  </div>
                </Button>
              </Link>
            </div>
          </Card>

          {/* Features Info */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <h3 className="font-bold text-lg mb-3">Why Choose Our System?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Easy Booking</p>
                  <p className="text-muted-foreground text-xs">Simple and intuitive booking process</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Real-time Availability</p>
                  <p className="text-muted-foreground text-xs">See facility status instantly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Free for Students</p>
                  <p className="text-muted-foreground text-xs">No cost for academic use</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Admin Dashboard Component
function AdminDashboard() {
  // TODO: Fetch real data from API
  const adminStats = {
    pendingBookings: 12,
    pendingRegistrations: 5,
    totalUsers: 1247,
    totalFacilities: 48,
    activeBookings: 89,
    systemHealth: 98.5,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      {/* Admin Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Bookings"
          value={adminStats.pendingBookings}
          icon={FileCheck}
          description="Awaiting approval"
          className={adminStats.pendingBookings > 0 ? "border-orange-200 bg-orange-50/50" : ""}
        />
        <StatCard
          title="Pending Registrations"
          value={adminStats.pendingRegistrations}
          icon={Users}
          description="New user requests"
          className={adminStats.pendingRegistrations > 0 ? "border-blue-200 bg-blue-50/50" : ""}
        />
        <StatCard
          title="Total Users"
          value={adminStats.totalUsers}
          icon={Users}
          description="All registered users"
        />
        <StatCard
          title="Total Facilities"
          value={adminStats.totalFacilities}
          icon={Building2}
          description="Available facilities"
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/admin/bookings">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Booking Approvals</h3>
                <p className="text-sm text-muted-foreground">Review and approve bookings</p>
              </div>
            </div>
            {adminStats.pendingBookings > 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <AlertCircle className="w-4 h-4" />
                <span>{adminStats.pendingBookings} pending</span>
              </div>
            )}
          </Card>
        </Link>

        <Link href="/dashboard/admin/users">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">User Management</h3>
                <p className="text-sm text-muted-foreground">Manage users and approvals</p>
              </div>
            </div>
            {adminStats.pendingRegistrations > 0 && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <AlertCircle className="w-4 h-4" />
                <span>{adminStats.pendingRegistrations} new registrations</span>
              </div>
            )}
          </Card>
        </Link>

        <Link href="/dashboard/admin/facilities">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Facility Management</h3>
                <p className="text-sm text-muted-foreground">Manage facilities and types</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/analytics">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Analytics</h3>
                <p className="text-sm text-muted-foreground">View system statistics</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/campuses">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Campus Management</h3>
                <p className="text-sm text-muted-foreground">Manage campuses</p>
              </div>
            </div>
          </Card>
        </Link>

        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">System Health</h3>
              <p className="text-sm text-muted-foreground">Overall system status</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uptime</span>
              <span className="text-sm font-bold text-primary">{adminStats.systemHealth}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${adminStats.systemHealth}%` }}
              ></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { getCurrentUser } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      const role = typeof user.role === "string" 
        ? user.role.toLowerCase() 
        : String(user.role).toLowerCase()
      setUserRole(role)
    } else {
      // Fallback to localStorage
      const roleFromStorage = typeof window !== "undefined" 
        ? localStorage.getItem("role")?.toLowerCase() 
        : null
      setUserRole(roleFromStorage || "student")
    }
    setIsLoading(false)
  }, [getCurrentUser])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Render different dashboard based on role
  if (userRole === "admin") {
    return <AdminDashboard />
  }

  // Default to Student/Lecturer dashboard
  return <StudentLecturerDashboard />
}
