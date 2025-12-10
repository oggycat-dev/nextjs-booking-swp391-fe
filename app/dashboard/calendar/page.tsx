"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { useFacilities } from "@/hooks/use-facility"
import { bookingApi } from "@/lib/api/booking"
import type { BookingCalendarDto, Facility } from "@/types"
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SearchableSelect } from "@/components/ui/searchable-select"

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7 AM to 10 PM

// Helper function to get week dates
function getWeekDates(date: Date) {
  const current = new Date(date)
  const day = current.getDay()
  // Adjust for Sunday (0) to be treated as day 7 (last day of week)
  const diff = current.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(current.setDate(diff))
  
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday)
    dayDate.setDate(monday.getDate() + i)
    weekDates.push(dayDate)
  }
  return weekDates
}

export default function CalendarPage() {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [selectedFacility, setSelectedFacility] = useState<string>("")
  const [bookings, setBookings] = useState<BookingCalendarDto[]>([])
  const [selectedBooking, setSelectedBooking] = useState<BookingCalendarDto | null>(null)
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const { facilities, fetchFacilities } = useFacilities()
  
  useEffect(() => {
    fetchFacilities()
  }, [])
  
  useEffect(() => {
    fetchCalendarBookings()
  }, [currentWeek, selectedFacility])
  
  const fetchCalendarBookings = async () => {
    setIsLoadingBookings(true)
    try {
      const weekDates = getWeekDates(currentWeek)
      const startDate = weekDates[0].toISOString().split('T')[0] // YYYY-MM-DD
      const endDate = weekDates[6].toISOString().split('T')[0] // YYYY-MM-DD
      
      const response = await bookingApi.getCalendarBookings({
        startDate,
        endDate,
        facilityId: selectedFacility || undefined,
      })
      
      if (response.success && response.data) {
        setBookings(response.data)
      } else {
        setBookings([])
      }
    } catch (error) {
      console.error('Failed to fetch calendar bookings:', error)
      setBookings([])
    } finally {
      setIsLoadingBookings(false)
    }
  }

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
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to midnight
    setCurrentWeek(today)
  }
  
  const formatWeekRange = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  // Get bookings for a specific day
  const getBookingsForDay = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate)
      return bookingDate.toDateString() === date.toDateString()
    })
  }

  // Calculate position and height for booking bar
  const getBookingStyle = (booking: BookingCalendarDto) => {
    const startHour = parseInt(booking.startTime.split(':')[0])
    const startMinute = parseInt(booking.startTime.split(':')[1])
    const endHour = parseInt(booking.endTime.split(':')[0])
    const endMinute = parseInt(booking.endTime.split(':')[1])
    
    // Calculate position from 7:00
    const topPosition = (startHour - 7) * 40 + (startMinute / 60) * 40
    
    // Calculate height based on duration
    const durationHours = (endHour - startHour) + (endMinute - startMinute) / 60
    const height = durationHours * 40
    
    return {
      top: `${topPosition}px`,
      height: `${Math.max(height, 20)}px`, // Minimum 20px height
    }
  }

  const renderWeekView = () => (
    <Card className="p-6">
      {isLoadingBookings && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading bookings...</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <div className="relative">
          {/* Header */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="font-bold text-sm">Time</div>
            {weekDates.map((date, i) => {
              const isToday = new Date().toDateString() === date.toDateString()
              return (
                <div key={i} className={`font-bold text-sm text-center rounded-t-lg py-1 ${isToday ? 'bg-muted/60' : ''}`}>
                  <div>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</div>
                  <div className="text-xs font-normal text-muted-foreground">
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Time grid background */}
          <div className="grid grid-cols-8 gap-2">
            <div className="space-y-[0px]">
              {HOURS.map((hour) => (
                <div key={hour} className="h-10 text-xs text-muted-foreground flex items-start">
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Day columns with booking overlays */}
            {weekDates.map((date, i) => {
              const isToday = new Date().toDateString() === date.toDateString()
              return (
                <div key={i} className="relative">
                  {/* Background grid */}
                  <div className="space-y-[0px]">
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className={`h-10 border-t border-input ${isToday ? 'bg-muted/40' : 'bg-muted/20'}`}
                      />
                    ))}
                  </div>

                {/* Booking bars overlay */}
                <div className="absolute inset-0">
                  {getBookingsForDay(date).map((booking, idx) => {
                    const style = getBookingStyle(booking)
                    const height = parseInt(style.height)
                    
                    // Determine styling based on status
                    const statusColor = 
                      booking.status === 'Approved' 
                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-700'
                        : booking.status === 'InUse'
                        ? 'bg-gradient-to-br from-pink-400 to-pink-600 border-pink-700 text-white hover:from-pink-500 hover:to-pink-700'
                        : booking.status === 'Pending'
                        ? 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-700 text-white hover:from-gray-500 hover:to-gray-700'
                        : booking.status === 'WaitingLecturerApproval' || booking.status === 'WaitingAdminApproval'
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-700 text-white hover:from-amber-500 hover:to-amber-700'
                        : 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-700 text-white hover:from-blue-500 hover:to-blue-700'
                    
                    // Adapt text size based on height
                    const isSmall = height < 40
                    const isMedium = height >= 40 && height < 80
                    const isLarge = height >= 80
                    
                    return (
                      <div
                        key={`${booking.id}-${idx}`}
                        className={`absolute left-0 right-0 rounded-lg border-l-[5px] shadow-md cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] ${statusColor}`}
                        style={style}
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <div className={`h-full flex flex-col justify-center ${isSmall ? 'px-1.5 py-0.5' : isMedium ? 'px-2 py-1' : 'px-3 py-2'}`}>
                          <div className={`font-bold truncate ${isSmall ? 'text-[10px]' : isMedium ? 'text-xs' : 'text-sm'}`}>
                            {booking.facilityName}
                          </div>
                          <div className={`opacity-90 truncate ${isSmall ? 'text-[8px]' : isMedium ? 'text-[10px]' : 'text-xs'}`}>
                            {booking.startTime.slice(0,5)} - {booking.endTime.slice(0,5)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar View</h1>
          <p className="text-muted-foreground">View facility availability and your bookings</p>
        </div>
        
        {/* Status Legend */}
        <div className="flex flex-col gap-2 bg-muted/30 p-4 rounded-lg border">
          <p className="text-sm font-semibold mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-400 to-emerald-600 border border-emerald-700"></div>
            <span className="text-xs">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-700"></div>
            <span className="text-xs">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-700"></div>
            <span className="text-xs">Waiting Lecture Approval</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-pink-400 to-pink-600 border border-pink-700"></div>
            <span className="text-xs">In Use</span>
          </div>
        </div>
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
            
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{formatWeekRange()}</p>
            </div>
            
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-5 h-5" />
              
            </button>

                        <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Today
            </button>
          </div>

          {/* Facility Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm font-medium whitespace-nowrap">Select Facility:</label>
            <div className="flex-1 md:min-w-[250px]">
              <SearchableSelect
                options={facilities}
                value={selectedFacility}
                onValueChange={(value) => setSelectedFacility(value)}
                getOptionLabel={(facility: Facility) => `${facility.facilityName} (${facility.typeName})`}
                getOptionValue={(facility: Facility) => facility.id}
                placeholder="All Facilities"
                searchPlaceholder="Search facilities..."
                emptyMessage="No facility found."
              />
            </div>
          </div>
        </div>
      </Card>

      {renderWeekView()}

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Booking Code</label>
                  <p className="text-base font-semibold">{selectedBooking.bookingCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge 
                      variant="secondary"
                      className={
                        selectedBooking.status === 'Approved' 
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white hover:from-emerald-500 hover:to-emerald-700' 
                          : selectedBooking.status === 'InUse'
                          ? 'bg-gradient-to-br from-pink-400 to-pink-600 text-white hover:from-pink-500 hover:to-pink-700'
                          : selectedBooking.status === 'Pending'
                          ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white hover:from-gray-500 hover:to-gray-700'
                          : selectedBooking.status === 'WaitingLecturerApproval' || selectedBooking.status === 'WaitingAdminApproval'
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700'
                          : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700'
                      }
                    >
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Facility Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Facility Name</label>
                    <p className="text-base">{selectedBooking.facilityName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Facility Code</label>
                    <p className="text-base">{selectedBooking.facilityCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Campus</label>
                    <p className="text-base">{selectedBooking.campusName}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <p className="text-base">{new Date(selectedBooking.bookingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Time</label>
                    <p className="text-base">{selectedBooking.startTime.slice(0,5)} - {selectedBooking.endTime.slice(0,5)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Number of Participants</label>
                    <p className="text-base">👥 {selectedBooking.numParticipants} people</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Booked By</label>
                    <p className="text-base">{selectedBooking.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <p className="text-base">{selectedBooking.userRole}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-muted-foreground">Purpose</label>
                <p className="text-base mt-1">{selectedBooking.purpose}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

