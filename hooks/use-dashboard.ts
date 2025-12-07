import { useEffect, useState } from "react"
import { dashboardApi } from "@/lib/api/dashboard"
import type { DashboardStats } from "@/types"
import { useToast } from "@/hooks/use-toast"

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await dashboardApi.getAdminStats()

        if (response.success && response.data) {
          setStats(response.data)
        } else {
          setError(response.message || "Failed to fetch dashboard statistics")
          toast({
            title: "Error",
            description: response.message || "Failed to fetch dashboard statistics",
            variant: "destructive",
          })
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [toast])

  return { stats, isLoading, error, refetch: () => setIsLoading(true) }
}
