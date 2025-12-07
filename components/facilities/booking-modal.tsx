"use client"

import { useState } from "react"
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

  const purposes = ["Group study", "Club meeting", "Project discussion", "Event rehearsal", "Class session", "Other"]

  const handleEquipmentToggle = (item: string) => {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]))
  }

  const handleSubmit = async () => {
    if (!date || !startTime || !endTime || !purpose || !participants) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (isStudent && !lecturerEmail) {
      toast({
        title: "Lecturer Email Required",
        description: "Please provide your lecturer's email address",
        variant: "destructive",
      })
      return
    }

    // Validate participants
    const participantsNum = Number.parseInt(participants, 10)
    if (isNaN(participantsNum) || participantsNum < 1) {
      toast({
        title: "Invalid Participants",
        description: "Please enter a valid number of participants (at least 1)",
        variant: "destructive",
      })
      return
    }

    if (participantsNum > facility.capacity) {
      toast({
        title: "Exceeds Capacity",
        description: `Maximum capacity is ${facility.capacity} participants`,
        variant: "destructive",
      })
      return
    }

    // Validate time range
    if (startTime >= endTime) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time",
        variant: "destructive",
      })
      return
    }

    // Convert "HH:mm" (from input[type=time]) to "HH:mm:ss" as backend expects seconds
    const startTimeFormatted = startTime.length === 5 ? `${startTime}:00` : startTime
    const endTimeFormatted = endTime.length === 5 ? `${endTime}:00` : endTime

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
        if (onBookingCreated) {
          onBookingCreated()
        }
      } else {
        toast({
          title: "Failed to Create Booking",
          description: error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create booking"
      toast({
        title: "Failed to Create Booking",
        description: errorMessage,
        variant: "destructive",
      })
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
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-9" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-9" />
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
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-input rounded-lg bg-background h-9"
                >
                  <option value="">Select purpose</option>
                  {purposes.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
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
                  onChange={(e) => setParticipants(e.target.value)}
                  className="h-9"
                />
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
                  onChange={(e) => setLecturerEmail(e.target.value)}
                  placeholder="lecturer@fpt.edu.vn"
                  required
                  className="h-9"
                />
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
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 h-9">
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-9"
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!date || !startTime || !endTime)) || (step === 2 && (!purpose || !participants))
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
