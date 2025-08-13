import { component$, useSignal, $ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import ThemeToggle from '../../components/ThemeToggle';

function toTitleCase(str: string) {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const DashboardHeader = component$(() => {
  const loc = useLocation();
  // Lấy phần cuối của pathname làm breadcrumb
  const pathParts = loc.url.pathname.split('/').filter(Boolean);
  const lastPart = pathParts.length > 0 ? toTitleCase(pathParts[pathParts.length - 1]) : 'Dashboard';

  // Quick module navigation search
  const searchQuery = useSignal('');
  const isFocused = useSignal(false);
  const modules = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Users', path: '/users' },
    { label: 'Companies', path: '/companies' },
    { label: 'Vehicles', path: '/vehicles' },
    { label: 'Maintenance Schedules', path: '/maintenance-schedules' },
    { label: 'Booking', path: '/booking' },
  ];
  const navigateTo = $((path: string) => { window.location.href = path; });
  const onEnter = $((e: KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return;
    const matches = modules.filter(m => m.label.toLowerCase().includes(q));
    if (matches.length > 0) {
      navigateTo(matches[0].path);
    }
  });

  return (
    <header class="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-[#f8f9fa] min-h-[64px]">
      {/* Logo + Breadcrumb */}
      <div class="flex items-center min-w-0 gap-4">
        <a href="/" class="flex items-center gap-2 min-w-0 hover:opacity-80 transition" aria-label="Go to Home">
          {/* Icon logo */}
          <svg width="28" height="28" fill="none" viewBox="0 0 32 32">
            {/* ...icon path... */}
          </svg>
          <span class="font-bold text-blue-700 uppercase text-base md:text-lg whitespace-nowrap">Soft UI Dashboard</span>
        </a>
        <div class="flex items-center text-gray-400 text-xs md:text-sm ml-4 md:ml-8 truncate">
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16" class="mr-1">
            {/* ...home icon... */}
          </svg>
          <span class="truncate"> / {lastPart}</span>
        </div>
      </div>
      {/* Search box + theme */}
      <div class="flex items-center ml-auto relative">
        <div class="flex items-center border border-gray-300 rounded-lg bg-white px-2 md:px-3 py-1 w-32 md:w-56 shadow-sm">
          <svg class="text-gray-400 mr-2" width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m0 0A7 7 0 105 5a7 7 0 0011.65 11.65z" />
          </svg>
          <input
            type="text"
            placeholder="Type here..."
            value={searchQuery.value}
            onInput$={(e) => (searchQuery.value = (e.target as HTMLInputElement).value)}
            onKeyDown$={onEnter}
            onFocus$={() => (isFocused.value = true)}
            onBlur$={() => setTimeout(() => (isFocused.value = false), 150)}
            class="outline-none border-none bg-transparent text-gray-700 w-full placeholder-gray-400 text-xs md:text-base"
          />
        </div>
        {/* Suggestions dropdown */}
        {isFocused.value && searchQuery.value.trim() && (
          <div class="absolute top-full mt-1 right-16 md:right-20 w-56 bg-white border border-gray-200 rounded-lg shadow z-50">
            {modules
              .filter(m => m.label.toLowerCase().includes(searchQuery.value.trim().toLowerCase()))
              .map(m => (
                <button key={m.path} onClick$={() => navigateTo(m.path)} class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">
                  {m.label}
                </button>
              ))}
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
});