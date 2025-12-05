"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useHolidays } from "@/hooks/use-holidays"

export default function HolidaysPage() {
  const { holidays, isLoading } = useHolidays()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredHolidays = holidays.filter((h) =>
    h.holidayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div>
        <h1 className="text-3xl font-bold mb-2">Holidays</h1>
        <p className="text-muted-foreground">View system holidays and recurring dates</p>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Search holidays..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Card className="p-12 text-center col-span-full">
            <p className="text-muted-foreground">Loading holidays...</p>
          </Card>
        ) : filteredHolidays.length === 0 ? (
          <Card className="p-12 text-center col-span-full">
            <p className="text-muted-foreground">No holidays found</p>
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
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
