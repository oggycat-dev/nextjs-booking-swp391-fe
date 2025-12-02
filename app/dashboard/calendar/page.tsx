"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7 AM to 10 PM

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string>("2025-12-05")
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day")

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const renderDayView = () => (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Day View - {selectedDate}</h3>
        <div className="space-y-2">
          {HOURS.map((hour) => (
            <div key={hour} className="flex gap-4">
              <div className="w-16 text-sm font-medium text-muted-foreground">
                {hour.toString().padStart(2, "0")}:00
              </div>
              <div className="flex-1 h-12 border border-input rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold mb-4">Bookings Today</h3>
        <div className="space-y-2 text-sm">
          <div className="p-3 bg-primary/10 text-primary rounded-lg border border-primary/20">
            10:00 - 11:30: Meeting Room 301 (Team meeting)
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-lg border border-primary/20">
            14:00 - 16:00: Study Room 105 (Group study)
          </div>
        </div>
      </Card>
    </div>
  )

  const renderWeekView = () => (
    <Card className="p-6">
      <h3 className="font-bold text-lg mb-4">Week View</h3>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-2 min-w-full">
          <div className="font-bold text-sm">Time</div>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="font-bold text-sm text-center">
              {day}
            </div>
          ))}
          {HOURS.map((hour) => (
            <div key={`row-${hour}`} className="contents">
              <div className="text-xs text-muted-foreground">{hour}:00</div>
              {Array(7)
                .fill(null)
                .map((_, i) => (
                  <div
                    key={`${hour}-${i}`}
                    className="h-10 border border-input rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )

  const renderMonthView = () => {
    const today = new Date(selectedDate)
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(today)
    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return (
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">
          {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="font-bold text-sm text-center p-2">
              {day}
            </div>
          ))}
          {days.map((day, i) => (
            <div
              key={i}
              className={`h-20 border rounded-lg p-2 ${
                day
                  ? "bg-muted/50 hover:bg-muted cursor-pointer transition-colors border-input"
                  : "bg-background border-transparent"
              }`}
            >
              {day && <p className="font-bold text-sm mb-1">{day}</p>}
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Calendar View</h1>
        <p className="text-muted-foreground">View facility availability and your bookings</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setViewMode("day")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === "day" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
        >
          Day
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === "week" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setViewMode("month")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === "month" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
        >
          Month
        </button>
      </div>

      {viewMode === "day" && renderDayView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "month" && renderMonthView()}
    </div>
  )
}

