"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useBookingMutations } from "@/hooks/use-booking"
import { useCampus } from "@/hooks/use-campus"
import { useHolidays } from "@/hooks/use-holidays"
import { bookingApi } from "@/lib/api/booking"
import type { Facility, BookingCalendarDto } from "@/types"
import { Loader2 } from "lucide-react"

interface BookingModalProps {
  facility: Facility
  isOpen: boolean
  onClose: () => void
  onBookingCreated?: () => void
}

interface FieldErrors {
  date?: string
  startTime?: string
  endTime?: string
  purpose?: string
  participants?: string
  lecturerEmail?: string
}

export function BookingModal({ facility, isOpen, onClose, onBookingCreated }: BookingModalProps) {
  const { toast } = useToast()
  const { getCurrentUser } = useAuth()
  const { createBooking, isLoading, error } = useBookingMutations()

  const user = getCurrentUser()
  const userRole = user?.role ? String(user.role).toLowerCase() : ""
  const isStudent = userRole === "student"

  const [step, setStep] = useState(1)
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [purpose, setPurpose] = useState("")
  const [participants, setParticipants] = useState("")
  const [lecturerEmail, setLecturerEmail] = useState("")
  const [equipment, setEquipment] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [dayBookings, setDayBookings] = useState<BookingCalendarDto[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)


  // Get campus working hours for client-side validation
  const { campus } = useCampus(facility.campusId)
  const { holidays } = useHolidays()

  // Fetch calendar bookings when date changes
  useEffect(() => {
    if (!date) {
      setDayBookings([])
      return
    }

    const fetchDayBookings = async () => {
      setIsLoadingBookings(true)
      try {
        const response = await bookingApi.getCalendarBookings({
          startDate: date,
          endDate: date,
          facilityId: facility.id,
        })

        if (response.success && response.data) {
          setDayBookings(response.data)
        } else {
          setDayBookings([])
        }
      } catch (error) {
        console.error('Failed to fetch day bookings:', error)
        setDayBookings([])
      } finally {
        setIsLoadingBookings(false)
      }
    }

    fetchDayBookings()
  }, [date, facility.id])

  const purposes = ["Group study", "Club meeting", "Project discussion", "Event rehearsal", "Class session", "Other"]

  const handleEquipmentToggle = (item: string) => {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]))
  }

  // Validation functions
  const validateDate = (value: string): string | undefined => {
    if (!value) return undefined
    const selectedDate = new Date(value)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    if (selectedDate < now) return "Cannot book in the past"
    return undefined
  }

  const validateStartTime = (value: string, dateValue: string): string | undefined => {
    if (!value) return undefined
    if (!dateValue) return undefined

    const now = new Date()
    const bookingDateTime = new Date(`${dateValue}T${value}:00`)

    if (bookingDateTime <= now) {
      const nowTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      return `Cannot book in the past. Current time is ${nowTime}. Please select a future time slot.`
    }

    if (endTime && value >= endTime) {
      return "End time must be after start time"
    }

    return undefined
  }

  const validateEndTime = (value: string, dateValue: string, startTimeValue: string): string | undefined => {
    if (!value) return undefined
    if (!startTimeValue) return undefined

    if (startTimeValue >= value) {
      return "End time must be after start time"
    }

    return undefined
  }

  // Ensure time like "07:04 PM" or "07:04" becomes HH:mm:ss 24-hour
  const ensureTimeFormatLocal = (time: string): string => {
    if (!time) return time
    let clean = time.trim()
    const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/)
    if (ampmMatch) {
      let h = parseInt(ampmMatch[1], 10)
      const m = ampmMatch[2]
      const p = ampmMatch[3].toUpperCase()
      if (p === 'PM' && h !== 12) h += 12
      if (p === 'AM' && h === 12) h = 0
      return `${h.toString().padStart(2, '0')}:${m}:00`
    }
    const parts = clean.split(':')
    if (parts.length >= 2) {
      const hh = parts[0].padStart(2, '0')
      const mm = parts[1]
      const ss = parts[2] || '00'
      return `${hh}:${mm}:${ss}`
    }
    return clean
  }

  const timeToMinutes = (t: string): number => {
    if (!t) return 0
    const fmt = ensureTimeFormatLocal(t)
    const [hh, mm] = fmt.split(':')
    return Number(hh) * 60 + Number(mm)
  }

  const validateWorkingHours = (start: string, end: string): string | undefined => {
    if (!campus) return undefined
    if (!start || !end) return undefined
    const campusStart = campus.workingHoursStart || '00:00:00'
    const campusEnd = campus.workingHoursEnd || '23:59:59'
    const campusStartMin = timeToMinutes(campusStart)
    const campusEndMin = timeToMinutes(campusEnd)
    const startMin = timeToMinutes(start)
    const endMin = timeToMinutes(end)

    if (startMin < campusStartMin || endMin > campusEndMin) {
      return `Booking time must be within campus working hours (${campusStart} - ${campusEnd})`
    }
    return undefined
  }

  const normalizeDate = (d?: string) => {
    if (!d) return ""
    try {
      const dt = new Date(d)
      if (isNaN(dt.getTime())) return d
      return dt.toISOString().split('T')[0]
    } catch (e) {
      return d
    }
  }

  // Re-validate date against holidays when holidays data arrives or date changes
  useEffect(() => {
    if (!date || !holidays || holidays.length === 0) return
    const norm = normalizeDate(date)
    const isHoliday = holidays.some(h => normalizeDate(h.holidayDate) === norm)
    if (isHoliday) {
      setFieldErrors(prev => ({ ...prev, date: "Cannot book facilities on holidays" }))
    } else {
      // only clear holiday message if previous error was holiday message
      setFieldErrors(prev => ({ ...prev, date: prev.date === "Cannot book facilities on holidays" ? undefined : prev.date }))
    }
  }, [holidays, date])

  const validateParticipants = (value: string): string | undefined => {
    if (!value) return undefined
    const participantsNum = Number.parseInt(value, 10)
    if (isNaN(participantsNum) || participantsNum < 1) {
      return "Please enter a valid number of participants (at least 1)"
    }
    if (participantsNum > facility.capacity) {
      return `Maximum capacity is ${facility.capacity} participants`
    }
    return undefined
  }

  const validateLecturerEmail = (value: string): string | undefined => {
    if (isStudent && !value.trim()) {
      return "Please provide your lecturer's email address"
    }
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Invalid email format"
    }
    return undefined
  }

  const validatePurpose = (value: string): string | undefined => {
    if (!value) return undefined
    return undefined
  }

  // Handle field changes with validation
  const handleDateChange = (value: string) => {
    setDate(value)
    const error = validateDate(value)
    setFieldErrors(prev => ({ ...prev, date: error }))
    // Check holiday
    if (holidays && holidays.length > 0) {
      const isHoliday = holidays.some(h => h.holidayDate === value)
      if (isHoliday) {
        setFieldErrors(prev => ({ ...prev, date: "Cannot book facilities on holidays" }))
      }
    }

    // Re-validate times when date changes
    if (startTime) {
      const startError = validateStartTime(startTime, value)
      setFieldErrors(prev => ({ ...prev, startTime: startError }))
    }

    // If both times present, validate against campus working hours
    if (startTime && endTime) {
      const wh = validateWorkingHours(startTime, endTime)
      if (wh) {
        setFieldErrors(prev => ({ ...prev, startTime: wh, endTime: wh }))
        // show inline errors only
      }
    }
  }

  const handleStartTimeChange = (value: string) => {
    setStartTime(value)
    const error = validateStartTime(value, date)
    setFieldErrors(prev => ({ ...prev, startTime: error }))

    // Re-validate end time when start time changes
    if (endTime) {
      const endError = validateEndTime(endTime, date, value)
      const wh = validateWorkingHours(value, endTime)
      setFieldErrors(prev => ({ ...prev, startTime: error || wh, endTime: endError || wh }))
      // show inline errors only
    }
  }

  const handleEndTimeChange = (value: string) => {
    setEndTime(value)
    const error = validateEndTime(value, date, startTime)
    setFieldErrors(prev => ({ ...prev, endTime: error }))

    if (startTime) {
      const wh = validateWorkingHours(startTime, value)
      setFieldErrors(prev => ({ ...prev, startTime: prev.startTime || wh, endTime: error || wh }))
      // show inline errors only
    }
  }

  const handleParticipantsChange = (value: string) => {
    setParticipants(value)
    const error = validateParticipants(value)
    setFieldErrors(prev => ({ ...prev, participants: error }))
  }

  const handleLecturerEmailChange = (value: string) => {
    setLecturerEmail(value)
    const error = validateLecturerEmail(value)
    setFieldErrors(prev => ({ ...prev, lecturerEmail: error }))
  }

  const handlePurposeChange = (value: string) => {
    setPurpose(value)
    const error = validatePurpose(value)
    setFieldErrors(prev => ({ ...prev, purpose: error }))
  }

  // Clear field errors and bookings when modal closes or resets
  useEffect(() => {
    if (!isOpen) {
      setFieldErrors({})
      setDayBookings([])
    }
  }, [isOpen])

  const handleSubmit = async () => {
    // Validate all fields
    const errors: FieldErrors = {}

    errors.date = validateDate(date)
    if (!errors.date && holidays && holidays.length > 0 && date) {
      const isHoliday = holidays.some(h => h.holidayDate === date)
      if (isHoliday) errors.date = "Cannot book facilities on holidays"
    }
    errors.startTime = validateStartTime(startTime, date)
    errors.endTime = validateEndTime(endTime, date, startTime)
    errors.purpose = validatePurpose(purpose)
    errors.participants = validateParticipants(participants)
    if (isStudent) {
      errors.lecturerEmail = validateLecturerEmail(lecturerEmail)
    }

    setFieldErrors(errors)

    // Check if there are any errors
    if (Object.values(errors).some(error => error !== undefined)) {
      // Scroll to first error field
      return
    }

    // Convert "HH:mm" (from input[type=time]) to "HH:mm:ss" as backend expects seconds
    const startTimeFormatted = startTime.length === 5 ? `${startTime}:00` : startTime
    const endTimeFormatted = endTime.length === 5 ? `${endTime}:00` : endTime

    const participantsNum = Number.parseInt(participants, 10)

    // Build booking data object, only including defined fields
    const bookingData: any = {
      facilityId: facility.id,
      bookingDate: date,
      // API expects "HH:mm:ss" (TimeSpan) for startTime/endTime
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      purpose: purpose.trim(),
      participants: participantsNum,
    }

    // Only add lecturerEmail if it's a student booking
    if (isStudent && lecturerEmail.trim()) {
      bookingData.lecturerEmail = lecturerEmail.trim()
    }

    // Only add notes if it's not empty
    if (notes.trim()) {
      bookingData.notes = notes.trim()
    }

    // Debug log (remove in production)
    console.log("Submitting booking data:", bookingData)

    try {
      const result = await createBooking(bookingData)

      if (result) {
        toast({
          title: "Booking Created",
          description: isStudent
            ? "Your booking request has been sent to the lecturer for approval"
            : "Your booking request has been sent to admin for approval",
        })
        onClose()
        // Reset form
        setStep(1)
        setDate("")
        setStartTime("")
        setEndTime("")
        setPurpose("")
        setParticipants("")
        setLecturerEmail("")
        setEquipment([])
        setNotes("")
        setFieldErrors({})
        setDayBookings([])
        if (onBookingCreated) {
          onBookingCreated()
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create booking"

      // Determine if this error should be shown inline (field error) instead of toast
      const lower = errorMessage ? errorMessage.toLowerCase() : ""
      const isFieldError = lower.includes("time slot") || lower.includes("already booked") || lower.includes("time") || lower.includes("date") || lower.includes("working hours") || lower.includes("holiday") || lower.includes("holidays")

      // Only show destructive toast for non-field errors
      if (!isFieldError) {
        toast({
          description: errorMessage,
          variant: "destructive",
        })
      }

      // Check if it's a time slot conflict
      if (errorMessage && (lower.includes("time slot") || lower.includes("already booked"))) {
        const conflictError = `This time slot is already booked from ${startTime} to ${endTime}`
        setFieldErrors(prev => ({ ...prev, startTime: conflictError, endTime: conflictError }))
        // Go back to step 1 to show error after a small delay so user can see toast
        setTimeout(() => {
          setStep(1)
        }, 100)
      } else {
        // For other errors, set to appropriate fields
        // If error is related to time, set to time fields and go back to step 1
        if (errorMessage && (lower.includes("time") || lower.includes("date") || lower.includes("working hours") || lower.includes("holiday") || lower.includes("holidays"))) {
          // Map holiday/date/time errors to time/date fields so they appear inline
          if (lower.includes("holiday") || lower.includes("holidays")) {
            setFieldErrors(prev => ({ ...prev, date: errorMessage }))
          } else {
            setFieldErrors(prev => ({ ...prev, startTime: errorMessage, endTime: errorMessage }))
          }
          setTimeout(() => {
            setStep(1)
          }, 100)
        } else {
          // Other errors, show in step 4
          setFieldErrors(prev => ({ ...prev, startTime: errorMessage }))
        }
      }
    }
  }

  const getEquipmentList = (): string[] => {
    if (!facility.equipment) return []
    return facility.equipment.split(",").map((e) => e.trim()).filter(Boolean)
  }

  const availableEquipment = getEquipmentList()

  // Calendar helper functions
  const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7 AM to 10 PM

  const getBookingStyle = (booking: BookingCalendarDto) => {
    const gridStartHour = 7  // 7:00 AM
    const gridEndHour = 22   // 10:00 PM (22:00)

    const startHour = parseInt(booking.startTime.split(':')[0])
    const startMinute = parseInt(booking.startTime.split(':')[1])
    const endHour = parseInt(booking.endTime.split(':')[0])
    const endMinute = parseInt(booking.endTime.split(':')[1])

    // Check if booking spans across midnight
    const spansMidnight = endHour < startHour || (endHour === startHour && endMinute < startMinute)

    // For daily view, determine the visible portion of the booking
    // Calculate the start position (clamp to grid start if before)
    const visibleStartHour = Math.max(startHour, gridStartHour)
    const visibleStartMinute = startHour < gridStartHour ? 0 : startMinute

    // Calculate the end position (clamp to grid end or end of day for midnight-spanning bookings)
    let visibleEndHour: number
    let visibleEndMinute: number

    if (spansMidnight) {
      // Booking spans midnight - show until end of grid (22:00) or end of day
      visibleEndHour = gridEndHour
      visibleEndMinute = 59
    } else {
      // Normal booking - clamp to grid end if needed
      visibleEndHour = Math.min(endHour, gridEndHour)
      visibleEndMinute = endHour > gridEndHour ? 59 : endMinute
    }

    // Calculate top position from grid start (each hour = 40px, each minute = 40/60 px)
    const topPosition = (visibleStartHour - gridStartHour) * 40 + (visibleStartMinute / 60) * 40

    // Calculate height based on visible duration
    const durationMinutes = (visibleEndHour - visibleStartHour) * 60 + (visibleEndMinute - visibleStartMinute)
    const height = Math.max((durationMinutes / 60) * 40, 20) // Minimum 20px height

    return {
      top: `${topPosition}px`,
      height: `${height}px`,
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-700 text-white'
      case 'InUse':
        return 'bg-gradient-to-br from-pink-400 to-pink-600 border-pink-700 text-white'
      case 'Pending':
        return 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-700 text-white'
      case 'WaitingLecturerApproval':
      case 'WaitingAdminApproval':
        return 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-700 text-white'
      default:
        return 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-700 text-white'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Book {facility.facilityName}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-base">Date & Time</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                onBlur={() => {
                  let error = validateDate(date)
                  if (holidays && holidays.length > 0 && date) {
                    const isHoliday = holidays.some(h => h.holidayDate === date)
                    if (isHoliday) error = "Cannot book facilities on holidays"
                  }
                  setFieldErrors(prev => ({ ...prev, date: error }))
                }}
                min={new Date().toISOString().split("T")[0]}
                className={`h-9 ${fieldErrors.date ? "border-destructive" : ""}`}
              />
              {fieldErrors.date && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.date}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  onBlur={() => {
                    const error = validateStartTime(startTime, date)
                    let newErr = error
                    if (endTime) {
                      const wh = validateWorkingHours(startTime, endTime)
                      if (wh) {
                        newErr = newErr || wh
                        setFieldErrors(prev => ({ ...prev, startTime: newErr, endTime: wh }))
                        return
                      }
                    }
                    setFieldErrors(prev => ({ ...prev, startTime: newErr }))
                  }}
                  className={`h-9 ${fieldErrors.startTime ? "border-destructive" : ""}`}
                />
                {fieldErrors.startTime && (
                  <p className="text-sm text-destructive mt-1">{fieldErrors.startTime}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  onBlur={() => {
                    const error = validateEndTime(endTime, date, startTime)
                    let newErr = error
                    if (startTime) {
                      const wh = validateWorkingHours(startTime, endTime)
                      if (wh) {
                        newErr = newErr || wh
                        setFieldErrors(prev => ({ ...prev, startTime: wh, endTime: newErr }))
                        return
                      }
                    }
                    setFieldErrors(prev => ({ ...prev, endTime: newErr }))
                  }}
                  className={`h-9 ${fieldErrors.endTime ? "border-destructive" : ""}`}
                />
                {fieldErrors.endTime && (
                  <p className="text-sm text-destructive mt-1">{fieldErrors.endTime}</p>
                )}
              </div>
            </div>

            {/* Day Calendar View */}
            {date && (
              <div className="mt-4 border rounded-lg p-3 bg-muted/20">
                <h4 className="text-sm font-semibold mb-2">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                <div className="relative" style={{ minHeight: '640px' }}>
                  {isLoadingBookings ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading bookings...</span>
                    </div>
                  ) : (
                    <>
                      {/* Time labels */}
                      <div className="absolute left-0 top-0 w-12 space-y-[0px]">
                        {HOURS.map((hour) => (
                          <div key={hour} className="h-10 text-xs text-muted-foreground flex items-start pt-1">
                            {hour}:00
                          </div>
                        ))}
                      </div>

                      {/* Calendar grid */}
                      <div className="ml-14 relative">
                        {/* Background grid */}
                        <div className="space-y-[0px]">
                          {HOURS.map((hour) => (
                            <div
                              key={hour}
                              className="h-10 border-t border-input bg-muted/20"
                            />
                          ))}
                        </div>

                        {/* Booking bars overlay */}
                        <div className="absolute inset-0">
                          {dayBookings
                            .filter((booking) => {
                              // Filter out bookings that are completely outside visible range (7:00 - 22:00)
                              const startHour = parseInt(booking.startTime.split(':')[0])
                              const endHour = parseInt(booking.endTime.split(':')[0])
                              const endMinute = parseInt(booking.endTime.split(':')[1])

                              // If booking spans midnight, it's visible if it starts before grid end
                              if (endHour < startHour || (endHour === startHour && endMinute < parseInt(booking.startTime.split(':')[1]))) {
                                return startHour < 22 // Show if starts before 22:00
                              }

                              // For normal bookings, show if they overlap with visible range
                              return (startHour < 22) && (endHour >= 7)
                            })
                            .map((booking, idx) => {
                              const style = getBookingStyle(booking)
                              const height = parseFloat(style.height.replace('px', ''))
                              const statusColor = getStatusColor(booking.status)

                              // Check if booking spans midnight
                              const startHour = parseInt(booking.startTime.split(':')[0])
                              const endHour = parseInt(booking.endTime.split(':')[0])
                              const startMinute = parseInt(booking.startTime.split(':')[1])
                              const endMinute = parseInt(booking.endTime.split(':')[1])
                              const spansMidnight = endHour < startHour || (endHour === startHour && endMinute < startMinute)

                              // Adapt text size based on height
                              const isSmall = height < 40
                              const isMedium = height >= 40 && height < 80

                              // Format display time - if spans midnight, show end as "23:59" or grid end
                              let displayEndTime = booking.endTime.slice(0, 5)
                              if (spansMidnight) {
                                // For midnight-spanning bookings, show until end of day in daily view
                                displayEndTime = "23:59"
                              }

                              return (
                                <div
                                  key={`${booking.id}-${idx}`}
                                  className={`absolute left-0 right-0 rounded-lg border-l-[4px] shadow-sm ${statusColor}`}
                                  style={style}
                                  title={`${booking.startTime.slice(0, 5)} - ${booking.endTime.slice(0, 5)}${spansMidnight ? ' (overnight)' : ''} | ${booking.status}`}
                                >
                                  <div className={`h-full flex flex-col justify-center ${isSmall ? 'px-1.5 py-0.5' : isMedium ? 'px-2 py-1' : 'px-2 py-1.5'}`}>
                                    <div className={`font-semibold truncate ${isSmall ? 'text-[9px]' : isMedium ? 'text-[10px]' : 'text-xs'}`}>
                                      {booking.startTime.slice(0, 5)} - {displayEndTime}
                                      {spansMidnight && !isSmall && ' *'}
                                    </div>
                                    {!isSmall && (
                                      <div className={`opacity-90 truncate ${isMedium ? 'text-[9px]' : 'text-[10px]'}`}>
                                        {booking.status}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-base">Booking Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => handlePurposeChange(e.target.value)}
                  onBlur={() => {
                    const error = validatePurpose(purpose)
                    setFieldErrors(prev => ({ ...prev, purpose: error }))
                  }}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg bg-background h-9 ${fieldErrors.purpose ? "border-destructive" : "border-input"}`}
                >
                  <option value="">Select purpose</option>
                  {purposes.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {fieldErrors.purpose && (
                  <p className="text-sm text-destructive mt-1">{fieldErrors.purpose}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Participants (Max: {facility.capacity})
                </label>
                <Input
                  type="number"
                  min="1"
                  max={facility.capacity}
                  value={participants}
                  onChange={(e) => handleParticipantsChange(e.target.value)}
                  onBlur={() => {
                    const error = validateParticipants(participants)
                    setFieldErrors(prev => ({ ...prev, participants: error }))
                  }}
                  className={`h-9 ${fieldErrors.participants ? "border-destructive" : ""}`}
                />
                {fieldErrors.participants && (
                  <p className="text-sm text-destructive mt-1">{fieldErrors.participants}</p>
                )}
              </div>
            </div>
            {isStudent && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Lecturer Email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={lecturerEmail}
                  onChange={(e) => handleLecturerEmailChange(e.target.value)}
                  onBlur={() => {
                    const error = validateLecturerEmail(lecturerEmail)
                    setFieldErrors(prev => ({ ...prev, lecturerEmail: error }))
                  }}
                  placeholder="lecturer@fpt.edu.vn"
                  required
                  className={`h-9 ${fieldErrors.lecturerEmail ? "border-destructive" : ""}`}
                />
                {fieldErrors.lecturerEmail && (
                  <p className="text-sm text-destructive mt-1">{fieldErrors.lecturerEmail}</p>
                )}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-base">Equipment & Notes</h3>
            {availableEquipment.length > 0 && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                Available: {availableEquipment.join(", ")}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Additional Equipment</label>
              <div className="grid grid-cols-2 gap-2">
                {["Projector", "Whiteboard", "Microphone", "Extra chairs/tables"].map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={equipment.includes(item)}
                      onChange={() => handleEquipmentToggle(item)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special requests..."
                className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background min-h-20"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-base">Review Booking</h3>
            {(fieldErrors.startTime || fieldErrors.endTime || fieldErrors.date) && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive font-medium mb-1">Lỗi:</p>
                {fieldErrors.startTime && (
                  <p className="text-sm text-destructive">{fieldErrors.startTime}</p>
                )}
                {fieldErrors.endTime && fieldErrors.endTime !== fieldErrors.startTime && (
                  <p className="text-sm text-destructive">{fieldErrors.endTime}</p>
                )}
                {fieldErrors.date && (
                  <p className="text-sm text-destructive">{fieldErrors.date}</p>
                )}
              </div>
            )}
            <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <p className="col-span-2"><span className="font-medium">Facility:</span> {facility.facilityName}</p>
                <p><span className="font-medium">Date:</span> {date}</p>
                <p><span className="font-medium">Time:</span> {startTime} - {endTime}</p>
                <p><span className="font-medium">Purpose:</span> {purpose}</p>
                <p><span className="font-medium">Participants:</span> {participants}</p>
                {equipment.length > 0 && (
                  <p className="col-span-2"><span className="font-medium">Equipment:</span> {equipment.join(", ")}</p>
                )}
                {notes && (
                  <p className="col-span-2"><span className="font-medium">Notes:</span> {notes}</p>
                )}
              </div>
            </div>

          </div>
        )}

        <div className="flex gap-2 mt-4">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                setStep(step - 1)
                // Clear errors when going back
                setFieldErrors({})
              }}
              className="flex-1 h-9"
            >
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-9"
              onClick={() => {
                // Validate current step before proceeding
                if (step === 1) {
                  const errors: FieldErrors = {}
                  errors.date = validateDate(date)
                  if (!errors.date && holidays && holidays.length > 0 && date) {
                    const isHoliday = holidays.some(h => h.holidayDate === date)
                    if (isHoliday) errors.date = "Cannot book facilities on holidays"
                  }
                  errors.startTime = validateStartTime(startTime, date)
                  errors.endTime = validateEndTime(endTime, date, startTime)
                  setFieldErrors(errors)

                  if (!errors.date && !errors.startTime && !errors.endTime && date && startTime && endTime) {
                    setStep(step + 1)
                  }
                } else if (step === 2) {
                  const errors: FieldErrors = {}
                  errors.purpose = validatePurpose(purpose)
                  errors.participants = validateParticipants(participants)
                  if (isStudent) {
                    errors.lecturerEmail = validateLecturerEmail(lecturerEmail)
                  }
                  setFieldErrors(errors)

                  const hasErrors = Object.values(errors).some(error => error !== undefined)
                  if (!hasErrors && purpose && participants && (!isStudent || lecturerEmail)) {
                    setStep(step + 1)
                  }
                } else {
                  setStep(step + 1)
                }
              }}
              disabled={
                (step === 1 && (!date || !startTime || !endTime || Boolean(fieldErrors.date))) ||
                (step === 2 && (!purpose || !participants || (isStudent && !lecturerEmail)))
              }
            >
              Continue
            </Button>
          ) : (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-9"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Booking"}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent h-9">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}
