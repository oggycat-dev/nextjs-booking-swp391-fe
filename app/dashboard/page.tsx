"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useBookingActions } from "@/hooks/use-booking-actions"
import { validateCheckIn, validateCheckOut, canShowCheckInButton, canShowCheckOutButton } from "@/lib/validation/booking-validation"
import Link from "next/link"
import { HeroSection } from "@/components/dashboard/hero-section"
import { StatCard } from "@/components/dashboard/stat-card"
import { useAuth } from "@/hooks/use-auth"
import { useDashboardStats } from "@/hooks/use-dashboard"
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Building2, 
  FileCheck,
  AlertCircle,
  BarChart3,
  Loader2
} from "lucide-react"

// Booking Card Component with Check-in/Check-out
function BookingCard({ booking, onUpdate }: { booking: any; onUpdate: () => void }) {
  const [checkInDialog, setCheckInDialog] = useState(false)
  const [checkOutDialog, setCheckOutDialog] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [validationWarning, setValidationWarning] = useState<string | null>(null)
  const { checkIn, checkOut, isProcessing } = useBookingActions()
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    if (timeString.includes('T')) {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const canCheckIn = canShowCheckInButton(booking)
  const canCheckOut = canShowCheckOutButton(booking)

  const handleCheckInClick = () => {
    setValidationError(null)
    setValidationWarning(null)
    
    const validation = validateCheckIn(booking)
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "❌ Check-in Not Available",
        description: validation.error,
        duration: 5000,
      })
      return
    }
    
    if (validation.warningMessage) {
      setValidationWarning(validation.warningMessage)
    }
    
    setCheckInDialog(true)
  }

  const handleCheckOutClick = () => {
    setValidationError(null)
    setValidationWarning(null)
    
    const validation = validateCheckOut(booking)
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "❌ Check-out Not Available",
        description: validation.error,
        duration: 5000,
      })
      return
    }
    
    if (validation.warningMessage) {
      setValidationWarning(validation.warningMessage)
    }
    
    setCheckOutDialog(true)
  }

  const handleCheckIn = async () => {
    const success = await checkIn(booking.id)
    if (success) {
      toast({
        title: "Success",
        description: "Checked in successfully",
      })
      setCheckInDialog(false)
      setValidationWarning(null)
      onUpdate()
    }
  }

  const handleCheckOut = async () => {
    const success = await checkOut(booking.id)
    if (success) {
      toast({
        title: "Success",
        description: "Checked out successfully",
      })
      setCheckOutDialog(false)
      setValidationWarning(null)
      onUpdate()
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:shadow-md transition-all">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-primary/20 rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">{booking.facilityName}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(booking.bookingDate)} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </p>
            {booking.checkedInAt && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Checked in at {formatTime(booking.checkedInAt)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canCheckIn && (
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleCheckInClick}
            >
              Check-in
            </Button>
          )}
          {canCheckOut && (
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleCheckOutClick}
            >
              Check-out
            </Button>
          )}
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            {booking.status}
          </Badge>
        </div>
      </div>

      {/* Check-in Dialog */}
      <AlertDialog open={checkInDialog} onOpenChange={setCheckInDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Check-in Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to check-in to this booking?
              <br />
              <strong className="text-foreground">{booking.facilityName}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {validationWarning && (
            <Alert variant="default" className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {validationWarning}
              </AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCheckIn} 
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check-in"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Check-out Dialog */}
      <AlertDialog open={checkOutDialog} onOpenChange={setCheckOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Check-out Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to check-out from this booking?
              <br />
              <strong className="text-foreground">{booking.facilityName}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {validationWarning && (
            <Alert variant="default" className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {validationWarning}
              </AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCheckOut} 
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check-out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Student/Lecturer Dashboard Component
function StudentLecturerDashboard() {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const { bookingApi } = await import('@/lib/api/booking')
      const response = await bookingApi.getMyBookingHistory()
      if (response.success && response.data) {
        setBookings(response.data)
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const upcomingBookings = bookings
    .filter((b) => b.status === "Approved" && new Date(b.bookingDate) >= new Date())
    .slice(0, 3)

  const statistics = {
    totalBookings: bookings.length,
    noShowCount: bookings.filter(b => b.status === "NoShow").length,
    favoriteCount: 3,
    upcomingCount: bookings.filter((b) => b.status === "Approved" && new Date(b.bookingDate) >= new Date()).length,
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
                  <BookingCard key={booking.id} booking={booking} onUpdate={fetchBookings} />
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
  const { stats, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard statistics...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard statistics. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const totalPendingApprovals = (stats.pendingLecturerApprovals || 0) + (stats.pendingAdminApprovals || 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      {/* User Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">User Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            description="All registered users"
          />
          <StatCard
            title="Students"
            value={stats.totalStudents}
            icon={Users}
            description="Student accounts"
            className="border-blue-200 bg-blue-50/50"
          />
          <StatCard
            title="Lecturers"
            value={stats.totalLecturers}
            icon={Users}
            description="Lecturer accounts"
            className="border-purple-200 bg-purple-50/50"
          />
          <StatCard
            title="Pending Registrations"
            value={stats.pendingRegistrations}
            icon={AlertCircle}
            description="New user requests"
            className={stats.pendingRegistrations > 0 ? "border-orange-200 bg-orange-50/50" : ""}
          />
          <StatCard
            title="Campus Changes"
            value={stats.pendingCampusChangeRequests}
            icon={Building2}
            description="Pending requests"
            className={stats.pendingCampusChangeRequests > 0 ? "border-orange-200 bg-orange-50/50" : ""}
          />
        </div>
      </div>

      {/* Booking Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Booking Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Pending Approvals"
            value={totalPendingApprovals}
            icon={FileCheck}
            description={`Lecturer: ${stats.pendingLecturerApprovals}, Admin: ${stats.pendingAdminApprovals}`}
            className={totalPendingApprovals > 0 ? "border-orange-200 bg-orange-50/50" : ""}
          />
          <StatCard
            title="Approved Today"
            value={stats.approvedBookingsToday}
            icon={CheckCircle2}
            description="Bookings approved"
            className="border-green-200 bg-green-50/50"
          />
          <StatCard
            title="Rejected Today"
            value={stats.rejectedBookingsToday}
            icon={AlertCircle}
            description="Bookings rejected"
            className={stats.rejectedBookingsToday > 0 ? "border-red-200 bg-red-50/50" : ""}
          />
          <StatCard
            title="In Use Now"
            value={stats.inUseBookingsNow}
            icon={Clock}
            description="Active bookings"
            className="border-blue-200 bg-blue-50/50"
          />
        </div>
      </div>

      {/* Booking Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Booking Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Today"
            value={stats.totalBookingsToday}
            icon={Calendar}
            description="Bookings today"
          />
          <StatCard
            title="This Week"
            value={stats.totalBookingsThisWeek}
            icon={TrendingUp}
            description="Bookings this week"
          />
          <StatCard
            title="This Month"
            value={stats.totalBookingsThisMonth}
            icon={BarChart3}
            description="Bookings this month"
          />
        </div>
      </div>

      {/* Facility Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Facility Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Facilities"
            value={stats.totalFacilities}
            icon={Building2}
            description="All facilities"
          />
          <StatCard
            title="Available"
            value={stats.availableFacilities}
            icon={CheckCircle2}
            description="Ready to book"
            className="border-green-200 bg-green-50/50"
          />
          <StatCard
            title="In Use"
            value={stats.inUseFacilities}
            icon={Clock}
            description="Currently occupied"
            className="border-blue-200 bg-blue-50/50"
          />
          <StatCard
            title="Maintenance"
            value={stats.maintenanceFacilities}
            icon={AlertCircle}
            description="Under maintenance"
            className={stats.maintenanceFacilities > 0 ? "border-yellow-200 bg-yellow-50/50" : ""}
          />
          <StatCard
            title="Total Campuses"
            value={stats.totalCampuses}
            icon={Building2}
            description="Campus locations"
          />
        </div>
      </div>

      {/* Utilization Rate */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-primary/20 rounded-lg">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Facility Utilization Rate</h3>
            <p className="text-sm text-muted-foreground">Overall facility usage</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Current Rate</span>
            <span className="text-sm font-bold text-primary">{stats.facilityUtilizationRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all"
              style={{ width: `${Math.min(stats.facilityUtilizationRate, 100)}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {stats.recentBookings && stats.recentBookings.length > 0 ? (
              stats.recentBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{booking.facilityName}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.bookedByName} • {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      booking.status === "Approved" ? "default" :
                      booking.status === "Pending" ? "secondary" :
                      booking.status === "Rejected" ? "destructive" : "outline"
                    }
                    className={
                      booking.status === "Approved" ? "bg-green-600" :
                      booking.status === "Pending" ? "bg-orange-500" :
                      booking.status === "Rejected" ? "bg-red-600" : ""
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent bookings</p>
            )}
          </div>
        </Card>

        {/* Recent Registrations */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Registrations</h2>
          <div className="space-y-3">
            {stats.recentRegistrations && stats.recentRegistrations.length > 0 ? (
              stats.recentRegistrations.slice(0, 5).map((registration) => (
                <div key={registration.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{registration.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {registration.email} • {registration.role}
                    </p>
                  </div>
                  <Badge 
                    variant={registration.isApproved ? "default" : "secondary"}
                    className={registration.isApproved ? "bg-green-600" : "bg-orange-500"}
                  >
                    {registration.isApproved ? "Approved" : "Pending"}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent registrations</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              {totalPendingApprovals > 0 && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{totalPendingApprovals} pending</span>
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
              {stats.pendingRegistrations > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{stats.pendingRegistrations} new registrations</span>
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

          <Link href="/dashboard/holidays">
            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Holiday Management</h3>
                  <p className="text-sm text-muted-foreground">Manage holidays</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
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
