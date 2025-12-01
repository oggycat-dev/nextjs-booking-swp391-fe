"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/auth/login-form"
import { CampusSelector } from "@/components/auth/campus-selector"

export default function Home() {
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleCampusSelect = (campus: string) => {
    setSelectedCampus(campus)
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  if (!selectedCampus) {
    return <CampusSelector onSelectCampus={handleCampusSelect} />
  }

  if (!isLoggedIn) {
    return <LoginForm campus={selectedCampus} onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-foreground text-primary rounded-lg flex items-center justify-center font-bold">
              FPT
            </div>
            <h1 className="text-xl font-bold">Facility Booking</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsLoggedIn(false)
              setSelectedCampus(null)
            }}
          >
            Logout
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <p className="text-muted-foreground mb-4">
              Welcome back! Campus: <span className="font-semibold text-foreground">{selectedCampus}</span>
            </p>
            <div className="space-y-2">
              <p className="text-sm">Your role: Student</p>
              <p className="text-sm">Campus: {selectedCampus}</p>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Search Facilities
              </Button>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">My Bookings</Button>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Create Booking</Button>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Statistics</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold text-primary">0</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">No-show Count</p>
                <p className="text-2xl font-bold text-primary">0</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
