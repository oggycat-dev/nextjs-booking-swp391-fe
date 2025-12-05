"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Facility } from "@/types"

interface FacilityGridProps {
  facilities: Facility[]
  viewMode: "grid" | "list"
  onBooking: (facility: Facility) => void
  onFacilityClick?: (facility: Facility) => void
}

export function FacilityGrid({ facilities, viewMode, onBooking, onFacilityClick }: FacilityGridProps) {
  // Parse imageUrl JSON string to get first image URL
  const getImageUrl = (facility: Facility): string | null => {
    if (!facility.imageUrl) return null
    
    try {
      // imageUrl is a JSON string containing array of URLs
      const urls = JSON.parse(facility.imageUrl)
      if (Array.isArray(urls) && urls.length > 0) {
        return urls[0] // Return first image
      }
      // If it's already a single URL string
      return facility.imageUrl
    } catch (e) {
      // If not JSON, treat as single URL
      return facility.imageUrl
    }
  }

  const getEquipmentList = (equipment: string | null): string[] => {
    if (!equipment) return []
    return equipment.split(",").map((e) => e.trim()).filter(Boolean)
  }

  const isAvailable = (facility: Facility): boolean => {
    return facility.status === "Available" && facility.isActive
  }

  const getLocationText = (facility: Facility): string => {
    const parts: string[] = []
    if (facility.building) parts.push(`Building ${facility.building}`)
    if (facility.floor) parts.push(`Floor ${facility.floor}`)
    if (facility.roomNumber) parts.push(`Room ${facility.roomNumber}`)
    return parts.length > 0 ? parts.join(", ") : facility.campusName || ""
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {facilities.map((facility) => {
          const equipment = getEquipmentList(facility.equipment)
          const available = isAvailable(facility)
          
          return (
            <Card 
              key={facility.id} 
              className="p-4 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onFacilityClick?.(facility)}
            >
            <div className="flex-1">
              <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    {facility.imageUrl ? (
                      <img
                        src={facility.imageUrl}
                        alt={facility.facilityName}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.error('Image load error:', facility.imageUrl)
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg">{facility.facilityName}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                      {facility.typeName} • {getLocationText(facility)}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Capacity: {facility.capacity} people</span>
                      {available && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Available
                      </span>
                    )}
                      {!available && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                          {facility.status || "Unavailable"}
                        </span>
                      )}
                    </div>
                    {equipment.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {equipment.slice(0, 3).map((eq) => (
                          <span 
                            key={eq} 
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                          >
                            {eq}
                          </span>
                        ))}
                        {equipment.length > 3 && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                            +{equipment.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={(e) => {
                e.stopPropagation()
                onBooking(facility)
              }}
                disabled={!available}
            >
                {available ? "Book Now" : "Unavailable"}
            </Button>
          </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {facilities.map((facility) => {
        const equipment = getEquipmentList(facility.equipment)
        const available = isAvailable(facility)
        
        return (
          <Card 
            key={facility.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col cursor-pointer"
            onClick={() => onFacilityClick?.(facility)}
          >
          <div className="relative w-full h-40 bg-muted overflow-hidden">
              {getImageUrl(facility) ? (
                <img
                  src={getImageUrl(facility)!}
                  alt={facility.facilityName}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image Available
                </div>
              )}
              {!available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold">
                    {facility.status || "Unavailable"}
                  </span>
              </div>
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-lg mb-1">{facility.facilityName}</h3>
            <p className="text-sm text-muted-foreground mb-3">
                {facility.typeName} • {getLocationText(facility)}
            </p>
            <div className="space-y-2 mb-4">
              <p className="text-xs">
                <span className="font-medium">Capacity:</span> {facility.capacity} people
              </p>
                {facility.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {facility.description}
              </p>
                )}
                {equipment.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {equipment.slice(0, 2).map((eq) => (
                      <span 
                        key={eq} 
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                      >
                      {eq}
                    </span>
                  ))}
                    {equipment.length > 2 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                        +{equipment.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-auto"
              onClick={(e) => {
                e.stopPropagation()
                onBooking(facility)
              }}
                disabled={!available}
            >
                {available ? "Book Now" : "Unavailable"}
            </Button>
          </div>
        </Card>
        )
      })}
    </div>
  )
}
