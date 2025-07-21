import { component$ } from '@builder.io/qwik';

export default component$(() => (
  <section class="py-24 bg-white">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 px-4">
      {/* Left: Car image */}
      <div class="flex-1 flex justify-center items-center relative">
        <img src="https://cdn.motor1.com/images/mgl/vxoJ0Y/s1/2023-audi-r8-v10-gt-rwd.jpg" alt="Audi R8" class="w-full max-w-md rounded-2xl shadow-xl" />
        <svg class="absolute -z-10 left-0 top-0 w-full h-full" viewBox="0 0 600 600" fill="none"><polygon points="0,0 600,0 600,600 0,300" fill="#e6f0ff" /></svg>
      </div>
      {/* Right: Content */}
      <div class="flex-1 max-w-xl">
        <span class="px-5 py-1 rounded-lg bg-[#e6f0ff] text-[#2563eb] font-semibold text-sm mb-4 inline-block">WHY CHOOSE US</span>
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Why Choose Our Car Rental Management System?</h2>
        <div class="space-y-7">
          {/* Reason 1 */}
          <div class="flex items-start gap-4">
            <div class="bg-[#e6f0ff] rounded-xl p-3 flex items-center justify-center">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2563eb" fill-opacity="0.12"/><path d="M12 17a1 1 0 0 1-1-1v-2.586l-1.293 1.293a1 1 0 0 1-1.414-1.414l3-3a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.414L13 13.414V16a1 1 0 0 1-1 1Z" fill="#2563eb"/></svg>
            </div>
            <div>
              <div class="font-semibold text-base mb-1">Comprehensive Fleet Management</div>
              <div class="text-gray-500 text-sm">Easily manage your entire vehicle fleet, track availability, assign vehicles, and monitor usage in real time.</div>
            </div>
          </div>
          {/* Reason 2 */}
          <div class="flex items-start gap-4">
            <div class="bg-[#e6f0ff] rounded-xl p-3 flex items-center justify-center">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2563eb" fill-opacity="0.12"/><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-2.67 0-8 1.34-8 4v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2c0-2.66-5.33-4-8-4Z" fill="#2563eb"/></svg>
            </div>
            <div>
              <div class="font-semibold text-base mb-1">Maintenance & Service Tracking</div>
              <div class="text-gray-500 text-sm">Schedule and track vehicle maintenance, receive automated reminders, and keep detailed service history for every car.</div>
            </div>
          </div>
          {/* Reason 3 */}
          <div class="flex items-start gap-4">
            <div class="bg-[#e6f0ff] rounded-xl p-3 flex items-center justify-center">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2563eb" fill-opacity="0.12"/><path d="M17 10V7a5 5 0 0 0-10 0v3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2Zm-5 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" fill="#2563eb"/></svg>
            </div>
            <div>
              <div class="font-semibold text-base mb-1">Advanced Analytics & Reporting</div>
              <div class="text-gray-500 text-sm">Gain insights into your business with real-time dashboards, revenue reports, fleet utilization, and customer analytics.</div>
            </div>
          </div>
          {/* Reason 4 */}
          <div class="flex items-start gap-4">
            <div class="bg-[#e6f0ff] rounded-xl p-3 flex items-center justify-center">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2563eb" fill-opacity="0.12"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" fill="#2563eb"/></svg>
            </div>
            <div>
              <div class="font-semibold text-base mb-1">Contract & Customer Management</div>
              <div class="text-gray-500 text-sm">Easily manage customer profiles, rental contracts, and payment history in one secure platform.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)); 