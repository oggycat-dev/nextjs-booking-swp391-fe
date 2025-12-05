"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { useFacilities } from "@/hooks/use-facility"
import { ChevronLeft, ChevronRight } from "lucide-react"

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7 AM to 10 PM

// Helper function to get week dates
function getWeekDates(date: Date) {
  const current = new Date(date)
  const first = current.getDate() - current.getDay() + 1 // Monday
  const monday = new Date(current.setDate(first))
  
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    weekDates.push(day)
  }
  return weekDates
}

export default function CalendarPage() {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [selectedFacility, setSelectedFacility] = useState<string>("")
  const { facilities, fetchFacilities } = useFacilities()
  
  useEffect(() => {
    fetchFacilities()
  }, [])

  const weekDates = getWeekDates(currentWeek)
  
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() - 7)
    setCurrentWeek(newDate)
  }
  
  const goToNextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + 7)
    setCurrentWeek(newDate)
  }
  
  const goToToday = () => {
    setCurrentWeek(new Date())
  }
  
  const formatWeekRange = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const renderWeekView = () => (
    <Card className="p-6">
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-2 min-w-full">
          <div className="font-bold text-sm">Time</div>
          {weekDates.map((date, i) => (
            <div key={i} className="font-bold text-sm text-center">
              <div>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</div>
              <div className="text-xs font-normal text-muted-foreground">
                {date.getDate()}/{date.getMonth() + 1}
              </div>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Calendar View</h1>
        <p className="text-muted-foreground">View facility availability and your bookings</p>
      </div>

      {/* Week Navigation and Facility Selector */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Week Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousWeek}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center min-w-[200px]">
              <p className="text-sm font-semibold">{formatWeekRange()}</p>
              <button
                onClick={goToToday}
                className="text-xs text-primary hover:underline mt-1"
              >
                Today
              </button>
            </div>
            
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Facility Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm font-medium whitespace-nowrap">Select Facility:</label>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="flex-1 md:min-w-[250px] px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Facilities</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.facilityName} ({facility.typeName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {renderWeekView()}
    </div>
  )
}

