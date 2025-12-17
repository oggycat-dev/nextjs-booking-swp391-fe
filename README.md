# FPT HCM Facility Booking — Frontend

Tài liệu này mô tả frontend của hệ thống đặt phòng FPT HCM (Next.js). Nội dung được viết lại dựa trên code hiện có và yêu cầu nghiệp vụ được cung cấp.

**Nguyên tắc quan trọng**
- **Tài khoản**: Chỉ chấp nhận email có đuôi @fpt (hoặc tài khoản cấp sẵn).  
- **Chọn campus trước khi đăng nhập**: Người dùng phải chọn campus trên màn hình trước khi tiến hành đăng nhập.  
- **Tài khoản admin**: Danh sách admin có thể được nạp từ biến môi trường (xem mục ENV).

**Flow chính**
- **Student Booking**: Sinh viên tạo booking request và gán email giảng viên. Yêu cầu được gửi cho Lecturer để approve → nếu Lecturer approve thì status chuyển về "Pending" và gửi cho Admin → Admin approve → Booking confirmed. Nếu Lecturer reject → Booking bị reject ngay.
- **Lecturer Booking**: Giảng viên tạo request trực tiếp gửi lên Admin → Admin approve → Booking confirmed.

**Ngoại lệ / Quy tắc**
- Student book: tối đa 7 ngày trước; Lecturer book: tối đa 30 ngày trước.  
- Giờ làm việc: Tùy theo từng cơ sở.  
- Không cho đặt vào ngày lễ.  
- No-show policy và chế tài (block account) do backend xử lý; frontend hiển thị thông báo và trạng thái.

**Tính năng theo vai trò (tóm tắt)**
- **Student**: Đăng ký/Đăng nhập, profile, tìm & đặt phòng (advanced search), calendar view, tạo booking request (gửi cho lecture duyệt), quản lý bookings, check-in/out, đánh giá, notifications, dashboard.
- **Lecturer**: Đăng ký/Đăng nhập, profile, tìm & đặt phòng (advanced search), calendar view, tạo booking request (gửi trực tiếp cho admin), quản lý bookings, check-in/out, notifications, dashboard phê duyệt booking cho students
- **Facility Admin**: CRUD campus/facility/type, xem & xử lý booking queue, approve/reject/modify/cancel, monitor check-in/out, conflict resolution, maintenance, user management, reports.

**Cấu trúc chính**
- app/ — Next.js App Router (routes & layout).  
- components/ — UI components (auth, dashboard, facility, ui primitives).  
- hooks/ — custom hooks (use-auth, use-booking, use-facility, ...).  
- lib/ — api clients, utils, firebase integration.  
- public/ — static assets (service worker, images).

**ENV & cấu hình**
- Yêu cầu: Node.js 18+ và pnpm.  
- Sao chép `.env.example` → `.env.local` và cấu hình:
  - NEXT_PUBLIC_API_URL: URL backend
  - NEXT_PUBLIC_FIREBASE_*: (nếu dùng Firebase)
  - ADMIN_ACCOUNTS / ADMIN_EMAILS: (danh sách admin, hoặc backend đọc từ env)

**Chạy project**
- Cài dependencies:

  ```bash
  pnpm install
  ```

- Chạy dev:

  ```bash
  pnpm dev
  ```

- Build & production:

  ```bash
  pnpm build
  pnpm start
  ```

**File & hook quan trọng**
- app/ — entry routes và dashboard.  
- lib/api-client.ts — config base cho API.  
- lib/firebase.ts — cấu hình push notifications.  
- hooks/use-auth.ts — logic đăng nhập/refresh token.  
- hooks/use-booking.ts — tạo/thu hồi/lay booking.

**Authentication & UX notes**
- Bắt buộc chọn campus trước khi hiển thị form login; lưu lựa chọn vào session/local để gửi lên API.  
- Validate email domain `@fpt` trên client (và backend) — cho phép tài khoản seed đặc biệt nếu có.

**Mapping UI → nghiệp vụ (tóm tắt triển khai)**
- Student tạo booking → POST /bookings (payload có lecturerEmail) → hiển thị trạng thái chờ lecturer → nếu lecturer approve → gửi tiếp admin queue.
- Lecturer approve → gọi API cập nhật status → notify admin.
- Admin UI: queue pending, approve/reject/modify, bulk actions, logs.

**Gợi ý cải tiến tiếp theo**
- Bổ sung màn hình yêu cầu chọn campus trước login.  
- Thêm client-side validation bắt buộc `@fpt`.  
- Implement Admin queue view nếu chưa có.

---

README này đã được viết lại dựa trên yêu cầu nghiệp vụ và cấu trúc frontend hiện tại. Muốn tôi commit thay đổi này và/hoặc triển khai một trong các cải tiến UI nêu trên không?# nextjs-booking-swp391-fe — Frontend Overview

This repository is the Next.js (App Router) frontend for the Facility Booking System (FPT University).

