"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    systemName: "FPT Facility Booking System",
    contactEmail: "admin@fpt.edu.vn",
    workingHoursStart: "07:00",
    workingHoursEnd: "22:00",
    studentMaxDaysAhead: 7,
    lecturerMaxDaysAhead: 30,
    maxConcurrentBookings: 3,
    checkInGracePeriod: 15,
    autoCheckoutDelay: 30,
    noShowThreshold: 3,
    approvalSLAHours: 24,
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
  })

  const [formData, setFormData] = useState(settings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setSettings(formData)
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings and rules</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="booking">Booking Rules</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">System Name</label>
                <Input
                  value={formData.systemName}
                  onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contact Email</label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Working Hours Start</label>
                  <Input
                    type="time"
                    value={formData.workingHoursStart}
                    onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Working Hours End</label>
                  <Input
                    type="time"
                    value={formData.workingHoursEnd}
                    onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Booking Rules</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Student Max Days Ahead</label>
                  <Input
                    type="number"
                    value={formData.studentMaxDaysAhead}
                    onChange={(e) => setFormData({ ...formData, studentMaxDaysAhead: Number.parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">How many days in advance students can book</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lecturer Max Days Ahead</label>
                  <Input
                    type="number"
                    value={formData.lecturerMaxDaysAhead}
                    onChange={(e) =>
                      setFormData({ ...formData, lecturerMaxDaysAhead: Number.parseInt(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">How many days in advance lecturers can book</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Concurrent Bookings Per User</label>
                <Input
                  type="number"
                  value={formData.maxConcurrentBookings}
                  onChange={(e) => setFormData({ ...formData, maxConcurrentBookings: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Check-in Grace Period (minutes)</label>
                  <Input
                    type="number"
                    value={formData.checkInGracePeriod}
                    onChange={(e) => setFormData({ ...formData, checkInGracePeriod: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Auto Check-out Delay (minutes)</label>
                  <Input
                    type="number"
                    value={formData.autoCheckoutDelay}
                    onChange={(e) => setFormData({ ...formData, autoCheckoutDelay: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">No-show Threshold for Blocking (count)</label>
                <Input
                  type="number"
                  value={formData.noShowThreshold}
                  onChange={(e) => setFormData({ ...formData, noShowThreshold: Number.parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">Users will be blocked after this many no-shows</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Approval SLA (hours)</label>
                <Input
                  type="number"
                  value={formData.approvalSLAHours}
                  onChange={(e) => setFormData({ ...formData, approvalSLAHours: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded"
                />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Send booking confirmations and reminders via email</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.smsNotifications}
                  onChange={(e) => setFormData({ ...formData, smsNotifications: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded"
                />
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Send urgent alerts via SMS</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.inAppNotifications}
                  onChange={(e) => setFormData({ ...formData, inAppNotifications: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded"
                />
                <div>
                  <p className="font-medium">In-app Notifications</p>
                  <p className="text-sm text-muted-foreground">Real-time notifications within the application</p>
                </div>
              </label>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">System Maintenance</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-3">Maintenance Tasks</p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Export All Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Generate Audit Log
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
                  >
                    Reset System
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Last backup: 2025-12-04 02:30 AM</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
