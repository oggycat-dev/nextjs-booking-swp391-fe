"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Facility {
  id: number
  name: string
  type: string
  capacity: number
  building: string
  floor: number
  equipment: string[]
  image: string
  rating: number
  available: boolean
}

interface FacilityGridProps {
  facilities: Facility[]
  viewMode: "grid" | "list"
  onBooking: (facility: Facility) => void
}

export function FacilityGrid({ facilities, viewMode, onBooking }: FacilityGridProps) {
  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {facilities.map((facility) => (
          <Card key={facility.id} className="p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={facility.image || "/placeholder.svg"}
                    alt={facility.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{facility.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {facility.type} • Building {facility.building}, Floor {facility.floor}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Capacity: {facility.capacity} people</span>
                    <span>Rating: {facility.rating}/5.0</span>
                    {facility.available && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => onBooking(facility)}
              disabled={!facility.available}
            >
              {facility.available ? "Book Now" : "Unavailable"}
            </Button>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {facilities.map((facility) => (
        <Card key={facility.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
          <div className="relative w-full h-40 bg-muted overflow-hidden">
            <img
              src={facility.image || "/placeholder.svg"}
              alt={facility.name}
              className="w-full h-full object-cover"
            />
            {!facility.available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold">Unavailable</span>
              </div>
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-bold text-lg mb-1">{facility.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {facility.type} • Building {facility.building}, Floor {facility.floor}
            </p>
            <div className="space-y-2 mb-4">
              <p className="text-xs">
                <span className="font-medium">Capacity:</span> {facility.capacity} people
              </p>
              <p className="text-xs">
                <span className="font-medium">Rating:</span> {facility.rating}/5.0
              </p>
              {facility.equipment.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {facility.equipment.slice(0, 2).map((eq) => (
                    <span key={eq} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                      {eq}
                    </span>
                  ))}
                  {facility.equipment.length > 2 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                      +{facility.equipment.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-auto"
              onClick={() => onBooking(facility)}
              disabled={!facility.available}
            >
              {facility.available ? "Book Now" : "Unavailable"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
