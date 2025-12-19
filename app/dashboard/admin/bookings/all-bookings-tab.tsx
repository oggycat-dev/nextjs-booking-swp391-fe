"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { bookingApi } from "@/lib/api/booking"
import { useCampuses } from "@/hooks/use-campus"
import { useFacilities } from "@/hooks/use-facility"
import type { BookingListDto, PaginatedResult } from "@/types"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

const BOOKING_STATUSES = [
    "All",
    "WaitingLecturerApproval",
    "WaitingAdminApproval",
    "Approved",
    "Rejected",
    "Cancelled",
    "Completed",
    "InUse",
    "NoShow",
]

export function AllBookingsTab() {
    const [bookings, setBookings] = useState<BookingListDto[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Pagination state
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [totalCount, setTotalCount] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // Filter state
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCampusId, setSelectedCampusId] = useState("")
    const [selectedFacilityId, setSelectedFacilityId] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("All")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    // Fetch data for dropdowns
    const { campuses } = useCampuses()
    const { facilities } = useFacilities(selectedCampusId ? { campusId: selectedCampusId } : undefined)

    // Fetch bookings
    const fetchBookings = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await bookingApi.getAllBookingsForAdmin({
                pageNumber,
                pageSize,
                facilityId: selectedFacilityId || undefined,
                campusId: selectedCampusId || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                status: selectedStatus !== "All" ? selectedStatus : undefined,
                searchTerm: searchTerm || undefined,
            })

            if (response.success && response.data) {
                setBookings(response.data.items || [])
                setTotalCount(response.data.totalCount || 0)
                setTotalPages(response.data.totalPages || 0)
            } else {
                setError(response.message || "Failed to fetch bookings")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch on mount and when filters/pagination change
    useEffect(() => {
        fetchBookings()
    }, [pageNumber, pageSize, selectedCampusId, selectedFacilityId, selectedStatus, fromDate, toDate])

    // Reset to page 1 when search term changes (with debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (pageNumber === 1) {
                fetchBookings()
            } else {
                setPageNumber(1)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm])

    const handleClearFilters = () => {
        setSearchTerm("")
        setSelectedCampusId("")
        setSelectedFacilityId("")
        setSelectedStatus("All")
        setFromDate("")
        setToDate("")
        setPageNumber(1)
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            WaitingLecturerApproval: "bg-yellow-100 text-yellow-700 border-yellow-300",
            WaitingAdminApproval: "bg-blue-100 text-blue-700 border-blue-300",
            Approved: "bg-green-100 text-green-700 border-green-300",
            Rejected: "bg-red-100 text-red-700 border-red-300",
            Cancelled: "bg-gray-100 text-gray-700 border-gray-300",
            Completed: "bg-purple-100 text-purple-700 border-purple-300",
            InUse: "bg-indigo-100 text-indigo-700 border-indigo-300",
            NoShow: "bg-orange-100 text-orange-700 border-orange-300",
        }
        return colors[status] || "bg-gray-100 text-gray-700 border-gray-300"
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN")
    }

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5)
    }

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Filter Bookings</h3>
                    <Button variant="outline" size="sm" onClick={handleClearFilters}>
                        Clear All Filters
                    </Button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2">
                    {/* Search */}
                    <div className="space-y-2 min-w-[200px]">
                        <label className="text-sm font-medium">Search</label>
                        <Input
                            placeholder="Code, user, facility..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Campus */}
                    <div className="space-y-2 min-w-[180px]">
                        <label className="text-sm font-medium">Campus</label>
                        <select
                            value={selectedCampusId}
                            onChange={(e) => {
                                setSelectedCampusId(e.target.value)
                                setSelectedFacilityId("") // Reset facility when campus changes
                            }}
                            className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm"
                        >
                            <option value="">All Campuses</option>
                            {campuses?.map((campus: any) => (
                                <option key={campus.id} value={campus.id}>
                                    {campus.campusName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Facility */}
                    <div className="space-y-2 min-w-[180px]">
                        <label className="text-sm font-medium">Facility</label>
                        <select
                            value={selectedFacilityId}
                            onChange={(e) => setSelectedFacilityId(e.target.value)}
                            className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm"
                            disabled={!selectedCampusId}
                        >
                            <option value="">All Facilities</option>
                            {facilities?.map((facility: any) => (
                                <option key={facility.id} value={facility.id}>
                                    {facility.facilityName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2 min-w-[180px]">
                        <label className="text-sm font-medium">Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm"
                        >
                            {BOOKING_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* From Date */}
                    <div className="space-y-2 min-w-[160px]">
                        <label className="text-sm font-medium">From Date</label>
                        <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>

                    {/* To Date */}
                    <div className="space-y-2 min-w-[160px]">
                        <label className="text-sm font-medium">To Date</label>
                        <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>

                    {/* Page Size */}
                    <div className="space-y-2 min-w-[140px]">
                        <label className="text-sm font-medium">Items per page</label>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value))
                                setPageNumber(1)
                            }}
                            className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm"
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                    Showing {bookings.length} of {totalCount} booking(s)
                </div>
            </Card>

            {/* Results Section */}
            <Card className="p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-destructive">{error}</div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No bookings found matching your criteria
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left p-3 font-semibold text-sm">Code</th>
                                        <th className="text-left p-3 font-semibold text-sm">User</th>
                                        <th className="text-left p-3 font-semibold text-sm">Facility</th>
                                        <th className="text-left p-3 font-semibold text-sm">Date</th>
                                        <th className="text-left p-3 font-semibold text-sm">Time</th>
                                        <th className="text-left p-3 font-semibold text-sm">Status</th>
                                        <th className="text-left p-3 font-semibold text-sm">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="p-3">
                                                <div className="font-medium text-sm">{booking.bookingCode}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium text-sm">{booking.userName}</div>
                                                <div className="text-xs text-muted-foreground">{booking.userRole}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium text-sm">{booking.facilityName}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">{formatDate(booking.bookingDate)}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge className={`${getStatusColor(booking.status)} border`}>
                                                    {booking.status}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-xs text-muted-foreground">
                                                    {formatDate(booking.createdAt)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Page {pageNumber} of {totalPages} ({totalCount} total)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                                    disabled={pageNumber === 1 || isLoading}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (pageNumber <= 3) {
                                            pageNum = i + 1
                                        } else if (pageNumber >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = pageNumber - 2 + i
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={pageNumber === pageNum ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setPageNumber(pageNum)}
                                                disabled={isLoading}
                                                className="w-10"
                                            >
                                                {pageNum}
                                            </Button>
                                        )
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                                    disabled={pageNumber === totalPages || isLoading}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    )
}
