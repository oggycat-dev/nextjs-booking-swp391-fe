"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useBookingActions } from "@/hooks/use-booking-actions"
import { validateCheckIn, validateCheckOut, canShowCheckInButton, canShowCheckOutButton } from "@/lib/validation/booking-validation"
import { bookingApi } from "@/lib/api/booking"
import type { BookingListDto } from "@/types"
import { Calendar, Clock, MapPin, Users, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react"

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingListDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingListDto | null>(null)
  const [checkInDialog, setCheckInDialog] = useState(false)
  const [checkOutDialog, setCheckOutDialog] = useState(false)
  const [validationWarning, setValidationWarning] = useState<string | null>(null)
  const { checkIn, checkOut, isProcessing, error } = useBookingActions()
  const { toast } = useToast()

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      })
    }
  }, [error, toast])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const response = await bookingApi.getMyBookingHistory()
      if (response.success && response.data) {
        setBookings(response.data)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to fetch bookings",
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckInClick = (booking: BookingListDto) => {
    setValidationWarning(null)
    setSelectedBooking(booking)
    
    const validation = validateCheckIn(booking)
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Cannot Check-in",
        description: validation.error,
      })
      return
    }
    
    if (validation.warningMessage) {
      setValidationWarning(validation.warningMessage)
    }
    
    setCheckInDialog(true)
  }

  const handleCheckOutClick = (booking: BookingListDto) => {
    setValidationWarning(null)
    setSelectedBooking(booking)
    
    const validation = validateCheckOut(booking)
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Cannot Check-out",
        description: validation.error,
      })
      return
    }
    
    if (validation.warningMessage) {
      setValidationWarning(validation.warningMessage)
    }
    
    setCheckOutDialog(true)
  }

  const handleCheckIn = async () => {
    if (!selectedBooking) return
    
    const success = await checkIn(selectedBooking.id)
    if (success) {
      toast({
        title: "Success",
        description: "Checked in successfully",
      })
      setCheckInDialog(false)
      setSelectedBooking(null)
      setValidationWarning(null)
      fetchBookings()
    }
  }

  const handleCheckOut = async () => {
    if (!selectedBooking) return
    
    const success = await checkOut(selectedBooking.id)
    if (success) {
      toast({
        title: "Success",
        description: "Checked out successfully",
      })
      setCheckOutDialog(false)
      setSelectedBooking(null)
      setValidationWarning(null)
      fetchBookings()
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
      "WaitingLecturerApproval": { variant: "outline", className: "border-yellow-500 text-yellow-700 bg-yellow-50" },
      "WaitingAdminApproval": { variant: "outline", className: "border-blue-500 text-blue-700 bg-blue-50" },
      "Approved": { variant: "default", className: "bg-green-600 text-white hover:bg-green-700 border-green-600" },
      "Completed": { variant: "secondary", className: "bg-gray-500 text-white" },
      "Rejected": { variant: "destructive", className: "bg-red-600 text-white" },
      "Cancelled": { variant: "destructive", className: "bg-red-600 text-white" },
      "NoShow": { variant: "destructive", className: "bg-orange-600 text-white" },
    }
    const statusInfo = statusMap[status] || { variant: "outline" as const, className: "text-gray-600" }
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {status}
      </Badge>
    )
  }

  const getBookingsByStatus = (status: string) => {
    if (status === "all") return bookings
    return bookings.filter((b) => b.status.toLowerCase() === status.toLowerCase())
  }

  const canCheckIn = (booking: BookingListDto) => {
    return canShowCheckInButton(booking)
  }

  const canCheckOut = (booking: BookingListDto) => {
    return canShowCheckOutButton(booking)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    // Handle both ISO datetime and TimeSpan formats
    if (timeString.includes('T')) {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    // TimeSpan format HH:mm:ss
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const renderBookingCard = (booking: BookingListDto) => (
    <Card key={booking.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-primary/40 mx-auto mb-2" />
              <p className="text-xs text-primary/60 font-medium px-2 line-clamp-2">{booking.facilityName}</p>
            </div>
          </div>
          {/* Status indicator on image */}
          {getStatusBadge(booking.status) && (
            <div className="absolute top-3 right-3">
              {getStatusBadge(booking.status)}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-6">
            {/* Left Section - Main Info */}
            <div className="flex-1 min-w-0">
              {/* Title and Code */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-lg text-foreground">{booking.facilityName}</h3>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {booking.bookingCode}
                </p>
              </div>
            
            {/* Date & Time Info */}
            <div className="space-y-2.5 mb-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{formatDate(booking.bookingDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </span>
                </div>
              </div>
              
              {/* Check-in/out Status */}
              {(booking.checkedInAt || booking.checkedOutAt) && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {booking.checkedInAt && (
                    <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-950 px-3 py-1.5 rounded-md border border-green-200 dark:border-green-800">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        In: {formatTime(booking.checkedInAt)}
                      </span>
                    </div>
                  )}
                  {booking.checkedOutAt && (
                    <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-md border border-blue-200 dark:border-blue-800">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-blue-700 dark:text-blue-300 font-medium">
                        Out: {formatTime(booking.checkedOutAt)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
            
            {/* Right Section - Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedBooking(booking)}
                className="min-w-[100px] hover:bg-primary/5"
              >
                Details
              </Button>
              {canCheckIn(booking) && (
                <Button 
                  size="sm" 
                  className="min-w-[100px] bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                  onClick={() => handleCheckInClick(booking)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Check-in
                </Button>
              )}
              {canCheckOut(booking) && (
                <Button 
                  size="sm" 
                  className="min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                  onClick={() => handleCheckOutClick(booking)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Check-out
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">View and manage all your facility bookings</p>
      </div>

      {bookings.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No bookings found</p>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({bookings.filter((b) => b.status === "Approved").length})
            </TabsTrigger>
            <TabsTrigger value="waitinglecturerapproval">
              Waiting Lecturer ({bookings.filter((b) => b.status === "WaitingLecturerApproval").length})
            </TabsTrigger>
            <TabsTrigger value="waitingadminapproval">
              Waiting Admin ({bookings.filter((b) => b.status === "WaitingAdminApproval").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({bookings.filter((b) => b.status === "Completed").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {getBookingsByStatus("all").map(renderBookingCard)}
          </TabsContent>
          <TabsContent value="approved" className="space-y-4 mt-4">
            {getBookingsByStatus("approved").map(renderBookingCard)}
          </TabsContent>
          <TabsContent value="waitinglecturerapproval" className="space-y-4 mt-4">
            {getBookingsByStatus("waitinglecturerapproval").map(renderBookingCard)}
          </TabsContent>
          <TabsContent value="waitingadminapproval" className="space-y-4 mt-4">
            {getBookingsByStatus("waitingadminapproval").map(renderBookingCard)}
          </TabsContent>
          <TabsContent value="completed" className="space-y-4 mt-4">
            {getBookingsByStatus("completed").map(renderBookingCard)}
          </TabsContent>
        </Tabs>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && !checkInDialog && !checkOutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
          <Card className="w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Code</p>
                  <p className="font-bold">{selectedBooking.bookingCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Facility</p>
                  <p className="font-bold">{selectedBooking.facilityName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-bold">{formatDate(selectedBooking.bookingDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="font-bold">{formatTime(selectedBooking.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p className="font-bold">{formatTime(selectedBooking.endTime)}</p>
                </div>
                {selectedBooking.checkedInAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Checked In</p>
                    <p className="font-bold text-green-600">{formatTime(selectedBooking.checkedInAt)}</p>
                  </div>
                )}
                {selectedBooking.checkedOutAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Checked Out</p>
                    <p className="font-bold text-blue-600">{formatTime(selectedBooking.checkedOutAt)}</p>
                  </div>
                )}
                {selectedBooking.lecturerEmail && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Lecturer Email</p>
                    <p className="font-bold">{selectedBooking.lecturerEmail}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {canCheckIn(selectedBooking) && (
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleCheckInClick(selectedBooking)}
                >
                  Check-in
                </Button>
              )}
              {canCheckOut(selectedBooking) && (
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleCheckOutClick(selectedBooking)}
                >
                  Check-out
                </Button>
              )}
              <Button variant="outline" className="flex-1" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Check-in Confirmation Dialog */}
      <AlertDialog open={checkInDialog} onOpenChange={setCheckInDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Check-in Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to check-in to this booking?
              <br />
              <strong className="text-foreground">{selectedBooking?.facilityName}</strong>
              <br />
              <span className="text-sm">
                {selectedBooking && formatDate(selectedBooking.bookingDate)} • {selectedBooking && formatTime(selectedBooking.startTime)} - {selectedBooking && formatTime(selectedBooking.endTime)}
              </span>
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

      {/* Check-out Confirmation Dialog */}
      <AlertDialog open={checkOutDialog} onOpenChange={setCheckOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Check-out Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to check-out from this booking?
              <br />
              <strong className="text-foreground">{selectedBooking?.facilityName}</strong>
              <br />
              <span className="text-sm">
                {selectedBooking && formatDate(selectedBooking.bookingDate)} • {selectedBooking && formatTime(selectedBooking.startTime)} - {selectedBooking && formatTime(selectedBooking.endTime)}
              </span>
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
    </div>
  )
}
