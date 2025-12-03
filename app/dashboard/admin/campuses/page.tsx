"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCampuses, useCampusMutations } from "@/hooks/use-campus"
import type { Campus, CreateCampusRequest, UpdateCampusRequest } from "@/types"

export default function AdminCampusesPage() {
  const { campuses, fetchCampuses, isLoading, error } = useCampuses()
  const { createCampus, updateCampus, deleteCampus, isLoading: isMutating } = useCampusMutations()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null)
  const [isInactiveConfirmOpen, setIsInactiveConfirmOpen] = useState(false)
  const [campusToInactivate, setCampusToInactivate] = useState<Campus | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailCampus, setDetailCampus] = useState<Campus | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<CreateCampusRequest | UpdateCampusRequest>({
    campusCode: "",
    campusName: "",
    address: "",
    workingHoursStart: "07:00:00",
    workingHoursEnd: "22:00:00",
    contactPhone: "",
    contactEmail: "",
  })

  const stats = {
    totalCampuses: campuses.length,
    activeCampuses: campuses.filter(c => c.isActive).length,
    inactiveCampuses: campuses.filter(c => !c.isActive).length,
  }

  const handleOpenCreateModal = () => {
    setSelectedCampus(null)
    setFormData({
      campusCode: "",
      campusName: "",
      address: "",
      workingHoursStart: "07:00:00",
      workingHoursEnd: "22:00:00",
      contactPhone: "",
      contactEmail: "",
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (campus: Campus) => {
    setSelectedCampus(campus)
    setFormData({
      campusName: campus.campusName,
      address: campus.address,
      workingHoursStart: campus.workingHoursStart,
      workingHoursEnd: campus.workingHoursEnd,
      contactPhone: campus.contactPhone || "",
      contactEmail: campus.contactEmail || "",
      isActive: campus.isActive,
    })
    setIsModalOpen(true)
  }

  const handleToggleActive = async (campus: Campus) => {
    // Nếu campus đang active và muốn inactive, hiện warning
    if (campus.isActive) {
      setCampusToInactivate(campus)
      setIsInactiveConfirmOpen(true)
    } else {
      // Nếu đang inactive, activate luôn không cần warning
      const updated = await updateCampus(campus.id, {
        campusName: campus.campusName,
        address: campus.address,
        workingHoursStart: campus.workingHoursStart,
        workingHoursEnd: campus.workingHoursEnd,
        contactPhone: campus.contactPhone || undefined,
        contactEmail: campus.contactEmail || undefined,
        isActive: true,
      })
      if (updated) {
        await fetchCampuses()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedCampus) {
      // Update existing campus
      const updated = await updateCampus(selectedCampus.id, formData as UpdateCampusRequest)
      if (updated) {
        await fetchCampuses()
        setIsModalOpen(false)
      }
    } else {
      // Create new campus
      const created = await createCampus(formData as CreateCampusRequest)
      if (created) {
        await fetchCampuses()
        setIsModalOpen(false)
      }
    }
  }

  const handleInactiveConfirm = async () => {
    if (campusToInactivate) {
      const updated = await updateCampus(campusToInactivate.id, {
        campusName: campusToInactivate.campusName,
        address: campusToInactivate.address,
        workingHoursStart: campusToInactivate.workingHoursStart,
        workingHoursEnd: campusToInactivate.workingHoursEnd,
        contactPhone: campusToInactivate.contactPhone || undefined,
        contactEmail: campusToInactivate.contactEmail || undefined,
        isActive: false,
      })
      if (updated) {
        await fetchCampuses()
        setIsInactiveConfirmOpen(false)
        setCampusToInactivate(null)
      }
    }
  }

  const handleViewDetail = (campus: Campus) => {
    setDetailCampus(campus)
    setIsDetailModalOpen(true)
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Campus Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage all campuses in the system</p>
        </div>
        <Button 
          onClick={handleOpenCreateModal}
          className="bg-gradient-to-r from-primary to-primary/90 shadow-lg w-full sm:w-auto"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Campus
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Total Campuses</p>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-blue-600">{stats.totalCampuses}</p>
          <p className="text-xs text-gray-500 mt-2">All registered campuses</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Active Campuses</p>
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-green-600">{stats.activeCampuses}</p>
          <p className="text-xs text-gray-500 mt-2">Currently operational</p>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-muted-foreground">Loading campuses...</p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="p-6 border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-1">Error loading campuses</h3>
              <p className="text-sm text-destructive/80">{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => fetchCampuses()}
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Campus List */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {campuses.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No campuses found</p>
            </Card>
          ) : (
            campuses.map((campus) => (
              <Card
                key={campus.id}
                className="group p-5 md:p-6 hover:shadow-2xl transition-all duration-300 border-0 ring-1 ring-gray-200 hover:ring-2 hover:ring-primary/50 cursor-pointer bg-white dark:bg-gray-900 hover:-translate-y-1"
                onClick={() => handleViewDetail(campus)}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white group-hover:text-primary transition-colors">{campus.campusName}</h3>
                          <p className="text-sm text-primary font-semibold">Code: {campus.campusCode}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap shadow-sm ${
                      campus.isActive 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
                        : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                    }`}>
                      {campus.isActive ? "● ACTIVE" : "● INACTIVE"}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{campus.address}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hours</p>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{campus.workingHoursStart.substring(0, 5)} - {campus.workingHoursEnd.substring(0, 5)}</p>
                      </div>
                    </div>
                    {campus.contactPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{campus.contactPhone}</p>
                        </div>
                      </div>
                    )}
                    {campus.contactEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{campus.contactEmail}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <Card className="w-full max-w-2xl p-4 md:p-6 max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold">
                {selectedCampus ? "Edit Campus" : "Create New Campus"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-muted-foreground hover:text-foreground text-xl md:text-2xl p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              {!selectedCampus && (
                <div>
                  <label className="block text-xs md:text-sm font-semibold mb-1 md:mb-2">
                    Campus Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={(formData as CreateCampusRequest).campusCode || ""}
                    onChange={(e) => setFormData({ ...formData, campusCode: e.target.value })}
                    placeholder="e.g., HCM, HN, DN"
                    required
                    className="h-10 md:h-11 border-2 text-sm md:text-base"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs md:text-sm font-semibold mb-1 md:mb-2">
                  Campus Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.campusName}
                  onChange={(e) => setFormData({ ...formData, campusName: e.target.value })}
                  placeholder="FPT University Ho Chi Minh"
                  required
                  className="h-10 md:h-11 border-2 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold mb-1 md:mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Lot E2a-7, D1 Street, High Tech Park, District 9"
                  required
                  className="h-10 md:h-11 border-2 text-sm md:text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold mb-1 md:mb-2">
                    Working Hours Start <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="time"
                    step="1"
                    value={formData.workingHoursStart?.substring(0, 8) || "07:00:00"}
                    onChange={(e) => {
                      const timeValue = e.target.value; // Format: "HH:mm:ss"
                      setFormData({ ...formData, workingHoursStart: timeValue })
                    }}
                    required
                    className="h-10 md:h-11 border-2 text-sm md:text-base"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: HH:mm:ss (24-hour)</p>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold mb-1 md:mb-2">
                    Working Hours End <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="time"
                    step="1"
                    value={formData.workingHoursEnd?.substring(0, 8) || "22:00:00"}
                    onChange={(e) => {
                      const timeValue = e.target.value; // Format: "HH:mm:ss"
                      setFormData({ ...formData, workingHoursEnd: timeValue })
                    }}
                    required
                    className="h-10 md:h-11 border-2 text-sm md:text-base"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: HH:mm:ss (24-hour)</p>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold mb-1 md:mb-2">Contact Phone</label>
                <Input
                  type="tel"
                  value={formData.contactPhone || ""}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+84 xxx xxx xxx"
                  className="h-10 md:h-11 border-2 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold mb-1 md:mb-2">Contact Email</label>
                <Input
                  type="email"
                  value={formData.contactEmail || ""}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contact@fpt.edu.vn"
                  className="h-10 md:h-11 border-2 text-sm md:text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 md:pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90 h-10 md:h-11 text-sm md:text-base"
                  disabled={isMutating}
                >
                  {isMutating ? "Saving..." : selectedCampus ? "Update Campus" : "Create Campus"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-10 md:h-11 text-sm md:text-base"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isMutating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && detailCampus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <Card className="w-full max-w-3xl p-4 md:p-6 max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Campus Details</h2>
              <button 
                onClick={() => setIsDetailModalOpen(false)} 
                className="text-muted-foreground hover:text-foreground text-xl md:text-2xl p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 md:space-y-6">
              {/* Header with Campus Name and Status */}
              <div className="pb-4 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="text-xl md:text-2xl font-bold">{detailCampus.campusName}</h3>
                  <span className={`inline-block px-3 py-1 text-xs md:text-sm font-semibold rounded-full w-fit ${
                    detailCampus.isActive 
                      ? "bg-green-100 text-green-700 border border-green-200" 
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}>
                    {detailCampus.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm md:text-base text-primary font-medium">Code: {detailCampus.campusCode}</p>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Address */}
                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs md:text-sm font-semibold text-muted-foreground mb-2 block">
                    Address
                  </label>
                  <div className="flex items-start gap-2 p-3 md:p-4 bg-muted/50 rounded-lg">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm md:text-base">{detailCampus.address}</p>
                  </div>
                </div>

                {/* Working Hours */}
                <div>
                  <label className="text-xs md:text-sm font-semibold text-muted-foreground mb-2 block">
                    Working Hours
                  </label>
                  <div className="flex items-center gap-2 p-3 md:p-4 bg-muted/50 rounded-lg">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm md:text-base">
                      <p className="font-medium">{detailCampus.workingHoursStart}</p>
                      <p className="text-muted-foreground text-xs">to</p>
                      <p className="font-medium">{detailCampus.workingHoursEnd}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="text-xs md:text-sm font-semibold text-muted-foreground mb-2 block">
                    Contact Phone
                  </label>
                  <div className="flex items-center gap-2 p-3 md:p-4 bg-muted/50 rounded-lg">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p className="text-sm md:text-base">{detailCampus.contactPhone || "N/A"}</p>
                  </div>
                </div>

                {/* Contact Email */}
                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs md:text-sm font-semibold text-muted-foreground mb-2 block">
                    Contact Email
                  </label>
                  <div className="flex items-center gap-2 p-3 md:p-4 bg-muted/50 rounded-lg">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm md:text-base break-all">{detailCampus.contactEmail || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsDetailModalOpen(false)
                    handleOpenEditModal(detailCampus)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10 md:h-11 text-sm md:text-base"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Campus
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsDetailModalOpen(false)
                    handleToggleActive(detailCampus)
                  }}
                  variant="outline"
                  className={`flex-1 h-10 md:h-11 text-sm md:text-base ${
                    detailCampus.isActive 
                      ? "text-orange-600 border-orange-200 hover:bg-orange-50" 
                      : "text-green-600 border-green-200 hover:bg-green-50"
                  }`}
                >
                  {detailCampus.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  onClick={() => setIsDetailModalOpen(false)}
                  variant="outline"
                  className="flex-1 h-10 md:h-11 text-sm md:text-base"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Inactive Warning Modal */}
      {isInactiveConfirmOpen && campusToInactivate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <Card className="w-full max-w-md p-4 md:p-6">
            <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-bold mb-1 md:mb-2">Deactivate Campus?</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Are you sure you want to deactivate <strong className="break-words">{campusToInactivate.campusName}</strong>?
                </p>
                <p className="text-xs md:text-sm text-orange-600 mt-2">
                  ⚠️ This campus will no longer be available for new bookings.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-6">
              <Button
                variant="outline"
                className="flex-1 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 text-sm md:text-base h-10 md:h-11"
                onClick={handleInactiveConfirm}
                disabled={isMutating}
              >
                {isMutating ? "Deactivating..." : "Deactivate"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-sm md:text-base h-10 md:h-11"
                onClick={() => {
                  setIsInactiveConfirmOpen(false)
                  setCampusToInactivate(null)
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
