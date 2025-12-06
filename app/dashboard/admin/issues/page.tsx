"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { usePendingFacilityIssues, useFacilityIssueMutations } from "@/hooks/use-facility-issue"
import { useFacilities } from "@/hooks/use-facility"
import { AlertCircle, Clock, MapPin, User, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react"
import type { FacilityIssue } from "@/types"

export default function AdminIssuesPage() {
  const { toast } = useToast()
  const { issues, fetchPendingIssues, isLoading } = usePendingFacilityIssues()
  const { changeRoom, isLoading: isChangingRoom } = useFacilityIssueMutations()
  const { facilities, fetchFacilities } = useFacilities()
  
  const [selectedIssue, setSelectedIssue] = useState<FacilityIssue | null>(null)
  const [showChangeRoomDialog, setShowChangeRoomDialog] = useState(false)
  const [newFacilityId, setNewFacilityId] = useState("")
  const [adminResponse, setAdminResponse] = useState("")

  useEffect(() => {
    fetchPendingIssues()
  }, [fetchPendingIssues])

  useEffect(() => {
    fetchFacilities()
  }, [])

  const handleChangeRoom = async () => {
    if (!selectedIssue || !newFacilityId) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a new facility",
      })
      return
    }

    if (!adminResponse.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Admin response is required",
      })
      return
    }

    try {
      const success = await changeRoom(selectedIssue.id, {
        newFacilityId,
        adminResponse: adminResponse.trim(),
      })

      if (success) {
        toast({
          title: "Room Changed",
          description: "The room has been changed and user has been notified via email.",
        })
        setShowChangeRoomDialog(false)
        setSelectedIssue(null)
        setNewFacilityId("")
        setAdminResponse("")
        fetchPendingIssues()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change room";
      toast({
        variant: "destructive",
        title: "Failed to Change Room",
        description: errorMessage,
      })
    }
  }

  const openChangeRoomDialog = (issue: FacilityIssue) => {
    setSelectedIssue(issue)
    setNewFacilityId("")
    setAdminResponse("")
    setShowChangeRoomDialog(true)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-700 border-red-200"
      case "High":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Low":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Filter facilities with similar type (same facility type as the reported facility)
  const getSimilarFacilities = () => {
    if (!selectedIssue || !facilities.length) return []
    
    // Try to find the original facility to get its type
    const originalFacility = facilities.find(f => f.id === selectedIssue.facilityId)
    if (!originalFacility) return facilities

    // Filter facilities with same type, excluding the original facility
    return facilities.filter(
      f => f.typeId === originalFacility.typeId && f.id !== selectedIssue.facilityId && f.status === "Available"
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Facility Issue Reports</h1>
          <p className="text-muted-foreground">Review and manage facility issue reports</p>
        </div>
        <Button onClick={fetchPendingIssues} variant="outline">
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading issue reports...</p>
        </Card>
      ) : issues.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">No pending issue reports</p>
          <p className="text-sm text-muted-foreground">All issues have been resolved</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <Card key={issue.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{issue.issueTitle}</h3>
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Badge>
                    <Badge variant="outline">{issue.category}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Reported by: <strong className="text-foreground">{issue.reportedByName || issue.reportedByEmail}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Facility: <strong className="text-foreground">{issue.facilityName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Reported at: <strong className="text-foreground">{formatDate(issue.createdAt || new Date().toISOString())}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Description:</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {issue.issueDescription}
                </p>
              </div>

              {issue.imageUrls && issue.imageUrls.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Images ({issue.imageUrls.length})
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {issue.imageUrls.map((imageUrl, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={imageUrl}
                          alt={`Issue image ${idx + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => openChangeRoomDialog(issue)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Change Room
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Change Room Dialog */}
      <AlertDialog open={showChangeRoomDialog} onOpenChange={setShowChangeRoomDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Change Room for Issue</AlertDialogTitle>
            <AlertDialogDescription>
              Select a new facility with similar functionality to replace the reported facility.
              <br />
              <strong>Note:</strong> The booking time will be recalculated from approval time to the original booking end time.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedIssue && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Current Facility:</p>
                <p className="text-sm">{selectedIssue.facilityName}</p>
                <p className="text-xs text-muted-foreground mt-1">Booking: {selectedIssue.bookingCode}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Select New Facility <span className="text-red-500">*</span>
                </label>
                <select
                  value={newFacilityId}
                  onChange={(e) => setNewFacilityId(e.target.value)}
                  className="w-full h-11 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a facility...</option>
                  {getSimilarFacilities().map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.facilityName} ({facility.facilityCode}) - {facility.typeName} - Capacity: {facility.capacity}
                    </option>
                  ))}
                </select>
                {getSimilarFacilities().length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    No similar facilities available. Showing all available facilities.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Admin Response (Optional)
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Add a note for the user..."
                  className="w-full px-3 py-2.5 border border-input rounded-lg bg-background min-h-24 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {adminResponse.length}/500 characters
                </p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingRoom}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangeRoom}
              disabled={isChangingRoom || !newFacilityId || !adminResponse.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isChangingRoom ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Approve & Change Room"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

