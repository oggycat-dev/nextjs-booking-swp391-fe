"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MOCK_CONFLICTS = [
  {
    id: "CF-001",
    type: "Double Booking",
    facility: "Meeting Room 301",
    date: "2025-12-05",
    timeSlot: "10:00 - 11:30",
    booking1: {
      id: "BK-001",
      requester: "Nguyen Van A",
      role: "Student",
      purpose: "Team meeting",
    },
    booking2: {
      id: "BK-002",
      requester: "Tran Thi B",
      role: "Student",
      purpose: "Project discussion",
    },
    priority: "High",
    status: "Unresolved",
    detectedAt: "2025-12-04 15:30",
  },
  {
    id: "CF-002",
    type: "Overlapping Bookings",
    facility: "Computer Lab 201",
    date: "2025-12-06",
    timeSlot: "09:00 - 12:00",
    booking1: {
      id: "BK-003",
      requester: "Prof. Le Van C",
      role: "Lecturer",
      purpose: "Class session (9:00 - 11:00)",
    },
    booking2: {
      id: "BK-004",
      requester: "Hoang Thi E",
      role: "Student",
      purpose: "Project work (10:30 - 12:00)",
    },
    priority: "High",
    status: "Unresolved",
    detectedAt: "2025-12-04 16:00",
  },
  {
    id: "CF-003",
    type: "Maintenance Conflict",
    facility: "Auditorium",
    date: "2025-12-08",
    timeSlot: "14:00 - 16:00",
    booking1: {
      id: "BK-005",
      requester: "Pham Van D",
      role: "Student",
      purpose: "Event rehearsal",
    },
    booking2: {
      id: null,
      requester: "Maintenance Team",
      role: "System",
      purpose: "Equipment servicing",
    },
    priority: "Critical",
    status: "Unresolved",
    detectedAt: "2025-12-04 14:20",
  },
]

