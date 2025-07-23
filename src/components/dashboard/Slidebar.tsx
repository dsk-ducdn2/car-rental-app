import { component$, useSignal } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';

const menu = [
  { label: 'Dashboard', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="13" width="7" height="7" rx="2" fill="currentColor"/><rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor"/><rect x="14" y="13" width="7" height="7" rx="2" fill="currentColor"/></svg>
  ), href: '/dashboard' },
  { label: 'Tables', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="4" rx="1" fill="currentColor"/><rect x="3" y="10" width="18" height="4" rx="1" fill="currentColor"/><rect x="3" y="15" width="18" height="4" rx="1" fill="currentColor"/></svg>
  ), href: '/tables' },
  { label: 'Billing', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2" fill="currentColor"/><rect x="7" y="3" width="10" height="4" rx="1" fill="currentColor"/></svg>
  ), href: '/tables' },
  { label: 'Virtual Reality', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="5" fill="currentColor"/><circle cx="7" cy="12" r="2" fill="#fff"/><circle cx="17" cy="12" r="2" fill="#fff"/></svg>
  ) },
  { label: 'RTL', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 7h10M7 12h10M7 17h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="3" y="5" width="4" height="14" rx="2" fill="currentColor"/></svg>
  ) },
];

const accountPages = [
  { label: 'Profile', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="currentColor"/><rect x="4" y="16" width="16" height="4" rx="2" fill="currentColor"/></svg>
  ) },
  { label: 'Sign In', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor"/><path d="M9 12h6M12 9l3 3-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  ), href: '/login' },
  { label: 'Sign Up', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor"/><path d="M12 8v8M8 12h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
  ), href: '/register' },
];

export const Sidebar = component$(() => {
  const loc = useLocation();
  const currentPath = loc.url.pathname;
  const collapsed = useSignal(false); // trạng thái thu/phóng
  // Tìm index của menu item có href khớp với url hiện tại
  const activeIndex = menu.findIndex(item => item.href && currentPath.startsWith(item.href));

  return (
    <aside class={[
      'bg-[#f8f9fa] min-h-screen pt-4 md:pt-6 transition-all duration-300',
      collapsed.value ? 'w-20 px-1 md:px-2' : 'w-full md:w-72 px-2 md:px-4',
    ]}>
      {/* Logo + Toggle */}
      <div class="flex items-center justify-between mb-8 px-2">
        <img src="/favicon.svg" alt="Logo" class="w-12 h-12 mx-auto" />
        <button
          type="button"
          aria-label={collapsed.value ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
          class="ml-2 p-2 rounded hover:bg-gray-200 transition"
          onClick$={() => (collapsed.value = !collapsed.value)}
        >
          {collapsed.value ? (
            // icon mở rộng
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M4 12h16M10 6l-6 6 6 6" stroke="#344767" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          ) : (
            // icon thu nhỏ
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M20 12H4m6 6l6-6-6-6" stroke="#344767" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          )}
        </button>
      </div>
      {/* Main menu */}
      <nav>
        <ul class="flex flex-col gap-2">
          {menu.map((item, idx) => (
            item.href ? (
              <a href={item.href} class="block">
                <li
                  class={[
                    'flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition shadow-sm',
                    activeIndex === idx
                      ? 'bg-cyan-500 text-white font-bold'
                      : 'bg-white text-gray-700 hover:bg-gray-100 font-medium',
                    'text-sm',
                  ]}
                  title={collapsed.value ? item.label : undefined}
                >
                  <span class={[
                    'w-8 h-8 flex items-center justify-center rounded-lg',
                    activeIndex === idx ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-[#344767]'
                  ]}>
                    {item.icon}
                  </span>
                  {!collapsed.value && (
                    <span class={activeIndex === idx ? 'text-white font-bold ml-2' : 'text-gray-700 ml-2'}>{item.label}</span>
                  )}
                </li>
              </a>
            ) : (
              <li
                class={[
                  'flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition shadow-sm',
                  activeIndex === idx
                    ? 'bg-cyan-500 text-white font-bold'
                    : 'bg-white text-gray-700 hover:bg-gray-100 font-medium',
                  'text-sm',
                ]}
                title={collapsed.value ? item.label : undefined}
              >
                <span class={[
                  'w-8 h-8 flex items-center justify-center rounded-lg',
                  activeIndex === idx ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-[#344767]'
                ]}>
                  {item.icon}
                </span>
                {!collapsed.value && (
                  <span class={activeIndex === idx ? 'text-white font-bold ml-2' : 'text-gray-700 ml-2'}>{item.label}</span>
                )}
              </li>
            )
          ))}
        </ul>
        {/* Account pages */}
        <div class={[collapsed.value ? 'hidden' : 'mt-8 mb-2 px-2 text-xs font-bold text-gray-400 tracking-widest']}>ACCOUNT PAGES</div>
        <ul class="flex flex-col gap-2">
          {accountPages.map((item) => (
            item.href ? (
              <a href={item.href} class="block">
                <li
                  class="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer bg-white hover:bg-gray-100 shadow-sm font-medium text-sm"
                  title={collapsed.value ? item.label : undefined}
                >
                  <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-[#344767]">
                    {item.icon}
                  </span>
                  {!collapsed.value && <span class="ml-2">{item.label}</span>}
                </li>
              </a>
            ) : (
              <li
                class="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer bg-white hover:bg-gray-100 shadow-sm font-medium text-sm"
                title={collapsed.value ? item.label : undefined}
              >
                <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-[#344767]">
                  {item.icon}
                </span>
                {!collapsed.value && <span class="ml-2">{item.label}</span>}
              </li>
            )
          ))}
        </ul>
      </nav>
    </aside>
  );
});