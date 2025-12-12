"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FacilitySearchFilters } from "@/components/facilities/search-filters"
import { FacilityGrid } from "@/components/facilities/facility-grid"
import { BookingModal } from "@/components/facilities/booking-modal"
import { FacilityDetailModal } from "@/components/facilities/facility-detail-modal"
import { useFacilities } from "@/hooks/use-facility"
import { useFacilityTypes } from "@/hooks/use-facility-type"
import { facilityApi } from "@/lib/api/facility"
import { storage } from "@/lib/storage-manager";
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
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  // Fetch facility types for filter dropdown
  const { facilityTypes } = useFacilityTypes(true) // Only active types

  // Always include campusId from storage for facility search
  // Use storage manager for consistency

  function getUserCampusId() {
    if (typeof window !== "undefined") {
      try {
        const userStr = storage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          return user.campusId;
        }
      } catch {}
    }
    return undefined;
  }

  // Always get campusId from storage and include in query dependencies
  const campusId = getUserCampusId();
  const query = useMemo(() => {
    return {
      facilityTypeId: filterOptions.facilityTypeId,
      availableOnly: filterOptions.availableOnly,
      ...(campusId ? { campusId } : {})
    };
  }, [filterOptions.facilityTypeId, filterOptions.availableOnly, campusId]);

  const { facilities, fetchFacilities, isLoading, error } = useFacilities(query)

  // Apply client-side filters (campus, capacity, equipment) on fetched facilities
  const filteredFacilities = useMemo(() => {
    let filtered = facilities || [];

    // Helper: always get campusId as string
    function getFacilityCampusId(facility: any): string | undefined {
      if (!facility) return undefined;
      if (typeof facility.campusId === 'string') return facility.campusId;
      if (typeof facility.campusId === 'object' && facility.campusId !== null) {
        if (typeof facility.campusId.id === 'string') return facility.campusId.id;
        if (typeof facility.campusId._id === 'string') return facility.campusId._id;
      }
      return undefined;
    }
    function getUserCampusId() {
      if (typeof window !== "undefined") {
        try {
          const userStr = window.sessionStorage.getItem("user") || window.localStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            return user.campusId;
          }
        } catch {}
      }
      return undefined;
    }
    const campusId = getUserCampusId();
    if (campusId) {
      filtered = filtered.filter(f => getFacilityCampusId(f) === campusId);
    }

    // Filter by capacity
    if (filterOptions.capacity) {
      filtered = filtered.filter(
        (f) => f.capacity >= filterOptions.capacity![0] && f.capacity <= filterOptions.capacity![1]
      );
    }

    // Filter by equipment
    if (filterOptions.equipment && filterOptions.equipment.length > 0) {
      filtered = filtered.filter((f) => {
        if (!f.equipment) return false;
        const facilityEquipment = f.equipment.split(",").map((e) => e.trim().toLowerCase());
        return filterOptions.equipment!.some((eq) =>
          facilityEquipment.some((fe) => fe.includes(eq.toLowerCase()))
        );
      });
    }

    // Filter by availability status
    if (filterOptions.availableOnly) {
      filtered = filtered.filter((f) => f.status === "Available" && f.isActive);
    }

    return filtered;
  }, [facilities, filterOptions]);

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

  const handleFacilityClick = async (facility: Facility) => {
    try {
      setIsLoadingDetail(true)
      console.log(`Fetching facility details for ID: ${facility.id}`)
      
      // Call API to get facility by ID
      const response = await facilityApi.getById(facility.id)
      console.log('Facility detail response:', response)
      
      if (response.success && response.data) {
        setSelectedFacility(response.data)
        setShowDetailModal(true)
      } else {
        console.error('Failed to fetch facility details:', response.message)
        // Fallback to using the facility from list
        setSelectedFacility(facility)
        setShowDetailModal(true)
      }
    } catch (error) {
      console.error('Error fetching facility details:', error)
      // Fallback to using the facility from list
      setSelectedFacility(facility)
      setShowDetailModal(true)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleBooking = async (facility: Facility) => {
    // Fetch facility details first, then open booking modal
    try {
      setIsLoadingDetail(true)
      console.log(`Fetching facility details for booking: ${facility.id}`)
      
      const response = await facilityApi.getById(facility.id)
      console.log('Facility detail response:', response)
      
      if (response.success && response.data) {
        setSelectedFacility(response.data)
        setShowBookingModal(true)
      } else {
        console.error('Failed to fetch facility details:', response.message)
        // Fallback to using the facility from list
        setSelectedFacility(facility)
        setShowBookingModal(true)
      }
    } catch (error) {
      console.error('Error fetching facility details:', error)
      // Fallback to using the facility from list
      setSelectedFacility(facility)
      setShowBookingModal(true)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleBookingSubmit = (data: any) => {
    console.log("Booking submitted:", data)
    setShowBookingModal(false)
    // TODO: Implement actual booking API call
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative w-full h-[280px] rounded-2xl overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/modern-meeting-room.png')" }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center text-white">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Search Facilities</h1>
            <p className="text-lg text-white/90">
              Find and book the perfect facility for your study sessions, meetings, and activities
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent"></div>
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
              onFacilityClick={handleFacilityClick}
            />
          )}
        </div>
      </div>

      {showDetailModal && selectedFacility && (
        <FacilityDetailModal
          facility={selectedFacility}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedFacility(null)
          }}
          onBookNow={handleBooking}
        />
      )}

      {showBookingModal && selectedFacility && (
        <BookingModal
          facility={selectedFacility}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  )
}
