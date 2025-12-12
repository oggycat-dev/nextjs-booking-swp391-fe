"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useBookingMutations } from "@/hooks/use-booking"
import type { Facility } from "@/types"

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
    
    // Re-validate times when date changes
    if (startTime) {
      const startError = validateStartTime(startTime, value)
      setFieldErrors(prev => ({ ...prev, startTime: startError }))
    }
  }

  const handleStartTimeChange = (value: string) => {
    setStartTime(value)
    const error = validateStartTime(value, date)
    setFieldErrors(prev => ({ ...prev, startTime: error }))
    
    // Re-validate end time when start time changes
    if (endTime) {
      const endError = validateEndTime(endTime, date, value)
      setFieldErrors(prev => ({ ...prev, endTime: endError }))
    }
  }

  const handleEndTimeChange = (value: string) => {
    setEndTime(value)
    const error = validateEndTime(value, date, startTime)
    setFieldErrors(prev => ({ ...prev, endTime: error }))
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

  // Clear field errors when modal closes or resets
  useEffect(() => {
    if (!isOpen) {
      setFieldErrors({})
    }
  }, [isOpen])

  const handleSubmit = async () => {
    // Validate all fields
    const errors: FieldErrors = {}
    
    errors.date = validateDate(date)
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
        if (onBookingCreated) {
          onBookingCreated()
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create booking"
      
      // Show toast immediately
      toast({
        description: errorMessage,
        variant: "destructive",
      })
      
      // Check if it's a time slot conflict
      if (errorMessage && (errorMessage.toLowerCase().includes("time slot") || errorMessage.toLowerCase().includes("already booked"))) {
        const conflictError = `This time slot is already booked from ${startTime} to ${endTime}`
        setFieldErrors(prev => ({ ...prev, startTime: conflictError, endTime: conflictError }))
        // Go back to step 1 to show error after a small delay so user can see toast
        setTimeout(() => {
          setStep(1)
        }, 100)
      } else {
        // For other errors, set to appropriate fields
        // If error is related to time, set to time fields and go back to step 1
        if (errorMessage.toLowerCase().includes("time") || errorMessage.toLowerCase().includes("date") || errorMessage.toLowerCase().includes("working hours")) {
          setFieldErrors(prev => ({ ...prev, startTime: errorMessage, endTime: errorMessage }))
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
                  const error = validateDate(date)
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
                    setFieldErrors(prev => ({ ...prev, startTime: error }))
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
                    setFieldErrors(prev => ({ ...prev, endTime: error }))
                  }}
                  className={`h-9 ${fieldErrors.endTime ? "border-destructive" : ""}`}
                />
                {fieldErrors.endTime && (
                  <p className="text-sm text-destructive mt-1">{fieldErrors.endTime}</p>
                )}
              </div>
            </div>
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
                <p><span className="font-medium">Facility:</span> {facility.facilityName}</p>
                <p><span className="font-medium">Type:</span> {facility.typeName}</p>
                <p className="col-span-2"><span className="font-medium">Location:</span> {facility.campusName}</p>
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary rounded" defaultChecked />
              <span className="text-sm">I agree to the no-show policy</span>
            </label>
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
                (step === 1 && (!date || !startTime || !endTime)) || 
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
