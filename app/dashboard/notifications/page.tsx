"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "booking_approved",
    title: "Booking Approved",
    message: "Your booking for Meeting Room 301 on Dec 5, 10:00 has been approved.",
    timestamp: "2025-12-04 14:30",
    read: false,
    icon: "✓",
  },
  {
    id: 2,
    type: "booking_reminder",
    title: "Booking Reminder",
    message: "Your booking for Study Room 105 starts in 2 hours (2:00 PM).",
    timestamp: "2025-12-05 11:45",
    read: false,
    icon: "🔔",
  },
  {
    id: 3,
    type: "booking_submitted",
    title: "Booking Submitted",
    message: "Your booking request for Computer Lab 201 has been received and is pending approval.",
    timestamp: "2025-12-03 09:15",
    read: true,
    icon: "📋",
  },
  {
    id: 4,
    type: "no_show_warning",
    title: "No-show Warning",
    message: "You did not check-in for Meeting Room 205. 1 warning on record.",
    timestamp: "2025-11-28 15:00",
    read: true,
    icon: "⚠️",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [selectedNotification, setSelectedNotification] = useState<(typeof MOCK_NOTIFICATIONS)[0] | null>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const renderNotification = (notification: (typeof MOCK_NOTIFICATIONS)[0]) => (
    <Card
      key={notification.id}
      className={`p-4 cursor-pointer hover:shadow-lg transition-all ${
        !notification.read ? "bg-primary/5 border-l-4 border-primary" : ""
      }`}
      onClick={() => setSelectedNotification(notification)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{notification.icon}</span>
            <div>
              <h3 className="font-bold">{notification.title}</h3>
              <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
            </div>
            {!notification.read && <div className="w-2 h-2 rounded-full bg-primary ml-auto flex-shrink-0" />}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            deleteNotification(notification.id)
          }}
          className="ml-2 flex-shrink-0"
        >
          ✕
        </Button>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No notifications yet</p>
            </Card>
          ) : (
            notifications.map(renderNotification)
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3 mt-4">
          {notifications.filter((n) => !n.read).length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">All caught up!</p>
            </Card>
          ) : (
            notifications.filter((n) => !n.read).map(renderNotification)
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-3 mt-4">
          {notifications.filter((n) => n.type.includes("booking")).map(renderNotification)}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-3 mt-4">
          {notifications.filter((n) => n.type.includes("warning") || n.type.includes("alert")).map(renderNotification)}
        </TabsContent>
      </Tabs>

      {selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedNotification.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold">{selectedNotification.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedNotification.timestamp}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-lg">{selectedNotification.message}</p>
            </div>

            <div className="flex gap-2">
              {!selectedNotification.read && (
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    markAsRead(selectedNotification.id)
                    setSelectedNotification(null)
                  }}
                >
                  Mark as Read
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedNotification(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

