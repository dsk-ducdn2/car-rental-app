import { component$ } from '@builder.io/qwik';

export default component$(() => {
  // Mock xe nổi bật
  const featuredCars = [
    {
      image: '/car1.jpg',
      name: 'Toyota Vios 2022',
      price: 700000,
    },
    {
      image: '/car2.jpg',
      name: 'Kia Morning 2021',
      price: 600000,
    },
    {
      image: '/car3.jpg',
      name: 'Mazda CX-5 2023',
      price: 1200000,
    },
  ];
  return (
    <>
      {/* Hero Section */}
      <div class="relative min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-400 text-white">
        <a href="/landing" class="absolute top-4 right-4 px-4 py-2 bg-white text-indigo-700 font-bold rounded-lg shadow hover:bg-indigo-50 transition z-20">Trang quảng cáo doanh nghiệp</a>
        <img src="/banner-car.jpg" alt="Car Banner" class="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div class="relative z-10 text-center max-w-2xl px-4">
          <h1 class="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Thuê xe tự lái Mioto Demo</h1>
          <p class="text-lg md:text-2xl mb-8 drop-shadow">Đặt xe nhanh, giá tốt, thủ tục đơn giản. Trải nghiệm dịch vụ thuê xe hàng đầu Việt Nam.</p>
          <div class="flex flex-col md:flex-row gap-4 justify-center">
            <a href="/login" class="px-8 py-3 bg-white text-indigo-700 font-bold rounded-lg shadow hover:bg-indigo-50 transition">Đăng nhập</a>
            <a href="/register" class="px-8 py-3 bg-indigo-700 text-white font-bold rounded-lg shadow hover:bg-indigo-800 transition">Đăng ký</a>
          </div>
        </div>
      </div>

      {/* Lợi ích */}
      <section class="py-12 bg-white">
        <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <img src="/icons/car.svg" class="mx-auto mb-2 w-12 h-12" />
            <div class="font-bold text-lg">Đa dạng xe</div>
            <div class="text-gray-500">Hơn 100+ mẫu xe, đủ mọi nhu cầu</div>
          </div>
          <div>
            <img src="/icons/price.svg" class="mx-auto mb-2 w-12 h-12" />
            <div class="font-bold text-lg">Giá tốt</div>
            <div class="text-gray-500">So sánh, chọn giá phù hợp</div>
          </div>
          <div>
            <img src="/icons/support.svg" class="mx-auto mb-2 w-12 h-12" />
            <div class="font-bold text-lg">Hỗ trợ 24/7</div>
            <div class="text-gray-500">Tư vấn, cứu hộ mọi lúc</div>
          </div>
          <div>
            <img src="/icons/insurance.svg" class="mx-auto mb-2 w-12 h-12" />
            <div class="font-bold text-lg">Bảo hiểm đầy đủ</div>
            <div class="text-gray-500">An tâm di chuyển</div>
          </div>
        </div>
      </section>

      {/* Quy trình */}
      <section class="py-12 bg-indigo-50">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-2xl font-bold mb-6 text-indigo-700">Quy trình thuê xe đơn giản</h2>
          <div class="flex flex-col md:flex-row gap-8 justify-center">
            <div>
              <div class="text-3xl font-bold text-indigo-600 mb-2">1</div>
              <div class="font-semibold">Đăng ký tài khoản</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-indigo-600 mb-2">2</div>
              <div class="font-semibold">Tìm xe phù hợp</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-indigo-600 mb-2">3</div>
              <div class="font-semibold">Đặt xe & xác nhận</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-indigo-600 mb-2">4</div>
              <div class="font-semibold">Nhận xe & trải nghiệm</div>
            </div>
          </div>
        </div>
      </section>

      {/* Xe nổi bật */}
      <section class="py-12 bg-white">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-2xl font-bold mb-6 text-indigo-700 text-center">Xe nổi bật</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <div class="bg-indigo-50 rounded-lg shadow p-4 text-center" key={car.name}>
                <img src={car.image} class="w-full h-40 object-cover rounded mb-2" />
                <div class="font-bold text-lg">{car.name}</div>
                <div class="text-indigo-600 font-semibold mb-2">{car.price.toLocaleString()}đ/ngày</div>
                <a href="#" class="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Xem chi tiết</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nút quản trị */}
      <section class="mt-10">
        <h2 class="text-lg font-semibold mb-2 text-indigo-700 text-center">Trang quản trị</h2>
        <div class="flex flex-wrap gap-2 justify-center">
          <a href="/admin-vehicles" class="px-4 py-2 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition">Quản lý xe</a>
          <a href="/admin-vehicles/flexible-price" class="px-4 py-2 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition">Giá thuê linh hoạt</a>
          <a href="/admin-companies" class="px-4 py-2 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition">Quản lý doanh nghiệp</a>
          <a href="/admin-stats" class="px-4 py-2 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition">Thống kê</a>
        </div>
      </section>

      {/* Footer */}
      <footer class="py-8 bg-indigo-900 text-white text-center mt-12">
        © 2025 Qwik Demo PWA. Inspired by <a href="https://www.mioto.vn/" class="underline">mioto.vn</a>
      </footer>
    </>
  );
});
