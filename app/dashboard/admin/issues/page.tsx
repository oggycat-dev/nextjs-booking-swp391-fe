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
import { parseApiError } from "@/lib/error-utils"

export default function AdminIssuesPage() {
  const { toast } = useToast()
  const { issues, fetchPendingIssues, isLoading } = usePendingFacilityIssues()
  const { changeRoom, rejectIssue, isLoading: isChangingRoom, error: mutationError } = useFacilityIssueMutations()
  const { facilities, fetchFacilities } = useFacilities()

  const [selectedIssue, setSelectedIssue] = useState<FacilityIssue | null>(null)
  const [showChangeRoomDialog, setShowChangeRoomDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [newFacilityId, setNewFacilityId] = useState("")
  const [adminResponse, setAdminResponse] = useState("")
  const [rejectReason, setRejectReason] = useState("")

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
          title: "Room Changed Successfully",
          description: "The room has been changed and the user has been notified via email.",
        })
        setShowChangeRoomDialog(false)
        setSelectedIssue(null)
        setNewFacilityId("")
        setAdminResponse("")
        fetchPendingIssues()
      } else {
        // Handle case when changeRoom returns false (error occurred)
        // Get error message from mutationError state
        const errorMsg = mutationError || "Failed to change room";
        const { title, description } = parseApiError(new Error(errorMsg));

        toast({
          variant: "destructive",
          title: title,
          description: description,
        })
      }
    } catch (error) {
      // This catch block handles unexpected errors only
      const { title, description } = parseApiError(error);

      toast({
        variant: "destructive",
        title: title,
        description: description,
      })
    }
  }

  const openChangeRoomDialog = (issue: FacilityIssue) => {
    setSelectedIssue(issue)
    setNewFacilityId("")
    setAdminResponse("")
    setShowChangeRoomDialog(true)
  }

  const openRejectDialog = (issue: FacilityIssue) => {
    setSelectedIssue(issue)
    setRejectReason("")
    setShowRejectDialog(true)
  }

  const handleReject = async () => {
    if (!selectedIssue || !rejectReason.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide a reason for rejection",
      })
      return
    }

    try {
      const success = await rejectIssue(selectedIssue.id, {
        rejectionReason: rejectReason.trim(),
      })

      if (success) {
        toast({
          title: "Issue Rejected",
          description: "The issue has been rejected and user has been notified.",
        })
        setShowRejectDialog(false)
        setSelectedIssue(null)
        setRejectReason("")
        fetchPendingIssues()
      }
    } catch (error) {
      const { title, description } = parseApiError(error);

      toast({
        variant: "destructive",
        title: title,
        description: description,
      })
    }
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

  // Filter facilities with similar type AND same campus as the reported facility
  const getSimilarFacilities = () => {
    if (!selectedIssue || !facilities.length) return []

    // Try to find the original facility to get its type
    const originalFacility = facilities.find(f => f.id === selectedIssue.facilityId)
    if (!originalFacility) return []

    // Filter facilities with same type & same campus, excluding the original facility
    return facilities.filter(
      f =>
        f.typeId === originalFacility.typeId &&
        f.campusId === originalFacility.campusId &&
        f.id !== selectedIssue.facilityId &&
        f.status === "Available"
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

      {/* Issues Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading issue reports...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-2">No pending issue reports</p>
            <p className="text-sm text-muted-foreground">All issues have been resolved</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-semibold text-sm">Issue Info</th>
                  <th className="text-left p-4 font-semibold text-sm">Facility</th>
                  <th className="text-left p-4 font-semibold text-sm">Reported By</th>
                  <th className="text-left p-4 font-semibold text-sm">Description</th>
                  <th className="text-center p-4 font-semibold text-sm">Severity</th>
                  <th className="text-center p-4 font-semibold text-sm">Images</th>
                  <th className="text-left p-4 font-semibold text-sm">Reported At</th>
                  <th className="text-center p-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-base">{issue.issueTitle}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-xs">{issue.category}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Booking: {issue.bookingCode}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="font-medium text-sm">{issue.facilityName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">{issue.reportedByName || "N/A"}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {issue.reportedByEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-3 max-w-md">
                        {issue.issueDescription}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      {issue.imageUrls && issue.imageUrls.length > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{issue.imageUrls.length}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              // Open first image in new tab, or show all in a modal
                              if (issue.imageUrls && issue.imageUrls.length > 0) {
                                window.open(issue.imageUrls[0], '_blank')
                              }
                            }}
                            title="View images"
                          >
                            View
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{formatDate(issue.createdAt || new Date().toISOString())}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-3"
                          onClick={(e) => {
                            e.stopPropagation()
                            openChangeRoomDialog(issue)
                          }}
                          title="Change Room"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 px-3"
                          onClick={(e) => {
                            e.stopPropagation()
                            openRejectDialog(issue)
                          }}
                          title="Reject"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

      {/* Reject Issue Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Issue Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this issue report?
              <br />
              <strong>{selectedIssue?.issueTitle}</strong>
              <br />
              <span className="text-sm">Facility: {selectedIssue?.facilityName}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedIssue && (
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this issue..."
                  className="w-full px-3 py-2.5 border border-input rounded-lg bg-background min-h-24 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={500}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {rejectReason.length}/500 characters
                </p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingRoom}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isChangingRoom || !rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isChangingRoom ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Reject Issue"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

