# Code Structure Documentation

Tài liệu này mô tả cấu trúc code và kiểm tra xem có tuân thủ chuẩn Clean Architecture không.

## 📐 Chuẩn Clean Architecture
D
```
┌─────────────────────────────────────────┐
│           UI/Pages (Presentation)       │  ← Gọi hooks, hiển thị UI
│  app/dashboard/*/page.tsx               │
│  components/*                           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Hooks (Business Logic)          │  ← Xử lý logic, state management
│  hooks/use-*.ts                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         API Layer (Data Access)         │  ← Gọi API endpoints
│  lib/api/*.ts                           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Types (Type Definitions)        │  ← Định nghĩa types, interfaces
│  types/index.ts                         │
└─────────────────────────────────────────┘
```

## ✅ Kiểm tra cấu trúc hiện tại

### 1. Types Layer (`types/index.ts`) ✅

**Chức năng**: Định nghĩa tất cả types, interfaces, enums

**Ví dụ**:
```typescript
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  // ...
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  // ...
}
```

**Status**: ✅ Đúng chuẩn - Chỉ định nghĩa types, không có logic

---

### 2. API Layer (`lib/api/*.ts`) ✅

**Chức năng**: Gọi API endpoints, trả về data

**Files**:
- `lib/api/auth.ts` - Authentication APIs
- `lib/api/users.ts` - User management APIs
- `lib/api/facility.ts` - Facility APIs
- `lib/api/campus.ts` - Campus APIs
- `lib/api/facility-type.ts` - Facility type APIs

**Ví dụ** (`lib/api/users.ts`):
```typescript
export const usersApi = {
  getAll: async (query?: GetUsersQuery): Promise<ApiResponse<PaginatedResult<User>>> => {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  // ...
}
```

**Status**: ✅ Đúng chuẩn - Chỉ gọi API, không xử lý state

---

### 3. Hooks Layer (`hooks/use-*.ts`) ✅

**Chức năng**: Xử lý business logic, state management, gọi API layer

**Files**:
- `hooks/use-auth.ts` - Authentication logic
- `hooks/use-users.ts` - User management logic
- `hooks/use-facility.ts` - Facility logic
- `hooks/use-campus.ts` - Campus logic
- `hooks/use-facility-type.ts` - Facility type logic

**Ví dụ** (`hooks/use-users.ts`):
```typescript
export function useUsers() {
  const [users, setUsers] = useState<PaginatedResult<User> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (query?: GetUsersQuery) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.getAll(query); // ← Gọi API layer
      if (response.success && response.data) {
        setUsers(response.data); // ← Xử lý state
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { users, fetchUsers, isLoading, error };
}
```

**Status**: ✅ Đúng chuẩn - Xử lý logic, state, gọi API layer

---

### 4. UI/Pages Layer (`app/dashboard/*/page.tsx`) ⚠️

**Chức năng**: Gọi hooks, hiển thị UI

**Ví dụ đúng** (`app/dashboard/admin/users/page.tsx`):
```typescript
export default function AdminUsersPage() {
  const { users, fetchUsers, isLoading, error } = useUsers(); // ← Gọi hooks
  const { updateUser } = useUserMutations(); // ← Gọi hooks

  useEffect(() => {
    fetchUsers({ pageNumber, pageSize }); // ← Sử dụng hooks
  }, [pageNumber]);

  return (
    <div>
      {/* UI rendering */}
    </div>
  );
}
```

**Status**: ✅ Đúng chuẩn - Gọi hooks, không gọi API trực tiếp

**⚠️ Vấn đề phát hiện**:

Một số pages đang dùng **MOCK_DATA** thay vì gọi hooks/API:

1. `app/dashboard/bookings/page.tsx` - Dùng `MOCK_BOOKINGS`
2. `app/dashboard/search/page.tsx` - Dùng `MOCK_FACILITIES`
3. `app/dashboard/calendar/page.tsx` - Dùng mock data
4. `app/dashboard/history/page.tsx` - Dùng `MOCK_HISTORY`
5. `app/dashboard/notifications/page.tsx` - Dùng `MOCK_NOTIFICATIONS`
6. `app/dashboard/profile/page.tsx` - Dùng mock profile data

