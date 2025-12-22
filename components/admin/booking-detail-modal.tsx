"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useFacility } from "@/hooks/use-facility"
import type { Booking, BookingStatus } from "@/types"

interface BookingDetailModalProps {
    booking: Booking | null
    onClose: () => void
    onApprove?: () => void
    onReject?: () => void
    showActions?: boolean
}

export function BookingDetailModal({
    booking,
    onClose,
    onApprove,
    onReject,
    showActions = true,
}: BookingDetailModalProps) {
    // Fetch facility details when a booking is selected
    const { facility, isLoading: isLoadingFacility } = useFacility(
        booking?.facilityId ? booking.facilityId : undefined
    )

    const getStatusColor = (status: BookingStatus) => {
        const colors: Record<string, string> = {
            WaitingLecturerApproval: "bg-yellow-100 text-yellow-700",
            WaitingAdminApproval: "bg-blue-100 text-blue-700",
            Approved: "bg-green-100 text-green-700",
            Rejected: "bg-red-100 text-red-700",
            Cancelled: "bg-gray-100 text-gray-700",
            Completed: "bg-purple-100 text-purple-700",
            CheckedIn: "bg-indigo-100 text-indigo-700",
            NoShow: "bg-orange-100 text-orange-700",
            Pending: "bg-blue-100 text-blue-700",
        }
        return colors[status] || "bg-gray-100 text-gray-700"
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN")
    }

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5)
    }

    if (!booking) return null

    const isPendingApproval =
        (booking as any).status === 'WaitingLecturerApproval' ||
        (booking as any).status === 'WaitingAdminApproval'

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Booking Details</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        ✕
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Booking Code</p>
                            <p className="font-bold">{booking.bookingCode}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(booking.status)}`}>
                                {booking.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Facility</p>
                            <p className="font-bold">{booking.facilityName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Date</p>
                            <p className="font-bold">{formatDate(booking.bookingDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Time</p>
                            <p className="font-bold">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Created At</p>
                            <p className="font-bold">{formatDate(booking.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Purpose</p>
                            <p className="font-bold">{booking.purpose}</p>
                        </div>
                        {isLoadingFacility ? (
                            <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">Loading facility details...</p>
                            </div>
                        ) : facility ? (
                            <>
                                {facility.building && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Tòa nhà (Building)</p>
                                        <p className="font-bold">{facility.building}</p>
                                    </div>
                                )}
                                {facility.floor && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Tầng (Floor)</p>
                                        <p className="font-bold">{facility.floor}</p>
                                    </div>
                                )}
                                {facility.roomNumber && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Phòng (Room)</p>
                                        <p className="font-bold">{facility.roomNumber}</p>
                                    </div>
                                )}
                                {facility.campusName && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Campus</p>
                                        <p className="font-bold">{facility.campusName}</p>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>

                    {booking.notes && (
                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-1">Notes</p>
                            <p className="font-medium">{booking.notes}</p>
                        </div>
                    )}

                    <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Requester Information</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Name</p>
                                <p className="font-medium">{booking.userName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Role</p>
                                <p className="font-medium">{booking.userRole}</p>
                            </div>
                            {booking.userEmail && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="font-medium">{booking.userEmail}</p>
                                </div>
                            )}
                            {booking.lecturerEmail && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Lecturer Email</p>
                                    <p className="font-medium">{booking.lecturerEmail}</p>
                                </div>
                            )}
                            {booking.lecturerName && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Approved by Lecturer</p>
                                    <p className="font-medium">{booking.lecturerName}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* Only show Approve/Reject for pending bookings */}
                    {showActions && isPendingApproval && (
                        <>
                            <Button
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                                onClick={onApprove}
                            >
                                Approve Booking
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 text-destructive hover:text-destructive bg-transparent"
                                onClick={onReject}
                            >
                                Reject Booking
                            </Button>
                        </>
                    )}
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </Card>
        </div>
    )
}
