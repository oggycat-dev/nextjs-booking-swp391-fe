"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useProfile } from "@/hooks/use-profile"
import { useAuth } from "@/hooks/use-auth"
import { useMyCampusChangeRequests, useCampusChangeRequestMutations } from "@/hooks/use-campus-change-requests"
import { useCampuses } from "@/hooks/use-campus"
import { useToast } from "@/hooks/use-toast"
import type { UpdateProfileRequest } from "@/types"

export default function ProfilePage() {
  const { toast } = useToast()
  const { profile, updateProfile, isLoading, error: profileError } = useProfile()
  const { changePassword, isLoading: isChangingPassword, getCurrentUser } = useAuth()
  const { myRequests, fetchMyRequests, isLoading: isLoadingRequests } = useMyCampusChangeRequests()
  const { requestCampusChange, isLoading: isSubmittingRequest } = useCampusChangeRequestMutations()
  const { campuses, fetchCampuses } = useCampuses()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    fullName: "",
    phoneNumber: "",
    department: "",
    major: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [campusChangeData, setCampusChangeData] = useState({
    requestedCampusId: "",
    reason: "",
  })
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Fetch campus change requests and campuses on mount
  useEffect(() => {
    fetchMyRequests()
    fetchCampuses()
  }, [fetchMyRequests, fetchCampuses])

  // Initialize form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        department: profile.department || "",
        major: profile.major || "",
      })
    }
  }, [profile])

  const handleSave = async () => {
    setUpdateError(null)
    setUpdateSuccess(false)
    
    if (!formData.fullName.trim()) {
      setUpdateError("Full name is required")
      return
    }

    const success = await updateProfile({
      fullName: formData.fullName.trim(),
      phoneNumber: formData.phoneNumber?.trim() || null,
      department: formData.department?.trim() || null,
      major: formData.major?.trim() || null,
    })

    if (success) {
      setUpdateSuccess(true)
      setIsEditing(false)
      setTimeout(() => setUpdateSuccess(false), 3000)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All fields are required")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirm password do not match")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    const success = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    })

    if (success) {
      setPasswordSuccess(true)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } else {
      setPasswordError("Failed to change password. Please check your current password.")
    }
  }

  const handleCampusChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!campusChangeData.requestedCampusId || !campusChangeData.reason.trim()) {
      toast({
        title: "Error",
        description: "Please select a campus and provide a reason",
        variant: "destructive",
      })
      return
    }

    if (profile?.campusId === campusChangeData.requestedCampusId) {
      toast({
        title: "Error",
        description: "You are already in this campus",
        variant: "destructive",
      })
      return
    }

    const success = await requestCampusChange({
      requestedCampusId: campusChangeData.requestedCampusId,
      reason: campusChangeData.reason.trim(),
    })

    if (success) {
      toast({
        title: "Success",
        description: "Campus change request submitted successfully",
      })
      setCampusChangeData({
        requestedCampusId: "",
        reason: "",
      })
      fetchMyRequests()
    } else {
      toast({
        title: "Error",
        description: "Failed to submit campus change request",
        variant: "destructive",
      })
    }
  }

  const getDisplayValue = (value: string | null | undefined): string => {
    return value || "N/A"
  }

  // Get campus name with fallback to UserInfo from localStorage
  const getCampusName = (): string => {
    if (profile?.campusName) {
      return profile.campusName
    }
    // Fallback to UserInfo from localStorage (set during login)
    const userInfo = getCurrentUser()
    if (userInfo?.campusName) {
      return userInfo.campusName
    }
    return "N/A"
  }

  if (isLoading && !profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
        <Card className="p-12 text-center">
          <p className="text-destructive">
            {profileError || "Failed to load profile. Please try again later."}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
          <TabsTrigger value="campus-change">Campus Change</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Personal Information</h2>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Edit
                </Button>
              )}
            </div>

            {updateError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md">
                <p className="text-sm text-destructive">{updateError}</p>
              </div>
            )}

            {updateSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-500 rounded-md">
                <p className="text-sm text-green-700">Profile updated successfully!</p>
              </div>
            )}

            {!isEditing ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="font-bold">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {profile.role === "Student" ? "Student ID" : "User Code"}
                  </p>
                  <p className="font-bold">{profile.userCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-bold">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-bold">{getDisplayValue(profile.phoneNumber)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <p className="font-bold capitalize">{profile.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Campus</p>
                  <p className="font-bold">{getCampusName()}</p>
                </div>
                {profile.department && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Department</p>
                    <p className="font-bold">{profile.department}</p>
                  </div>
                )}
                {profile.major && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Major</p>
                    <p className="font-bold">{profile.major}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Status</p>
                  <div className="flex items-center gap-2">
                    {profile.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Approval Status</p>
                  <div className="flex items-center gap-2">
                    {profile.isApproved ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        Pending Approval
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                  <p className="font-bold">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      value={formData.phoneNumber || ""}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {profile.role === "Lecturer" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Department</label>
                      <Input
                        value={formData.department || ""}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Enter department"
                      />
                    </div>
                  )}
                  {profile.role === "Student" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Major</label>
                      <Input
                        value={formData.major || ""}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                        placeholder="Enter major"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        fullName: profile.fullName || "",
                        phoneNumber: profile.phoneNumber || "",
                        department: profile.department || "",
                        major: profile.major || "",
                      })
                      setIsEditing(false)
                      setUpdateError(null)
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Change Password</h2>
            
            {passwordError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md">
                <p className="text-sm text-destructive">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-500 rounded-md">
                <p className="text-sm text-green-700">Password changed successfully!</p>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password (min 8 characters)"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="campus-change" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request New Campus Change */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Request Campus Change</h2>
              <form onSubmit={handleCampusChangeRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Campus</label>
                  <Input
                    value={getCampusName()}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Requested Campus *</label>
                  <select
                    value={campusChangeData.requestedCampusId}
                    onChange={(e) => setCampusChangeData({ ...campusChangeData, requestedCampusId: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select campus</option>
                    {campuses
                      .filter(c => c.id !== profile?.campusId)
                      .map((campus) => (
                        <option key={campus.id} value={campus.id}>
                          {campus.campusName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Reason *</label>
                  <Textarea
                    value={campusChangeData.reason}
                    onChange={(e) => setCampusChangeData({ ...campusChangeData, reason: e.target.value })}
                    placeholder="Explain why you want to change campus..."
                    rows={4}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmittingRequest ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </Card>

            {/* My Campus Change Requests History */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">My Requests History</h2>
              {isLoadingRequests ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading requests...</p>
                </div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No campus change requests yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {myRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            {request.currentCampusName || "No campus"} → {request.requestedCampusName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(request.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "Approved" ? "default" :
                            request.status === "Rejected" ? "destructive" : "secondary"
                          }
                          className={
                            request.status === "Approved" ? "bg-green-600" :
                            request.status === "Pending" ? "bg-orange-500" : ""
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <div className="border-t pt-2">
                        <p className="text-sm font-medium mb-1">Reason:</p>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                      </div>
                      {request.reviewComment && (
                        <div className="border-t pt-2">
                          <p className="text-sm font-medium mb-1">Admin Comment:</p>
                          <p className="text-sm text-muted-foreground">{request.reviewComment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
