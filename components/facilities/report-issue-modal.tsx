"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useFacilityIssueMutations } from "@/hooks/use-facility-issue"
import { AlertCircle, Upload, X, Loader2 } from "lucide-react"
import type { BookingListDto } from "@/types"

interface ReportIssueModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingListDto
  onReported?: () => void
}

const SEVERITY_OPTIONS = [
  { value: "Low", label: "Low - Minor issue" },
  { value: "Medium", label: "Medium - Moderate issue" },
  { value: "High", label: "High - Significant issue" },
  { value: "Critical", label: "Critical - Urgent issue" },
] as const

const CATEGORY_OPTIONS = [
  "Equipment Failure",
  "Infrastructure",
  "Safety",
  "Cleanliness",
  "Other",
] as const

export function ReportIssueModal({ isOpen, onClose, booking, onReported }: ReportIssueModalProps) {
  const { toast } = useToast()
  const { reportIssue, isLoading } = useFacilityIssueMutations()
  
  const [issueTitle, setIssueTitle] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High" | "Critical">("Medium")
  const [category, setCategory] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
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

      setImages(prev => [...prev, ...validFiles])
      
      // Create previews
      validFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    // Validation
    if (!issueTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Issue title is required"
      })
      return
    }

    if (!issueDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Issue description is required"
      })
      return
    }

    if (!category) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Category is required"
      })
      return
    }

    if (issueTitle.length > 200) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Issue title cannot exceed 200 characters"
      })
      return
    }

    if (issueDescription.length > 1000) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Issue description cannot exceed 1000 characters"
      })
      return
    }

    const result = await reportIssue({
      bookingId: booking.id,
      issueTitle: issueTitle.trim(),
      issueDescription: issueDescription.trim(),
      severity,
      category,
      images: images.length > 0 ? images : undefined,
    })

    if (result) {
      toast({
        title: "Issue Reported",
        description: "Your facility issue has been reported to admin. They will review and take action.",
      })
      
      // Reset form
      setIssueTitle("")
      setIssueDescription("")
      setSeverity("Medium")
      setCategory("")
      setImages([])
      setImagePreviews([])
      
      onClose()
      if (onReported) {
        onReported()
      }
    } else {
      toast({
        variant: "destructive",
        title: "Failed to Report Issue",
        description: "Please try again later",
      })
    }
  }

  if (!isOpen) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Report Facility Issue</AlertDialogTitle>
          <AlertDialogDescription>
            Report an issue with the facility: <strong>{booking.facilityName}</strong>
            <br />
            Booking: {booking.bookingCode}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Issue Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              placeholder="e.g., TV screen is broken"
              maxLength={200}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {issueTitle.length}/200 characters
            </p>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Issue Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="w-full px-3 py-2.5 border border-input rounded-lg bg-background min-h-28 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {issueDescription.length}/1000 characters
            </p>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Severity <span className="text-red-500">*</span>
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as typeof severity)}
              className="w-full h-11 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select category</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Images (Optional)
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
              Max 5MB per file. Formats: JPEG, JPG, PNG, GIF
            </p>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

