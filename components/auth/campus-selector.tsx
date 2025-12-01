"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const CAMPUSES = [
  {
    id: "fpt-hcm",
    name: "FPT HCM",
    location: "Ho Chi Minh City",
    address: "Lot E2a-7, D1 Street, High Tech Park, District 9",
  },
  {
    id: "fpt-hanoi",
    name: "FPT Ha Noi",
    location: "Ha Noi",
    address: "E3, Cau Giay District",
  },
  {
    id: "fpt-danang",
    name: "FPT Da Nang",
    location: "Da Nang",
    address: "Tran Phu Street",
  },
  {
    id: "fpt-cantho",
    name: "FPT Can Tho",
    location: "Can Tho",
    address: "Ca Mau Street",
  },
]

interface CampusSelectorProps {
  onSelectCampus: (campus: string) => void
}

export function CampusSelector({ onSelectCampus }: CampusSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold">
              FPT
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">FPT Facility Booking System</h1>
          <p className="text-muted-foreground">Select your campus to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CAMPUSES.map((campus) => (
            <Card
              key={campus.id}
              className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
              onClick={() => onSelectCampus(campus.name)}
            >
              <h3 className="text-lg font-bold mb-1">{campus.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{campus.location}</p>
              <p className="text-xs text-muted-foreground mb-4">{campus.address}</p>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => onSelectCampus(campus.name)}
              >
                Select Campus
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
