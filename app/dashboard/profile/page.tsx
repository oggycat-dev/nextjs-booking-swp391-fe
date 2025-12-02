"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Nguyen Van A",
    email: "nguyen.van.a@student.fpt.com",
    studentId: "SE123456",
    phone: "+84912345678",
    department: "Software Engineering",
    major: "Web Development",
    campus: "FPT HCM",
  })

  const [formData, setFormData] = useState(profile)

  const handleSave = () => {
    setProfile(formData)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Personal Information</h2>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Edit
                </Button>
              )}
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="font-bold">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Student ID</p>
                  <p className="font-bold">{profile.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-bold">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-bold">{profile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Department</p>
                  <p className="font-bold">{profile.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Major</p>
                  <p className="font-bold">{profile.major}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Campus</p>
                  <p className="font-bold">{profile.campus}</p>
                </div>
              </div>
            ) : (
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Department</label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData(profile)
                      setIsEditing(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Change Password</h2>
            <form className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <Input type="password" placeholder="Enter current password" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Update Password</Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
            <div className="space-y-4 max-w-md">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary rounded" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Booking confirmations and reminders</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary rounded" />
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Important alerts and reminders</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary rounded" />
                <div>
                  <p className="font-medium">In-app Notifications</p>
                  <p className="text-sm text-muted-foreground">Real-time updates within the app</p>
                </div>
              </label>
            </div>

            <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">Save Preferences</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

