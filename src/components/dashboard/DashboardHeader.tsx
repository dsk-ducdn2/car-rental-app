import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';

function toTitleCase(str: string) {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const DashboardHeader = component$(() => {
  const loc = useLocation();
  // Lấy phần cuối của pathname làm breadcrumb
  const pathParts = loc.url.pathname.split('/').filter(Boolean);
  const lastPart = pathParts.length > 0 ? toTitleCase(pathParts[pathParts.length - 1]) : 'Dashboard';

  return (
    <header class="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-[#f8f9fa] min-h-[64px]">
      {/* Logo + Breadcrumb */}
      <div class="flex items-center min-w-0 gap-4">
        <div class="flex items-center gap-2 min-w-0">
          {/* Icon logo */}
          <svg width="28" height="28" fill="none" viewBox="0 0 32 32">
            {/* ...icon path... */}
          </svg>
          <span class="font-bold text-blue-700 uppercase text-base md:text-lg whitespace-nowrap">Soft UI Dashboard</span>
        </div>
        <div class="flex items-center text-gray-400 text-xs md:text-sm ml-4 md:ml-8 truncate">
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16" class="mr-1">
            {/* ...home icon... */}
          </svg>
          <span class="truncate"> / {lastPart}</span>
        </div>
      </div>
      {/* Search box */}
      <div class="flex items-center ml-auto">
        <div class="flex items-center border border-gray-300 rounded-lg bg-white px-2 md:px-3 py-1 w-32 md:w-56 shadow-sm">
          <svg class="text-gray-400 mr-2" width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m0 0A7 7 0 105 5a7 7 0 0011.65 11.65z" />
          </svg>
          <input
            type="text"
            placeholder="Type here..."
            class="outline-none border-none bg-transparent text-gray-700 w-full placeholder-gray-400 text-xs md:text-base"
          />
        </div>
      </div>
    </header>
  );
});