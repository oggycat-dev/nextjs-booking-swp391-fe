"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useHolidays, useHolidayMutations } from "@/hooks/use-holidays"
import type { Holiday } from "@/types"

export default function AdminHolidaysPage() {
  const { toast } = useToast()
  const { holidays, fetchHolidays, isLoading } = useHolidays()
  const { createHoliday, deleteHoliday } = useHolidayMutations()

  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredHolidays = holidays.filter((h) =>
    h.holidayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    setShowModal(true)
  }

  const handleDelete = async (holiday: Holiday) => {
    const confirmed = window.confirm(`Delete holiday "${holiday.holidayName}"?`)
    if (!confirmed) return
    
    const ok = await deleteHoliday(holiday.id)
    if (ok) {
      toast({ title: "Holiday deleted successfully" })
      await fetchHolidays()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Holiday Management</h1>
          <p className="text-muted-foreground">Manage system holidays and recurring dates</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleCreate}>
          Create Holiday
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search holidays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => setSearchTerm("")}
          >
            Clear
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Card className="p-12 text-center col-span-full">
            <p className="text-muted-foreground">Loading holidays...</p>
          </Card>
        ) : filteredHolidays.length === 0 ? (
          <Card className="p-12 text-center col-span-full">
            <p className="text-muted-foreground mb-4">No holidays found</p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleCreate}
            >
              Create New Holiday
            </Button>
          </Card>
        ) : (
          filteredHolidays.map((holiday) => (
            <Card key={holiday.id} className="p-5 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{holiday.holidayName}</h3>
                    {holiday.isRecurring && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        Recurring
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{formatDate(holiday.holidayDate)}</span>
                  </div>

                  {holiday.description && (
                    <div className="pt-2 border-t">
                      <p className="text-muted-foreground text-xs leading-relaxed">{holiday.description}</p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Created: {new Date(holiday.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(holiday)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <HolidayFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSaved={async () => {
            setShowModal(false)
            await fetchHolidays()
          }}
        />
      )}
    </div>
  )
}

interface HolidayFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => Promise<void> | void
}

function HolidayFormModal({ isOpen, onClose, onSaved }: HolidayFormModalProps) {
  const { toast } = useToast()
  const { createHoliday, isLoading } = useHolidayMutations()

  const [holidayName, setHolidayName] = useState("")
  const [holidayDate, setHolidayDate] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [description, setDescription] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Frontend validation
    const errors: string[] = []

    if (!holidayName.trim()) {
      errors.push("Holiday name is required")
    } else if (holidayName.length > 200) {
      errors.push("Holiday name cannot exceed 200 characters")
    }

    if (!holidayDate) {
      errors.push("Holiday date is required")
    }

    if (description && description.length > 500) {
      errors.push("Description cannot exceed 500 characters")
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join("; "),
        variant: "destructive",
      })
      return
    }

    // Convert date to ISO string
    const dateObj = new Date(holidayDate)
    const isoDate = dateObj.toISOString()

    const created = await createHoliday({
      holidayName,
      holidayDate: isoDate,
      isRecurring,
      description: description || undefined,
    })

    if (created) {
      toast({ title: "Holiday created successfully" })
      await onSaved()
    } else {
      toast({
        title: "Failed to create holiday",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        {/* Header */}
        <div className="border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create Holiday</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl px-2">
            ✕
          </button>
        </div>

        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {/* Holiday Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Holiday Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              placeholder="e.g., New Year's Day"
              maxLength={200}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {holidayName.length}/200 characters
            </p>
          </div>

          {/* Holiday Date */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Is Recurring */}
          <div className="flex items-center gap-3">
            <input
              id="holiday-recurring"
              type="checkbox"
              className="w-5 h-5 accent-primary cursor-pointer"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            <label htmlFor="holiday-recurring" className="text-sm font-medium cursor-pointer">
              Recurring annually
            </label>
          </div>
          <p className="text-xs text-muted-foreground -mt-3 ml-8">
            Check this if the holiday repeats every year (e.g., Christmas, New Year)
          </p>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
            <textarea
              placeholder="Enter holiday description..."
              className="w-full px-3 py-2.5 border border-input rounded-lg bg-background min-h-24 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {description.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Holiday"}
            </Button>
            <Button type="button" variant="outline" className="flex-1 h-11 bg-transparent font-semibold" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
