"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { usePendingAdminApprovals, useBookingMutations } from "@/hooks/use-booking"
import { useFacility } from "@/hooks/use-facility"
import type { Booking, BookingStatus } from "@/types"

export default function AdminBookingsPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { bookings: pendingBookings, fetchPendingApprovals, isLoading: isLoadingPending } = usePendingAdminApprovals()
  const { approveBookingAsAdmin, rejectBookingAsAdmin, isLoading: isMutating, error: mutationError } = useBookingMutations()
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [comment, setComment] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [filterDate, setFilterDate] = useState<string>("")
  
  // Fetch facility details when a booking is selected (only when viewing details, not in approve/reject modals)
  const { facility, isLoading: isLoadingFacility } = useFacility(
    selectedBooking?.facilityId && !actionType ? selectedBooking.facilityId : undefined
  )

  // Read query params on mount
  useEffect(() => {
    const statusParam = searchParams.get("status")
    const dateParam = searchParams.get("date")
    const filterParam = searchParams.get("filter")
    
    if (statusParam) {
      setFilterStatus(statusParam)
    }
    
    if (dateParam) {
      if (dateParam === "today") {
        setFilterDate(new Date().toISOString().split('T')[0])
      } else {
        setFilterDate(dateParam)
      }
    }
    
    if (filterParam === "pending") {
      // Already showing pending approvals by default
    }
  }, [searchParams])

  useEffect(() => {
    fetchPendingApprovals()
  }, [fetchPendingApprovals])

  const filteredBookings = pendingBookings
    .filter(
      (b) => {
        const matchesSearch =
          b.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = !filterStatus || b.status === filterStatus
        
        const matchesDate = !filterDate || (() => {
          const bookingDate = new Date(b.bookingDate).toISOString().split('T')[0]
          return bookingDate === filterDate
        })()
        
        return matchesSearch && matchesStatus && matchesDate
      }
    )
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB
    })

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
      Pending: "bg-blue-100 text-blue-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  const handleApprove = async (booking: Booking) => {
    const result = await approveBookingAsAdmin(booking.id, comment || undefined)
    if (result) {
      toast({
        title: "Booking Approved",
        description: "The booking has been approved successfully",
      })
      setSelectedBooking(null)
      setActionType(null)
      setComment("")
      fetchPendingApprovals()
    } else {
      toast({
        title: "Failed to Approve",
        description: mutationError || "The booking could not be approved. Please try again.",
        variant: "destructive",
      })
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
    
    const result = await rejectBookingAsAdmin(booking.id, rejectReason)
    if (result) {
      toast({
        title: "Booking Rejected",
        description: "The booking has been rejected",
      })
      setSelectedBooking(null)
      setActionType(null)
      setRejectReason("")
      fetchPendingApprovals()
    } else {
      toast({
        title: "Failed to Reject",
        description: mutationError || "The booking could not be rejected. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-gray-900 shadow-lg border-0 ring-1 ring-gray-200 dark:ring-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pending Approvals ({pendingBookings.length})</h3>
        </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold text-primary">{pendingBookings.length}</p>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <Card className="p-4 flex-1">
              <Input
                placeholder="Search by facility, requester, or booking code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Card>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {sortOrder === 'newest' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14"/>
                    <path d="m19 12-7 7-7-7"/>
                  </svg>
                  Newest First
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5"/>
                    <path d="m5 12 7-7 7 7"/>
                  </svg>
                  Oldest First
                </>
              )}
            </Button>
          </div>

          {isLoadingPending ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Loading pending bookings...</p>
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
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-400"
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{booking.facilityName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(booking.status)}`}>
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

                {booking.lecturerName && (
                  <div className="mb-4 text-sm">
                    <p className="text-muted-foreground text-xs">Approved by Lecturer</p>
                    <p className="font-medium">{booking.lecturerName}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
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
                    onClick={(e) => {
                      e.stopPropagation()
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
        </TabsContent>
      </Tabs>
      </Card>

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
                  <p className="text-sm text-muted-foreground mb-1">Booking Code</p>
                  <p className="font-bold">{selectedBooking.bookingCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedBooking.status)}`}>
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
                  <p className="font-bold">{formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created At</p>
                  <p className="font-bold">{formatDate(selectedBooking.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Participants</p>
                  <p className="font-bold">{selectedBooking.participants}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Purpose</p>
                  <p className="font-bold">{selectedBooking.purpose}</p>
                </div>
                {isLoadingFacility ? (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Loading facility details...</p>
                  </div>
                ) : facility ? (
                  <>
                    {facility.building && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tòa nhà (Building)</p>
                        <p className="font-bold">{facility.building}</p>
                      </div>
                    )}
                    {facility.floor && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tầng (Floor)</p>
                        <p className="font-bold">{facility.floor}</p>
                      </div>
                    )}
                    {facility.roomNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Phòng (Room)</p>
                        <p className="font-bold">{facility.roomNumber}</p>
                      </div>
                    )}
                    {facility.campusName && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Campus</p>
                        <p className="font-bold">{facility.campusName}</p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
              
              {selectedBooking.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="font-medium">{selectedBooking.notes}</p>
                </div>
              )}

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
                  {selectedBooking.lecturerEmail && (
                    <div>
                      <p className="text-xs text-muted-foreground">Lecturer Email</p>
                      <p className="font-medium">{selectedBooking.lecturerEmail}</p>
                    </div>
                  )}
                  {selectedBooking.lecturerName && (
                    <div>
                      <p className="text-xs text-muted-foreground">Approved by Lecturer</p>
                      <p className="font-medium">{selectedBooking.lecturerName}</p>
                    </div>
                  )}
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

      {/* Approve Modal */}
      {selectedBooking && actionType === "approve" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Approve Booking?</h2>
            <div className="bg-muted p-4 rounded-lg mb-6 text-sm space-y-1">
              <p><span className="font-medium">Facility:</span> {selectedBooking.facilityName}</p>
              <p><span className="font-medium">Date:</span> {formatDate(selectedBooking.bookingDate)}</p>
              <p><span className="font-medium">Time:</span> {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}</p>
              <p><span className="font-medium">Requester:</span> {selectedBooking.userName}</p>
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
                  setComment("")
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
                <option value="User has too many active bookings">User has too many active bookings</option>
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
