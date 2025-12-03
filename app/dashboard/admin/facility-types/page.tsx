"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useFacilityTypes, useFacilityTypeMutations } from "@/hooks/use-facility-type"
import type { FacilityType } from "@/types"

export default function AdminFacilityTypesPage() {
  const { toast } = useToast()
  const { facilityTypes, fetchFacilityTypes, isLoading } = useFacilityTypes()
  const { createFacilityType, isLoading: isCreating, error: createError } = useFacilityTypeMutations()

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createTypeCode, setCreateTypeCode] = useState("")
  const [createTypeName, setCreateTypeName] = useState("")
  const [createDescription, setCreateDescription] = useState("")

  // View modal state
  const [selectedType, setSelectedType] = useState<FacilityType | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)

  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  const handleCreateFacilityType = async () => {
    if (!createTypeCode.trim() || !createTypeName.trim()) {
      toast({
        title: "Error",
        description: "Type Code and Type Name are required",
        variant: "destructive",
      })
      return
    }

    const result = await createFacilityType({
      typeCode: createTypeCode.trim(),
      typeName: createTypeName.trim(),
      description: createDescription.trim() || undefined,
    })

    if (result) {
      toast({
        title: "Success",
        description: "Facility type created successfully",
      })
      setShowCreateModal(false)
      setCreateTypeCode("")
      setCreateTypeName("")
      setCreateDescription("")
      fetchFacilityTypes()
    } else {
      toast({
        title: "Error",
        description: createError || "Failed to create facility type",
        variant: "destructive",
      })
    }
  }

  const handleViewDetails = (type: FacilityType) => {
    setSelectedType(type)
    setShowViewModal(true)
  }

  const filteredTypes = facilityTypes.filter((type) => {
    const matchesSearch =
      type.typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.typeCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && type.isActive) ||
      (filterStatus === "inactive" && !type.isActive)

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facility Types</h1>
          <p className="text-muted-foreground mt-1">Manage facility type categories</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + Create Facility Type
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearchTerm("")
                setFilterStatus("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTypes.length} of {facilityTypes.length} facility types
      </div>

      {/* Facility Types Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading facility types...</div>
      ) : filteredTypes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No facility types found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTypes.map((type) => (
            <Card
              key={type.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(type)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{type.typeName}</h3>
                  <p className="text-sm text-muted-foreground">{type.typeCode}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    type.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {type.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {type.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {type.description}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Create Facility Type</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateTypeCode("")
                    setCreateTypeName("")
                    setCreateDescription("")
                  }}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Type Code <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={createTypeCode}
                    onChange={(e) => setCreateTypeCode(e.target.value)}
                    placeholder="e.g., LAB, ROOM, HALL"
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Short code to identify this type
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Type Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={createTypeName}
                    onChange={(e) => setCreateTypeName(e.target.value)}
                    placeholder="e.g., Laboratory, Meeting Room, Lecture Hall"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    placeholder="Enter a description for this facility type..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateTypeCode("")
                    setCreateTypeName("")
                    setCreateDescription("")
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateFacilityType}
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Facility Type Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedType(null)
                  }}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type Code</label>
                  <p className="text-lg font-semibold mt-1">{selectedType.typeCode}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type Name</label>
                  <p className="text-lg font-semibold mt-1">{selectedType.typeName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        selectedType.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {selectedType.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {selectedType.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="mt-1">{selectedType.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="text-sm font-mono mt-1 text-muted-foreground">{selectedType.id}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedType(null)
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
