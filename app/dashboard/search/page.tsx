"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FacilitySearchFilters } from "@/components/facilities/search-filters"
import { FacilityGrid } from "@/components/facilities/facility-grid"
import { BookingModal } from "@/components/facilities/booking-modal"
import { useFacilities } from "@/hooks/use-facility"
import { useFacilityTypes } from "@/hooks/use-facility-type"
import type { Facility } from "@/types"

interface FilterOptions {
  facilityTypeId?: string
  capacity?: [number, number]
  equipment?: string[]
  availableOnly?: boolean
}

export default function SearchPage() {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    availableOnly: true,
  })
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Fetch facility types for filter dropdown
  const { facilityTypes } = useFacilityTypes(true) // Only active types

  // Fetch facilities with filters
  const query = useMemo(() => ({
    facilityTypeId: filterOptions.facilityTypeId,
    availableOnly: filterOptions.availableOnly,
  }), [filterOptions.facilityTypeId, filterOptions.availableOnly])

  const { facilities, fetchFacilities, isLoading, error } = useFacilities(query)

  // Apply client-side filters (capacity, equipment) on fetched facilities
  const filteredFacilities = useMemo(() => {
    let filtered = facilities || []

    // Filter by capacity
    if (filterOptions.capacity) {
      filtered = filtered.filter(
        (f) => f.capacity >= filterOptions.capacity![0] && f.capacity <= filterOptions.capacity![1]
      )
    }

    // Filter by equipment
    if (filterOptions.equipment && filterOptions.equipment.length > 0) {
      filtered = filtered.filter((f) => {
        if (!f.equipment) return false
        const facilityEquipment = f.equipment.split(",").map((e) => e.trim().toLowerCase())
        return filterOptions.equipment!.some((eq) =>
          facilityEquipment.some((fe) => fe.includes(eq.toLowerCase()))
        )
      })
    }

    // Filter by availability status
    if (filterOptions.availableOnly) {
      filtered = filtered.filter((f) => f.status === "Available" && f.isActive)
    }

    return filtered
  }, [facilities, filterOptions])

  const handleFilter = (filters: {
    type?: string
    capacity?: [number, number]
    equipment?: string[]
    availability?: boolean
  }) => {
    // Find facility type ID from type name
    const facilityType = facilityTypes.find((ft) => ft.typeName === filters.type)
    
    setFilterOptions({
      facilityTypeId: facilityType?.id || undefined,
      capacity: filters.capacity,
      equipment: filters.equipment,
      availableOnly: filters.availability,
    })
  }

  const handleBooking = (facility: Facility) => {
    setSelectedFacility(facility)
    setShowBookingModal(true)
  }

  const handleBookingSubmit = (data: any) => {
    console.log("Booking submitted:", data)
    setShowBookingModal(false)
    // TODO: Implement actual booking API call
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Search Facilities</h1>
        <p className="text-muted-foreground">Find and book the perfect facility for your needs</p>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <p className="text-destructive text-sm">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FacilitySearchFilters 
            onFilter={handleFilter} 
            facilityTypes={facilityTypes}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading facilities...</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {filteredFacilities.length} {filteredFacilities.length === 1 ? "facility" : "facilities"} found
              </p>
            )}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </div>
          </div>

          {isLoading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Loading facilities...</p>
            </Card>
          ) : filteredFacilities.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No facilities found matching your criteria</p>
              <Button 
                variant="outline" 
                onClick={() => setFilterOptions({ availableOnly: true })}
              >
                Clear Filters
              </Button>
            </Card>
          ) : (
            <FacilityGrid 
              facilities={filteredFacilities} 
              viewMode={viewMode} 
              onBooking={handleBooking} 
            />
          )}
        </div>
      </div>

      {showBookingModal && selectedFacility && (
        <BookingModal
          facility={selectedFacility}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  )
}
