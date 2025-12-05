import type { BookingListDto } from "@/types"

export interface ValidationResult {
  isValid: boolean
  error?: string
  warningMessage?: string
}

/**
 * Validates if a booking can be checked in
 */
export function validateCheckIn(booking: BookingListDto): ValidationResult {
  // Check if already checked in
  if (booking.checkedInAt) {
    return {
      isValid: false,
      error: "This booking has already been checked in",
    }
  }

  // Check if already checked out
  if (booking.checkedOutAt) {
    return {
      isValid: false,
      error: "Cannot check in to a booking that has already been checked out",
    }
  }

  // Check booking status
  const status = booking.status?.toLowerCase() || ""
  
  if (status === "rejected" || status === "cancelled") {
    return {
      isValid: false,
      error: `Cannot check in to a booking with status: ${booking.status}`,
    }
  }

  if (status === "waitinglecturerapproval" || status === "waitingadminapproval") {
    return {
      isValid: false,
      error: "Cannot check in to a booking that is pending approval",
    }
  }

  if (status === "completed") {
    return {
      isValid: false,
      error: "Cannot check in to a completed booking",
    }
  }

  if (status === "noshow") {
    return {
      isValid: false,
      error: "Cannot check in to a no-show booking",
    }
  }

  // Check if booking date is valid
  const bookingDate = new Date(booking.bookingDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  bookingDate.setHours(0, 0, 0, 0)

  const daysDifference = Math.floor((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Allow check-in on the booking date or up to 1 day before
  if (daysDifference < -1) {
    return {
      isValid: false,
      error: "Cannot check in to a booking that is more than 1 day past the booking date",
    }
  }

  // Warning for early check-in (more than 1 day before)
  if (daysDifference > 1) {
    return {
      isValid: true,
      warningMessage: "You are checking in more than 1 day before the booking date",
    }
  }

  // Warning for late check-in (on the day after)
  if (daysDifference === -1) {
    return {
      isValid: true,
      warningMessage: "You are checking in 1 day after the booking date",
    }
  }

  // Check time window (optional - can check in up to 30 minutes before start time)
  const now = new Date()
  const bookingDateTime = new Date(`${booking.bookingDate}T${booking.startTime}`)
  
  // Parse time string (HH:mm:ss or HH:mm)
  const timeParts = booking.startTime.split(":")
  const startHour = parseInt(timeParts[0], 10)
  const startMinute = parseInt(timeParts[1], 10)
  
  bookingDateTime.setHours(startHour, startMinute, 0, 0)
  
  const timeDifference = bookingDateTime.getTime() - now.getTime()
  const minutesDifference = timeDifference / (1000 * 60)

  // Warning if checking in more than 30 minutes before start time
  if (minutesDifference > 30 && daysDifference === 0) {
    return {
      isValid: true,
      warningMessage: "You are checking in more than 30 minutes before the booking start time",
    }
  }

  // Warning if checking in after the end time
  const endTimeParts = booking.endTime.split(":")
  const endHour = parseInt(endTimeParts[0], 10)
  const endMinute = parseInt(endTimeParts[1], 10)
  const bookingEndDateTime = new Date(`${booking.bookingDate}T${booking.endTime}`)
  bookingEndDateTime.setHours(endHour, endMinute, 0, 0)
  
  if (now > bookingEndDateTime && daysDifference === 0) {
    return {
      isValid: true,
      warningMessage: "You are checking in after the booking end time",
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validates if a booking can be checked out
 */
export function validateCheckOut(booking: BookingListDto): ValidationResult {
  // Check if not checked in
  if (!booking.checkedInAt) {
    return {
      isValid: false,
      error: "Cannot check out from a booking that has not been checked in",
    }
  }

  // Check if already checked out
  if (booking.checkedOutAt) {
    return {
      isValid: false,
      error: "This booking has already been checked out",
    }
  }

  // Check booking status
  const status = booking.status?.toLowerCase() || ""
  
  if (status === "rejected" || status === "cancelled") {
    return {
      isValid: false,
      error: `Cannot check out from a booking with status: ${booking.status}`,
    }
  }

  if (status === "completed") {
    return {
      isValid: false,
      error: "This booking has already been completed",
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Determines if the check-in button should be shown for a booking
 */
export function canShowCheckInButton(booking: BookingListDto): boolean {
  // Don't show if already checked in
  if (booking.checkedInAt) {
    return false
  }

  // Don't show if already checked out
  if (booking.checkedOutAt) {
    return false
  }

  // Don't show for certain statuses
  const status = booking.status?.toLowerCase() || ""
  
  if (
    status === "rejected" ||
    status === "cancelled" ||
    status === "completed" ||
    status === "noshow"
  ) {
    return false
  }

  // Show for approved bookings or checked-in status (edge case)
  if (status === "approved" || status === "checkedin") {
    return true
  }

  // Don't show for pending approvals
  if (status === "waitinglecturerapproval" || status === "waitingadminapproval") {
    return false
  }

  // Default: show if status is not explicitly blocked
  return true
}

/**
 * Determines if the check-out button should be shown for a booking
 */
export function canShowCheckOutButton(booking: BookingListDto): boolean {
  // Must be checked in
  if (!booking.checkedInAt) {
    return false
  }

  // Don't show if already checked out
  if (booking.checkedOutAt) {
    return false
  }

  // Don't show for certain statuses
  const status = booking.status?.toLowerCase() || ""
  
  if (
    status === "rejected" ||
    status === "cancelled" ||
    status === "completed" ||
    status === "noshow"
  ) {
    return false
  }

  // Show if checked in (regardless of status, as long as not completed)
  return true
}

