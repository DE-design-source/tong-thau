# Hướng dẫn bật backend Firebase (đăng nhập + lưu dữ liệu thật)

Khi **chưa** cấu hình, hệ thống chạy ở **chế độ DEMO** (dữ liệu lưu trên trình duyệt, đăng nhập admin bằng mật khẩu `demo`). Làm theo các bước dưới để chuyển sang backend thật.

## 1. Tạo project Firebase
1. Vào https://console.firebase.google.com → **Add project** → đặt tên (vd `nha-thau`) → tạo.
2. Trong project, bấm biểu tượng **</>** (Web) để "Add app" → đặt nickname → **Register app**.
3. Firebase hiện đoạn `firebaseConfig = { apiKey: ... }`. **Copy các giá trị này.**

## 2. Dán config vào web
Mở file `firebase-config.js` trong repo, điền các giá trị vừa copy:
```js
window.FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "nha-thau.firebaseapp.com",
  projectId: "nha-thau",
  storageBucket: "nha-thau.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123...:web:abc..."
};
```
> apiKey của Firebase Web là **công khai được** — không phải bí mật, nên commit lên GitHub bình thường.

## 3. Bật đăng nhập (Authentication)
1. Firebase Console → **Build → Authentication → Get started**.
2. Tab **Sign-in method** → bật **Email/Password** → Save.
3. Tab **Users → Add user** → nhập email + mật khẩu cho tài khoản admin của bạn. Đây là tài khoản dùng để đăng nhập trang `admin.html`.

## 4. Tạo database (Firestore)
1. Firebase Console → **Build → Firestore Database → Create database**.
2. Chọn location gần Việt Nam (vd `asia-southeast1`) → bắt đầu ở **Production mode**.
3. Vào tab **Rules**, dán quy tắc sau rồi **Publish**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contractors/{id} {
      allow read: if true;                 // ai cũng xem được hồ sơ
      allow write: if request.auth != null; // chỉ admin đã đăng nhập mới sửa
    }
  }
}
```

## 5. Đưa dữ liệu mẫu lên
1. Push code (`./push.sh`), mở `admin.html` trên web → đăng nhập bằng tài khoản ở bước 3.
2. Lúc này database trống. Bấm **Nhập JSON** → chọn file `data/contractors.json` để nạp 2 nhà thầu mẫu (Vietcons, Kiến Phong).
3. Xong! Thêm/sửa nhà thầu trực tiếp, user sẽ thấy ngay ở trang danh bạ (không cần push nữa).

## Ảnh nhà thầu
- Cách nhanh: dán **URL ảnh** (từ website nhà thầu hoặc dịch vụ ảnh) vào ô Cover/Hero/Dự án.
- Hoặc bỏ ảnh vào thư mục `contractors/<ten>/img/` trong repo, push, rồi dùng đường dẫn `contractors/<ten>/img/anh.jpg`.

## Ghi chú
- Muốn đổi mật khẩu admin: Firebase Console → Authentication → Users.
- Quên bước 4 (Rules) sẽ khiến admin không lưu được — nhớ Publish rules.
