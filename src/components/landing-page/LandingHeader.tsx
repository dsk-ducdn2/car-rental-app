import { component$, useSignal } from '@builder.io/qwik';
import ThemeToggle from '../ThemeToggle';

export default component$(() => {
  const open = useSignal(false);
  return (
    <header class="w-full px-4 sm:px-6 md:px-8 py-4 md:py-6 flex items-center bg-white shadow-sm sticky top-0 z-20">
      <a href="#" class="flex items-center gap-2 flex-shrink-0" style={{textDecoration:'none'}}>
        <img src="/favicon.svg" alt="Logo" class="w-8 h-8" />
        <span class="text-xl font-bold text-[#2563eb] tracking-tight">RENTCARS</span>
      </a>
      {/* Desktop nav */}
      <nav class="hidden md:flex gap-10 text-base font-medium flex-1 items-center justify-center">
        <a href="#service-intro" class="hover:text-[#2563eb] transition">Service Introduction Video</a>
        <a href="#why-choose-us" class="hover:text-[#2563eb] transition">Why Choose Us</a>
        <a href="#comparison" class="hover:text-[#2563eb] transition">Big step forward</a>
        <a href="#testimonials" class="hover:text-[#2563eb] transition">Testimonials</a>
        <a href="#register-section" class="ml-4 px-7 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-[#2d6fa3] to-[#23b6a0] flex items-center gap-2 shadow hover:opacity-90 transition border-0" style={{minWidth:'160px', justifyContent:'center', height:'44px'}}>
          Registration Form
          <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><path d="M7 11h8m0 0-3-3m3 3-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </nav>
      {/* Mobile hamburger */}
      <div class="hidden md:flex items-center ml-auto">
        <ThemeToggle />
      </div>
      <button class="md:hidden flex items-center p-2 ml-auto" onClick$={() => (open.value = !open.value)} aria-label="Open menu">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect y="5" width="24" height="2" rx="1" fill="#2563eb"/><rect y="11" width="24" height="2" rx="1" fill="#2563eb"/><rect y="17" width="24" height="2" rx="1" fill="#2563eb"/></svg>
      </button>
      {/* Mobile menu dropdown */}
      {open.value && (
        <div class="absolute top-full left-0 w-full bg-white shadow-lg flex flex-col items-center py-4 gap-4 md:hidden animate-fade-in z-30">
          <a href="#service-intro" class="text-base font-medium hover:text-[#2563eb] transition">Service Introduction Video</a>
          <a href="#why-choose-us" class="text-base font-medium hover:text-[#2563eb] transition">Why Choose Us</a>
          <a href="#comparison" class="text-base font-medium hover:text-[#2563eb] transition">Big step forward</a>
          <a href="#testimonials" class="text-base font-medium hover:text-[#2563eb] transition">Testimonials</a>
          <a href="#register-section" class="mt-2 px-7 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-[#2d6fa3] to-[#23b6a0] flex items-center gap-2 shadow hover:opacity-90 transition border-0" style={{minWidth:'160px', justifyContent:'center'}}>
            Registration Form
            <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><path d="M7 11h8m0 0-3-3m3 3-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <ThemeToggle />
        </div>
      )}
    </header>
  );
}); 