export default function AdminConflictsPage() {
  const [conflicts, setConflicts] = useState(MOCK_CONFLICTS)
  const [selectedConflict, setSelectedConflict] = useState<(typeof MOCK_CONFLICTS)[0] | null>(null)
  const [resolutionType, setResolutionType] = useState<"priority" | "contact" | "reschedule" | null>(null)

  const unresolvedConflicts = conflicts.filter((c) => c.status === "Unresolved")
  const resolvedConflicts = conflicts.filter((c) => c.status === "Resolved")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-700"
      case "High":
        return "bg-orange-100 text-orange-700"
      case "Medium":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-green-100 text-green-700"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Double Booking":
        return "border-l-red-400"
      case "Overlapping Bookings":
        return "border-l-orange-400"
      case "Maintenance Conflict":
        return "border-l-purple-400"
      default:
        return "border-l-blue-400"
    }
  }

  const handleResolveByPriority = (conflictId: string, bookingToKeep: string) => {
    const conflict = conflicts.find((c) => c.id === conflictId)
    if (conflict) {
      setConflicts(conflicts.map((c) => (c.id === conflictId ? { ...c, status: "Resolved" } : c)))
      setSelectedConflict(null)
      setResolutionType(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Conflict Management</h1>
        <p className="text-muted-foreground">Detect and resolve booking conflicts automatically</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Unresolved Conflicts</p>
          <p className="text-3xl font-bold text-destructive">{unresolvedConflicts.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Critical Priority</p>
          <p className="text-3xl font-bold text-primary">
            {unresolvedConflicts.filter((c) => c.priority === "Critical").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Resolved This Month</p>
          <p className="text-3xl font-bold text-primary">{resolvedConflicts.length}</p>
        </Card>
      </div>

      <Tabs defaultValue="unresolved" className="w-full">
        <TabsList>
          <TabsTrigger value="unresolved">Unresolved ({unresolvedConflicts.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedConflicts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="unresolved" className="mt-4 space-y-4">
          {unresolvedConflicts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No unresolved conflicts</p>
              <p className="text-sm text-muted-foreground">System is running smoothly</p>
            </Card>
          ) : (
            unresolvedConflicts
              .sort((a, b) => {
                const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
                return (
                  (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) -
                  (priorityOrder[b.priority as keyof typeof priorityOrder] || 4)
                )
              })
              .map((conflict) => (
                <Card
                  key={conflict.id}
                  className={`p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 ${getTypeColor(conflict.type)}`}
                  onClick={() => setSelectedConflict(conflict)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{conflict.type}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(conflict.priority)}`}
                        >
                          {conflict.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Conflict ID: {conflict.id} • Detected: {conflict.detectedAt}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded-lg mb-4 text-sm space-y-2">
                    <p>
                      <span className="font-medium">Facility:</span> {conflict.facility}
                    </p>
                    <p>
                      <span className="font-medium">Date & Time:</span> {conflict.date} • {conflict.timeSlot}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="border-r pr-4">
                      <p className="text-muted-foreground text-xs font-medium">Booking 1</p>
                      <p className="font-medium">{conflict.booking1.requester}</p>
                      <p className="text-xs text-muted-foreground">{conflict.booking1.role}</p>
                      <p className="text-xs mt-1">{conflict.booking1.purpose}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">Booking 2</p>
                      <p className="font-medium">{conflict.booking2.requester}</p>
                      <p className="text-xs text-muted-foreground">{conflict.booking2.role}</p>
                      <p className="text-xs mt-1">{conflict.booking2.purpose}</p>
                    </div>
                  </div>

                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
                    Resolve Conflict
                  </Button>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-4 space-y-4">
          {resolvedConflicts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No resolved conflicts</p>
            </Card>
          ) : (
            resolvedConflicts.map((conflict) => (
              <Card key={conflict.id} className="p-4 opacity-75 border-l-4 border-l-green-400">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{conflict.type}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Resolved
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {conflict.facility} • {conflict.date} • {conflict.timeSlot}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {selectedConflict && !resolutionType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedConflict.type}</h2>
              <button onClick={() => setSelectedConflict(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Conflict ID</p>
                  <p className="font-bold">{selectedConflict.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Priority</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded ${getPriorityColor(selectedConflict.priority)}`}
                  >
                    {selectedConflict.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Facility</p>
                  <p className="font-bold">{selectedConflict.facility}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                  <p className="font-bold">
                    {selectedConflict.date} • {selectedConflict.timeSlot}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Conflicting Bookings</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="font-bold text-sm mb-1">{selectedConflict.booking1.requester}</p>
                      <p className="text-xs text-muted-foreground mb-1">{selectedConflict.booking1.role}</p>
                      <p className="text-xs">{selectedConflict.booking1.purpose}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="font-bold text-sm mb-1">{selectedConflict.booking2.requester}</p>
                      <p className="text-xs text-muted-foreground mb-1">{selectedConflict.booking2.role}</p>
                      <p className="text-xs">{selectedConflict.booking2.purpose}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setResolutionType("priority")}
              >
                Resolve by Priority (Auto)
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setResolutionType("contact")}>
                Contact Both Users
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setResolutionType("reschedule")}
              >
                Reschedule One Booking
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setSelectedConflict(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {selectedConflict && resolutionType === "priority" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Resolve by Priority</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Based on booking priority rules, which booking should be approved?
            </p>

            <div className="space-y-2 mb-6">
              <div
                className="p-3 border border-input rounded-lg cursor-pointer hover:bg-muted"
                onClick={() => handleResolveByPriority(selectedConflict.id, selectedConflict.booking1.id)}
              >
                <p className="font-medium text-sm">{selectedConflict.booking1.requester}</p>
                <p className="text-xs text-muted-foreground">{selectedConflict.booking1.purpose}</p>
              </div>
              <div
                className="p-3 border border-input rounded-lg cursor-pointer hover:bg-muted"
                onClick={() => handleResolveByPriority(selectedConflict.id, selectedConflict.booking2.id)}
              >
                <p className="font-medium text-sm">{selectedConflict.booking2.requester}</p>
                <p className="text-xs text-muted-foreground">{selectedConflict.booking2.purpose}</p>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent" onClick={() => setResolutionType(null)}>
              Back
            </Button>
          </Card>
        </div>
      )}

      {selectedConflict && resolutionType === "contact" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Contact Users</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Send notifications to both users to resolve the conflict manually
            </p>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-2">
              Send Notifications
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => setResolutionType(null)}>
              Back
            </Button>
          </Card>
        </div>
      )}

      {selectedConflict && resolutionType === "reschedule" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Reschedule Booking</h2>
            <p className="text-sm text-muted-foreground mb-4">Find alternative time slot for one booking</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">New Date</label>
                <input type="date" className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Time</label>
                <input type="time" className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-2">Reschedule</Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => setResolutionType(null)}>
              Back
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
