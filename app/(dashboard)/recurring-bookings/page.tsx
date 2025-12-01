"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MOCK_RECURRING_BOOKINGS = [
  {
    id: "RB-001",
    facilityName: "Computer Lab 201",
    type: "Lab",
    courseCode: "SE101",
    courseName: "Web Development Basics",
    startDate: "2025-12-01",
    endDate: "2026-02-28",
    recurrence: "Weekly (Mon, Wed, Fri)",
    time: "09:00 - 11:00",
    capacity: 30,
    status: "Active",
    instances: 24,
  },
  {
    id: "RB-002",
    facilityName: "Meeting Room 301",
    type: "Meeting Room",
    courseCode: "SE102",
    courseName: "Software Design Patterns",
    startDate: "2025-12-02",
    endDate: "2026-02-28",
    recurrence: "Weekly (Tuesday, Thursday)",
    time: "14:00 - 15:30",
    capacity: 15,
    status: "Active",
    instances: 16,
  },
  {
    id: "RB-003",
    facilityName: "Auditorium",
    type: "Auditorium",
    courseCode: "SE103",
    courseName: "Software Project Management",
    startDate: "2025-11-20",
    endDate: "2025-12-31",
    recurrence: "Weekly (Monday)",
    time: "10:00 - 12:00",
    capacity: 100,
    status: "Ended",
    instances: 6,
  },
]

export default function RecurringBookingsPage() {
  const [bookings, setBookings] = useState(MOCK_RECURRING_BOOKINGS)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<(typeof MOCK_RECURRING_BOOKINGS)[0] | null>(null)

  const activeBookings = bookings.filter((b) => b.status === "Active")
  const endedBookings = bookings.filter((b) => b.status === "Ended")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Recurring Bookings</h1>
          <p className="text-muted-foreground">Manage semester-long and recurring facility reservations</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setShowCreateModal(true)}
        >
          Create Recurring Booking
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Recurring</p>
          <p className="text-3xl font-bold text-primary">{activeBookings.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Instances</p>
          <p className="text-3xl font-bold text-primary">{bookings.reduce((acc, b) => acc + b.instances, 0)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Ended Series</p>
          <p className="text-3xl font-bold text-primary">{endedBookings.length}</p>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
          <TabsTrigger value="ended">Ended ({endedBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {activeBookings.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No active recurring bookings</p>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setShowCreateModal(true)}
              >
                Create One
              </Button>
            </Card>
          ) : (
            activeBookings.map((booking) => (
              <Card
                key={booking.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{booking.facilityName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.courseCode}: {booking.courseName}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Active</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Recurrence</p>
                    <p className="font-medium text-sm">{booking.recurrence}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-medium text-sm">{booking.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Period</p>
                    <p className="font-medium text-sm">
                      {booking.startDate} to {booking.endDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Instances</p>
                    <p className="font-medium text-sm">{booking.instances} bookings</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View All Instances
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    Cancel Series
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="ended" className="space-y-4 mt-4">
          {endedBookings.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No ended recurring bookings</p>
            </Card>
          ) : (
            endedBookings.map((booking) => (
              <Card
                key={booking.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer opacity-75"
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{booking.facilityName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.courseCode}: {booking.courseName}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">Ended</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Recurrence</p>
                    <p className="font-medium text-sm">{booking.recurrence}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Period</p>
                    <p className="font-medium text-sm">
                      {booking.startDate} to {booking.endDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Instances</p>
                    <p className="font-medium text-sm">{booking.instances}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedBooking.facilityName}</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Course</p>
                <p className="font-bold">
                  {selectedBooking.courseCode}: {selectedBooking.courseName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Recurrence Pattern</p>
                  <p className="font-bold">{selectedBooking.recurrence}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Time</p>
                  <p className="font-bold">{selectedBooking.time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                  <p className="font-bold">{selectedBooking.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">End Date</p>
                  <p className="font-bold">{selectedBooking.endDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Capacity</p>
                  <p className="font-bold">{selectedBooking.capacity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Instances</p>
                  <p className="font-bold">{selectedBooking.instances}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {selectedBooking.status === "Active" && (
                <>
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Edit Series</Button>
                  <Button variant="outline" className="flex-1 text-destructive hover:text-destructive bg-transparent">
                    Cancel Series
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Create Recurring Booking</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Course</label>
                <select className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                  <option>SE101 - Web Development Basics</option>
                  <option>SE102 - Software Design Patterns</option>
                  <option>SE103 - Advanced Python</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Facility</label>
                <select className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                  <option>Computer Lab 201</option>
                  <option>Meeting Room 301</option>
                  <option>Auditorium</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <Input type="date" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <Input type="time" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <Input type="time" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Recurrence Pattern</label>
                <div className="space-y-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                    <label key={day} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-primary rounded" />
                      <span className="text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Create Recurring Booking
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
