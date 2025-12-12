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
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

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
        showSearch={true}
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

      {/* Booking Overview - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Statistics - Main Card */}
        <Card className="lg:col-span-2 bg-white border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Booking Overview</CardTitle>
            <CardDescription className="text-gray-500">Booking statistics and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/admin/bookings?status=Approved&date=today">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stats.approvedBookingsToday}</p>
                    <p className="text-sm font-medium text-gray-700">Approved Today</p>
                    <p className="text-xs text-gray-500">Bookings approved</p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/admin/bookings?status=Rejected&date=today">
                <div className={`flex items-center gap-3 p-3 ${stats.rejectedBookingsToday > 0 ? "bg-red-50" : "bg-gray-50"} rounded-lg hover:bg-gray-100 transition-colors cursor-pointer`}>
                  <div className={`w-10 h-10 ${stats.rejectedBookingsToday > 0 ? "bg-red-100" : "bg-gray-100"} rounded-full flex items-center justify-center`}>
                    <AlertCircle className={`h-5 w-5 ${stats.rejectedBookingsToday > 0 ? "text-red-600" : "text-gray-600"}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stats.rejectedBookingsToday}</p>
                    <p className="text-sm font-medium text-gray-700">Rejected Today</p>
                    <p className="text-xs text-gray-500">Bookings rejected</p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/admin/bookings?status=InUse">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stats.inUseBookingsNow}</p>
                    <p className="text-sm font-medium text-gray-700">In Use Now</p>
                    <p className="text-xs text-gray-500">Active bookings</p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/admin/bookings?date=today">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stats.totalBookingsToday}</p>
                    <p className="text-sm font-medium text-gray-700">Today</p>
                    <p className="text-xs text-gray-500">Bookings today</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Quick Stats */}
            <Link href="/dashboard/admin/bookings">
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Booking Activity</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stats.totalBookingsToday}</p>
                    <p className="text-xs text-gray-600">Today</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stats.totalBookingsThisWeek}</p>
                    <p className="text-xs text-gray-600">This Week</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stats.totalBookingsThisMonth}</p>
                    <p className="text-xs text-gray-600">This Month</p>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Utilization Rate - Sidebar */}
        <Link href="/dashboard/admin/analytics">
          <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Utilization Rate</CardTitle>
              <CardDescription className="text-gray-500">Overall facility usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary mb-2">{stats.facilityUtilizationRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">Current Rate</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-primary h-4 rounded-full transition-all"
              style={{ width: `${Math.min(stats.facilityUtilizationRate, 100)}%` }}
            ></div>
          </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Pending Approvals:</span>
                    <span className="font-medium text-gray-900">
                      Lecturer: {stats.pendingLecturerApprovals}
                    </span>
        </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-500">Admin:</span>
                    <span className="font-medium text-gray-900">{stats.pendingAdminApprovals}</span>
                  </div>
                </div>
              </div>
            </CardContent>
      </Card>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Statistics Chart */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Booking Statistics</CardTitle>
            <CardDescription className="text-gray-500">Bookings by time period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: "Today", value: stats.totalBookingsToday },
                { name: "This Week", value: stats.totalBookingsThisWeek },
                { name: "This Month", value: stats.totalBookingsThisMonth }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="oklch(0.6 0.2 29.23)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Facility Status Chart */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Facility Status</CardTitle>
            <CardDescription className="text-gray-500">Current facility distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Available", value: stats.availableFacilities, color: "#10b981" },
                    { name: "In Use", value: stats.inUseFacilities, color: "#3b82f6" },
                    { name: "Maintenance", value: stats.maintenanceFacilities, color: "#f59e0b" }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: "Available", value: stats.availableFacilities, color: "#10b981" },
                    { name: "In Use", value: stats.inUseFacilities, color: "#3b82f6" },
                    { name: "Maintenance", value: stats.maintenanceFacilities, color: "#f59e0b" }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Statistics Chart */}
        <Card className="bg-white border-gray-200 lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">User Statistics</CardTitle>
            <CardDescription className="text-gray-500">User distribution and pending requests</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { 
                  name: "Users", 
                  Students: stats.totalStudents,
                  Lecturers: stats.totalLecturers,
                  "Pending": stats.pendingRegistrations,
                  "Campus Change": stats.pendingCampusChangeRequests
                }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Students" fill="#3b82f6" />
                <Bar dataKey="Lecturers" fill="#8b5cf6" />
                <Bar dataKey="Pending" fill="#f59e0b" />
                <Bar dataKey="Campus Change" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Booking Approval Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Booking Approval Status</CardTitle>
            <CardDescription className="text-gray-500">Today's booking approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: "Approved", value: stats.approvedBookingsToday, fill: "#10b981" },
                { name: "Rejected", value: stats.rejectedBookingsToday, fill: "#ef4444" }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pending Approvals Breakdown */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Pending Approvals</CardTitle>
            <CardDescription className="text-gray-500">Breakdown by approval level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: "Lecturer", value: stats.pendingLecturerApprovals, fill: "#f59e0b" },
                { name: "Admin", value: stats.pendingAdminApprovals, fill: "#ef4444" }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
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
