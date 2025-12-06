"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useMyBookings } from "@/hooks/use-booking"
import { useBookingActions } from "@/hooks/use-booking-actions"
import { validateCheckIn, validateCheckOut, canShowCheckInButton, canShowCheckOutButton } from "@/lib/validation/booking-validation"
import { ReportIssueModal } from "@/components/facilities/report-issue-modal"
import type { Booking, BookingListDto } from "@/types"
import { AlertCircle, Loader2, CheckCircle2, AlertTriangle } from "lucide-react"

interface HistoryEntry {
  id: string
  facilityName: string
  type: string
  date: string
  time: string
  duration: string
  purpose: string
  checkedIn: boolean
  checkedOut: boolean
  noShow: boolean
  rating: number
  comment: string
  booking: Booking
}

// Helper function to calculate duration in hours
function calculateDuration(startTime: string, endTime: string): string {
  const start = startTime.split(":").map(Number)
  const end = endTime.split(":").map(Number)
  const startMinutes = start[0] * 60 + start[1]
  const endMinutes = end[0] * 60 + end[1]
  const diffMinutes = endMinutes - startMinutes
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  
  if (hours === 0) {
    return `${minutes} minutes`
  } else if (minutes === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`
  } else {
    const decimalHours = (diffMinutes / 60).toFixed(1)
    return `${decimalHours} hours`
  }
}

// Helper function to format time from "HH:mm:ss" to "HH:mm"
function formatTime(timeString: string): string {
  return timeString.substring(0, 5)
}

// Helper function to format date from ISO string to "YYYY-MM-DD"
function formatDate(dateString: string): string {
  return dateString.split("T")[0]
}

export default function HistoryPage() {
  const { bookings, isLoading, error, fetchMyBookings } = useMyBookings()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)
  const [facilityTypeMap, setFacilityTypeMap] = useState<Record<string, string>>({})
  const [checkInDialog, setCheckInDialog] = useState<string | null>(null)
  const [checkOutDialog, setCheckOutDialog] = useState<string | null>(null)
  const [reportIssueModal, setReportIssueModal] = useState<string | null>(null)
  const [validationWarning, setValidationWarning] = useState<string | null>(null)
  const { checkIn, checkOut, isProcessing } = useBookingActions()
  const { toast } = useToast()

  // Fetch facility types for all bookings
  useEffect(() => {
    const fetchFacilityTypes = async () => {
      const typeMap: Record<string, string> = {}
      
      bookings.forEach((booking: Booking) => {
        // Extract type from facilityName or facilityCode
        const name = booking.facilityName || ""
        if (name.includes("Lab") || name.includes("LAB")) {
          typeMap[booking.facilityId] = "Lab"
        } else if (name.includes("Room") || name.includes("Meeting")) {
          typeMap[booking.facilityId] = "Meeting Room"
        } else if (name.includes("Study")) {
          typeMap[booking.facilityId] = "Study Room"
        } else {
          typeMap[booking.facilityId] = "Facility"
        }
      })
      
      setFacilityTypeMap(typeMap)
    }
    
    if (bookings.length > 0) {
      fetchFacilityTypes()
    }
  }, [bookings])

  // Map bookings to history entries
  const historyEntries: HistoryEntry[] = useMemo(() => {
    return bookings.map((booking: Booking) => {
      const checkedIn = booking.status === "CheckedIn" || booking.status === "Completed" || booking.checkedInAt !== null
      const checkedOut = booking.status === "Completed" || booking.checkedOutAt !== null
      const noShow = booking.status === "NoShow"
      
      return {
        id: booking.bookingCode,
        facilityName: booking.facilityName,
        type: facilityTypeMap[booking.facilityId] || "Facility",
        date: formatDate(booking.bookingDate),
        time: `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`,
        duration: calculateDuration(booking.startTime, booking.endTime),
        purpose: booking.purpose,
        checkedIn,
        checkedOut,
        noShow,
        rating: 0, // Rating not available in API yet
        comment: booking.notes || "",
        booking,
      }
    })
  }, [bookings, facilityTypeMap])

  // Check if user can report issue (must be checked in and not checked out)
  const canReportIssue = (booking: Booking): boolean => {
    return !!booking.checkedInAt && !booking.checkedOutAt
  }

  // Convert Booking to BookingListDto for validation
  const bookingToDto = (booking: Booking): BookingListDto => {
    return {
      id: booking.id,
      bookingCode: booking.bookingCode,
      facilityId: booking.facilityId,
      facilityName: booking.facilityName,
      userId: booking.userId,
      userName: booking.userName || "",
      userRole: booking.userRole || "",
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose,
      participants: booking.participants || 0,
      status: String(booking.status), // Convert BookingStatus to string
      lecturerEmail: booking.lecturerEmail || null,
      lecturerName: booking.lecturerName || null,
      rejectionReason: booking.rejectionReason || null,
      notes: booking.notes || null,
      checkedInAt: booking.checkedInAt || null,
      checkedOutAt: booking.checkedOutAt || null,
      createdAt: booking.createdAt,
    }
  }

  const handleCheckInClick = (booking: Booking) => {
    setValidationWarning(null)
    const bookingDto = bookingToDto(booking)
    const validation = validateCheckIn(bookingDto)
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
    
    setCheckInDialog(booking.id)
  }

  const handleCheckOutClick = (booking: Booking) => {
    setValidationWarning(null)
    const bookingDto = bookingToDto(booking)
    const validation = validateCheckOut(bookingDto)
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
    
    setCheckOutDialog(booking.id)
  }

  const handleCheckIn = async (bookingId: string) => {
    const success = await checkIn(bookingId)
    if (success) {
      toast({
        title: "Success",
        description: "Checked in successfully",
      })
      setCheckInDialog(null)
      setValidationWarning(null)
      fetchMyBookings()
    }
  }

  const handleCheckOut = async (bookingId: string) => {
    const success = await checkOut(bookingId)
    if (success) {
      toast({
        title: "Success",
        description: "Checked out successfully",
      })
      setCheckOutDialog(null)
      setValidationWarning(null)
      fetchMyBookings()
    }
  }

  // Filter history based on search term
  const filteredHistory = useMemo(() => {
    if (searchTerm === "") {
      return historyEntries
    }
    const term = searchTerm.toLowerCase()
    return historyEntries.filter(
      (h) =>
        h.facilityName.toLowerCase().includes(term) ||
        h.purpose.toLowerCase().includes(term) ||
        h.id.toLowerCase().includes(term),
    )
  }, [historyEntries, searchTerm])

  const stats = useMemo(() => {
    const totalBookings = historyEntries.length
    const completedBookings = historyEntries.filter((h) => h.checkedOut).length
    const noShows = historyEntries.filter((h) => h.noShow).length
    const rejectedBookings = historyEntries.filter((h) => h.booking.status === "Rejected").length
    const ratings = historyEntries.filter((h) => h.rating > 0)
    const averageRating = ratings.length > 0
      ? (ratings.reduce((acc, h) => acc + h.rating, 0) / ratings.length).toFixed(1)
      : "0.0"
    
    return {
      totalBookings,
      completedBookings,
      noShows,
      rejectedBookings,
      averageRating,
    }
  }, [historyEntries])

  // Refresh bookings when component mounts
  useEffect(() => {
    fetchMyBookings()
  }, [fetchMyBookings])

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Booking History</h1>
          <p className="text-muted-foreground">View your past bookings and facility usage</p>
        </div>
        <Card className="p-12 text-center">
          <p className="text-destructive">Error loading booking history: {error}</p>
          <Button onClick={() => fetchMyBookings()} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Booking History</h1>
        <p className="text-muted-foreground">View your past bookings and facility usage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-primary">{stats.totalBookings}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-3xl font-bold text-primary">{stats.completedBookings}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Rejected</p>
          <p className="text-3xl font-bold text-destructive">{stats.rejectedBookings}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">No-shows</p>
          <p className="text-3xl font-bold text-destructive">{stats.noShows}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg. Rating</p>
          <p className="text-3xl font-bold text-primary">{stats.averageRating}</p>
        </Card>
      </div>

      <Card className="p-4">
        <Input
          type="search"
          placeholder="Search by facility name, booking ID, or purpose..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading booking history...</p>
          </Card>
        ) : filteredHistory.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No bookings found</p>
          </Card>
        ) : (
          filteredHistory.map((entry) => (
            <Card
              key={entry.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{entry.facilityName}</h3>
                    {entry.booking.status === "Rejected" && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                        Rejected
                      </span>
                    )}
                    {entry.noShow && (
                      <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded">
                        No-show
                      </span>
                    )}
                    {entry.checkedOut && !entry.noShow && entry.booking.status !== "Rejected" && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Completed
                      </span>
                    )}
                    {entry.booking.status === "Approved" && !entry.checkedOut && !entry.noShow && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        Approved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {entry.date} • {entry.time} ({entry.duration})
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{entry.purpose}</span>
                    {entry.rating > 0 && <span className="text-primary font-medium">★ {entry.rating}/5.0</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canShowCheckInButton(bookingToDto(entry.booking)) && (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCheckInClick(entry.booking)
                      }}
                    >
                      Check-in
                    </Button>
                  )}
                  {canShowCheckOutButton(bookingToDto(entry.booking)) && (
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCheckOutClick(entry.booking)
                      }}
                    >
                      Check-out
                    </Button>
                  )}
                  {canReportIssue(entry.booking) && (
                    <Button 
                      size="sm" 
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        setReportIssueModal(entry.booking.id)
                      }}
                    >
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Report Issue
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation()
                    setSelectedEntry(entry)
                  }}>
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Check-in Dialog */}
      {checkInDialog && (() => {
        const booking = bookings.find(b => b.id === checkInDialog)
        if (!booking) return null
        return (
          <AlertDialog open={!!checkInDialog} onOpenChange={(open) => !open && setCheckInDialog(null)}>
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
                  onClick={() => handleCheckIn(checkInDialog)} 
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check-in"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      })()}

      {/* Check-out Dialog */}
      {checkOutDialog && (() => {
        const booking = bookings.find(b => b.id === checkOutDialog)
        if (!booking) return null
        return (
          <AlertDialog open={!!checkOutDialog} onOpenChange={(open) => !open && setCheckOutDialog(null)}>
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
                  onClick={() => handleCheckOut(checkOutDialog)} 
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check-out"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      })()}

      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedEntry.facilityName}</h2>
              <button onClick={() => setSelectedEntry(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="font-bold">{selectedEntry.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-bold">{selectedEntry.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-bold">{selectedEntry.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-bold">{selectedEntry.time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-bold">{selectedEntry.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-bold">{selectedEntry.purpose}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <div className="flex gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedEntry.checkedIn ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {selectedEntry.checkedIn ? "Checked In" : "Not Checked In"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedEntry.checkedOut ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {selectedEntry.checkedOut ? "Checked Out" : "Not Checked Out"}
                  </span>
                </div>
              </div>

              {selectedEntry.comment && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm">{selectedEntry.comment}</p>
                </div>
              )}
              {selectedEntry.rating > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                  <p className="font-bold text-lg text-primary mb-2">★ {selectedEntry.rating}/5.0</p>
                </div>
              )}
            </div>

            <Button variant="outline" onClick={() => setSelectedEntry(null)} className="w-full">
              Close
            </Button>
          </Card>
        </div>
      )}

      {/* Report Issue Modal */}
      {reportIssueModal && (() => {
        const booking = bookings.find(b => b.id === reportIssueModal)
        if (!booking) return null
        const bookingDto = bookingToDto(booking)
        return (
          <ReportIssueModal
            isOpen={!!reportIssueModal}
            onClose={() => setReportIssueModal(null)}
            booking={bookingDto}
            onReported={() => {
              setReportIssueModal(null)
              fetchMyBookings()
            }}
          />
        )
      })()}
    </div>
  )
}

