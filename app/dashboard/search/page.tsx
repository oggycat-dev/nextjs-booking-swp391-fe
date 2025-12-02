"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FacilitySearchFilters } from "@/components/facilities/search-filters"
import { FacilityGrid } from "@/components/facilities/facility-grid"
import { BookingModal } from "@/components/facilities/booking-modal"

const MOCK_FACILITIES = [
  {
    id: 1,
    name: "Meeting Room 301",
    type: "Meeting Room",
    capacity: 8,
    building: "A",
    floor: 3,
    equipment: ["Projector", "Whiteboard"],
    image: "/modern-meeting-room.png",
    rating: 4.5,
    available: true,
  },
  {
    id: 2,
    name: "Computer Lab 201",
    type: "Lab",
    capacity: 30,
    building: "B",
    floor: 2,
    equipment: ["PCs", "Projector", "Microphone"],
    image: "/computer-lab.png",
    rating: 4.2,
    available: true,
  },
  {
    id: 3,
    name: "Study Room 105",
    type: "Study Room",
    capacity: 6,
    building: "C",
    floor: 1,
    equipment: ["Whiteboard"],
    image: "/study-room.jpg",
    rating: 4.8,
    available: true,
  },
  {
    id: 4,
    name: "Auditorium",
    type: "Auditorium",
    capacity: 200,
    building: "D",
    floor: 0,
    equipment: ["Projector", "Sound System", "Microphone"],
    image: "/auditorium.jpg",
    rating: 4.6,
    available: false,
  },
  {
    id: 5,
    name: "Sports Gym",
    type: "Sports",
    capacity: 50,
    building: "E",
    floor: 1,
    equipment: [],
    image: "/sports-gym.jpg",
    rating: 4.4,
    available: true,
  },
  {
    id: 6,
    name: "Meeting Room 302",
    type: "Meeting Room",
    capacity: 12,
    building: "A",
    floor: 3,
    equipment: ["Projector", "Whiteboard", "Video Conference"],
    image: "/meeting-room-modern.jpg",
    rating: 4.7,
    available: true,
  },
]

export default function SearchPage() {
  const [filteredFacilities, setFilteredFacilities] = useState(MOCK_FACILITIES)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedFacility, setSelectedFacility] = useState<(typeof MOCK_FACILITIES)[0] | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const handleFilter = (filters: {
    type?: string
    capacity?: [number, number]
    equipment?: string[]
    availability?: boolean
  }) => {
    let filtered = MOCK_FACILITIES

    if (filters.type) {
      filtered = filtered.filter((f) => f.type === filters.type)
    }

    if (filters.capacity) {
      filtered = filtered.filter((f) => f.capacity >= filters.capacity[0] && f.capacity <= filters.capacity[1])
    }

    if (filters.equipment && filters.equipment.length > 0) {
      filtered = filtered.filter((f) => filters.equipment!.every((e) => f.equipment.includes(e)))
    }

    if (filters.availability !== undefined) {
      filtered = filtered.filter((f) => f.available === filters.availability)
    }

    setFilteredFacilities(filtered)
  }

  const handleBooking = (facility: (typeof MOCK_FACILITIES)[0]) => {
    setSelectedFacility(facility)
    setShowBookingModal(true)
  }

  const handleBookingSubmit = (data: any) => {
    console.log("Booking submitted:", data)
    setShowBookingModal(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Search Facilities</h1>
        <p className="text-muted-foreground">Find and book the perfect facility for your needs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FacilitySearchFilters onFilter={handleFilter} />
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{filteredFacilities.length} facilities found</p>
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

          {filteredFacilities.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No facilities found matching your criteria</p>
              <Button variant="outline" onClick={() => handleFilter({})}>
                Clear Filters
              </Button>
            </Card>
          ) : (
            <FacilityGrid facilities={filteredFacilities} viewMode={viewMode} onBooking={handleBooking} />
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

