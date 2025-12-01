"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const MOCK_USERS = [
  {
    id: 1,
    name: "Nguyen Van A",
    email: "nguyen.van.a@student.fpt.com",
    role: "Student",
    department: "Software Engineering",
    studentId: "SE123456",
    status: "Active",
    noShowCount: 0,
    joinedDate: "2024-09-01",
    bookings: 12,
  },
  {
    id: 2,
    name: "Tran Thi B",
    email: "tran.thi.b@student.fpt.com",
    role: "Student",
    department: "Business Administration",
    studentId: "BA789012",
    status: "Active",
    noShowCount: 1,
    joinedDate: "2024-09-01",
    bookings: 5,
  },
  {
    id: 3,
    name: "Prof. Le Van C",
    email: "le.van.c@fpt.com",
    role: "Lecturer",
    department: "Software Engineering",
    studentId: "LEC001",
    status: "Active",
    noShowCount: 0,
    joinedDate: "2023-01-15",
    bookings: 45,
  },
  {
    id: 4,
    name: "Pham Van D",
    email: "pham.van.d@student.fpt.com",
    role: "Student",
    department: "Software Engineering",
    studentId: "SE345678",
    status: "Blocked",
    noShowCount: 3,
    joinedDate: "2024-09-01",
    bookings: 8,
  },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [selectedUser, setSelectedUser] = useState<(typeof MOCK_USERS)[0] | null>(null)

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !filterRole || u.role === filterRole
    const matchesStatus = !filterStatus || u.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    totalUsers: users.length,
    students: users.filter((u) => u.role === "Student").length,
    lecturers: users.filter((u) => u.role === "Lecturer").length,
    blocked: users.filter((u) => u.status === "Blocked").length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Blocked":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const handleBlockUnblock = (id: number) => {
    setUsers(
      users.map((u) => {
        if (u.id === id) {
          return { ...u, status: u.status === "Blocked" ? "Active" : "Blocked" }
        }
        return u
      }),
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">View and manage system users and permissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Users</p>
          <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Students</p>
          <p className="text-3xl font-bold text-primary">{stats.students}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Lecturers</p>
          <p className="text-3xl font-bold text-primary">{stats.lecturers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Blocked Users</p>
          <p className="text-3xl font-bold text-destructive">{stats.blocked}</p>
        </Card>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            >
              <option value="">All Roles</option>
              <option value="Student">Student</option>
              <option value="Lecturer">Lecturer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                setSearchTerm("")
                setFilterRole("")
                setFilterStatus("")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No users found</p>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                      {user.role}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <span>Department: {user.department}</span>
                    <span>Bookings: {user.bookings}</span>
                    <span>No-shows: {user.noShowCount}</span>
                    <span>Joined: {user.joinedDate}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBlockUnblock(user.id)
                    }}
                    className={
                      user.status === "Blocked"
                        ? "text-green-600 hover:text-green-600"
                        : "text-destructive hover:text-destructive"
                    }
                  >
                    {user.status === "Blocked" ? "Unblock" : "Block"}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
              <button onClick={() => setSelectedUser(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-bold">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <p className="font-bold">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.status)}`}
                  >
                    {selectedUser.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Department</p>
                  <p className="font-bold">{selectedUser.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                  <p className="font-bold">{selectedUser.bookings}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">No-shows</p>
                  <p className="font-bold text-destructive">{selectedUser.noShowCount}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">View Bookings</Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => handleBlockUnblock(selectedUser.id)}
              >
                {selectedUser.status === "Blocked" ? "Unblock User" : "Block User"}
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
