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
      <div className="space-y-4">
        {facilities.map((facility) => {
          const equipment = getEquipmentList(facility.equipment)
          const available = isAvailable(facility)
          const imageUrl = getImageUrl(facility)
          
          return (
            <Card 
              key={facility.id} 
              className="overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer group"
              onClick={() => onFacilityClick?.(facility)}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image Section */}
                <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 bg-muted overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={facility.facilityName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('Image load error:', imageUrl)
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs">No Image</p>
                      </div>
                    </div>
                  )}
                  {!available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {facility.status || "Unavailable"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Info */}
                    <div className="flex-1 min-w-0">
                      {/* Title and Type */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-xl text-foreground">{facility.facilityName}</h3>
                        {available ? (
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                            Available
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                            {facility.status || "Unavailable"}
                          </span>
                        )}
                      </div>
                      
                      {/* Type and Location */}
                      <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <span className="font-medium">{facility.typeName}</span>
                        <span>•</span>
                        <span>{getLocationText(facility)}</span>
                      </p>

                      {/* Capacity */}
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium text-foreground">Capacity: {facility.capacity} people</span>
                      </div>

                      {/* Description */}
                      {facility.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {facility.description}
                        </p>
                      )}

                      {/* Equipment Tags */}
                      {equipment.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {equipment.slice(0, 4).map((eq) => (
                            <span 
                              key={eq} 
                              className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium"
                            >
                              {eq}
                            </span>
                          ))}
                          {equipment.length > 4 && (
                            <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-md font-medium">
                              +{equipment.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Button */}
                    <div className="flex-shrink-0">
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white px-6 shadow-md hover:shadow-lg transition-all"
                        onClick={(e) => {
                          e.stopPropagation()
                          onBooking(facility)
                        }}
                        disabled={!available}
                      >
                        {available ? "Book Now" : "Unavailable"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
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
