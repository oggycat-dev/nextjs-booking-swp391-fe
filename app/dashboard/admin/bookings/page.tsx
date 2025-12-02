"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MOCK_PENDING_BOOKINGS = [
  {
    id: "BK-20251205-001",
    requesterName: "Nguyen Van A",
    requesterRole: "Student",
    requesterDept: "Software Engineering",
    facilityName: "Computer Lab 201",
    date: "2025-12-05",
    time: "09:00 - 11:00",
    purpose: "Project work",
    participants: 5,
    noShowCount: 0,
    requestedAt: "2025-12-04 10:30",
    status: "Pending",
  },
  {
    id: "BK-20251206-002",
    requesterName: "Tran Thi B",
    requesterRole: "Student",
    requesterDept: "Business",
    facilityName: "Meeting Room 301",
    date: "2025-12-06",
    time: "14:00 - 15:30",
    purpose: "Club meeting",
    participants: 8,
    noShowCount: 1,
    requestedAt: "2025-12-04 14:15",
    status: "Pending",
  },
  {
    id: "BK-20251207-003",
    requesterName: "Prof. Le Van C",
    requesterRole: "Lecturer",
    requesterDept: "Software Engineering",
    facilityName: "Auditorium",
    date: "2025-12-07",
    time: "10:00 - 12:00",
    purpose: "Class session",
    participants: 100,
    noShowCount: 0,
    requestedAt: "2025-12-04 09:00",
    status: "Pending",
  },
]

const MOCK_APPROVED_BOOKINGS = [
  {
    id: "BK-20251201-001",
    requesterName: "Pham Van D",
    requesterRole: "Student",
    facilityName: "Study Room 105",
    date: "2025-12-01",
    time: "16:00 - 18:00",
    purpose: "Group study",
    participants: 4,
    approvedAt: "2025-11-30 11:20",
    approvedBy: "Admin User",
    status: "Approved",
  },
  {
    id: "BK-20251202-002",
    requesterName: "Hoang Thi E",
    requesterRole: "Student",
    facilityName: "Meeting Room 302",
    date: "2025-12-02",
    time: "10:00 - 11:30",
    purpose: "Presentation",
    participants: 6,
    approvedAt: "2025-12-01 15:45",
    approvedBy: "Admin User",
    status: "Approved",
  },
]

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState(MOCK_PENDING_BOOKINGS)
  const [approvedBookings, setApprovedBookings] = useState(MOCK_APPROVED_BOOKINGS)
  const [selectedBooking, setSelectedBooking] = useState<(typeof MOCK_PENDING_BOOKINGS)[0] | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredBookings = bookings.filter(
    (b) =>
      b.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleApprove = (id: string) => {
    const booking = bookings.find((b) => b.id === id)
    if (booking) {
      const approvedBooking = {
        ...booking,
        approvedAt: new Date().toLocaleString(),
        approvedBy: "Admin User",
        status: "Approved",
      }
      setApprovedBookings([approvedBooking, ...approvedBookings])
      setBookings(bookings.filter((b) => b.id !== id))
      setSelectedBooking(null)
      setActionType(null)
    }
  }

  const handleReject = (id: string) => {
    if (rejectReason.trim()) {
      setBookings(bookings.filter((b) => b.id !== id))
      setSelectedBooking(null)
      setActionType(null)
      setRejectReason("")
    }
  }

  const handleCancel = (id: string) => {
    setApprovedBookings(approvedBookings.filter((b) => b.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
        <p className="text-muted-foreground">Review and approve facility booking requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold text-primary">{bookings.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Approved This Month</p>
          <p className="text-3xl font-bold text-primary">{approvedBookings.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg. Approval Time</p>
          <p className="text-3xl font-bold text-primary">2.5h</p>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending ({bookings.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          <Card className="p-4">
            <Input
              placeholder="Search by facility, requester, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Card>

          {filteredBookings.length === 0 ? (
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
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Booking ID: {booking.id}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      booking.noShowCount > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {booking.noShowCount > 0 ? `${booking.noShowCount} no-shows` : "No issues"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Requester</p>
                    <p className="font-medium">{booking.requesterName}</p>
                    <p className="text-xs text-muted-foreground">{booking.requesterRole}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Date & Time</p>
                    <p className="font-medium">{booking.date}</p>
                    <p className="text-xs">{booking.time}</p>
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
        </TabsContent>

        <TabsContent value="approved" className="mt-4 space-y-4">
          {approvedBookings.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No approved bookings</p>
            </Card>
          ) : (
            approvedBookings.map((booking) => (
              <Card key={booking.id} className="p-4 hover:shadow-lg transition-shadow border-l-4 border-green-400">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{booking.facilityName}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Approved
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {booking.date} • {booking.time}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <span>
                        {booking.requesterName} ({booking.requesterRole})
                      </span>
                      <span>Approved: {booking.approvedAt}</span>
                      <span>By: {booking.approvedBy}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive ml-4 bg-transparent"
                    onClick={() => handleCancel(booking.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

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
                  <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
                  <p className="font-bold">{selectedBooking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">Pending</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Facility</p>
                  <p className="font-bold">{selectedBooking.facilityName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-bold">{selectedBooking.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Time</p>
                  <p className="font-bold">{selectedBooking.time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Purpose</p>
                  <p className="font-bold">{selectedBooking.purpose}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Requester Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedBooking.requesterName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="font-medium">{selectedBooking.requesterRole}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="font-medium">{selectedBooking.requesterDept}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">No-show Count</p>
                    <p className={`font-medium ${selectedBooking.noShowCount > 0 ? "text-destructive" : ""}`}>
                      {selectedBooking.noShowCount}
                    </p>
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
                <span className="font-medium">Date:</span> {selectedBooking.date}
              </p>
              <p>
                <span className="font-medium">Time:</span> {selectedBooking.time}
              </p>
              <p>
                <span className="font-medium">Requester:</span> {selectedBooking.requesterName}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => handleApprove(selectedBooking.id)}
              >
                Confirm Approve
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setActionType(null)
                }}
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

            <div>
              <label className="block text-sm font-medium mb-2">Rejection Reason</label>
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
                onClick={() => handleReject(selectedBooking.id)}
                disabled={!rejectReason}
              >
                Reject
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setActionType(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

