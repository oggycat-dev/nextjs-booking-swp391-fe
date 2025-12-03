"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Facility } from "@/types"

interface BookingModalProps {
  facility: Facility
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export function BookingModal({ facility, isOpen, onClose, onSubmit }: BookingModalProps) {
  const [step, setStep] = useState(1)
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [purpose, setPurpose] = useState("")
  const [participants, setParticipants] = useState("")
  const [equipment, setEquipment] = useState<string[]>([])
  const [notes, setNotes] = useState("")

  const purposes = ["Group study", "Club meeting", "Project discussion", "Event rehearsal", "Class session", "Other"]

  const handleEquipmentToggle = (item: string) => {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]))
  }

  const handleSubmit = () => {
    onSubmit({
      facilityId: facility.id,
      date,
      startTime,
      endTime,
      purpose,
      participants,
      equipment,
      notes,
    })
  }

  const getEquipmentList = (): string[] => {
    if (!facility.equipment) return []
    return facility.equipment.split(",").map((e) => e.trim()).filter(Boolean)
  }

  const availableEquipment = getEquipmentList()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Book {facility.facilityName}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Select Date & Time</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Booking Details</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
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
              <label className="block text-sm font-medium mb-2">
                Number of Participants (Max: {facility.capacity})
              </label>
              <Input
                type="number"
                min="1"
                max={facility.capacity}
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Equipment & Notes</h3>
            {availableEquipment.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Available Equipment</label>
                <div className="text-sm text-muted-foreground mb-3">
                  This facility has: {availableEquipment.join(", ")}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Additional Equipment Needed</label>
              <div className="space-y-2">
                {["Projector", "Whiteboard", "Microphone", "Extra chairs/tables"].map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={equipment.includes(item)}
                      onChange={() => handleEquipmentToggle(item)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or notes..."
                className="w-full px-3 py-2 border border-input rounded-lg bg-background min-h-24"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Review Booking</h3>
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <p>
                <span className="font-medium">Facility:</span> {facility.facilityName}
              </p>
              <p>
                <span className="font-medium">Type:</span> {facility.typeName}
              </p>
              <p>
                <span className="font-medium">Location:</span> {facility.campusName}
                {facility.building && `, Building ${facility.building}`}
                {facility.floor && `, Floor ${facility.floor}`}
                {facility.roomNumber && `, Room ${facility.roomNumber}`}
              </p>
              <p>
                <span className="font-medium">Date:</span> {date}
              </p>
              <p>
                <span className="font-medium">Time:</span> {startTime} - {endTime}
              </p>
              <p>
                <span className="font-medium">Purpose:</span> {purpose}
              </p>
              <p>
                <span className="font-medium">Participants:</span> {participants}
              </p>
              {equipment.length > 0 && (
                <p>
                  <span className="font-medium">Additional Equipment:</span> {equipment.join(", ")}
                </p>
              )}
              {notes && (
                <p>
                  <span className="font-medium">Notes:</span> {notes}
                </p>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary rounded" defaultChecked />
              <span className="text-sm">I agree to the no-show policy</span>
            </label>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!date || !startTime || !endTime)) || (step === 2 && (!purpose || !participants))
              }
            >
              Continue
            </Button>
          ) : (
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSubmit}>
              Submit Booking
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}
