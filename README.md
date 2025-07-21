# CarRental - Progressive Web App

Ứng dụng cho thuê xe trực tuyến được xây dựng bằng Qwik framework và Tailwind CSS với đầy đủ tính năng PWA.

## 🌟 Tính năng chính

### 🎯 Giao diện người dùng
- **Landing Page** đẹp mắt với hero section và showcase xe nổi bật
- **Responsive Design** tối ưu cho mobile và desktop
- **Modern UI** với Tailwind CSS và component system
- **Dark/Light mode** support (có thể mở rộng)

### 👥 Hệ thống người dùng
- **Đăng ký/Đăng nhập** với validation
- **Phân quyền**: Admin, Staff, Owner, Customer
- **Xác minh danh tính** với upload documents
- **Quản lý profile** và settings

### 🚗 Quản lý xe
- **CRUD xe** với đầy đủ thông tin
- **Trạng thái xe**: Available, Rented, Reserved, Maintenance
- **Tìm kiếm và lọc** xe theo nhiều tiêu chí
- **Upload hình ảnh** và documents

### 💰 Hệ thống giá và thanh toán
- **Giá linh hoạt**: theo giờ, ngày, tháng
- **Chính sách giá** đặc biệt cho ngày lễ, cuối tuần
- **Thanh toán online** (mô phỏng)
- **Đặt cọc** và refund

### 📊 Dashboard và Báo cáo
- **Thống kê real-time** cho Admin/Owner
- **Biểu đồ** doanh thu và hiệu suất
- **Cảnh báo** xe sắp bảo trì
- **Báo cáo** chi tiết

### 🛠️ Bảo trì và Quản lý
- **Lịch bảo dưỡng** tự động
- **Log sửa chữa** và chi phí
- **Nhắc nhở** bảo trì định kỳ

### 📱 PWA Features
- **Offline support** với service worker
- **Install prompt** cho mobile
- **Push notifications**
- **Background sync**
- **App-like experience**

## 🛠️ Công nghệ sử dụng

- **Frontend**: Qwik + Qwik City
- **Styling**: Tailwind CSS
- **Icons**: Lucide Qwik
- **PWA**: Service Worker + Manifest
- **TypeScript**: Full type safety
- **Date handling**: date-fns

## 📁 Cấu trúc dự án

```
src/
├── components/
│   ├── ui/           # UI components (Button, Input, Card, Modal)
│   ├── layout/       # Layout components (Header, Footer, Sidebar)
│   ├── forms/        # Form components
│   ├── cars/         # Car-related components
│   └── dashboard/    # Dashboard components
├── routes/           # Page routes
├── types/            # TypeScript interfaces
├── utils/            # Utility functions
├── lib/              # Third-party libraries
└── hooks/            # Custom hooks
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm start
```

### Build production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## 📱 PWA Features

### Service Worker
- **Cache strategy**: Network first cho API, Cache first cho static files
- **Offline support**: Trang offline và cached content
- **Background sync**: Đồng bộ dữ liệu khi online trở lại

### Manifest
- **App icons**: Đầy đủ kích thước cho các thiết bị
- **Shortcuts**: Tìm xe, Đặt xe, Dashboard
- **Theme colors**: Blue theme (#2563eb)

### Install Prompt
- **Auto-detect**: Tự động phát hiện khi có thể install
- **Custom UI**: Giao diện đẹp mắt
- **User choice**: Cho phép user chọn install hoặc dismiss

## 🎨 UI Components

### Button
```tsx
<Button variant="primary" size="lg" loading={true}>
  Click me
</Button>
```

### Input
```tsx
<Input 
  label="Email" 
  type="email" 
  error="Email không hợp lệ"
  leftIcon={<MailIcon />}
/>
```

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

### Modal
```tsx
<Modal isOpen={true} onClose={() => {}} title="Modal Title">
  Content
</Modal>
```

## 🔐 Authentication

### User Roles
- **Admin**: Quản trị toàn bộ hệ thống
- **Staff**: Quản lý xe và đơn hàng
- **Owner**: Quản lý xe của mình
- **Customer**: Thuê xe và quản lý đơn hàng

### Document Verification
- **CCCD/CMND**: Bắt buộc cho tất cả users
- **Driver License**: Bắt buộc cho customers
- **Business License**: Bắt buộc cho owners

## 🚗 Car Management

### Car Properties
- **Basic info**: Brand, model, year, license plate
- **Specifications**: Seats, fuel type, transmission
- **Pricing**: Hourly, daily, monthly rates
- **Status**: Available, Rented, Reserved, Maintenance
- **Location**: GPS coordinates và address
- **Documents**: Insurance, registration, inspection

### Car Features
- **Image gallery**: Multiple images per car
- **Rating system**: User reviews và ratings
- **Availability calendar**: Real-time booking status
- **Maintenance history**: Service records

## 💳 Payment System

### Pricing Models
- **Hourly**: Cho thuê ngắn hạn
- **Daily**: Cho thuê theo ngày
- **Monthly**: Cho thuê dài hạn
- **Special rates**: Ngày lễ, cuối tuần

### Payment Methods
- **Credit/Debit cards**: Visa, Mastercard
- **Digital wallets**: Momo, ZaloPay
- **Bank transfer**: Direct transfer
- **Cash**: On-site payment

## 📊 Dashboard Analytics

### Admin Dashboard
- **Revenue metrics**: Daily, weekly, monthly
- **Car utilization**: Usage rates per car
- **User statistics**: Registration, activity
- **System health**: Maintenance alerts

### Owner Dashboard
- **My cars**: Performance của xe sở hữu
- **Revenue**: Doanh thu từ xe
- **Bookings**: Lịch đặt xe
- **Maintenance**: Lịch bảo trì

## 🔧 Development

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality rules
- **Prettier**: Code formatting
- **Conventional commits**: Git commit messages

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Linting
```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📱 PWA Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Check Service Workers, Manifest, Storage

### Lighthouse
```bash
# Install Lighthouse globally
npm install -g lighthouse

# Run audit
lighthouse https://your-app.com --view
```

### PWA Checklist
- ✅ Manifest file
- ✅ Service Worker
- ✅ HTTPS
- ✅ Responsive design
- ✅ Fast loading
- ✅ Offline functionality

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Qwik](https://qwik.dev/) - The amazing framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Beautiful icons
- [date-fns](https://date-fns.org/) - Date utilities

## 📞 Support

- **Email**: support@carrental.vn
- **Phone**: +84 123 456 789
- **Documentation**: [docs.carrental.vn](https://docs.carrental.vn)

---

Made with ❤️ by CarRental Team
