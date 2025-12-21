"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useFacilities, useFacilityMutations } from "@/hooks/use-facility"
import { useFacilityTypes } from "@/hooks/use-facility-type"
import { useCampuses } from "@/hooks/use-campus"
import { facilityApi } from "@/lib/api/facility"
import type { Facility, FacilityStatus } from "@/types"

type AdminFacility = Facility

const STATUS_COLORS: Record<string, string> = {
  Available: "bg-green-100 text-green-700",
  UnderMaintenance: "bg-yellow-100 text-yellow-700",
  Unavailable: "bg-red-100 text-red-700",
}

export default function AdminFacilitiesPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { facilities, fetchFacilities, isLoading } = useFacilities()
  const { facilityTypes } = useFacilityTypes(true)
  const { campuses } = useCampuses()
  const { deleteFacility, updateFacility } = useFacilityMutations()

  const [showModal, setShowModal] = useState(false)
  const [editingFacility, setEditingFacility] = useState<AdminFacility | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingFacility, setViewingFacility] = useState<AdminFacility | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTypeId, setFilterTypeId] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [filterCampusId, setFilterCampusId] = useState<string>("")

  // Read query params on mount
  useEffect(() => {
    const statusParam = searchParams.get("status")
    if (statusParam) {
      setFilterStatus(statusParam)
    }
  }, [searchParams])

  // Parse imageUrl JSON string to get first image URL
  const getImageUrl = (facility: AdminFacility): string | null => {
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

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const matchesSearch =
        f.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.facilityCode.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = !filterTypeId || f.typeId === filterTypeId
      const matchesCampus = !filterCampusId || f.campusId === filterCampusId
      const matchesStatus = !filterStatus || f.status === filterStatus
      return matchesSearch && matchesType && matchesCampus && matchesStatus
    }).reverse() // Newest first (reverse API order)
  }, [facilities, searchTerm, filterTypeId, filterCampusId, filterStatus])

  const handleCreate = () => {
    setEditingFacility(null)
    setShowModal(true)
  }

  const handleView = async (facility: AdminFacility) => {
    try {
      console.log('Fetching facility details for view...')
      const response = await facilityApi.getById(facility.id)
      if (response.success && response.data) {
        setViewingFacility(response.data)
        setShowViewModal(true)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch facility details",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching facility details:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch facility details",
        variant: "destructive"
      })
    }
  }

  const handleEdit = async (facility: AdminFacility) => {
    try {
      const response = await facilityApi.getById(facility.id)
      if (response.success && response.data) {
        setEditingFacility(response.data)
        setShowModal(true)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch facility details",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch facility details",
        variant: "destructive"
      })
    }
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
      status: newStatus,
      isActive: facility.isActive,
    })
    if (updated) {
      toast({ title: "Status updated", duration: 1000 })
      fetchFacilities()

    }
  }

  const getStatusColor = (status: string) => STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"

  const resolveTypeName = (f: AdminFacility) => {
    if (f.typeName && f.typeName.trim()) return f.typeName
    const t = facilityTypes.find((ft) => ft.id === f.typeId)
    return t?.typeName ?? "-"
  }

  const resolveCampusName = (f: AdminFacility) => {
    if (f.campusName && f.campusName.trim()) return f.campusName
    const c = campuses.find((cc) => cc.id === f.campusId)
    return c?.campusName ?? "-"
  }

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <label className="block text-sm font-medium mb-2">Campus</label>
            <select
              value={filterCampusId}
              onChange={(e) => setFilterCampusId(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            >
              <option value="">All Campuses</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.campusName}
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
                setFilterCampusId("")
                setFilterStatus("")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Facility Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Loading facilities...</p>
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No facilities found</p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleCreate}
            >
              Create New Facility
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-semibold text-sm">Facility Info</th>
                  <th className="text-left p-4 font-semibold text-sm">Type</th>
                  <th className="text-left p-4 font-semibold text-sm">Campus</th>
                  <th className="text-left p-4 font-semibold text-sm">Location</th>
                  <th className="text-center p-4 font-semibold text-sm">Capacity</th>
                  <th className="text-left p-4 font-semibold text-sm">Equipment</th>
                  <th className="text-center p-4 font-semibold text-sm">Status</th>
                  <th className="text-center p-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacilities.map((facility) => (
                  <tr
                    key={facility.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-base">{facility.facilityName}</div>
                        <div className="text-xs text-muted-foreground">Code: {facility.facilityCode}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{resolveTypeName(facility)}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{resolveCampusName(facility)}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>Building: {facility.building ?? "-"}</div>
                        <div className="text-xs text-muted-foreground">Floor: {facility.floor ?? "-"}</div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-semibold">{facility.capacity}</span>
                    </td>
                    <td className="p-4">
                      {facility.equipment ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {facility.equipment
                            .split(",")
                            .map((e) => e.trim())
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((eq, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                {eq}
                              </span>
                            ))}
                          {facility.equipment.split(",").filter(Boolean).length > 2 && (
                            <span className="px-2 py-0.5 bg-muted text-xs rounded">
                              +{facility.equipment.split(",").filter(Boolean).length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(facility.status)}`}>
                        {facility.status === "UnderMaintenance" ? "Maintenance" : facility.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleView(facility)
                          }}
                          className="h-8 px-3"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(facility)
                          }}
                          className="h-8 px-3"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <select
                          value={facility.status}
                          onChange={(e) => handleStatusChange(facility, e.target.value as FacilityStatus)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 px-2 text-xs border border-input rounded-lg bg-background"
                          title="Change Status"
                        >
                          <option value="Available">Available</option>
                          <option value="UnderMaintenance">Maintenance</option>
                          <option value="Unavailable">Unavailable</option>
                        </select>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(facility)
                          }}
                          className="h-8 px-3"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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

      {showViewModal && viewingFacility && (
        <FacilityViewModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false)
            setViewingFacility(null)
          }}
          facility={viewingFacility}
          onEdit={() => {
            setShowViewModal(false)
            handleEdit(viewingFacility)
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
  const [images, setImages] = useState<File[]>([])
  const [status, setStatus] = useState<FacilityStatus>((facility?.status as FacilityStatus) ?? "Available")
  const [isActive, setIsActive] = useState(facility?.isActive ?? true)

  // Sync state when facility prop changes (when editing different facilities)
  useEffect(() => {
    if (facility) {
      setFacilityCode(facility.facilityCode ?? "")
      setFacilityName(facility.facilityName ?? "")
      setCampusId(facility.campusId ?? "")
      setTypeId(facility.typeId ?? "")
      setBuilding(facility.building ?? "")
      setFloor(facility.floor ?? "")
      setRoomNumber(facility.roomNumber ?? "")
      setCapacity(facility.capacity?.toString() ?? "")
      setDescription(facility.description ?? "")
      setEquipment(facility.equipment ?? "")
      setStatus((facility.status as FacilityStatus) ?? "Available")
      setIsActive(facility.isActive ?? true)
    } else {
      // Reset form for create mode
      setFacilityCode("")
      setFacilityName("")
      setCampusId("")
      setTypeId("")
      setBuilding("")
      setFloor("")
      setRoomNumber("")
      setCapacity("")
      setDescription("")
      setEquipment("")
      setStatus("Available")
      setIsActive(true)
      setImages([])
    }
  }, [facility])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const errors: string[] = []

    // Common validations for both create and update
    if (!facilityName.trim()) {
      errors.push("Facility name is required")
    } else if (facilityName.length > 200) {
      errors.push("Facility name cannot exceed 200 characters")
    }

    if (!typeId) {
      errors.push("Facility type is required")
    }

    if (!capacity || isNaN(Number(capacity))) {
      errors.push("Capacity is required")
    } else if (Number(capacity) <= 0) {
      errors.push("Capacity must be greater than 0")
    } else if (Number(capacity) > 1000) {
      errors.push("Capacity cannot exceed 1000")
    }

    if (description && description.length > 1000) {
      errors.push("Description cannot exceed 1000 characters")
    }

    if (equipment && equipment.length > 500) {
      errors.push("Equipment cannot exceed 500 characters")
    }

    // Create-specific validations
    if (!isEdit) {
      if (!facilityCode.trim()) {
        errors.push("Facility code is required")
      } else if (facilityCode.length > 20) {
        errors.push("Facility code cannot exceed 20 characters")
      } else if (!/^[A-Z0-9-]+$/.test(facilityCode)) {
        errors.push("Facility code must contain only uppercase letters, numbers, and hyphens")
      }

      if (!campusId) {
        errors.push("Campus is required")
      }

      // Validate images (limit to 2 files)
      if (images.length > 0) {
        if (images.length > 2) {
          errors.push("You can upload a maximum of 2 images")
        }
        images.forEach((file, index) => {
          if (file.size > 5 * 1024 * 1024) {
            errors.push(`Image ${index + 1} (${file.name}) exceeds 5MB`)
          }
          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
          if (!validTypes.includes(file.type.toLowerCase())) {
            errors.push(`Image ${index + 1} (${file.name}) must be JPEG, JPG, PNG, or GIF`)
          }
        })
      }
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join("; "),
        variant: "destructive"
      })
      return
    }

    if (isEdit && facility) {
      // Validate new images in edit mode
      if (images.length > 0) {
        if (images.length > 2) {
          errors.push("You can upload a maximum of 2 images")
        }
        images.forEach((file, index) => {
          if (file.size > 5 * 1024 * 1024) {
            errors.push(`Image ${index + 1} (${file.name}) exceeds 5MB`)
          }
          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
          if (!validTypes.includes(file.type.toLowerCase())) {
            errors.push(`Image ${index + 1} (${file.name}) must be JPEG, JPG, PNG, or GIF`)
          }
        })

        if (errors.length > 0) {
          toast({
            title: "Validation Error",
            description: errors.join("; "),
            variant: "destructive"
          })
          return
        }
      }

      const updated = await updateFacility(facility.id, {
        facilityName,
        typeId,
        campusId: campusId || undefined,
        building: building || undefined,
        floor: floor || undefined,
        roomNumber: roomNumber || undefined,
        capacity: Number(capacity),
        description: description || undefined,
        equipment: equipment || undefined,
        // Nếu có upload ảnh mới thì để backend tự xử lý images mới,
        // không gửi lại imageUrl cũ để tránh lỗi 500 từ API
        imageUrl: images.length === 0 ? facility.imageUrl || undefined : undefined,
        images: images.length > 0 ? images : undefined,
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
      images: images.length > 0 ? images : undefined,
    })
    if (created) {
      toast({ title: "Facility created" })
      await onSaved()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      // Validate file size and type
      const validFiles = filesArray.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB`,
            variant: "destructive"
          })
          return false
        }
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type.toLowerCase())) {
          toast({
            title: "Invalid file type",
            description: `${file.name} must be JPEG, JPG, PNG, or GIF`,
            variant: "destructive"
          })
          return false
        }
        return true
      })

      // Enforce maximum 2 images - keep first 2 valid files
      if (validFiles.length > 2) {
        toast({
          title: "Too many files",
          description: "You can upload a maximum of 2 images",
          variant: "destructive",
        })
      }
      setImages(validFiles.slice(0, 2))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-8" onClick={onClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col relative z-50 py-0 gap-0" onClick={(e) => e.stopPropagation()}>
        {/* Header - Fixed at top, NOT scrollable */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-950 border-b px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold">{isEdit ? "Edit Facility" : "Create Facility"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl px-2">
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form className="px-6 pt-4 pb-6 space-y-5" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Facility Code <span className="text-red-500">*</span>
                </label>
                <Input
                  value={facilityCode}
                  onChange={(e) => setFacilityCode(e.target.value.toUpperCase())}
                  placeholder="ABC"
                  disabled={isEdit}
                  maxLength={20}
                  pattern="[A-Z0-9-]+"
                  title="Only uppercase letters, numbers, and hyphens allowed"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Only uppercase, numbers, and hyphens (max 20 chars)
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Facility Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="Room name"
                  maxLength={200}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Max 200 characters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Campus <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full h-11 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={campusId}
                  onChange={(e) => setCampusId(e.target.value)}
                >
                  <option value="">Select campus</option>
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.campusName}
                    </option>
                  ))}
                </select>
                {/* Campus can now be changed when editing */}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full h-11 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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

            {/* Location */}
            <div className="space-y-1 pt-2">
              <h3 className="text-lg font-semibold">Location</h3>
              <p className="text-sm text-muted-foreground">Specify the facility location</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Building</label>
                <Input
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="A"
                  className="h-11"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Floor</label>
                <Input
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="2"
                  className="h-11"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Room Number</label>
                <Input
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="201"
                  className="h-11"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-1 pt-2">
              <h3 className="text-lg font-semibold">Settings</h3>
              <p className="text-sm text-muted-foreground">Configure capacity and availability</p>
            </div>

            <div className={`grid grid-cols-1 ${isEdit ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-4`}>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="30"
                  min="1"
                  max="1000"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Must be between 1-1000</p>
              </div>
              {isEdit && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Status</label>
                    <select
                      className="w-full h-11 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as FacilityStatus)}
                    >
                      <option value="Available">Available</option>
                      <option value="UnderMaintenance">Under maintenance</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-8">
                    <input
                      id="facility-active"
                      type="checkbox"
                      className="w-5 h-5 accent-primary cursor-pointer"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <label htmlFor="facility-active" className="text-sm font-medium cursor-pointer">Active</label>
                  </div>
                </>
              )}
            </div>

            {/* Additional Information */}
            <div className="space-y-1 pt-2">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <p className="text-sm text-muted-foreground">Equipment and description</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Equipment (comma separated)</label>
              <Input
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="Projector, Whiteboard, PCs"
                maxLength={500}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                {equipment.length}/500 characters
              </p>
            </div>

            {/* Images upload - used for both create and update (matches Swagger images[] array) */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Images
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-3 py-2.5 border border-input rounded-lg bg-background file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Max 5MB per file. Formats: JPEG, JPG, PNG, GIF.&nbsp;
                {isEdit
                  ? "Các ảnh mới upload sẽ được thêm vào cùng với các ảnh hiện có."
                  : "Bạn có thể upload nhiều ảnh cho facility khi tạo mới."}
                {images.length > 0 && (
                  <span className="font-medium text-primary"> {" "}
                    {images.length} file(s) selected
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                placeholder="Enter facility description..."
                className="w-full px-3 py-2.5 border border-input rounded-lg bg-background min-h-28 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                {description.length}/1000 characters
              </p>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="submit"
                className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : isEdit ? "Update Facility" : "Create Facility"}
              </Button>
              <Button type="button" variant="outline" className="flex-1 h-11 bg-transparent font-semibold" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

interface FacilityViewModalProps {
  isOpen: boolean
  onClose: () => void
  facility: AdminFacility
  onEdit: () => void
}

function FacilityViewModal({ isOpen, onClose, facility, onEdit }: FacilityViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { facilityTypes } = useFacilityTypes()
  const { campuses } = useCampuses()

  // Get type name from typeId
  const getTypeName = (): string => {
    if (facility.typeName && facility.typeName !== "-") return facility.typeName
    const type = facilityTypes.find(t => t.id === facility.typeId)
    return type?.typeName || facility.typeName || "-"
  }

  // Get campus name from campusId
  const getCampusName = (): string => {
    if (facility.campusName && facility.campusName !== "-") return facility.campusName
    const campus = campuses.find(c => c.id === facility.campusId)
    return campus?.campusName || facility.campusName || "-"
  }

  if (!isOpen) return null

  // Parse imageUrl - backend returns JSON array string or comma-separated URLs
  const getImageUrls = (): string[] => {
    if (!facility.imageUrl) {
      console.log('No imageUrl found')
      return []
    }

    console.log('Raw imageUrl:', facility.imageUrl)
    console.log('Type of imageUrl:', typeof facility.imageUrl)

    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(facility.imageUrl)
      console.log('Parsed as JSON:', parsed)
      if (Array.isArray(parsed)) {
        console.log('Image URLs array:', parsed)
        return parsed.filter(url => url && typeof url === 'string')
      }
      return [facility.imageUrl]
    } catch (error) {
      console.log('Failed to parse as JSON, treating as string:', error)
      // If not JSON, treat as comma-separated or single URL
      const urls = facility.imageUrl.split(',').map(url => url.trim()).filter(Boolean)
      console.log('Split URLs:', urls)
      return urls
    }
  }

  const imageUrls = getImageUrls()
  const hasImages = imageUrls.length > 0

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Available: "bg-green-100 text-green-700",
      UnderMaintenance: "bg-yellow-100 text-yellow-700",
      Unavailable: "bg-red-100 text-red-700",
    }
    return colors[status] ?? "bg-gray-100 text-gray-700"
  }

  const getEquipmentList = (): string[] => {
    if (!facility.equipment) return []
    return facility.equipment.split(',').map(e => e.trim()).filter(Boolean)
  }

  const equipment = getEquipmentList()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col py-0 gap-0 overflow-hidden">
        {/* Header - Fixed, not scrollable */}
        <div className="flex-shrink-0 bg-background border-b p-6 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold">{facility.facilityName}</h2>
            <p className="text-sm text-muted-foreground mt-1">Code: {facility.facilityCode}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl px-2">
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Image Gallery */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Images</h3>
            {hasImages ? (
              <div className="relative w-full h-[450px] bg-muted rounded-xl overflow-hidden shadow-lg">
                <img
                  src={imageUrls[currentImageIndex]}
                  alt={`${facility.facilityName} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load image:', imageUrls[currentImageIndex])
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                  onLoad={() => console.log('Image loaded successfully:', imageUrls[currentImageIndex])}
                />
                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    >
                      →
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {currentImageIndex + 1} / {imageUrls.length}
                    </div>
                  </>
                )}
                {imageUrls.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {imageUrls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-primary shadow-md scale-105' : 'border-muted hover:border-primary/50'
                          }`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-64 bg-muted rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">No images available</p>
                <p className="text-sm mt-1">Images will appear here when uploaded</p>
              </div>
            )}
          </div>

          {/* Facility Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5 bg-muted/30">
              <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{getTypeName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campus:</span>
                  <span className="font-medium">{getCampusName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campus ID:</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{facility.campusId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="font-medium">{facility.capacity} people</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(facility.status)}`}>
                    {facility.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active:</span>
                  <span className="font-medium">{facility.isActive ? '✓ Yes' : '✗ No'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-muted/30">
              <h3 className="font-semibold text-lg mb-4">Location</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Building:</span>
                  <span className="font-medium">{facility.building || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Floor:</span>
                  <span className="font-medium">{facility.floor || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Number:</span>
                  <span className="font-medium">{facility.roomNumber || '-'}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Description */}
          {facility.description && (
            <Card className="p-5 bg-muted/30">
              <h3 className="font-semibold text-lg mb-3">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{facility.description}</p>
            </Card>
          )}

          {/* Equipment */}
          {equipment.length > 0 && (
            <Card className="p-5 bg-muted/30">
              <h3 className="font-semibold text-lg mb-3">Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {equipment.map((eq) => (
                  <span key={eq} className="px-4 py-2 bg-primary/10 text-primary text-sm rounded-lg font-medium border border-primary/20">
                    {eq}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 bg-background border-t p-6 flex justify-end rounded-b-xl">
          <Button onClick={onEdit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Edit Facility
          </Button>
        </div>
      </Card>
    </div>
  )
}

