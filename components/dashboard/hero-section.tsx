"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface HeroSectionProps {
  title?: string
  subtitle?: string
  showSearch?: boolean
  backgroundImage?: string
}

export function HeroSection({ 
  title = "Welcome to FPT Facility Booking", 
  subtitle = "Book the perfect facility for your study and work needs",
  showSearch = false,
  backgroundImage 
}: HeroSectionProps) {
  const router = useRouter()

  const handleSearch = () => {
    router.push("/dashboard/search")
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-8">
      {/* Background with image or gradient overlay */}
      {backgroundImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/60">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center text-white">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            {subtitle}
          </p>

          {showSearch && (
            <Card className="mt-8 p-4 md:p-6 bg-white/95 backdrop-blur-sm shadow-2xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Search facilities..."
                    className="h-12 text-lg"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch()
                    }}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold"
                >
                  Search
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm text-muted-foreground">
                <span className="px-3 py-1 bg-muted rounded-full">Meeting Rooms</span>
                <span className="px-3 py-1 bg-muted rounded-full">Study Rooms</span>
                <span className="px-3 py-1 bg-muted rounded-full">Labs</span>
                <span className="px-3 py-1 bg-muted rounded-full">Auditoriums</span>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  )
}