## Quick summary
- Framework: Next.js (App Router), TypeScript
- Styling: Tailwind CSS (via project styles), component-based UI primitives
- State & data: React hooks (custom hooks in `hooks/`), lightweight client-side state
- API layer: `lib/api/*` contains API clients; `hooks/*` wrap these clients and provide loading/error state
- Storage: `lib/storage-manager.ts` (abstraction over session/local/cookie)

## Prerequisites
- Node.js (recommended LTS)
- pnpm (project uses pnpm lockfile) — npm or pnpm supported depending on your environment

## Install & run
1. Install dependencies

```bash
cd nextjs-booking-swp391-fe
pnpm install
```

2. Run development server

```bash
pnpm dev
# or
npm run dev
```

3. Build for production

```bash
pnpm build
pnpm start
```

## Environment
- Project reads API settings and credentials from environment variables (see `.env.example` and `.env.local` in repo root).
- Firebase web push support uses `public/firebase-messaging-sw.js` and config in `lib/firebase.ts`.

## High-level project layout
- `app/` — Next.js App Router pages and layouts (main entry points). Key areas:
  - `app/dashboard/` — Main application dashboard and sub-pages (search, calendar, admin, profile, bookings, etc.)
  - `app/dashboard/admin/` — Admin pages (manage facilities, users, etc.)
- `components/` — Reusable UI components and UI primitives (cards, buttons, inputs, searchable selects, facility components, modals)
  - `components/facilities/` — Facility list, grid, search filters, booking modal, facility detail
  - `components/ui/` — Generic UI building blocks used across the app
- `hooks/` — Custom React hooks that handle data fetching and mutations, e.g.:
  - `use-facility.ts` — fetch all facilities, facility by id, mutations
  - `use-facility-type.ts` — facility types
  - `use-auth.ts` — authentication and storage of user / tokens
  - `use-campus.ts`, `use-users.ts`, `use-booking.ts`, etc.
- `lib/` — Utilities and API clients
  - `lib/api/*` — thin API clients per resource (facility, facility-type, booking, auth, ...). These functions call the backend and return typed ApiResponse objects.
  - `lib/storage-manager.ts` — abstraction for storing tokens/user in cookies / localStorage / sessionStorage
  - `lib/api-client.ts` — base API config and helpers (auth headers)
- `types/` — TypeScript types for API requests/responses and domain models
- `public/` — static assets (service worker for Firebase, images)

## Key patterns and notes
- API client functions are in `lib/api/*`. They return the backend `ApiResponse<T>` shape; hooks call them and manage component-friendly state (`isLoading`, `error`, data).
- Hooks are the preferred way to interact with backend data from components. They encapsulate fetching, caching (component-level), and mutation behavior.
- Storage of auth tokens and user is centralized via `storage` (an instance of `StorageManager` in `lib/storage-manager.ts`). Hooks and components read from `storage.getItem('user')` when needed.

## Important behaviors implemented
- Campus filtering: the Search and Calendar pages include logic to include `campusId` in facility queries so the backend can return campus-specific facility lists. The code also contains client-side safeguards that normalize `facility.campusId` (string vs object) when necessary.
- Image uploads for facilities (admin create/update): API clients use `FormData` to upload `images[]`. The admin facility form enforces client-side validation (file types, size) and a maximum of 2 images (both create and update flows) to avoid server-side errors.
- Facility detail and booking: clicking a facility fetches details via `facilityApi.getById(id)` then opens the detail/booking modal.

## Admin: Manage Facilities
- Admin UI for facilities is at `app/dashboard/admin/facilities/page.tsx`.
- Features:
  - Create / Edit facility modal (`FacilityFormModal` in the same file). The modal handles validation and file upload using `FormData`.
  - Image upload limits: the frontend enforces a maximum of 2 images and validates file type and size (<= 5MB).
  - When editing a facility, the form now allows changing `campusId` (the frontend sends `campusId` in update FormData). The backend must accept and process `campusId` on update.

## Troubleshooting & tips
- If the backend returns an error when uploading multiple images, check the network request (DevTools → Network) — ensure FormData contains only up to 2 `images` fields and the `images` fields are proper file entries.
- If campus-specific filtering doesn't apply, verify:
  - The `user` object stored in `storage` includes `campusId` (string) and the frontend sends it in query parameters.
  - Backend accepts `campusId` query param and filters results.
- For CORS or auth header issues, check `lib/api-client.ts` and backend configuration (appsettings / CORS settings).

## Developer notes
- Adding a new API resource: create `lib/api/<resource>.ts` with functions, then add a `hooks/use-<resource>.ts` hook to wrap the API and provide `isLoading`/`error` states.
- When a request accepts files, the frontend uses `FormData` and `getAuthHeaders('multipart/form-data')` to avoid setting `Content-Type` (browser sets boundary automatically).
- Keep server-side validation as the source of truth (frontend validations are conveniences and safeguards).

## Contributing
- Follow existing patterns: components should be stateless where possible and use hooks for data and actions.
- Run `pnpm dev` and use the browser devtools network tab to inspect FormData for uploads.