**Cần sửa**: Tạo hooks và API cho các features này:
- `hooks/use-bookings.ts` + `lib/api/bookings.ts`
- `hooks/use-notifications.ts` + `lib/api/notifications.ts`
- etc.

---

## 📊 Tổng kết

| Layer | Chức năng | Status | Files |
|-------|-----------|--------|-------|
| **Types** | Định nghĩa types, interfaces | ✅ Đúng | `types/index.ts` |
| **API** | Gọi API endpoints | ✅ Đúng | `lib/api/*.ts` (6 files) |
| **Hooks** | Xử lý logic, state management | ✅ Đúng | `hooks/use-*.ts` (7 files) |
| **UI/Pages** | Gọi hooks, hiển thị UI | ⚠️ Một số dùng mock | `app/dashboard/*/page.tsx` |

## 🔧 Cần làm

### 1. Tạo API và Hooks cho các features còn thiếu:

**Bookings**:
- [ ] `lib/api/bookings.ts` - Booking APIs
- [ ] `hooks/use-bookings.ts` - Booking logic
- [ ] Update `app/dashboard/bookings/page.tsx` - Dùng hooks thay vì MOCK

**Notifications**:
- [ ] `lib/api/notifications.ts` - Notification APIs
- [ ] `hooks/use-notifications.ts` - Notification logic
- [ ] Update `app/dashboard/notifications/page.tsx` - Dùng hooks thay vì MOCK

**Profile**:
- [ ] `lib/api/profile.ts` - Profile APIs (hoặc dùng users API)
- [ ] `hooks/use-profile.ts` - Profile logic
- [ ] Update `app/dashboard/profile/page.tsx` - Dùng hooks thay vì MOCK

**Search/Facilities**:
- [ ] `lib/api/facility.ts` - Đã có, cần kiểm tra
- [ ] `hooks/use-facility.ts` - Đã có, cần kiểm tra
- [ ] Update `app/dashboard/search/page.tsx` - Dùng hooks thay vì MOCK

**History**:
- [ ] `lib/api/bookings.ts` - Có thể dùng chung với bookings
- [ ] `hooks/use-bookings.ts` - Có thể dùng chung với bookings
- [ ] Update `app/dashboard/history/page.tsx` - Dùng hooks thay vì MOCK

### 2. Pattern cần tuân thủ:

```typescript
// ❌ SAI - Page gọi API trực tiếp
export default function MyPage() {
  const [data, setData] = useState();
  useEffect(() => {
    fetch('/api/endpoint').then(r => r.json()).then(setData); // ❌
  }, []);
}

// ✅ ĐÚNG - Page gọi hooks
export default function MyPage() {
  const { data, fetchData, isLoading } = useMyHook(); // ✅
  useEffect(() => {
    fetchData();
  }, []);
}
```

```typescript
// ❌ SAI - Hook gọi API trực tiếp với fetch
export function useMyHook() {
  useEffect(() => {
    fetch('/api/endpoint').then(...); // ❌
  }, []);
}

// ✅ ĐÚNG - Hook gọi API layer
export function useMyHook() {
  const fetchData = useCallback(async () => {
    const response = await myApi.getAll(); // ✅
    // ...
  }, []);
}
```

## ✅ Kết luận

**Cấu trúc hiện tại**: ✅ **Đúng chuẩn Clean Architecture**

- Types layer: ✅ Chỉ định nghĩa types
- API layer: ✅ Chỉ gọi API
- Hooks layer: ✅ Xử lý logic, gọi API layer
- UI/Pages layer: ✅ Gọi hooks, hiển thị UI

**Vấn đề**: Một số pages đang dùng mock data thay vì hooks/API. Cần tạo hooks và API cho các features này.

---

**Last Updated**: 2025-12-05

