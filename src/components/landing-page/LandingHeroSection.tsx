import { component$ } from '@builder.io/qwik';

export default component$(() => (
  <section class="flex-1 flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-12 md:py-0 max-w-7xl mx-auto w-full">
    {/* Left */}
    <div class="flex-1 flex flex-col justify-center max-w-xl pt-8 md:pt-0">
      <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
        Self-Drive Car Rental Management System for Businesses
      </h1>
      <p class="text-lg text-gray-700 mb-6 max-w-md">
        Empower your car rental business with an all-in-one platform: streamline fleet operations, manage customers and contracts, automate bookings, and gain actionable insights with advanced reporting. Boost efficiency and maximize your revenue with our modern SaaS solution.
      </p>
      <div class="flex gap-3 mb-8">
        <a href="#" aria-label="Get it on Google Play">
          <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" class="h-12" />
        </a>
        <a href="#" aria-label="Download on the App Store">
          <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" class="h-12" />
        </a>
      </div>
      <div class="hidden md:block h-8"></div>
    </div>
    {/* Right - Car image */}
    <div class="flex-1 flex justify-center items-center relative">
      <div class="absolute -top-8 -right-8 w-[420px] h-[420px] bg-[#e6f0ff] rounded-full z-0 hidden md:block"></div>
      <img
        src="https://stimg.cardekho.com/images/carexteriorimages/930x620/Porsche/911/11757/1717680690776/front-left-side-47.jpg"
        alt="Porsche Car"
        class="relative z-10 w-[420px] max-w-full drop-shadow-2xl"
        style={{ filter: 'drop-shadow(0 8px 32px rgba(37,99,235,0.18))' }}
      />
    </div>
  </section>
)); 