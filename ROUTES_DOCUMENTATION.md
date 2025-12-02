# Routes Documentation - Facility Booking System

Tài liệu này mô tả tất cả các routes trong hệ thống và role nào có quyền truy cập.

## 📋 Tổng quan

Hệ thống có 3 roles chính:
- **Student** - Sinh viên
- **Lecturer** - Giảng viên  
- **Admin** - Quản trị viên

## 🎓 Student Routes

Các routes dành cho **Student**:

| Route | Mô tả | File Location |
|-------|-------|---------------|
| `/dashboard` | Dashboard chính - Tổng quan bookings và thống kê | `app/dashboard/page.tsx` |
| `/dashboard/search` | Tìm kiếm và lọc facilities | `app/dashboard/search/page.tsx` |
| `/dashboard/bookings` | Quản lý tất cả bookings của user | `app/dashboard/bookings/page.tsx` |
| `/dashboard/calendar` | Xem lịch bookings theo ngày/tuần/tháng | `app/dashboard/calendar/page.tsx` |
| `/dashboard/history` | Lịch sử các bookings đã hoàn thành | `app/dashboard/history/page.tsx` |
| `/dashboard/notifications` | Xem và quản lý thông báo | `app/dashboard/notifications/page.tsx` |
| `/dashboard/profile` | Quản lý thông tin cá nhân và đổi mật khẩu | `app/dashboard/profile/page.tsx` |

**Tổng cộng: 7 routes**

## 👨‍🏫 Lecturer Routes

Các routes dành cho **Lecturer** (bao gồm tất cả của Student + thêm):

### Routes chung với Student:
- `/dashboard` - Dashboard chính
- `/dashboard/search` - Tìm kiếm facilities
- `/dashboard/bookings` - Quản lý bookings
- `/dashboard/calendar` - Xem lịch
- `/dashboard/history` - Lịch sử bookings
- `/dashboard/notifications` - Thông báo
- `/dashboard/profile` - Hồ sơ cá nhân

### Routes chỉ dành cho Lecturer:

| Route | Mô tả | File Location |
|-------|-------|---------------|
| `/dashboard/recurring-bookings` | Quản lý bookings định kỳ cho các khóa học | `app/dashboard/recurring-bookings/page.tsx` |
| `/dashboard/department-reports` | Xem báo cáo sử dụng facilities của phòng ban | `app/dashboard/department-reports/page.tsx` |

**Tổng cộng: 9 routes** (7 chung + 2 riêng)

## 👨‍💼 Admin Routes

Các routes dành cho **Admin**:

### Routes chung:
- `/dashboard` - Dashboard chính
- `/dashboard/notifications` - Thông báo
- `/dashboard/profile` - Hồ sơ cá nhân

### Routes chỉ dành cho Admin:

| Route | Mô tả | File Location |
|-------|-------|---------------|
| `/dashboard/admin/facilities` | Quản lý facilities (tạo, sửa, xóa, thay đổi trạng thái) | `app/dashboard/admin/facilities/page.tsx` |
| `/dashboard/admin/bookings` | Duyệt và quản lý booking requests | `app/dashboard/admin/bookings/page.tsx` |
| `/dashboard/admin/users` | Quản lý users và approve registrations | `app/dashboard/admin/users/page.tsx` |
| `/dashboard/admin/analytics` | Xem analytics và reports hệ thống | `app/dashboard/admin/analytics/page.tsx` |
| `/dashboard/admin/settings` | Cài đặt hệ thống (booking rules, notifications, etc.) | `app/dashboard/admin/settings/page.tsx` |

**Tổng cộng: 8 routes** (3 chung + 5 riêng)

## 🔐 Role-Based Access Control

### Cách hoạt động:

1. **Navigation Filtering**: Trong `app/dashboard/layout.tsx`, mỗi menu item có thuộc tính `roles`:
   ```typescript
   const navItems = [
     { href: "/dashboard", label: "Dashboard", roles: ["student", "lecturer", "admin"] },
     { href: "/dashboard/search", label: "Search Facilities", roles: ["student", "lecturer"] },
     { href: "/dashboard/recurring-bookings", label: "Recurring Bookings", roles: ["lecturer"] },
     { href: "/dashboard/admin/facilities", label: "Manage Facilities", roles: ["admin"] },
     // ...
   ]
   ```

2. **Dynamic Filtering**: Navigation được lọc theo role hiện tại:
   ```typescript
   const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole))
   ```

3. **User Role Detection**: Role được lấy từ:
   - `localStorage.getItem("role")`
   - `getCurrentUser().role` từ auth hook

### Bảo mật:

⚠️ **Lưu ý**: Hiện tại chỉ có client-side filtering. Để bảo mật tốt hơn, nên thêm:
- Server-side route protection (middleware)
- API endpoint authorization checks
- Route guards trong Next.js middleware

## 📊 Tổng kết

| Role | Số lượng Routes | Routes riêng |
|------|----------------|--------------|
| **Student** | 7 | 0 |
| **Lecturer** | 9 | 2 (recurring-bookings, department-reports) |
| **Admin** | 8 | 5 (facilities, bookings, users, analytics, settings) |

## 🗂️ Cấu trúc thư mục

```
app/dashboard/
├── page.tsx                    # Dashboard chính (tất cả roles)
├── layout.tsx                  # Layout với navigation filtering
├── search/
│   └── page.tsx                # Search (Student, Lecturer)
├── bookings/
│   └── page.tsx                # My Bookings (Student, Lecturer)
├── calendar/
│   └── page.tsx                # Calendar View (Student, Lecturer)
├── history/
│   └── page.tsx                # Booking History (Student, Lecturer)
├── notifications/
│   └── page.tsx                # Notifications (tất cả roles)
├── profile/
│   └── page.tsx                # Profile (tất cả roles)
├── recurring-bookings/
│   └── page.tsx                # Recurring Bookings (Lecturer only)
├── department-reports/
│   └── page.tsx                # Department Reports (Lecturer only)
└── admin/
    ├── facilities/
    │   └── page.tsx            # Manage Facilities (Admin only)
    ├── bookings/
    │   └── page.tsx            # Booking Approvals (Admin only)
    ├── users/
    │   └── page.tsx            # User Management (Admin only)
    ├── analytics/
    │   └── page.tsx            # Analytics (Admin only)
    └── settings/
        └── page.tsx            # Settings (Admin only)
```

## 🔄 Flow đăng nhập và routing

1. User đăng nhập → Nhận token và role từ backend
2. Role được lưu vào `localStorage`
3. Redirect đến `/dashboard` dựa trên role:
   - Student → `/dashboard`
   - Lecturer → `/dashboard`
   - Admin → `/dashboard`
4. Layout component load và filter navigation theo role
5. User chỉ thấy các menu items phù hợp với role của mình

## 📝 Notes

- Tất cả routes đều nằm trong `app/dashboard/` để dễ quản lý
- Route group `(dashboard)` đã được xóa, tất cả routes hiện ở `dashboard/`
- Navigation được render động dựa trên role, không hardcode
- Mỗi page component có thể tự kiểm tra role nếu cần (optional)

---

**Last Updated**: 2025-12-05
**Maintained by**: Development Team

