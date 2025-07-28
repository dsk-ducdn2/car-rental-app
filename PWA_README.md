# Progressive Web App (PWA) Configuration

## Tổng quan

Ứng dụng Car Rental đã được cấu hình như một Progressive Web App (PWA), cho phép người dùng:

- **Cài đặt ứng dụng** trên thiết bị (desktop, mobile)
- **Sử dụng offline** khi không có kết nối internet
- **Nhận thông báo cập nhật** khi có phiên bản mới
- **Truy cập nhanh** từ màn hình chính

## Tính năng PWA đã triển khai

### 1. Manifest Configuration
- **Tên ứng dụng**: Car Rental App
- **Short name**: CarRental
- **Theme color**: #3b82f6 (Blue)
- **Background color**: #1f2937 (Dark gray)
- **Display mode**: Standalone (chạy như ứng dụng native)
- **Orientation**: Portrait-primary
- **Scope**: Toàn bộ ứng dụng

### 2. Service Worker
- **Auto update**: Tự động cập nhật khi có phiên bản mới
- **Cache strategy**: Cache-first cho fonts và assets
- **Offline support**: Hoạt động offline với dữ liệu đã cache

### 3. Install Prompt
- **Tự động hiển thị** khi đáp ứng điều kiện cài đặt
- **Giao diện thân thiện** với ngôn ngữ tiếng Việt
- **Tùy chọn cài đặt/hủy** cho người dùng

### 4. Update Notifications
- **Thông báo cập nhật** khi có phiên bản mới
- **Thông báo offline ready** khi sẵn sàng hoạt động offline
- **Tùy chọn reload** để áp dụng cập nhật

## Cách sử dụng

### Cho người dùng:

1. **Cài đặt ứng dụng**:
   - Trên Chrome/Edge: Nhấn vào icon cài đặt trên thanh địa chỉ
   - Trên mobile: Chọn "Thêm vào màn hình chính"
   - Hoặc sử dụng prompt "Cài đặt" trong ứng dụng

2. **Sử dụng offline**:
   - Ứng dụng sẽ cache dữ liệu cần thiết
   - Hoạt động bình thường khi không có internet
   - Dữ liệu sẽ sync khi có kết nối trở lại

3. **Cập nhật ứng dụng**:
   - Nhận thông báo khi có cập nhật mới
   - Nhấn "Cập nhật" để áp dụng phiên bản mới

### Cho developer:

1. **Build và deploy**:
   ```bash
   npm run build
   npm run preview
   ```

2. **Test PWA**:
   - Sử dụng Chrome DevTools > Application tab
   - Kiểm tra Manifest và Service Worker
   - Test offline functionality

3. **Customize**:
   - Chỉnh sửa `manifest.json` cho thông tin ứng dụng
   - Cập nhật icons trong `public/icons/`
   - Tùy chỉnh cache strategy trong `vite.config.ts`

## Cấu trúc file

```
public/
├── manifest.json          # PWA manifest
├── icons/                 # App icons
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   ├── browserconfig.xml  # Windows tile config
│   └── safari-pinned-tab.svg
└── images/
    └── dashboard.png      # Screenshot cho app store

src/
├── components/
│   ├── PWAInstallPrompt.tsx    # Install prompt UI
│   ├── PWAUpdatePrompt.tsx     # Update notifications
│   └── PWAInfo.tsx            # PWA status display
├── root.tsx                    # PWA components integration
└── components/router-head/
    └── router-head.tsx        # PWA meta tags
```

## Browser Support

- ✅ Chrome/Chromium (Android, Desktop)
- ✅ Edge (Windows, Android)
- ✅ Safari (iOS, macOS)
- ✅ Firefox (Desktop, Android)
- ⚠️ Samsung Internet (một số tính năng hạn chế)

## Best Practices

1. **Performance**:
   - Sử dụng lazy loading cho components
   - Optimize images và assets
   - Minimize bundle size

2. **User Experience**:
   - Hiển thị loading states
   - Cung cấp offline feedback
   - Smooth transitions

3. **Security**:
   - Sử dụng HTTPS (bắt buộc cho PWA)
   - Validate input data
   - Secure API calls

## Troubleshooting

### PWA không hiển thị install prompt:
- Kiểm tra HTTPS
- Đảm bảo manifest.json hợp lệ
- Test trên Chrome DevTools

### Service Worker không hoạt động:
- Clear browser cache
- Kiểm tra console errors
- Verify workbox configuration

### Offline không hoạt động:
- Kiểm tra cache strategy
- Verify network requests
- Test với DevTools > Network > Offline

## Tài liệu tham khảo

- [MDN Web Docs - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa.dev/)
- [Workbox](https://developers.google.com/web/tools/workbox) 