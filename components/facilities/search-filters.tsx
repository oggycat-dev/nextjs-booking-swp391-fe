"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { FacilityType } from "@/types"

const EQUIPMENT_OPTIONS = ["Projector", "Whiteboard", "PCs", "Microphone", "Sound System", "Video Conference"]

interface FacilitySearchFiltersProps {
  onFilter: (filters: {
    type?: string
    capacity?: [number, number]
    equipment?: string[]
    availability?: boolean
  }) => void
  facilityTypes?: FacilityType[]
}

export function FacilitySearchFilters({ onFilter, facilityTypes = [] }: FacilitySearchFiltersProps) {
  const [selectedType, setSelectedType] = useState<string>("")
  const [minCapacity, setMinCapacity] = useState<number>(1)
  const [maxCapacity, setMaxCapacity] = useState<number>(200)
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [showAvailable, setShowAvailable] = useState<boolean>(true)

  const handleApplyFilters = () => {
    onFilter({
      type: selectedType || undefined,
      capacity: [minCapacity, maxCapacity],
      equipment: selectedEquipment,
      availability: showAvailable,
    })
  }

  const handleEquipmentToggle = (equipment: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(equipment) ? prev.filter((e) => e !== equipment) : [...prev, equipment],
    )
  }

  return (
    <Card className="p-6 space-y-6 sticky top-20">
      <div>
        <h3 className="font-bold mb-3">Facility Type</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value=""
              checked={selectedType === ""}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm">All Types</span>
          </label>
          {facilityTypes.map((type) => (
            <label key={type.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value={type.typeName}
                checked={selectedType === type.typeName}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm">{type.typeName}</span>
            </label>
          ))}
          {facilityTypes.length === 0 && (
            <p className="text-xs text-muted-foreground">Loading facility types...</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3">Capacity</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Min: {minCapacity}</label>
            <input
              type="range"
              min="1"
              max="200"
              value={minCapacity}
              onChange={(e) => setMinCapacity(Number.parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Max: {maxCapacity}</label>
            <input
              type="range"
              min="1"
              max="200"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number.parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3">Equipment</h3>
        <div className="space-y-2">
          {EQUIPMENT_OPTIONS.map((equipment) => (
            <label key={equipment} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedEquipment.includes(equipment)}
                onChange={() => handleEquipmentToggle(equipment)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm">{equipment}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showAvailable}
            onChange={(e) => setShowAvailable(e.target.checked)}
            className="w-4 h-4 accent-primary rounded"
          />
          <span className="text-sm font-medium">Show Available Only</span>
        </label>
      </div>

      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleApplyFilters}>
        Apply Filters
      </Button>
    </Card>
  )
}
