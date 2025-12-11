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

### 2. Tạo file environment variables

**Bạn có thể dùng `.env` HOẶC `.env.local`** - cả hai đều hoạt động. 

**Sự khác biệt**:
- `.env.local`: Theo convention của Next.js, dùng cho config local (cá nhân), ưu tiên cao nhất
- `.env`: Dùng cho config mặc định

**Khuyến nghị**: Dùng `.env` nếu bạn muốn đơn giản hơn, hoặc `.env.local` nếu bạn muốn theo convention của Next.js.

Tạo file `.env` (hoặc `.env.local`) trong thư mục root với nội dung sau:

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
5. Copy các giá trị trong `firebaseConfig` object và paste vào `.env` (hoặc `.env.local`)
6. Vào tab **Cloud Messaging** > Copy **VAPID key** (Web Push certificates) và paste vào `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

### 4. Generate Firebase Service Worker

**QUAN TRỌNG**: Sau khi tạo `.env` hoặc `.env.local`, bạn **PHẢI** chạy script để generate service worker:

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

1. **Đảm bảo đã tạo `.env` hoặc `.env.local`** với đầy đủ Firebase config
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
- `env.example` (file mẫu)

❌ **KHÔNG commit**:
- `firebase-messaging-sw.js` (file được generate, sẽ tự động tạo khi chạy script)
- `.env` hoặc `.env.local` (chứa thông tin bảo mật, đã được ignore trong .gitignore)

## 📝 Scripts có sẵn

- `npm run dev` - Chạy development server (tự động generate service worker trước khi start)
- `npm run build` - Build production (tự động generate service worker trước khi build)
- `npm run generate-sw` - Generate service worker từ template và .env.local
- `npm run lint` - Chạy ESLint

## 🔍 Troubleshooting

### Lỗi: "Firebase config is missing"
- Kiểm tra file `.env` hoặc `.env.local` có đầy đủ các biến môi trường không
- Đảm bảo tên biến bắt đầu bằng `NEXT_PUBLIC_`
- Lưu ý: Script `generate-sw.js` đọc cả `.env.local` (ưu tiên) và `.env`, Next.js cũng tự động load cả hai

### Lỗi: "Service worker không được đăng ký"
- Kiểm tra file `public/firebase-messaging-sw.js` có tồn tại không
- Xóa cache service worker và reload lại trang
- Đảm bảo đang chạy trên HTTPS hoặc localhost (service worker yêu cầu secure context)

### Notifications không nhận được
- Kiểm tra đã cho phép notifications trong browser chưa
- Kiểm tra FCM token đã được đăng ký với backend chưa
- Kiểm tra backend có gửi notification đến đúng FCM token không

## 🚀 Deploy lên Vercel

### 1. Chuẩn bị

Đảm bảo project của bạn đã:
- ✅ Push code lên GitHub/GitLab/Bitbucket
- ✅ Test local thành công
- ✅ Có tài khoản Vercel (miễn phí tại [vercel.com](https://vercel.com))

### 2. Deploy từ Vercel Dashboard

1. **Đăng nhập Vercel** và click **"Add New Project"**
2. **Import Git Repository** - chọn repository của bạn
3. **Configure Project**:
   - Framework Preset: **Next.js** (tự động detect)
   - Root Directory: `./` (hoặc để mặc định)
   - Build Command: `npm run build` (mặc định)
   - Output Directory: `.next` (mặc định)

### 3. Cấu hình Environment Variables

**QUAN TRỌNG**: Bạn **PHẢI** set environment variables trong Vercel dashboard trước khi deploy:

1. Trong Vercel project settings, vào **Settings** > **Environment Variables**
2. Thêm tất cả các biến môi trường sau (chọn cho **Production**, **Preview**, và **Development**):

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_API_TIMEOUT=30000

NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

3. **Lưu ý**: 
   - `NEXT_PUBLIC_API_URL` phải là URL production của backend API (không phải `localhost`)
   - Đảm bảo backend API đã được deploy và cho phép CORS từ domain Vercel của bạn

### 4. Service Worker tự động generate

**Tin tốt**: Service worker sẽ **tự động được generate** khi Vercel build project!

- Script `prebuild` trong `package.json` sẽ tự động chạy `npm run generate-sw` trước khi build
- Script `generate-sw.js` sẽ đọc environment variables từ Vercel và generate `firebase-messaging-sw.js`
- File này sẽ được include trong build và serve từ `/firebase-messaging-sw.js`

### 5. Deploy và kiểm tra

1. Click **Deploy** trong Vercel
2. Chờ build hoàn thành (xem logs để đảm bảo `generate-sw` chạy thành công)
3. Sau khi deploy xong, kiểm tra:
   - ✅ Trang web load được
   - ✅ API calls hoạt động (kiểm tra Network tab)
   - ✅ Service worker được đăng ký (DevTools > Application > Service Workers)
   - ✅ Notifications hoạt động (nếu đã setup)

### 6. Cấu hình Backend API (CORS)

**QUAN TRỌNG**: Backend API của bạn phải cho phép CORS từ domain Vercel:

Ví dụ trong backend (nếu dùng .NET):

```csharp
// Trong appsettings.json hoặc environment variables
"Cors": {
  "AllowedOrigins": [
    "http://localhost:3000",
    "https://your-app.vercel.app",  // Domain Vercel của bạn
    "https://your-custom-domain.com" // Nếu có custom domain
  ]
}
```

### 7. Custom Domain (Optional)

Nếu bạn muốn dùng custom domain:

1. Trong Vercel project, vào **Settings** > **Domains**
2. Thêm domain của bạn
3. Follow hướng dẫn để config DNS
4. Update CORS settings trong backend để include custom domain

### 8. Environment Variables cho các môi trường khác nhau

Bạn có thể set environment variables khác nhau cho:
- **Production**: Cho production domain
- **Preview**: Cho preview deployments (từ branches/PRs)
- **Development**: Cho local development (nếu dùng Vercel CLI)

Ví dụ:
- Production: `NEXT_PUBLIC_API_URL=https://api.production.com/api`
- Preview: `NEXT_PUBLIC_API_URL=https://api.staging.com/api`
- Development: `NEXT_PUBLIC_API_URL=http://localhost:5001/api`

