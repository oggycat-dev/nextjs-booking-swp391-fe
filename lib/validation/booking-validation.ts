/**
 * Booking Check-in/Check-out Validation
 * Frontend validation matching backend business rules
 */

import type { BookingListDto } from "@/types"

export interface ValidationResult {
  isValid: boolean
  error?: string
  warningMessage?: string
}

/**
 * Parse time string to Date object for comparison
 */
function parseTimeToDate(dateString: string, timeString: string): Date {
  const date = new Date(dateString)
  
  // Handle TimeSpan format (HH:mm:ss)
  if (timeString.includes(':')) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number)
    date.setHours(hours, minutes, seconds || 0, 0)
  } else if (timeString.includes('T')) {
    // Handle ISO datetime format
    return new Date(timeString)
  }
  
  return date
}

/**
 * Format time for display
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Validate check-in eligibility
 * Business Rules:
 * 1. Booking must be Approved
 * 2. Must not be already checked in
 * 3. Current time must be within check-in window (start time to 15 minutes after)
 */
export function validateCheckIn(booking: BookingListDto): ValidationResult {
  // Rule 1: Booking must be approved
  if (booking.status !== "Approved") {
    return {
      isValid: false,
      error: `Cannot check-in. Booking status is ${booking.status}`
    }
  }

  // Rule 2: Must not be already checked in
  if (booking.checkedInAt) {
    return {
      isValid: false,
      error: "This booking has already been checked in"
    }
  }

  // Rule 3: Check time window
  const now = new Date()
  const bookingDateTime = parseTimeToDate(booking.bookingDate, booking.startTime)
  const checkInWindowStart = new Date(bookingDateTime)
  const checkInWindowEnd = new Date(bookingDateTime.getTime() + 15 * 60 * 1000) // +15 minutes

  // Too early
  if (now < checkInWindowStart) {
    return {
      isValid: false,
      error: `Check-in is not available yet. You can check in from ${formatTime(checkInWindowStart)}`
    }
  }

  // Too late - check-in window expired
  if (now > checkInWindowEnd) {
    return {
      isValid: false,
      error: `Check-in window has expired (until ${formatTime(checkInWindowEnd)}). This booking will be marked as no-show if you proceed.`,
      warningMessage: "⚠️ Late check-in will count as a no-show"
    }
  }

  // Show warning if close to deadline (within last 5 minutes)
  const fiveMinutesBeforeEnd = new Date(checkInWindowEnd.getTime() - 5 * 60 * 1000)
  if (now > fiveMinutesBeforeEnd) {
    return {
      isValid: true,
      warningMessage: `⚠️ Check-in window closes at ${formatTime(checkInWindowEnd)}`
    }
  }

  return { isValid: true }
}

/**
 * Validate check-out eligibility
 * Business Rules:
 * 1. Must be checked in first
 * 2. Must not be already checked out
 * 3. Current time must be within check-out window (end time to 15 minutes after)
 */
export function validateCheckOut(booking: BookingListDto): ValidationResult {
  // Rule 1: Must be checked in first
  if (!booking.checkedInAt) {
    return {
      isValid: false,
      error: "Cannot check-out without checking in first"
    }
  }

  // Rule 2: Must not be already checked out
  if (booking.checkedOutAt) {
    return {
      isValid: false,
      error: "This booking has already been checked out"
    }
  }

  // Rule 3: Check time window
  const now = new Date()
  const bookingEndDateTime = parseTimeToDate(booking.bookingDate, booking.endTime)
  const checkOutWindowStart = new Date(bookingEndDateTime)
  const checkOutWindowEnd = new Date(bookingEndDateTime.getTime() + 15 * 60 * 1000) // +15 minutes

  // Too early
  if (now < checkOutWindowStart) {
    return {
      isValid: false,
      error: `Check-out is not available yet. You can check out from ${formatTime(checkOutWindowStart)}`
    }
  }

  // Too late - check-out window expired
  if (now > checkOutWindowEnd) {
    return {
      isValid: false,
      error: `Check-out window has expired (until ${formatTime(checkOutWindowEnd)}). This booking will be marked as no-show if you proceed.`,
      warningMessage: "⚠️ Late check-out will count as a no-show"
    }
  }

  // Show warning if close to deadline (within last 5 minutes)
  const fiveMinutesBeforeEnd = new Date(checkOutWindowEnd.getTime() - 5 * 60 * 1000)
  if (now > fiveMinutesBeforeEnd) {
    return {
      isValid: true,
      warningMessage: `⚠️ Check-out window closes at ${formatTime(checkOutWindowEnd)}`
    }
  }

  return { isValid: true }
}

/**
 * Check if check-in button should be visible
 */
export function canShowCheckInButton(booking: BookingListDto): boolean {
  return booking.status === "Approved" && !booking.checkedInAt
}

/**
 * Check if check-out button should be visible
 */
export function canShowCheckOutButton(booking: BookingListDto): boolean {
  return booking.status === "Approved" && !!booking.checkedInAt && !booking.checkedOutAt
}

/**
 * Get booking time status for display
 */
export function getBookingTimeStatus(booking: BookingListDto): {
  status: 'upcoming' | 'in-progress' | 'completed' | 'expired'
  message: string
} {
  const now = new Date()
  const startTime = parseTimeToDate(booking.bookingDate, booking.startTime)
  const endTime = parseTimeToDate(booking.bookingDate, booking.endTime)

  if (now < startTime) {
    return {
      status: 'upcoming',
      message: `Starts at ${formatTime(startTime)}`
    }
  }

  if (now >= startTime && now <= endTime) {
    return {
      status: 'in-progress',
      message: `In progress until ${formatTime(endTime)}`
    }
  }

  if (now > endTime && now <= new Date(endTime.getTime() + 15 * 60 * 1000)) {
    return {
      status: 'completed',
      message: 'Ending soon'
    }
  }

  return {
    status: 'expired',
    message: 'Time expired'
  }
}
