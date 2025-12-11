# 🔧 Hướng dẫn Setup Project

## 📋 Yêu cầu

- Node.js 18+ 
- npm hoặc pnpm
- Firebase project (cho notifications)

## 🚀 Cài đặt

### 1. Clone và cài đặt dependencies

```bash
git clone <repository-url>
cd nextjs-booking-swp391-fe
npm install
# hoặc
pnpm install
```

### 2. Tạo file `.env.local`

Tạo file `.env.local` trong thư mục root với nội dung sau:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Firebase Configuration
# Lấy từ Firebase Console > Project Settings > General > Your apps > Web app
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase VAPID Key (Web Push Certificate)
# Lấy từ Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

### 3. Lấy Firebase Configuration

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Project Settings** (⚙️) > **General**
4. Scroll xuống **Your apps** > Chọn Web app hoặc click **Add app** nếu chưa có
5. Copy các giá trị trong `firebaseConfig` object và paste vào `.env.local`
6. Vào tab **Cloud Messaging** > Copy **VAPID key** (Web Push certificates) và paste vào `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

### 4. Generate Firebase Service Worker

**QUAN TRỌNG**: Sau khi tạo `.env.local`, bạn **PHẢI** chạy script để generate service worker:

```bash
npm run generate-sw
```

Script này sẽ tự động chạy khi bạn chạy `npm run dev` hoặc `npm run build` (nhờ `predev` và `prebuild` hooks), nhưng nếu bạn pull code về và chưa chạy dev/build lần nào, hãy chạy thủ công lệnh trên.

### 5. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## ⚠️ Lưu ý quan trọng

### Vấn đề thường gặp: Notifications không hoạt động

**Nguyên nhân**: File `firebase-messaging-sw.js` không được generate hoặc được generate với config sai.

**Giải pháp**:

1. **Đảm bảo đã tạo `.env.local`** với đầy đủ Firebase config
2. **Chạy script generate service worker**:
   ```bash
   npm run generate-sw
   ```
3. **Kiểm tra file `public/firebase-messaging-sw.js`** có được generate chưa
4. **Xóa cache service worker** trong browser:
   - Mở DevTools (F12)
   - Vào tab **Application** > **Service Workers**
   - Click **Unregister** cho các service worker cũ
   - Hard refresh (Ctrl+Shift+R hoặc Cmd+Shift+R)

### File nào cần commit, file nào không?

✅ **Commit vào git**:
- `firebase-messaging-sw.template.js` (template file)
- `scripts/generate-sw.js` (script generate)
- `.env.local` - **KHÔNG**, file này đã được ignore

❌ **KHÔNG commit**:
- `firebase-messaging-sw.js` (file được generate, sẽ tự động tạo khi chạy script)
- `.env.local` (chứa thông tin bảo mật)

## 📝 Scripts có sẵn

- `npm run dev` - Chạy development server (tự động generate service worker trước khi start)
- `npm run build` - Build production (tự động generate service worker trước khi build)
- `npm run generate-sw` - Generate service worker từ template và .env.local
- `npm run lint` - Chạy ESLint

## 🔍 Troubleshooting

### Lỗi: "Firebase config is missing"
- Kiểm tra file `.env.local` có đầy đủ các biến môi trường không
- Đảm bảo tên biến bắt đầu bằng `NEXT_PUBLIC_`

### Lỗi: "Service worker không được đăng ký"
- Kiểm tra file `public/firebase-messaging-sw.js` có tồn tại không
- Xóa cache service worker và reload lại trang
- Đảm bảo đang chạy trên HTTPS hoặc localhost (service worker yêu cầu secure context)

### Notifications không nhận được
- Kiểm tra đã cho phép notifications trong browser chưa
- Kiểm tra FCM token đã được đăng ký với backend chưa
- Kiểm tra backend có gửi notification đến đúng FCM token không

