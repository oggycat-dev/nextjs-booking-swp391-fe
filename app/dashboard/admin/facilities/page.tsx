"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useFacilities, useFacilityMutations } from "@/hooks/use-facility"
import { useFacilityTypes } from "@/hooks/use-facility-type"
import { useCampuses } from "@/hooks/use-campus"
import type { Facility, FacilityStatus } from "@/types"

type AdminFacility = Facility

const STATUS_COLORS: Record<string, string> = {
  Available: "bg-green-100 text-green-700",
  UnderMaintenance: "bg-yellow-100 text-yellow-700",
  Unavailable: "bg-red-100 text-red-700",
}

export default function AdminFacilitiesPage() {
  const { toast } = useToast()
  const { facilities, fetchFacilities, isLoading } = useFacilities()
  const { facilityTypes } = useFacilityTypes(true)
  const { campuses } = useCampuses()
  const { deleteFacility, updateFacility } = useFacilityMutations()

  const [showModal, setShowModal] = useState(false)
  const [editingFacility, setEditingFacility] = useState<AdminFacility | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTypeId, setFilterTypeId] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const matchesSearch =
        f.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.facilityCode.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = !filterTypeId || f.typeId === filterTypeId
      const matchesStatus = !filterStatus || f.status === filterStatus
      return matchesSearch && matchesType && matchesStatus
    })
  }, [facilities, searchTerm, filterTypeId, filterStatus])

  const handleCreate = () => {
    setEditingFacility(null)
    setShowModal(true)
  }

  const handleEdit = (facility: AdminFacility) => {
    setEditingFacility(facility)
    setShowModal(true)
  }

  const handleDelete = async (facility: AdminFacility) => {
    const confirmed = window.confirm(`Delete facility "${facility.facilityName}"?`)
    if (!confirmed) return
    const ok = await deleteFacility(facility.id)
    if (ok) {
      toast({ title: "Facility deleted" })
      fetchFacilities()
    }
  }

  const handleStatusChange = async (facility: AdminFacility, newStatus: FacilityStatus) => {
    const updated = await updateFacility(facility.id, {
      facilityName: facility.facilityName,
      typeId: facility.typeId,
      building: facility.building ?? undefined,
      floor: facility.floor ?? undefined,
      roomNumber: facility.roomNumber ?? undefined,
      capacity: facility.capacity,
      description: facility.description ?? undefined,
      equipment: facility.equipment ?? undefined,
      imageUrl: facility.imageUrl ?? undefined,
      status: newStatus,
      isActive: facility.isActive,
    })
    if (updated) {
      toast({ title: "Status updated" })
      fetchFacilities()
    }
  }

  const getStatusColor = (status: string) => STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Facility Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage campus facilities</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleCreate}>
          Create Facility
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={filterTypeId}
              onChange={(e) => setFilterTypeId(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            >
              <option value="">All Types</option>
              {facilityTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.typeName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="UnderMaintenance">Under maintenance</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                setSearchTerm("")
                setFilterTypeId("")
                setFilterStatus("")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading facilities...</p>
          </Card>
        ) : filteredFacilities.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No facilities found</p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleCreate}
            >
              Create New Facility
            </Button>
          </Card>
        ) : (
          filteredFacilities.map((facility) => (
            <Card key={facility.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{facility.facilityName}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(facility.status)}`}>
                      {facility.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Code: {facility.facilityCode} • Type: {facility.typeName} • Campus: {facility.campusName} •
                    Building {facility.building ?? "-"}, Floor {facility.floor ?? "-"} • Capacity: {facility.capacity}
                  </p>
                  <div className="flex items-center gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Equipment</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(facility.equipment ?? "")
                          .split(",")
                          .map((e) => e.trim())
                          .filter(Boolean)
                          .map((eq) => (
                            <span key={eq} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                              {eq}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => handleEdit(facility)}
                  >
                    Edit
                  </Button>
                  <select
                    value={facility.status}
                    onChange={(e) => handleStatusChange(facility, e.target.value as FacilityStatus)}
                    className="px-2 py-1 text-xs border border-input rounded-lg bg-background"
                  >
                    <option value="Available">Available</option>
                    <option value="UnderMaintenance">Under maintenance</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(facility)}
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
        <FacilityFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          facility={editingFacility}
          facilityTypes={facilityTypes}
          campuses={campuses}
          onSaved={async () => {
            setShowModal(false)
            await fetchFacilities()
          }}
        />
      )}
    </div>
  )
}

interface FacilityFormModalProps {
  isOpen: boolean
  onClose: () => void
  facility?: AdminFacility | null
  facilityTypes: ReturnType<typeof useFacilityTypes>["facilityTypes"]
  campuses: ReturnType<typeof useCampuses>["campuses"]
  onSaved: () => Promise<void> | void
}

function FacilityFormModal({ isOpen, onClose, facility, facilityTypes, campuses, onSaved }: FacilityFormModalProps) {
  const isEdit = !!facility
  const { toast } = useToast()
  const { createFacility, updateFacility, isLoading } = useFacilityMutations()

  const [facilityCode, setFacilityCode] = useState(facility?.facilityCode ?? "")
  const [facilityName, setFacilityName] = useState(facility?.facilityName ?? "")
  const [campusId, setCampusId] = useState(facility?.campusId ?? "")
  const [typeId, setTypeId] = useState(facility?.typeId ?? "")
  const [building, setBuilding] = useState(facility?.building ?? "")
  const [floor, setFloor] = useState(facility?.floor ?? "")
  const [roomNumber, setRoomNumber] = useState(facility?.roomNumber ?? "")
  const [capacity, setCapacity] = useState(facility?.capacity?.toString() ?? "")
  const [description, setDescription] = useState(facility?.description ?? "")
  const [equipment, setEquipment] = useState(facility?.equipment ?? "")
  const [imageUrl, setImageUrl] = useState(facility?.imageUrl ?? "")
  const [images, setImages] = useState<File[]>([])
  const [status, setStatus] = useState<FacilityStatus>((facility?.status as FacilityStatus) ?? "Available")
  const [isActive, setIsActive] = useState(facility?.isActive ?? true)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const missingFields = []
    if (!facilityCode) missingFields.push("Facility Code")
    if (!facilityName) missingFields.push("Facility Name")
    if (!campusId) missingFields.push("Campus")
    if (!typeId) missingFields.push("Type")
    if (!capacity || Number(capacity) <= 0) missingFields.push("Capacity (must be > 0)")

    if (missingFields.length > 0) {
      toast({ 
        title: "Missing Required Fields", 
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive" 
      })
      return
    }

    if (isEdit && facility) {
      const updated = await updateFacility(facility.id, {
        facilityName,
        typeId,
        building: building || undefined,
        floor: floor || undefined,
        roomNumber: roomNumber || undefined,
        capacity: Number(capacity),
        description: description || undefined,
        equipment: equipment || undefined,
        imageUrl: imageUrl || undefined,
        status,
        isActive,
      })
      if (updated) {
        toast({ title: "Facility updated" })
        await onSaved()
      }
      return
    }

    const created = await createFacility({
      facilityCode,
      facilityName,
      typeId,
      campusId,
      building: building || undefined,
      floor: floor || undefined,
      roomNumber: roomNumber || undefined,
      capacity: Number(capacity),
      description: description || undefined,
      equipment: equipment || undefined,
      imageUrl: imageUrl || undefined,
      images: images.length > 0 ? images : undefined,
    })
    if (created) {
      toast({ title: "Facility created" })
      await onSaved()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{isEdit ? "Edit Facility" : "Create Facility"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Facility Code <span className="text-destructive">*</span>
              </label>
              <Input
                value={facilityCode}
                onChange={(e) => setFacilityCode(e.target.value.toUpperCase())}
                placeholder="e.g., LAB-201"
                disabled={isEdit}
                maxLength={20}
                pattern="[A-Z0-9-]+"
                title="Only uppercase letters, numbers, and hyphens allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">Only uppercase, numbers, and hyphens (max 20 chars)</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Facility Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                placeholder="e.g., Computer Lab 201"
                maxLength={200}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Campus <span className="text-destructive">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                disabled={isEdit}
              >
                <option value="">Select campus</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.campusName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Type <span className="text-destructive">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
              >
                <option value="">Select type</option>
                {facilityTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.typeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Building</label>
              <Input value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="A" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Floor</label>
              <Input value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Room Number</label>
              <Input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="201" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Capacity <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="30"
                min="1"
                max="1000"
              />
              <p className="text-xs text-muted-foreground mt-1">Must be between 1-1000</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                value={status}
                onChange={(e) => setStatus(e.target.value as FacilityStatus)}
              >
                <option value="Available">Available</option>
                <option value="UnderMaintenance">Under maintenance</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="facility-active"
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="facility-active" className="text-sm">Active</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Equipment (comma separated)</label>
            <Input
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="Projector, Whiteboard, PCs"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">Max 500 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Images</label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                setImages(files)
              }}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload one or more images (JPG, PNG, etc.)
            </p>
            {images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                    {image.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image URL (Alternative)</label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Or provide an image URL instead of uploading files
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              placeholder="Enter facility description..."
              className="w-full px-3 py-2 border border-input rounded-lg bg-background min-h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">Max 1000 characters</p>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isEdit ? "Update Facility" : "Create Facility"}
            </Button>
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

