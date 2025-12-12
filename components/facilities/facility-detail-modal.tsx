"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, MapPin, Users, CheckCircle2, XCircle } from "lucide-react"
import { useFacilityTypes } from "@/hooks/use-facility-type"
import { useCampuses } from "@/hooks/use-campus"
import type { Facility } from "@/types"

interface FacilityDetailModalProps {
  facility: Facility
  isOpen: boolean
  onClose: () => void
  onBookNow: (facility: Facility) => void
}

export function FacilityDetailModal({ facility, isOpen, onClose, onBookNow }: FacilityDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { facilityTypes } = useFacilityTypes()
  const { campuses } = useCampuses()

  // Get type name from typeId
  const getTypeName = (): string => {
    if (facility.typeName) return facility.typeName
    const type = facilityTypes.find(t => t.id === facility.typeId)
    return type?.typeName || facility.typeName || "-"
  }

  // Get campus name from campusId
  const getCampusName = (): string => {
    if (facility.campusName) return facility.campusName
    const campus = campuses.find(c => c.id === facility.campusId)
    return campus?.campusName || facility.campusName || "-"
  }

  if (!isOpen) return null

  // Parse imageUrl JSON string to get array of images
  const getImages = (): string[] => {
    if (!facility.imageUrl) return []
    
    try {
      const urls = JSON.parse(facility.imageUrl)
      if (Array.isArray(urls)) {
        return urls
      }
      return [facility.imageUrl]
    } catch (e) {
      return [facility.imageUrl]
    }
  }

  const images = getImages()
  const hasImages = images.length > 0

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const getEquipmentList = (equipment: string | null): string[] => {
    if (!equipment) return []
    return equipment.split(",").map((e) => e.trim()).filter(Boolean)
  }

  const equipmentList = getEquipmentList(facility.equipment)
  const isAvailable = facility.status === "Available" && facility.isActive

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <Card className="w-full max-w-4xl bg-background relative my-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">{facility.facilityName}</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Code */}
          <div>
            <p className="text-sm text-muted-foreground">Code: <span className="font-mono font-medium text-foreground">{facility.facilityCode}</span></p>
          </div>

          {/* Images */}
          {hasImages ? (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Images</h3>
              <div className="relative w-full h-[400px] bg-muted rounded-lg overflow-hidden group">
                <img
                  src={images[currentImageIndex]}
                  alt={`${facility.facilityName} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">No images available</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{getTypeName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campus:</span>
                  <span className="font-medium">{getCampusName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {facility.capacity} people
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium px-2 py-0.5 rounded text-xs ${
                    isAvailable 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {isAvailable ? "Available" : facility.status || "Unavailable"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Location</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Building:</span>
                  <span className="font-medium">{facility.building || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Floor:</span>
                  <span className="font-medium">{facility.floor || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Number:</span>
                  <span className="font-medium">{facility.roomNumber || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {facility.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{facility.description}</p>
            </div>
          )}

          {/* Equipment */}
          {equipmentList.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {equipmentList.map((eq) => (
                  <span 
                    key={eq} 
                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-md font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t px-6 py-4 flex items-center justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white px-8"
            onClick={() => {
              onClose()
              onBookNow(facility)
            }}
            disabled={!isAvailable}
          >
            {isAvailable ? "Book Now" : "Unavailable"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
