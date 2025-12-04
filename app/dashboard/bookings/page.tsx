"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BookingsPage() {
  // TODO: Integrate with real API
  const bookings: any[] = []
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  const getBookingsByStatus = (status: string) => {
    if (status === "all") return bookings
    return bookings.filter((b) => b.status.toLowerCase() === status.toLowerCase())
  }

  const renderBookingCard = (booking: any) => (
    <Card key={booking.id} className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg">{booking.facilityName}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${booking.statusColor}`}>
              {booking.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Booking ID: {booking.id}</p>
          <p className="text-sm mb-1">
            {booking.date} • {booking.time}
          </p>
          <p className="text-sm text-muted-foreground">
            Purpose: {booking.purpose} • {booking.participants} participants
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
            Details
          </Button>
          {booking.status === "Approved" && (
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">View and manage all your facility bookings</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({bookings.filter((b) => b.status === "Pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({bookings.filter((b) => b.status === "Approved").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({bookings.filter((b) => b.status === "Completed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {getBookingsByStatus("all").map(renderBookingCard)}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4 mt-4">
          {getBookingsByStatus("pending").map(renderBookingCard)}
        </TabsContent>
        <TabsContent value="approved" className="space-y-4 mt-4">
          {getBookingsByStatus("approved").map(renderBookingCard)}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4 mt-4">
          {getBookingsByStatus("completed").map(renderBookingCard)}
        </TabsContent>
      </Tabs>

      {selectedBooking && (
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
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="font-bold">{selectedBooking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedBooking.statusColor}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Facility</p>
                  <p className="font-bold">{selectedBooking.facilityName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-bold">{selectedBooking.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-bold">{selectedBooking.time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="font-bold">{selectedBooking.participants}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {selectedBooking.status === "Approved" && (
                <>
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Check-in</Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
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
    </div>
  )
}

