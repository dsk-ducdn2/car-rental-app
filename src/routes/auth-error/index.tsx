import { component$ } from '@builder.io/qwik';

export default component$(() => {
  return (
    <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div class="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md w-full border border-red-100">
        <div class="flex justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
          </svg>
        </div>
        <h1 class="text-2xl font-extrabold text-red-600 mb-2">Authentication Error</h1>
        <p class="mb-6 text-gray-700 text-base">Phiên đăng nhập của bạn đã hết hạn hoặc không hợp lệ.</p>
        <a href="/login" class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors duration-200">Đăng nhập lại</a>
      </div>
    </div>
  );
}); 