### 9. Troubleshooting khi deploy

#### Lỗi: "Firebase config is missing" trong build logs
- ✅ Kiểm tra đã set tất cả Firebase environment variables trong Vercel chưa
- ✅ Đảm bảo tên biến đúng chính xác (case-sensitive)

#### Lỗi: "Service worker không được đăng ký" sau khi deploy
- ✅ Kiểm tra build logs có chạy `generate-sw` thành công không
- ✅ Kiểm tra file `/firebase-messaging-sw.js` có accessible không (mở URL: `https://your-app.vercel.app/firebase-messaging-sw.js`)
- ✅ Đảm bảo đang dùng HTTPS (Vercel tự động cung cấp)

#### API calls bị CORS error
- ✅ Kiểm tra backend đã cho phép origin từ Vercel domain chưa
- ✅ Kiểm tra `NEXT_PUBLIC_API_URL` đúng URL production chưa

#### Notifications không hoạt động trên production
- ✅ Đảm bảo đã set đầy đủ Firebase environment variables
- ✅ Kiểm tra Firebase project settings có cho phép domain Vercel không
- ✅ Kiểm tra service worker đã được đăng ký trong browser chưa

### 10. Continuous Deployment

Sau khi setup xong, mỗi khi bạn push code lên Git:
- Vercel sẽ tự động detect changes
- Tự động chạy build với environment variables đã set
- Tự động deploy lên production (nếu push vào main/master branch)
- Hoặc tạo preview deployment (nếu push vào branch khác)

**Lưu ý**: Service worker sẽ được generate lại mỗi lần build, nên đảm bảo environment variables luôn được set đúng trong Vercel dashboard.
