"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useMyBookings, usePendingLecturerApprovals, useBookingMutations } from "@/hooks/use-booking"
import type { Booking, BookingStatus } from "@/types"

export default function BookingsPage() {
  const { toast } = useToast()
  const { getCurrentUser } = useAuth()
  const user = getCurrentUser()
  const userRole = user?.role ? String(user.role).toLowerCase() : ""
  const isLecturer = userRole === "lecturer"
  
  const { bookings: myBookings, fetchMyBookings, isLoading: isLoadingMyBookings } = useMyBookings()
  const { bookings: pendingApprovals, fetchPendingApprovals, isLoading: isLoadingPending } = usePendingLecturerApprovals()
  const { 
    approveBookingAsLecturer, 
    rejectBookingAsLecturer, 
    cancelBooking, 
    isLoading: isMutating 
  } = useBookingMutations()
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | "cancel" | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchMyBookings()
    if (isLecturer) {
      fetchPendingApprovals()
    }
  }, [fetchMyBookings, fetchPendingApprovals, isLecturer])

  const getBookingsByStatus = (status: string) => {
    if (status === "all") return myBookings
    return myBookings.filter((b) => b.status.toLowerCase() === status.toLowerCase())
  }

  const getStatusColor = (status: BookingStatus) => {
    const colors: Record<string, string> = {
      WaitingLecturerApproval: "bg-yellow-100 text-yellow-700",
      WaitingAdminApproval: "bg-blue-100 text-blue-700",
      Approved: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
      Cancelled: "bg-gray-100 text-gray-700",
      Completed: "bg-purple-100 text-purple-700",
      CheckedIn: "bg-indigo-100 text-indigo-700",
      NoShow: "bg-orange-100 text-orange-700",
      Pending: "bg-yellow-100 text-yellow-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const formatTime = (timeString: string) => {
    // Time format is "HH:mm:ss" or "HH:mm"
    return timeString.substring(0, 5)
  }

  const handleApprove = async (booking: Booking) => {
    if (booking.status !== "WaitingLecturerApproval") {
      toast({
        title: "Cannot Approve",
        description: "Only student bookings waiting for lecturer approval can be approved",
        variant: "destructive",
      })
      return
    }
    const result = await approveBookingAsLecturer(booking.id)
    if (result) {
      toast({
        title: "Booking Approved",
        description: "The booking has been approved and sent to admin",
      })
      setSelectedBooking(null)
      setActionType(null)
      fetchPendingApprovals()
      fetchMyBookings()
    }
  }

  const handleReject = async (booking: Booking) => {
    if (!rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }
    
    const result = await rejectBookingAsLecturer(booking.id, rejectReason)
    if (result) {
      toast({
        title: "Booking Rejected",
        description: "The booking has been rejected",
      })
      setSelectedBooking(null)
      setActionType(null)
      setRejectReason("")
      fetchPendingApprovals()
      fetchMyBookings()
    }
  }

  const handleCancel = async (booking: Booking) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${booking.bookingCode}?`)) {
      return
    }
    
    const result = await cancelBooking(booking.id)
    if (result) {
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled",
      })
      fetchMyBookings()
    }
  }

  const filteredPendingApprovals = pendingApprovals
    .filter((b) => b.status === "WaitingLecturerApproval")
    .filter(
      (b) =>
        b.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const filteredMyBookings = myBookings.filter(
    (b) =>
      b.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">
          {isLecturer ? "View and manage your bookings and pending approvals" : "View and manage all your facility bookings"}
        </p>
      </div>

      {isLecturer && (
        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4">Pending Lecturer Approvals</h2>
          <div className="mb-4">
            <Input
              placeholder="Search by facility, student name, or booking code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoadingPending ? (
            <p className="text-muted-foreground text-center py-8">Loading pending approvals...</p>
          ) : filteredPendingApprovals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchTerm ? "No bookings found matching your search" : "No pending approvals"}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredPendingApprovals.map((booking) => (
                <Card key={booking.id} className="p-4 hover:shadow-lg transition-shadow border-l-4 border-yellow-400">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{booking.facilityName}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Booking Code: {booking.bookingCode}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Student</p>
                          <p className="font-medium">{booking.userName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Date & Time</p>
                          <p className="font-medium">{formatDate(booking.bookingDate)}</p>
                          <p className="text-xs">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Purpose</p>
                          <p className="font-medium">{booking.purpose}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Participants</p>
                          <p className="font-medium">{booking.participants}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setActionType("approve")
                      }}
                      disabled={isMutating}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setActionType("reject")
                      }}
                      disabled={isMutating}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({filteredMyBookings.length})</TabsTrigger>
          <TabsTrigger value="waitinglecturerapproval">
            Waiting Lecturer ({getBookingsByStatus("waitinglecturerapproval").length})
          </TabsTrigger>
          <TabsTrigger value="waitingadminapproval">
            Waiting Admin ({getBookingsByStatus("waitingadminapproval").length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({getBookingsByStatus("approved").length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({getBookingsByStatus("rejected").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {isLoadingMyBookings ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Loading bookings...</p>
            </Card>
          ) : filteredMyBookings.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No bookings found</p>
            </Card>
          ) : (
            filteredMyBookings.map((booking) => (
              <Card key={booking.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{booking.facilityName}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Booking Code: {booking.bookingCode}</p>
                    <p className="text-sm mb-1">
                      {formatDate(booking.bookingDate)} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Purpose: {booking.purpose} • {booking.participants} participants
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
                      Details
                    </Button>
                    {(booking.status === "Approved" || booking.status === "WaitingAdminApproval") && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive bg-transparent"
                        onClick={() => handleCancel(booking)}
                        disabled={isMutating}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {["waitinglecturerapproval", "waitingadminapproval", "approved", "rejected"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4 mt-4">
            {getBookingsByStatus(status).map((booking) => (
              <Card key={booking.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{booking.facilityName}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Booking Code: {booking.bookingCode}</p>
                    <p className="text-sm mb-1">
                      {formatDate(booking.bookingDate)} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Purpose: {booking.purpose} • {booking.participants} participants
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
                      Details
                    </Button>
                    {(booking.status === "Approved" || booking.status === "WaitingAdminApproval") && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive bg-transparent"
                        onClick={() => handleCancel(booking)}
                        disabled={isMutating}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Booking Details Modal */}
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
                  <p className="text-sm text-muted-foreground">Booking Code</p>
                  <p className="font-bold">{selectedBooking.bookingCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
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
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-bold">{formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="font-bold">{selectedBooking.participants}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-bold">{selectedBooking.purpose}</p>
                </div>
                {selectedBooking.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-bold">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {selectedBooking.status === "Approved" && (
                <>
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Check-in</Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-transparent"
                    onClick={() => handleCancel(selectedBooking)}
                    disabled={isMutating}
                  >
                    Cancel Booking
                  </Button>
                </>
              )}
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Approve Modal */}
      {selectedBooking && actionType === "approve" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Approve Booking?</h2>
            <div className="bg-muted p-4 rounded-lg mb-6 text-sm space-y-1">
              <p><span className="font-medium">Facility:</span> {selectedBooking.facilityName}</p>
              <p><span className="font-medium">Date:</span> {formatDate(selectedBooking.bookingDate)}</p>
              <p><span className="font-medium">Time:</span> {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}</p>
              <p><span className="font-medium">Student:</span> {selectedBooking.userName}</p>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => handleApprove(selectedBooking)}
                disabled={isMutating}
              >
                {isMutating ? "Approving..." : "Confirm Approve"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setActionType(null)
                }}
                disabled={isMutating}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {selectedBooking && actionType === "reject" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Reject Booking</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Rejection Reason <span className="text-destructive">*</span></label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background mb-4"
              >
                <option value="">Select a reason</option>
                <option value="Facility not suitable for purpose">Facility not suitable for purpose</option>
                <option value="Overlapping booking">Overlapping booking</option>
                <option value="Insufficient information">Insufficient information</option>
                <option value="Policy violation">Policy violation</option>
                <option value="Other">Other (specify in notes)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-destructive hover:text-destructive bg-transparent"
                onClick={() => handleReject(selectedBooking)}
                disabled={!rejectReason || isMutating}
              >
                {isMutating ? "Rejecting..." : "Reject"}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 bg-transparent" 
                onClick={() => {
                  setActionType(null)
                  setRejectReason("")
                }}
                disabled={isMutating}
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
