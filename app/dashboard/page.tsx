"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function DashboardPage() {
  // TODO: Fetch real data from API
  const upcomingBookings = [
    {
      id: 1,
      facilityName: "Meeting Room 301",
      date: "2025-12-05",
      time: "10:00 - 11:30",
      status: "Approved",
    },
  ]

  const statistics = {
    totalBookings: 5,
    noShowCount: 0,
    favoriteCount: 3,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to FPT Facility Booking System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Bookings</p>
          <p className="text-3xl font-bold text-primary">{statistics.totalBookings}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">No-show Count</p>
          <p className="text-3xl font-bold text-primary">{statistics.noShowCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Favorite Facilities</p>
          <p className="text-3xl font-bold text-primary">{statistics.favoriteCount}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Upcoming Bookings</h2>
            {upcomingBookings.length === 0 ? (
              <p className="text-muted-foreground">No upcoming bookings</p>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{booking.facilityName}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.date} • {booking.time}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/dashboard/search" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Search Facilities
                </Button>
              </Link>
              <Link href="/dashboard/bookings" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  View All Bookings
                </Button>
              </Link>
              <Link href="/dashboard/search?action=new" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Create Booking
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

