"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useFirebaseNotification } from "@/hooks/use-firebase-notification"
import { Bell, BellOff, Settings, Trash2, Check, ExternalLink, RefreshCw } from "lucide-react"
import type { PushNotification, NotificationData } from "@/types"
import { useNotifications } from "@/hooks/use-notifications"

// Get icon based on notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "new_registration":
      return "👤"
    case "campus_change_request":
      return "🏫"
    case "new_booking":
      return "📅"
    case "booking_approved":
      return "✅"
    case "booking_rejected":
      return "❌"
    default:
      return "🔔"
  }
}

// Get badge color based on notification type
const getNotificationBadge = (type: string) => {
  switch (type) {
    case "new_registration":
      return "bg-blue-500"
    case "campus_change_request":
      return "bg-purple-500"
    case "new_booking":
      return "bg-green-500"
    case "booking_approved":
      return "bg-emerald-500"
    case "booking_rejected":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

// Get readable type label
const getTypeLabel = (type: string) => {
  switch (type) {
    case "new_registration":
      return "New Registration"
    case "campus_change_request":
      return "Campus Change"
    case "new_booking":
      return "New Booking"
    case "booking_approved":
      return "Approved"
    case "booking_rejected":
      return "Rejected"
    default:
      return "Notification"
  }
}

export default function NotificationsPage() {
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  
  // Use notifications hook for all business logic
  const {
    notifications,
    isLoading: isLoadingNotifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll: clearAllNotifications,
  } = useNotifications()
  
  // Use Firebase notification hook for push notification settings
  const { 
    fcmToken, 
    isSupported, 
    isLoading: isLoadingFirebase, 
    error,
    setupNotifications,
    unregisterToken,
    handleNotificationClick 
  } = useFirebaseNotification()

  const handleViewDetails = (notification: PushNotification) => {
    markAsRead(notification.id)
    if (notification.data) {
      handleNotificationClick(notification.data)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const renderNotification = (notification: PushNotification) => (
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
            <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{notification.title}</h3>
                <Badge className={`${getNotificationBadge(notification.type)} text-white text-xs`}>
                  {getTypeLabel(notification.type)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{formatTimestamp(notification.createdAt)}</p>
            </div>
            {!notification.read && <div className="w-2 h-2 rounded-full bg-primary ml-auto flex-shrink-0" />}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{notification.body}</p>
        </div>
        <div className="flex gap-1 ml-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                markAsRead(notification.id)
              }}
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              deleteNotification(notification.id)
            }}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )

  const renderEmptyState = (message: string) => (
    <Card className="p-12 text-center">
      <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            {isLoadingNotifications ? (
              "Loading notifications..."
            ) : unreadCount > 0 ? (
              `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
            ) : (
              "All caught up!"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadNotifications}
            disabled={isLoadingNotifications}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllNotifications}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Push Notification Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  {isSupported 
                    ? "Receive real-time notifications for new registrations, bookings, and campus change requests"
                    : "Push notifications are not supported in this browser"}
                </p>
              </div>
              <Switch 
                checked={!!fcmToken}
                 disabled={!isSupported || isLoadingFirebase}
                onCheckedChange={(checked) => {
                  if (checked) {
                     setupNotifications()
                  } else {
                     unregisterToken()
                  }
                }}
              />
            </div>

            {fcmToken && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications are enabled
                </p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 p-3 rounded-lg">
                <p className="text-sm text-destructive flex items-center gap-2">
                  <BellOff className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}

             {isLoadingFirebase && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Setting up notifications...
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Notifications List */}
      {isLoadingNotifications ? (
        <Card className="p-12 text-center">
          <RefreshCw className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading notifications from server...</p>
        </Card>
      ) : (
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="campus">Campus Changes</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {notifications.length === 0 
            ? renderEmptyState("No notifications yet")
            : notifications.map(renderNotification)}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3 mt-4">
          {notifications.filter((n) => !n.read).length === 0 
            ? renderEmptyState("All caught up!")
            : notifications.filter((n) => !n.read).map(renderNotification)}
        </TabsContent>

        <TabsContent value="registrations" className="space-y-3 mt-4">
          {notifications.filter((n) => n.type === "new_registration").length === 0
            ? renderEmptyState("No registration notifications")
            : notifications.filter((n) => n.type === "new_registration").map(renderNotification)}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-3 mt-4">
          {notifications.filter((n) => n.type.includes("booking")).length === 0
            ? renderEmptyState("No booking notifications")
            : notifications.filter((n) => n.type.includes("booking")).map(renderNotification)}
        </TabsContent>

        <TabsContent value="campus" className="space-y-3 mt-4">
          {notifications.filter((n) => n.type === "campus_change_request").length === 0
            ? renderEmptyState("No campus change notifications")
            : notifications.filter((n) => n.type === "campus_change_request").map(renderNotification)}
        </TabsContent>
      </Tabs>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getNotificationIcon(selectedNotification.type)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{selectedNotification.title}</h2>
                    <Badge className={`${getNotificationBadge(selectedNotification.type)} text-white`}>
                      {getTypeLabel(selectedNotification.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedNotification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-muted-foreground hover:text-foreground text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-lg">{selectedNotification.body}</p>
            </div>

            {/* Additional Details */}
            {selectedNotification.data && (
              <div className="space-y-2 mb-6">
                <h3 className="font-semibold">Details</h3>
                <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                  {selectedNotification.data.userName && (
                    <p><span className="text-muted-foreground">User:</span> {selectedNotification.data.userName}</p>
                  )}
                  {selectedNotification.data.userEmail && (
                    <p><span className="text-muted-foreground">Email:</span> {selectedNotification.data.userEmail}</p>
                  )}
                  {selectedNotification.data.facilityName && (
                    <p><span className="text-muted-foreground">Facility:</span> {selectedNotification.data.facilityName}</p>
                  )}
                  {selectedNotification.data.bookingDate && (
                    <p><span className="text-muted-foreground">Date:</span> {selectedNotification.data.bookingDate}</p>
                  )}
                  {selectedNotification.data.startTime && selectedNotification.data.endTime && (
                    <p><span className="text-muted-foreground">Time:</span> {selectedNotification.data.startTime} - {selectedNotification.data.endTime}</p>
                  )}
                  {selectedNotification.data.campusName && (
                    <p><span className="text-muted-foreground">Campus:</span> {selectedNotification.data.campusName}</p>
                  )}
                  {selectedNotification.data.requestedCampusName && (
                    <p><span className="text-muted-foreground">Requested Campus:</span> {selectedNotification.data.requestedCampusName}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => handleViewDetails(selectedNotification)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Details
              </Button>
              {!selectedNotification.read && (
                <Button
                  variant="outline"
                  onClick={() => {
                    markAsRead(selectedNotification.id)
                    setSelectedNotification({ ...selectedNotification, read: true })
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
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
