"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const MOCK_HISTORY = [
  {
    id: "BK-20251201-001",
    facilityName: "Meeting Room 301",
    type: "Meeting Room",
    date: "2025-12-01",
    time: "09:00 - 10:30",
    duration: "1.5 hours",
    purpose: "Team meeting",
    checkedIn: true,
    checkedOut: true,
    noShow: false,
    rating: 4.5,
    comment: "Great meeting room, good equipment",
  },
  {
    id: "BK-20251128-002",
    facilityName: "Study Room 105",
    type: "Study Room",
    date: "2025-11-28",
    time: "14:00 - 16:00",
    duration: "2 hours",
    purpose: "Group study",
    checkedIn: true,
    checkedOut: true,
    noShow: false,
    rating: 4.0,
    comment: "Quiet and comfortable",
  },
  {
    id: "BK-20251120-003",
    facilityName: "Computer Lab 201",
    type: "Lab",
    date: "2025-11-20",
    time: "10:00 - 12:00",
    duration: "2 hours",
    purpose: "Project work",
    checkedIn: true,
    checkedOut: true,
    noShow: false,
    rating: 3.5,
    comment: "Some computers had issues",
  },
  {
    id: "BK-20251115-004",
    facilityName: "Meeting Room 205",
    type: "Meeting Room",
    date: "2025-11-15",
    time: "15:00 - 16:00",
    duration: "1 hour",
    purpose: "Project discussion",
    checkedIn: false,
    checkedOut: false,
    noShow: true,
    rating: 0,
    comment: "No-show",
  },
]

export default function HistoryPage() {
  const [filteredHistory, setFilteredHistory] = useState(MOCK_HISTORY)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<(typeof MOCK_HISTORY)[0] | null>(null)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term === "") {
      setFilteredHistory(MOCK_HISTORY)
    } else {
      setFilteredHistory(
        MOCK_HISTORY.filter(
          (h) =>
            h.facilityName.toLowerCase().includes(term.toLowerCase()) ||
            h.purpose.toLowerCase().includes(term.toLowerCase()) ||
            h.id.toLowerCase().includes(term.toLowerCase()),
        ),
      )
    }
  }

  const stats = {
    totalBookings: MOCK_HISTORY.length,
    completedBookings: MOCK_HISTORY.filter((h) => h.checkedOut).length,
    noShows: MOCK_HISTORY.filter((h) => h.noShow).length,
    averageRating: (
      MOCK_HISTORY.filter((h) => h.rating > 0).reduce((acc, h) => acc + h.rating, 0) /
      MOCK_HISTORY.filter((h) => h.rating > 0).length
    ).toFixed(1),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Booking History</h1>
        <p className="text-muted-foreground">View your past bookings and facility usage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-primary">{stats.totalBookings}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-3xl font-bold text-primary">{stats.completedBookings}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">No-shows</p>
          <p className="text-3xl font-bold text-destructive">{stats.noShows}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg. Rating</p>
          <p className="text-3xl font-bold text-primary">{stats.averageRating}</p>
        </Card>
      </div>

      <Card className="p-4">
        <Input
          type="search"
          placeholder="Search by facility name, booking ID, or purpose..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
        />
      </Card>

      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No bookings found</p>
          </Card>
        ) : (
          filteredHistory.map((entry) => (
            <Card
              key={entry.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{entry.facilityName}</h3>
                    {entry.noShow && (
                      <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded">
                        No-show
                      </span>
                    )}
                    {entry.checkedOut && !entry.noShow && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {entry.date} • {entry.time} ({entry.duration})
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{entry.purpose}</span>
                    {entry.rating > 0 && <span className="text-primary font-medium">★ {entry.rating}/5.0</span>}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedEntry.facilityName}</h2>
              <button onClick={() => setSelectedEntry(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="font-bold">{selectedEntry.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-bold">{selectedEntry.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-bold">{selectedEntry.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-bold">{selectedEntry.time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-bold">{selectedEntry.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-bold">{selectedEntry.purpose}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <div className="flex gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedEntry.checkedIn ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {selectedEntry.checkedIn ? "Checked In" : "Not Checked In"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedEntry.checkedOut ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {selectedEntry.checkedOut ? "Checked Out" : "Not Checked Out"}
                  </span>
                </div>
              </div>

              {selectedEntry.rating > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                  <p className="font-bold text-lg text-primary mb-2">★ {selectedEntry.rating}/5.0</p>
                  <p className="text-sm">{selectedEntry.comment}</p>
                </div>
              )}
            </div>

            <Button variant="outline" onClick={() => setSelectedEntry(null)} className="w-full">
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
