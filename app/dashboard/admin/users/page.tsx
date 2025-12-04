"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useUsers, useUserMutations } from "@/hooks/use-users"
import { usePendingRegistrations } from "@/hooks/use-auth"
import { useCampusChangeRequests, useCampusChangeRequestMutations } from "@/hooks/use-campus-change-requests"
import type { User, UserRole, PendingRegistration, CampusChangeRequest } from "@/types"

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<boolean | "">("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [activeTab, setActiveTab] = useState<"users" | "pending" | "campus-change">("users")
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedPending, setSelectedPending] = useState<PendingRegistration | null>(null)
  const [selectedCampusChange, setSelectedCampusChange] = useState<CampusChangeRequest | null>(null)
  const [campusChangeComment, setCampusChangeComment] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Create user modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createEmail, setCreateEmail] = useState("")
  const [createFirstName, setCreateFirstName] = useState("")
  const [createLastName, setCreateLastName] = useState("")
  const [createPhoneNumber, setCreatePhoneNumber] = useState("")
  const [createRole, setCreateRole] = useState("Student")
  const [createPassword, setCreatePassword] = useState("")
  const [createConfirmPassword, setCreateConfirmPassword] = useState("")
  
  // Edit form states
  const [editFirstName, setEditFirstName] = useState("")
  const [editLastName, setEditLastName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState<number>(0)
  const [editIsActive, setEditIsActive] = useState(true)
  
  const pageSize = 10
  const { toast } = useToast()

  const { users, fetchUsers, isLoading, error } = useUsers()
  const { createUser, updateUser, deleteUser, resetPassword, isLoading: isMutating, error: updateError } = useUserMutations()
  const { registrations, fetchPendingRegistrations, approveRegistration, isLoading: isPendingLoading } = usePendingRegistrations()
  const { requests: campusChangeRequests, fetchPending: fetchCampusChangeRequests, isLoading: isCampusChangeLoading } = useCampusChangeRequests()
  const { approveRequest: approveCampusChangeRequest, isLoading: isApprovingCampusChange } = useCampusChangeRequestMutations()

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers({
        pageNumber,
        pageSize,
        searchTerm: searchTerm || undefined,
        role: filterRole || undefined,
        isActive: filterStatus === "" ? undefined : filterStatus === true,
      })
    } else if (activeTab === "pending") {
      fetchPendingRegistrations()
    } else if (activeTab === "campus-change") {
      fetchCampusChangeRequests()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, searchTerm, filterRole, filterStatus, activeTab])

  const handleSearch = () => {
    setPageNumber(1) // Reset to first page when searching
    fetchUsers({
      pageNumber: 1,
      pageSize,
      searchTerm: searchTerm || undefined,
      role: filterRole || undefined,
      isActive: filterStatus === "" ? undefined : filterStatus === true,
    })
  }

  const handleToggleActive = async (user: User) => {
    const [firstName, ...lastNameParts] = user.fullName.split(' ')
    const lastName = lastNameParts.join(' ') || firstName
    const roleMap: Record<UserRole, number> = { Student: 0, Lecturer: 1, Admin: 2 }
    
    const updated = await updateUser(user.id, {
      firstName: firstName,
      lastName: lastName,
      email: user.email,
      role: roleMap[user.role],
      isActive: !user.isActive,
    })

    if (updated) {
      // Refresh the list
      fetchUsers({
        pageNumber,
        pageSize,
        searchTerm: searchTerm || undefined,
        role: filterRole || undefined,
        isActive: filterStatus === "" ? undefined : filterStatus === true,
      })
      if (selectedUser?.id === user.id) {
        setSelectedUser(updated)
      }
    }
  }

  const handleEditUser = () => {
    if (!selectedUser) return
    
    // Load current data into form
    const [firstName, ...lastNameParts] = selectedUser.fullName.split(' ')
    setEditFirstName(firstName)
    setEditLastName(lastNameParts.join(' ') || firstName)
    setEditEmail(selectedUser.email)
    const roleMap: Record<UserRole, number> = { Student: 0, Lecturer: 1, Admin: 2 }
    setEditRole(roleMap[selectedUser.role])
    setEditIsActive(selectedUser.isActive)
    setIsEditMode(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    const updated = await updateUser(selectedUser.id, {
      firstName: editFirstName,
      lastName: editLastName,
      email: editEmail,
      role: editRole,
      isActive: editIsActive,
    })

    if (updated) {
      toast({
        title: "Success",
        description: "User updated successfully",
      })
      // Refresh the list
      fetchUsers({
        pageNumber,
        pageSize,
        searchTerm: searchTerm || undefined,
        role: filterRole || undefined,
        isActive: filterStatus === "" ? undefined : filterStatus === true,
      })
      setSelectedUser(updated)
      setIsEditMode(false)
    } else {
      toast({
        title: "Error",
        description: updateError || "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    // Reset form to current user data
    if (selectedUser) {
      const [firstName, ...lastNameParts] = selectedUser.fullName.split(' ')
      setEditFirstName(firstName)
      setEditLastName(lastNameParts.join(' ') || firstName)
      setEditEmail(selectedUser.email)
      const roleMap: Record<UserRole, number> = { Student: 0, Lecturer: 1, Admin: 2 }
      setEditRole(roleMap[selectedUser.role])
      setEditIsActive(selectedUser.isActive)
    }
  }

  const displayUsers = users?.items || []

  const stats = {
    totalUsers: users?.totalCount || 0,
    students: displayUsers.filter((u) => u.role === "Student").length,
    lecturers: displayUsers.filter((u) => u.role === "Lecturer").length,
    blocked: displayUsers.filter((u) => !u.isActive).length,
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive"
  }

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword || !confirmPassword) return
    
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters!")
      return
    }

    const success = await resetPassword(selectedUser.id, newPassword)
    if (success) {
      setShowResetPassword(false)
      setNewPassword("")
      setConfirmPassword("")
      alert("Password reset successfully!")
    }
  }

  const handleCreateUser = async () => {
    if (!createEmail || !createFirstName || !createLastName || !createPassword || !createConfirmPassword) {
      alert("Please fill in all required fields!")
      return
    }

    if (createPassword !== createConfirmPassword) {
      alert("Passwords do not match!")
      return
    }

    if (createPassword.length < 6) {
      alert("Password must be at least 6 characters!")
      return
    }

    const newUser = await createUser({
      email: createEmail,
      firstName: createFirstName,
      lastName: createLastName,
      phoneNumber: createPhoneNumber || undefined,
      role: createRole,
      password: createPassword,
    })

    if (newUser) {
      setShowCreateModal(false)
      setCreateEmail("")
      setCreateFirstName("")
      setCreateLastName("")
      setCreatePhoneNumber("")
      setCreateRole("Student")
      setCreatePassword("")
      setCreateConfirmPassword("")
      alert("User created successfully!")
      // Refresh user list
      fetchUsers({
        pageNumber,
        pageSize,
        searchTerm: searchTerm || undefined,
        role: filterRole || undefined,
        isActive: filterStatus === "" ? undefined : filterStatus === true,
      })
    }
  }

  const handleApproveRegistration = async (registration: PendingRegistration, approved: boolean) => {
    const result = await approveRegistration({
      userId: registration.id,
      isApproved: approved,
      rejectionReason: approved ? undefined : rejectionReason || undefined,
    })
    
    if (result) {
      setSelectedPending(null)
      setRejectionReason("")
      if (activeTab === "pending") {
        await fetchPendingRegistrations()
      }
    }
  }

  const handleApproveCampusChange = async (request: CampusChangeRequest, approved: boolean) => {
    const result = await approveCampusChangeRequest(request.id, {
      approved,
      comment: campusChangeComment || undefined,
    })
    
    if (result) {
      setSelectedCampusChange(null)
      setCampusChangeComment("")
      if (activeTab === "campus-change") {
        await fetchCampusChangeRequests()
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">View and manage system users and permissions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === "users"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          All Users
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 relative ${
            activeTab === "pending"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending Registrations
          {registrations.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {registrations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("campus-change")}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 relative ${
            activeTab === "campus-change"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Campus Change Requests
          {campusChangeRequests.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
              {campusChangeRequests.length}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-rose-600">{stats.totalUsers}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Students</p>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-blue-600">{stats.students}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Lecturers</p>
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-purple-600">{stats.lecturers}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Inactive Users</p>
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-red-600">{stats.blocked}</p>
        </Card>
      </div>

      {activeTab === "users" && (
        <Card className="p-6 bg-white dark:bg-gray-900 shadow-lg border-0 ring-1 ring-gray-200 dark:ring-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters & Search</h3>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-primary via-orange-500 to-orange-600 hover:from-orange-600 hover:to-primary shadow-lg hover:shadow-xl transition-all rounded-xl font-semibold h-11"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create User
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Search</label>
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
              className="h-11 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Role</label>
            <Select value={filterRole || "all"} onValueChange={(value) => setFilterRole(value === "all" ? "" : value)}>
              <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-primary rounded-xl">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Lecturer">Lecturer</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
            <Select
              value={filterStatus === "" ? "all" : filterStatus === true ? "active" : "inactive"}
              onValueChange={(value) => {
                if (value === "all") setFilterStatus("")
                else setFilterStatus(value === "active")
              }}
            >
              <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-primary rounded-xl">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleSearch} className="flex-1 h-11 bg-gradient-to-r from-primary via-orange-500 to-orange-600 hover:from-orange-600 hover:to-primary shadow-lg hover:shadow-xl transition-all rounded-xl font-semibold">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-11 border-2 border-gray-300 hover:bg-gray-100 rounded-xl font-semibold"
              onClick={() => {
                setSearchTerm("")
                setFilterRole("")
                setFilterStatus("")
                setPageNumber(1)
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>
      )}

      {activeTab === "users" && isLoading && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </Card>
      )}

      {activeTab === "users" && error && !isLoading && (
        <Card className="p-6 border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-1">Error loading users</h3>
              <p className="text-sm text-destructive/80">{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => {
                  fetchUsers({
                    pageNumber,
                    pageSize,
                    searchTerm: searchTerm || undefined,
                    role: filterRole || undefined,
                    isActive: filterStatus === "" ? undefined : filterStatus === true,
                  })
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "pending" && (
        <>
          {isPendingLoading && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Loading pending registrations...</p>
            </Card>
          )}
          {!isPendingLoading && registrations.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No pending registrations</p>
            </Card>
          )}
          {!isPendingLoading && registrations.length > 0 && (
            <div className="space-y-3">
              {registrations.map((registration) => (
                <Card
                  key={registration.id}
                  className="p-5 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl flex items-center justify-center">
                          <span className="text-lg font-bold text-yellow-600">
                            {registration.fullName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{registration.fullName}</h3>
                          <p className="text-sm text-muted-foreground">{registration.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                            {registration.role}
                          </span>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                            {registration.campusName}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm pl-16">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {registration.phoneNumber}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(registration.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {registration.userCode}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPending(registration)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "campus-change" && (
        <>
          {isCampusChangeLoading && (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-muted-foreground">Loading campus change requests...</p>
              </div>
            </Card>
          )}
          {!isCampusChangeLoading && campusChangeRequests.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No pending campus change requests</p>
            </Card>
          )}
          {!isCampusChangeLoading && campusChangeRequests.length > 0 && (
            <div className="space-y-3">
              {campusChangeRequests.map((request: CampusChangeRequest) => (
                <Card
                  key={request.id}
                  className="p-5 hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-500/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center">
                          <span className="text-lg font-bold text-orange-600">
                            {request.userName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{request.userName}</h3>
                          <p className="text-sm text-muted-foreground">{request.userEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                            Pending
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm pl-16">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Current Campus</p>
                          <p className="font-semibold">{request.currentCampusName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Requested Campus</p>
                          <p className="font-semibold text-orange-600">{request.requestedCampusName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Request Date</p>
                          <p className="font-semibold">{new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-3 pl-16">
                        <p className="text-xs text-muted-foreground mb-1">Reason</p>
                        <p className="text-sm bg-muted p-2 rounded">{request.reason}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCampusChange(request)}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "users" && !isLoading && !error && (
        <>
          {/* Results Summary */}
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{displayUsers.length}</span> of{" "}
              <span className="font-semibold text-foreground">{users?.totalCount || 0}</span> users
              {users && users.totalPages > 1 && (
                <span> (Page {users.pageNumber} of {users.totalPages})</span>
              )}
            </p>
            {users && users.totalPages > 1 && (
              <p className="text-xs text-muted-foreground">
                {users.hasPreviousPage && "← Previous"} {users.hasPreviousPage && users.hasNextPage && "•"} {users.hasNextPage && "Next →"}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {displayUsers.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No users found</p>
              </Card>
            ) : (
              displayUsers.map((user) => (
                <Card
                  key={user.id}
                  className="p-5 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 group"
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                          <span className="text-lg font-bold text-primary">
                            {user.fullName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                            {user.fullName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                            {user.role}
                          </span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)} border`}>
                            {getStatusText(user.isActive)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm pl-16">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {user.userCode}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        {user.lastLoginAt && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(user.lastLoginAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {users && users.totalPages > 1 && (
            <Card className="p-6 bg-white dark:bg-gray-900 shadow-lg border-0 ring-1 ring-gray-200 dark:ring-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setPageNumber(1)}
                    disabled={!users.hasPreviousPage}
                    className="h-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPageNumber(pageNumber - 1)}
                    disabled={!users.hasPreviousPage}
                    className="h-10"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Page</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, users.totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (users.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (users.pageNumber <= 3) {
                        pageNum = i + 1;
                      } else if (users.pageNumber >= users.totalPages - 2) {
                        pageNum = users.totalPages - 4 + i;
                      } else {
                        pageNum = users.pageNumber - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === users.pageNumber ? "default" : "outline"}
                          onClick={() => setPageNumber(pageNum)}
                          className={`h-10 w-10 p-0 ${
                            pageNum === users.pageNumber
                              ? "bg-gradient-to-r from-primary via-orange-500 to-orange-600 hover:from-orange-600 hover:to-primary"
                              : ""
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <span className="text-sm text-muted-foreground">of {users.totalPages}</span>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setPageNumber(pageNumber + 1)}
                    disabled={!users.hasNextPage}
                    className="h-10"
                  >
                    Next
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPageNumber(users.totalPages)}
                    disabled={!users.hasNextPage}
                    className="h-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {selectedUser.fullName}
              </h2>
              <button 
                onClick={() => {
                  setSelectedUser(null)
                  setIsEditMode(false)
                  setShowResetPassword(false)
                  setNewPassword("")
                  setConfirmPassword("")
                }} 
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {!isEditMode ? (
              // View Mode
              <>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="font-bold">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">User Code</p>
                      <p className="font-bold">{selectedUser.userCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                      <p className="font-bold">{selectedUser.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                      <p className="font-bold">{selectedUser.phoneNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Role</p>
                      <p className="font-bold">{selectedUser.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Campus</p>
                      <p className="font-bold">{selectedUser.campusName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Department</p>
                      <p className="font-bold">{selectedUser.department || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Major</p>
                      <p className="font-bold">{selectedUser.major || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.isActive)}`}
                      >
                        {getStatusText(selectedUser.isActive)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Created At</p>
                      <p className="font-bold">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {!showResetPassword ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                      onClick={handleEditUser}
                    >
                      Edit User
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                      onClick={() => setShowResetPassword(true)}
                    >
                      Reset Password
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => handleToggleActive(selectedUser)}
                      disabled={isMutating}
                    >
                      {selectedUser.isActive ? "Deactivate User" : "Activate User"}
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => {
                      setSelectedUser(null)
                      setShowResetPassword(false)
                      setNewPassword("")
                      setConfirmPassword("")
                    }}>
                      Close
                    </Button>
                  </div>
                ) : (
                  // Reset Password Form
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h3 className="font-semibold text-yellow-800 mb-3">Reset Password for {selectedUser.fullName}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            New Password <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min 6 characters)"
                            className="border-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Confirm Password <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="border-2"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={handleResetPassword}
                        disabled={isMutating || !newPassword || !confirmPassword}
                      >
                        {isMutating ? "Resetting..." : "Confirm Reset"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setShowResetPassword(false)
                          setNewPassword("")
                          setConfirmPassword("")
                        }}
                        disabled={isMutating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Edit Mode
              <>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">User Code (Read-only)</label>
                      <Input value={selectedUser.userCode} disabled className="bg-muted" />
                    </div>
                    <div className="col-span-2"></div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        First Name <span className="text-destructive">*</span>
                      </label>
                      <Input 
                        value={editFirstName} 
                        onChange={(e) => setEditFirstName(e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Last Name <span className="text-destructive">*</span>
                      </label>
                      <Input 
                        value={editLastName} 
                        onChange={(e) => setEditLastName(e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <Input 
                        type="email"
                        value={editEmail} 
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Role <span className="text-destructive">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                        value={editRole}
                        onChange={(e) => setEditRole(Number(e.target.value))}
                      >
                        <option value={0}>Student</option>
                        <option value={1}>Lecturer</option>
                        <option value={2}>Admin</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <input
                          id="edit-user-active"
                          type="checkbox"
                          className="w-4 h-4 accent-primary"
                          checked={editIsActive}
                          onChange={(e) => setEditIsActive(e.target.checked)}
                        />
                        <label htmlFor="edit-user-active" className="text-sm font-medium">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleSaveUser}
                    disabled={isMutating || !editFirstName.trim() || !editLastName.trim() || !editEmail.trim()}
                  >
                    {isMutating ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-transparent" 
                    onClick={handleCancelEdit}
                    disabled={isMutating}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {/* Pending Registration Modal */}
      {selectedPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Review Registration</h2>
              <button onClick={() => {
                setSelectedPending(null)
                setRejectionReason("")
              }} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="font-bold">{selectedPending.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-bold">{selectedPending.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                  <p className="font-bold">{selectedPending.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Campus</p>
                  <p className="font-bold">{selectedPending.campusName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <p className="font-bold">{selectedPending.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">User Code</p>
                  <p className="font-bold">{selectedPending.userCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created At</p>
                  <p className="font-bold">{new Date(selectedPending.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2">Rejection Reason (if rejecting)</label>
                <Input
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="h-11 border-2"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                onClick={() => handleApproveRegistration(selectedPending, true)}
                disabled={isPendingLoading}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                onClick={() => handleApproveRegistration(selectedPending, false)}
                disabled={isPendingLoading}
              >
                Reject
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => {
                setSelectedPending(null)
                setRejectionReason("")
              }}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Campus Change Request Modal */}
      {selectedCampusChange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Review Campus Change Request</h2>
              <button onClick={() => {
                setSelectedCampusChange(null)
                setCampusChangeComment("")
              }} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">User Name</p>
                  <p className="font-bold">{selectedCampusChange.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">User Email</p>
                  <p className="font-bold">{selectedCampusChange.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Campus</p>
                  <p className="font-bold">{selectedCampusChange.currentCampusName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Requested Campus</p>
                  <p className="font-bold text-orange-600">{selectedCampusChange.requestedCampusName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Request Date</p>
                  <p className="font-bold">{new Date(selectedCampusChange.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                    {selectedCampusChange.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reason for Change</p>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">{selectedCampusChange.reason}</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2">Admin Comment (optional)</label>
                <textarea
                  placeholder="Enter your comment or rejection reason..."
                  value={campusChangeComment}
                  onChange={(e) => setCampusChangeComment(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-input rounded-lg bg-background min-h-20"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                onClick={() => handleApproveCampusChange(selectedCampusChange, true)}
                disabled={isApprovingCampusChange}
              >
                {isApprovingCampusChange ? "Processing..." : "Approve"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                onClick={() => handleApproveCampusChange(selectedCampusChange, false)}
                disabled={isApprovingCampusChange}
              >
                {isApprovingCampusChange ? "Processing..." : "Reject"}
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => {
                setSelectedCampusChange(null)
                setCampusChangeComment("")
              }}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Create New User</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateEmail("")
                  setCreateFirstName("")
                  setCreateLastName("")
                  setCreatePhoneNumber("")
                  setCreateRole("Student")
                  setCreatePassword("")
                  setCreateConfirmPassword("")
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    value={createPhoneNumber}
                    onChange={(e) => setCreatePhoneNumber(e.target.value)}
                    placeholder="+84 123 456 789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={createFirstName}
                    onChange={(e) => setCreateFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={createLastName}
                    onChange={(e) => setCreateLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Role <span className="text-destructive">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value)}
                  >
                    <option value="Student">Student</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div></div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm Password <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="password"
                    value={createConfirmPassword}
                    onChange={(e) => setCreateConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleCreateUser}
                disabled={
                  isMutating ||
                  !createEmail ||
                  !createFirstName ||
                  !createLastName ||
                  !createPassword ||
                  !createConfirmPassword
                }
              >
                {isMutating ? "Creating..." : "Create User"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateEmail("")
                  setCreateFirstName("")
                  setCreateLastName("")
                  setCreatePhoneNumber("")
                  setCreateRole("Student")
                  setCreatePassword("")
                  setCreateConfirmPassword("")
                }}
                disabled={isMutating}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

