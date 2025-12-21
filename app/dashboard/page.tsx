"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useBookingActions } from "@/hooks/use-booking-actions"
import { validateCheckIn, validateCheckOut, canShowCheckInButton, canShowCheckOutButton } from "@/lib/validation/booking-validation"
import Link from "next/link"
import { HeroSection } from "@/components/dashboard/hero-section"
import { useAuth } from "@/hooks/use-auth"
import { useDashboardStats } from "@/hooks/use-dashboard"
import type { BookingListDto } from "@/types"
import {
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  Building2,
  FileCheck,
  AlertCircle,
  Loader2
} from "lucide-react"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart
} from "recharts"

// Booking Card Component with Check-in/Check-out
function BookingCard({ booking, onUpdate }: { booking: BookingListDto; onUpdate: () => void }) {
  const [checkInDialog, setCheckInDialog] = useState(false)
  const [checkOutDialog, setCheckOutDialog] = useState(false)
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
  const [bookings, setBookings] = useState<BookingListDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const { bookingApi } = await import('@/lib/api/booking')
      const response = await bookingApi.getMyBookingHistory()
      if (response.success && response.data) {
        setBookings(response.data || [])
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch bookings",
          variant: "destructive",
        })
        setBookings([])
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  const upcomingBookings = bookings
    .filter((b) => b.status === "Approved" && new Date(b.bookingDate) >= new Date())
    .slice(0, 3)

  // Calculate statistics from API data
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const statistics = {
    totalBookings: bookings.length,
    completedCount: bookings.filter(b => b.status === "Completed").length,
    noShowCount: bookings.filter(b => b.status === "NoShow").length,
    upcomingCount: bookings.filter((b) => {
      const bookingDate = new Date(b.bookingDate)
      bookingDate.setHours(0, 0, 0, 0)
      return b.status === "Approved" && bookingDate >= today
    }).length,
    pendingCount: bookings.filter(b =>
      b.status === "WaitingLecturerApproval" ||
      b.status === "WaitingAdminApproval" ||
      b.status === "Pending"
    ).length,
    rejectedCount: bookings.filter(b => b.status === "Rejected").length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Section with Search */}
      <HeroSection
        title="Discover & Book Facilities"
        subtitle="Find the perfect space for your study sessions, group meetings, and academic activities"
        showSearch={false}
        backgroundImage="/FPT layout.png"
      />

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/history">
          <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics.totalBookings}</p>
                  <p className="text-xs text-gray-500 mt-1">All time bookings</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/bookings?status=Approved">
          <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Upcoming</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics.upcomingCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Scheduled bookings</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/history?status=Completed">
          <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics.completedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Successfully used</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/history?status=NoShow">
          <Card className={`bg-white ${statistics.noShowCount > 0 ? "border-orange-200" : "border-gray-200"} hover:shadow-lg transition-all cursor-pointer h-full`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">No-show Count</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics.noShowCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Missed bookings</p>
                </div>
                <div className={`w-12 h-12 ${statistics.noShowCount > 0 ? "bg-orange-100" : "bg-gray-100"} rounded-full flex items-center justify-center`}>
                  <TrendingUp className={`h-6 w-6 ${statistics.noShowCount > 0 ? "text-orange-600" : "text-gray-600"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings - Main Card */}
        <Card className="lg:col-span-2 bg-white border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Bookings</CardTitle>
                <CardDescription className="text-gray-500">Your next facility reservations</CardDescription>
              </div>
              <Link href="/dashboard/bookings">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Features Info - Sidebar */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Why Choose Our System?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Easy Booking</p>
                  <p className="text-gray-500 text-xs">Simple and intuitive booking process</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Real-time Availability</p>
                  <p className="text-gray-500 text-xs">See facility status instantly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Free for Students</p>
                  <p className="text-gray-500 text-xs">No cost for academic use</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/admin/users">
          <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-500 mt-1">All registered users</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/facilities">
          <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Facilities</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalFacilities}</p>
                  <p className="text-xs text-gray-500 mt-1">All facilities</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/admin/bookings?date=${new Date().toISOString().split('T')[0]}`}>
          <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Bookings This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalBookingsThisMonth}</p>
                  <p className="text-xs text-gray-500 mt-1">Monthly bookings</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/bookings?filter=pending">
          <Card className={`bg-white ${totalPendingApprovals > 0 ? "border-orange-200" : "border-gray-200"} hover:shadow-lg transition-all cursor-pointer h-full`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                  <p className="text-3xl font-bold text-gray-900">{totalPendingApprovals}</p>
                  <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                </div>
                <div className={`w-12 h-12 ${totalPendingApprovals > 0 ? "bg-orange-100" : "bg-gray-100"} rounded-full flex items-center justify-center`}>
                  <FileCheck className={`h-6 w-6 ${totalPendingApprovals > 0 ? "text-orange-600" : "text-gray-600"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Overview - Main Card */}
        <Card className="lg:col-span-2 bg-white border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">User Overview</CardTitle>
            <CardDescription className="text-gray-500">User statistics and pending requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/admin/users?role=Student">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stats.totalStudents}</p>
                    <p className="text-sm font-medium text-gray-700">Students</p>
                    <p className="text-xs text-gray-500">Student accounts</p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/admin/users?role=Lecturer">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stats.totalLecturers}</p>
                    <p className="text-sm font-medium text-gray-700">Lecturers</p>
                    <p className="text-xs text-gray-500">Lecturer accounts</p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/admin/users?tab=pending">
                <div className={`flex items-center gap-3 p-3 ${stats.pendingRegistrations > 0 ? "bg-orange-50" : "bg-gray-50"} rounded-lg hover:bg-gray-100 transition-colors cursor-pointer`}>
                  <div className={`w-10 h-10 ${stats.pendingRegistrations > 0 ? "bg-orange-100" : "bg-gray-100"} rounded-full flex items-center justify-center`}>
                    <AlertCircle className={`h-5 w-5 ${stats.pendingRegistrations > 0 ? "text-orange-600" : "text-gray-600"}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stats.pendingRegistrations}</p>
                    <p className="text-sm font-medium text-gray-700">Pending Registrations</p>
                    <p className="text-xs text-gray-500">New user requests</p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/admin/users?tab=campus-change">
                <div className={`flex items-center gap-3 p-3 ${stats.pendingCampusChangeRequests > 0 ? "bg-orange-50" : "bg-gray-50"} rounded-lg hover:bg-gray-100 transition-colors cursor-pointer`}>
                  <div className={`w-10 h-10 ${stats.pendingCampusChangeRequests > 0 ? "bg-orange-100" : "bg-gray-100"} rounded-full flex items-center justify-center`}>
                    <Building2 className={`h-5 w-5 ${stats.pendingCampusChangeRequests > 0 ? "text-orange-600" : "text-gray-600"}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stats.pendingCampusChangeRequests}</p>
                    <p className="text-sm font-medium text-gray-700">Campus Changes</p>
                    <p className="text-xs text-gray-500">Pending requests</p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Facility Status - Sidebar */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Facility Status</CardTitle>
            <CardDescription className="text-gray-500">Current facility availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/dashboard/admin/facilities?status=Available">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Available</p>
                      <p className="text-xs text-gray-500">Ready to book</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{stats.availableFacilities}</p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/admin/facilities?status=Unavailable">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">In Use</p>
                      <p className="text-xs text-gray-500">Currently occupied</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{stats.inUseFacilities}</p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/admin/facilities?status=UnderMaintenance">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${stats.maintenanceFacilities > 0 ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-600"} rounded-full flex items-center justify-center`}>
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Maintenance</p>
                      <p className="text-xs text-gray-500">Under maintenance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{stats.maintenanceFacilities}</p>
                  </div>
                </div>
              </Link>
            </div>

            <Link href="/dashboard/admin/campuses">
              <div className="mt-4 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Total Campuses:</span>
                  <span className="text-lg font-bold text-blue-600">{stats.totalCampuses}</span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Booking Overview - 2x2 Grid */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Booking Overview</CardTitle>
          <CardDescription className="text-gray-500">Today's booking statistics and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard/admin/bookings?status=Approved&date=today">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl hover:shadow-md transition-all cursor-pointer border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Approved Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedBookingsToday}</p>
                  <p className="text-xs text-gray-500 mt-1">Bookings approved</p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/admin/bookings?status=Rejected&date=today">
              <div className={`flex items-center gap-4 p-4 ${stats.rejectedBookingsToday > 0 ? "bg-gradient-to-br from-red-50 to-red-100/50 border-red-200" : "bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200"} rounded-xl hover:shadow-md transition-all cursor-pointer border`}>
                <div className={`w-12 h-12 ${stats.rejectedBookingsToday > 0 ? "bg-red-500" : "bg-gray-400"} rounded-xl flex items-center justify-center shadow-sm`}>
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Rejected Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejectedBookingsToday}</p>
                  <p className="text-xs text-gray-500 mt-1">Bookings rejected</p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/admin/bookings?status=InUse">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl hover:shadow-md transition-all cursor-pointer border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">In Use Now</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inUseBookingsNow}</p>
                  <p className="text-xs text-gray-500 mt-1">Active bookings</p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/admin/bookings?date=today">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl hover:shadow-md transition-all cursor-pointer border border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookingsToday}</p>
                  <p className="text-xs text-gray-500 mt-1">All bookings today</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section - Row 1: Booking Trend & User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trend Line Chart */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Booking Trends
            </CardTitle>
            <CardDescription className="text-gray-500">Bookings comparison by period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { name: "Mon", bookings: Math.round(stats.totalBookingsThisWeek / 7), approved: Math.round(stats.totalBookingsThisWeek / 7 * 0.8), rejected: Math.round(stats.totalBookingsThisWeek / 7 * 0.1) },
                { name: "Tue", bookings: Math.round(stats.totalBookingsThisWeek / 7 * 1.2), approved: Math.round(stats.totalBookingsThisWeek / 7 * 0.9), rejected: Math.round(stats.totalBookingsThisWeek / 7 * 0.05) },
                { name: "Wed", bookings: Math.round(stats.totalBookingsThisWeek / 7 * 1.1), approved: Math.round(stats.totalBookingsThisWeek / 7 * 0.85), rejected: Math.round(stats.totalBookingsThisWeek / 7 * 0.08) },
                { name: "Thu", bookings: Math.round(stats.totalBookingsThisWeek / 7 * 0.9), approved: Math.round(stats.totalBookingsThisWeek / 7 * 0.75), rejected: Math.round(stats.totalBookingsThisWeek / 7 * 0.12) },
                { name: "Fri", bookings: Math.round(stats.totalBookingsThisWeek / 7 * 1.3), approved: Math.round(stats.totalBookingsThisWeek / 7 * 0.95), rejected: Math.round(stats.totalBookingsThisWeek / 7 * 0.06) },
                { name: "Sat", bookings: Math.round(stats.totalBookingsThisWeek / 7 * 0.6), approved: Math.round(stats.totalBookingsThisWeek / 7 * 0.5), rejected: Math.round(stats.totalBookingsThisWeek / 7 * 0.03) },
                { name: "Sun", bookings: Math.round(stats.totalBookingsThisWeek / 7 * 0.4), approved: Math.round(stats.totalBookingsThisWeek / 7 * 0.35), rejected: Math.round(stats.totalBookingsThisWeek / 7 * 0.02) }
              ]}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6 }} name="Total Bookings" />
                <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Approved" />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution Donut Chart */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              User Distribution
            </CardTitle>
            <CardDescription className="text-gray-500">Breakdown by user type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <linearGradient id="studentGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="lecturerGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                  <linearGradient id="pendingGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
                <Pie
                  data={[
                    { name: "Students", value: stats.totalStudents, fill: "url(#studentGradient)" },
                    { name: "Lecturers", value: stats.totalLecturers, fill: "url(#lecturerGradient)" },
                    { name: "Pending", value: stats.pendingRegistrations, fill: "url(#pendingGradient)" }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#6b7280' }}
                >
                  {[
                    { name: "Students", value: stats.totalStudents, fill: "url(#studentGradient)" },
                    { name: "Lecturers", value: stats.totalLecturers, fill: "url(#lecturerGradient)" },
                    { name: "Pending", value: stats.pendingRegistrations, fill: "url(#pendingGradient)" }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Row 2: Facility Status & Approval Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facility Status */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-500" />
              Facility Status
            </CardTitle>
            <CardDescription className="text-gray-500">Current facility distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <linearGradient id="availableGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <linearGradient id="inUseGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="maintenanceGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
                <Pie
                  data={[
                    { name: "Available", value: stats.availableFacilities },
                    { name: "In Use", value: stats.inUseFacilities },
                    { name: "Maintenance", value: stats.maintenanceFacilities }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="url(#availableGradient)" />
                  <Cell fill="url(#inUseGradient)" />
                  <Cell fill="url(#maintenanceGradient)" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Approval Pipeline */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Approval Pipeline
            </CardTitle>
            <CardDescription className="text-gray-500">Current pending approvals breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: "Lecturer Approvals", pending: stats.pendingLecturerApprovals, icon: "👨‍🏫" },
                  { name: "Admin Approvals", pending: stats.pendingAdminApprovals, icon: "👤" },
                  { name: "User Registrations", pending: stats.pendingRegistrations, icon: "📝" },
                  { name: "Campus Changes", pending: stats.pendingCampusChangeRequests, icon: "🏢" }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barCategoryGap="25%"
              >
                <defs>
                  <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                    <stop offset="100%" stopColor="#f87171" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="barGradient3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="barGradient4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  formatter={(value: number) => [`${value} pending`, 'Count']}
                />
                <Bar
                  dataKey="pending"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                  label={{
                    position: 'top',
                    fill: '#374151',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  {[
                    { name: "Lecturer Approvals", pending: stats.pendingLecturerApprovals },
                    { name: "Admin Approvals", pending: stats.pendingAdminApprovals },
                    { name: "User Registrations", pending: stats.pendingRegistrations },
                    { name: "Campus Changes", pending: stats.pendingCampusChangeRequests }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#barGradient${index + 1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Legend with colors */}
            <div className="flex justify-center gap-6 mt-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm text-gray-600">Lecturer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Admin</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-600">Registrations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Campus</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Bookings</CardTitle>
                <CardDescription className="text-gray-500">Latest booking activity</CardDescription>
              </div>
              <Link href="/dashboard/admin/bookings">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{booking.facilityName}</p>
                      <p className="text-xs text-gray-500">
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
                <p className="text-sm text-gray-500 text-center py-4">No recent bookings</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Registrations</CardTitle>
                <CardDescription className="text-gray-500">New user registrations</CardDescription>
              </div>
              <Link href="/dashboard/admin/users">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentRegistrations && stats.recentRegistrations.length > 0 ? (
                stats.recentRegistrations.slice(0, 5).map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{registration.fullName}</p>
                      <p className="text-xs text-gray-500">
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
                <p className="text-sm text-gray-500 text-center py-4">No recent registrations</p>
              )}
            </div>
          </CardContent>
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
