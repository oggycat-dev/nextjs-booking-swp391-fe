"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const REPORT_DATA = {
  facilityUsage: [
    { facility: "Computer Lab 201", bookings: 45, hours: 90, utilization: 85 },
    { facility: "Meeting Room 301", bookings: 32, hours: 48, utilization: 72 },
    { facility: "Study Room 105", bookings: 28, hours: 42, utilization: 63 },
    { facility: "Auditorium", bookings: 12, hours: 36, utilization: 54 },
  ],
  departmentStats: {
    totalBookings: 117,
    totalHours: 216,
    averageUtilization: 68.5,
    topBooker: "Prof. Nguyen Van A",
  },
}

export default function DepartmentReportsPage() {
  const [dateRange, setDateRange] = useState("month")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Department Reports</h1>
        <p className="text-muted-foreground">View facility usage statistics for your department</p>
      </div>

      <div className="flex gap-2">
        <Button variant={dateRange === "week" ? "default" : "outline"} onClick={() => setDateRange("week")}>
          Week
        </Button>
        <Button variant={dateRange === "month" ? "default" : "outline"} onClick={() => setDateRange("month")}>
          Month
        </Button>
        <Button variant={dateRange === "semester" ? "default" : "outline"} onClick={() => setDateRange("semester")}>
          Semester
        </Button>
        <Button variant="outline" className="ml-auto bg-transparent">
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-primary">{REPORT_DATA.departmentStats.totalBookings}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Hours</p>
          <p className="text-3xl font-bold text-primary">{REPORT_DATA.departmentStats.totalHours}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg Utilization</p>
          <p className="text-3xl font-bold text-primary">{REPORT_DATA.departmentStats.averageUtilization}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Top Booker</p>
          <p className="font-bold text-sm">{REPORT_DATA.departmentStats.topBooker}</p>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="w-full">
        <TabsList>
          <TabsTrigger value="usage">Facility Usage</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="mt-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Facility Usage by Department</h2>
            <div className="space-y-4">
              {REPORT_DATA.facilityUsage.map((item, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">{item.facility}</h3>
                    <span className="text-sm font-medium text-primary">{item.utilization}% utilized</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${item.utilization}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <span>{item.bookings} bookings</span>
                    <span>{item.hours} hours booked</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Booking Trends</h2>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Chart visualization would go here (use a charting library)</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Department Comparison</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Software Engineering</p>
                <div className="w-full bg-muted rounded-full h-3 mb-1">
                  <div className="bg-primary h-full rounded-full" style={{ width: "78%" }} />
                </div>
                <p className="text-xs text-muted-foreground">78% of total bookings</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Business Administration</p>
                <div className="w-full bg-muted rounded-full h-3 mb-1">
                  <div className="bg-primary h-full rounded-full" style={{ width: "15%" }} />
                </div>
                <p className="text-xs text-muted-foreground">15% of total bookings</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Marketing</p>
                <div className="w-full bg-muted rounded-full h-3 mb-1">
                  <div className="bg-primary h-full rounded-full" style={{ width: "7%" }} />
                </div>
                <p className="text-xs text-muted-foreground">7% of total bookings</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
