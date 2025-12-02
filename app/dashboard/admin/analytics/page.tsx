"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ANALYTICS_DATA = {
  overview: {
    totalBookings: 487,
    approvalRate: 92.5,
    noShowRate: 8.2,
    averageApprovalTime: "2.4h",
    userSatisfaction: 4.6,
  },
  facilityUsage: [
    { facility: "Computer Lab 201", bookings: 89, hours: 178, utilization: 85 },
    { facility: "Meeting Room 301", bookings: 65, hours: 97, utilization: 72 },
    { facility: "Auditorium", bookings: 34, hours: 102, utilization: 54 },
    { facility: "Study Room 105", bookings: 52, hours: 78, utilization: 63 },
    { facility: "Meeting Room 302", bookings: 41, hours: 61, utilization: 58 },
  ],
  peakHours: [
    { hour: "09:00", bookings: 45 },
    { hour: "10:00", bookings: 62 },
    { hour: "11:00", bookings: 58 },
    { hour: "12:00", bookings: 38 },
    { hour: "14:00", bookings: 71 },
    { hour: "15:00", bookings: 68 },
    { hour: "16:00", bookings: 55 },
  ],
  userActivity: [
    { role: "Student", bookings: 380, percentage: 78 },
    { role: "Lecturer", bookings: 107, percentage: 22 },
  ],
}

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState("month")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
        <p className="text-muted-foreground">System-wide usage statistics and insights</p>
      </div>

      <div className="flex gap-2">
        <Button variant={dateRange === "week" ? "default" : "outline"} onClick={() => setDateRange("week")}>
          Week
        </Button>
        <Button variant={dateRange === "month" ? "default" : "outline"} onClick={() => setDateRange("month")}>
          Month
        </Button>
        <Button variant={dateRange === "year" ? "default" : "outline"} onClick={() => setDateRange("year")}>
          Year
        </Button>
        <Button variant="outline" className="ml-auto bg-transparent">
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-primary">{ANALYTICS_DATA.overview.totalBookings}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Approval Rate</p>
          <p className="text-3xl font-bold text-primary">{ANALYTICS_DATA.overview.approvalRate}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">No-show Rate</p>
          <p className="text-3xl font-bold text-destructive">{ANALYTICS_DATA.overview.noShowRate}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg Approval Time</p>
          <p className="text-3xl font-bold text-primary">{ANALYTICS_DATA.overview.averageApprovalTime}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Satisfaction</p>
          <p className="text-3xl font-bold text-primary">★ {ANALYTICS_DATA.overview.userSatisfaction}</p>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="w-full">
        <TabsList>
          <TabsTrigger value="usage">Facility Usage</TabsTrigger>
          <TabsTrigger value="peakhours">Peak Hours</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="mt-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Facility Utilization Report</h2>
            <div className="space-y-4">
              {ANALYTICS_DATA.facilityUsage.map((facility, i) => (
                <div key={i} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">{facility.facility}</h3>
                    <span className="text-sm font-medium text-primary">{facility.utilization}% utilized</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 mb-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${facility.utilization}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <span>{facility.bookings} bookings</span>
                    <span>{facility.hours} hours</span>
                    <span className={facility.utilization > 70 ? "text-orange-600 font-medium" : ""}>
                      {facility.utilization > 90
                        ? "High Demand"
                        : facility.utilization > 70
                          ? "Normal"
                          : "Underutilized"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="peakhours" className="mt-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Peak Hours Analysis</h2>
            <div className="space-y-3">
              {ANALYTICS_DATA.peakHours.map((hour, i) => {
                const maxBookings = Math.max(...ANALYTICS_DATA.peakHours.map((h) => h.bookings))
                const percentage = (hour.bookings / maxBookings) * 100
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-16 font-bold text-sm text-muted-foreground">{hour.hour}</div>
                    <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden relative">
                      <div
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium text-primary w-16 text-right">{hour.bookings}</div>
                  </div>
                )
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Peak booking times are between 2-4 PM. Consider adjusting facility capacity or adding more facilities
              during these hours.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">User Activity</h2>
            <div className="space-y-6">
              {ANALYTICS_DATA.userActivity.map((user, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">{user.role}</h3>
                    <span className="text-sm text-primary font-medium">{user.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${user.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{user.bookings} total bookings</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

