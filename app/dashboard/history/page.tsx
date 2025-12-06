"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useBookingHistory } from "@/hooks/use-booking"
import type { Booking } from "@/types"

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
  const { bookings, isLoading, error, fetchHistory } = useBookingHistory()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)
  const [facilityTypeMap, setFacilityTypeMap] = useState<Record<string, string>>({})

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

  // Refresh history when component mounts
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Booking History</h1>
          <p className="text-muted-foreground">View your past bookings and facility usage</p>
        </div>
        <Card className="p-12 text-center">
          <p className="text-destructive">Error loading booking history: {error}</p>
          <Button onClick={() => fetchHistory()} className="mt-4">
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
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

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
    </div>
  )
}

