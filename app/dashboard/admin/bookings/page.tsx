"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAdminBookings } from "@/hooks/use-admin-bookings"
import type { BookingListDto } from "@/types"

export default function AdminBookingsPage() {
  const { bookings, isLoading, error, fetchPendingApprovals, approveBooking } = useAdminBookings()
  const [selectedBooking, setSelectedBooking] = useState<BookingListDto | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [comment, setComment] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPendingApprovals()
  }, [])

  const filteredBookings = bookings.filter(
    (b) =>
      b.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleApprove = async (id: string) => {
    const success = await approveBooking(id, {
      approved: true,
      comment: comment || undefined,
    })
    
    if (success) {
      setSelectedBooking(null)
      setActionType(null)
      setComment("")
      alert("Booking approved successfully!")
    } else {
      alert(error || "Failed to approve booking")
    }
  }

  const handleReject = async (id: string) => {
    if (!comment.trim()) {
      alert("Please provide a rejection reason")
      return
    }
    
    const success = await approveBooking(id, {
      approved: false,
      comment: comment,
    })
    
    if (success) {
      setSelectedBooking(null)
      setActionType(null)
      setComment("")
      alert("Booking rejected successfully!")
    } else {
      alert(error || "Failed to reject booking")
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    
    // Handle different time formats
    // Could be "HH:mm:ss" or just "HH:mm" or a full datetime string
    try {
      if (timeString.includes('T')) {
        // ISO datetime string
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      
      // Assume "HH:mm:ss" or "HH:mm" format
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
      
      return timeString;
    } catch (error) {
      console.error('Error formatting time:', timeString, error);
      return timeString;
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-gray-900 shadow-lg border-0 ring-1 ring-gray-200 dark:ring-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pending Approvals ({bookings.length})</h3>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <Input
              placeholder="Search by facility, requester, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Card>

          {isLoading ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            </Card>
          ) : error ? (
            <Card className="p-12 text-center border-destructive/50 bg-destructive/5">
              <p className="text-destructive">{error}</p>
              <Button 
                onClick={() => fetchPendingApprovals()} 
                variant="outline"
                className="mt-4"
              >
                Retry
              </Button>
            </Card>
          ) : filteredBookings.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? "No bookings found matching your search" : "No pending bookings"}
              </p>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <Card
                key={booking.id}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-yellow-400"
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{booking.facilityName}</h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Booking Code: {booking.bookingCode}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Requester</p>
                    <p className="font-medium">{booking.userName}</p>
                    <p className="text-xs text-muted-foreground">{booking.userRole}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Date & Time</p>
                    <p className="font-medium">{formatDate(booking.bookingDate)}</p>
                    <p className="text-xs">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Lecturer Email</p>
                    <p className="font-medium">{booking.lecturerEmail || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Created At</p>
                    <p className="font-medium">{formatDate(booking.createdAt)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedBooking(booking)
                      setActionType("approve")
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedBooking(booking)
                      setActionType("reject")
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedBooking(booking)
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {selectedBooking && !actionType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Booking Code</p>
                  <p className="font-bold">{selectedBooking.bookingCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Facility</p>
                  <p className="font-bold">{selectedBooking.facilityName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-bold">{formatDate(selectedBooking.bookingDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Time</p>
                  <p className="font-bold">
                    {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created At</p>
                  <p className="font-bold">{formatDate(selectedBooking.createdAt)}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Requester Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedBooking.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="font-medium">{selectedBooking.userRole}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lecturer Email</p>
                    <p className="font-medium">{selectedBooking.lecturerEmail || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setActionType("approve")}
              >
                Approve Booking
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-destructive hover:text-destructive bg-transparent"
                onClick={() => setActionType("reject")}
              >
                Reject Booking
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {selectedBooking && actionType === "approve" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Approve Booking?</h2>
            <div className="bg-muted p-4 rounded-lg mb-6 text-sm space-y-1">
              <p>
                <span className="font-medium">Facility:</span> {selectedBooking.facilityName}
              </p>
              <p>
                <span className="font-medium">Date:</span> {formatDate(selectedBooking.bookingDate)}
              </p>
              <p>
                <span className="font-medium">Time:</span> {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
              </p>
              <p>
                <span className="font-medium">Requester:</span> {selectedBooking.userName}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any comments..."
                className="w-full px-3 py-2 border border-input rounded-lg bg-background min-h-20"
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => handleApprove(selectedBooking.id)}
                disabled={isLoading}
              >
                {isLoading ? "Approving..." : "Confirm Approve"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setActionType(null)
                  setComment("")
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {selectedBooking && actionType === "reject" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Reject Booking</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rejection Reason *</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="w-full px-3 py-2 border border-input rounded-lg bg-background min-h-24"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-destructive hover:text-destructive bg-transparent"
                onClick={() => handleReject(selectedBooking.id)}
                disabled={!comment.trim() || isLoading}
              >
                {isLoading ? "Rejecting..." : "Reject"}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 bg-transparent" 
                onClick={() => {
                  setActionType(null)
                  setComment("")
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

