"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const MOCK_FACILITIES = [
  {
    id: 1,
    code: "LAB-201",
    name: "Computer Lab 201",
    type: "Lab",
    building: "B",
    floor: 2,
    capacity: 30,
    status: "Active",
    equipment: ["PCs", "Projector", "Microphone"],
    utilization: 85,
    lastUpdated: "2025-12-04",
  },
  {
    id: 2,
    code: "MR-301",
    name: "Meeting Room 301",
    type: "Meeting Room",
    building: "A",
    floor: 3,
    capacity: 8,
    status: "Active",
    equipment: ["Projector", "Whiteboard"],
    utilization: 72,
    lastUpdated: "2025-12-01",
  },
  {
    id: 3,
    code: "SR-105",
    name: "Study Room 105",
    type: "Study Room",
    building: "C",
    floor: 1,
    capacity: 6,
    status: "Maintenance",
    equipment: ["Whiteboard"],
    utilization: 0,
    lastUpdated: "2025-11-28",
  },
  {
    id: 4,
    code: "AUD-001",
    name: "Auditorium",
    type: "Auditorium",
    building: "D",
    floor: 0,
    capacity: 200,
    status: "Active",
    equipment: ["Projector", "Sound System", "Microphone"],
    utilization: 54,
    lastUpdated: "2025-12-03",
  },
]

const FACILITY_TYPES = ["Lab", "Meeting Room", "Study Room", "Auditorium", "Sports"]
const BUILDING_OPTIONS = ["A", "B", "C", "D", "E"]

export default function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState(MOCK_FACILITIES)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState<(typeof MOCK_FACILITIES)[0] | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")

  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || f.type === filterType
    const matchesStatus = !filterStatus || f.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleEdit = (facility: (typeof MOCK_FACILITIES)[0]) => {
    setSelectedFacility(facility)
    setShowEditModal(true)
  }

  const handleStatusChange = (id: number, newStatus: string) => {
    setFacilities(facilities.map((f) => (f.id === id ? { ...f, status: newStatus } : f)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Maintenance":
        return "bg-yellow-100 text-yellow-700"
      case "Unavailable":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Facility Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage campus facilities</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setShowCreateModal(true)}
        >
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            >
              <option value="">All Types</option>
              {FACILITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
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
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                setSearchTerm("")
                setFilterType("")
                setFilterStatus("")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredFacilities.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No facilities found</p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setShowCreateModal(true)}
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
                    <h3 className="text-lg font-bold">{facility.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(facility.status)}`}>
                      {facility.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Code: {facility.code} • Type: {facility.type} • Building {facility.building}, Floor {facility.floor}{" "}
                    • Capacity: {facility.capacity}
                  </p>
                  <div className="flex items-center gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Equipment</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {facility.equipment.map((eq) => (
                          <span key={eq} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Utilization</p>
                      <p className="text-lg font-bold text-primary">{facility.utilization}%</p>
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
                    onChange={(e) => handleStatusChange(facility.id, e.target.value)}
                    className="px-2 py-1 text-xs border border-input rounded-lg bg-background"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {showCreateModal && (
        <FacilityFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Facility"
        />
      )}

      {showEditModal && selectedFacility && (
        <FacilityFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedFacility(null)
          }}
          title={`Edit ${selectedFacility.name}`}
          facility={selectedFacility}
        />
      )}
    </div>
  )
}

interface FacilityFormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  facility?: (typeof MOCK_FACILITIES)[0]
}

function FacilityFormModal({ isOpen, onClose, title, facility }: FacilityFormModalProps) {
  if (!isOpen) return null

  const FACILITY_TYPES = ["Lab", "Meeting Room", "Study Room", "Auditorium", "Sports"]
  const BUILDING_OPTIONS = ["A", "B", "C", "D", "E"]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Facility Code</label>
              <Input defaultValue={facility?.code} placeholder="e.g., LAB-201" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Facility Name</label>
              <Input defaultValue={facility?.name} placeholder="e.g., Computer Lab 201" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                {FACILITY_TYPES.map((type) => (
                  <option key={type} value={type} selected={facility?.type === type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Capacity</label>
              <Input type="number" defaultValue={facility?.capacity} placeholder="e.g., 30" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Building</label>
              <select className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                {BUILDING_OPTIONS.map((building) => (
                  <option key={building} value={building} selected={facility?.building === building}>
                    {building}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Floor</label>
              <Input type="number" defaultValue={facility?.floor} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                <option selected={facility?.status === "Active"}>Active</option>
                <option selected={facility?.status === "Maintenance"}>Maintenance</option>
                <option selected={facility?.status === "Unavailable"}>Unavailable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Equipment</label>
            <div className="space-y-2">
              {["Projector", "Whiteboard", "PCs", "Microphone", "Sound System", "Video Conference"].map((item) => (
                <label key={item} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={facility?.equipment.includes(item)}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              placeholder="Enter facility description..."
              className="w-full px-3 py-2 border border-input rounded-lg bg-background min-h-24"
              defaultValue=""
            />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              {facility ? "Update Facility" : "Create Facility"}
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
