import { component$, useSignal, $, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { jwtDecode } from 'jwt-decode';

const menu = [
  { label: 'Dashboard', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="13" width="7" height="7" rx="2" fill="currentColor"/><rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor"/><rect x="14" y="13" width="7" height="7" rx="2" fill="currentColor"/></svg>
  ), href: '/dashboard' },
  { label: 'Users', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="4" rx="1" fill="currentColor"/><rect x="3" y="10" width="18" height="4" rx="1" fill="currentColor"/><rect x="3" y="15" width="18" height="4" rx="1" fill="currentColor"/></svg>
  ), href: '/users' },
  { label: 'Companies', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/><rect x="7" y="7" width="4" height="10" rx="1" fill="#fff"/><rect x="13" y="7" width="4" height="10" rx="1" fill="#fff"/></svg>
  ), href: '/companies' },
  { label: 'Vehicles', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M5 12l2-6h10l2 6M5 12l1 4h2l1-4m8 0l1 4h2l1-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/></svg>
  ), href: '/vehicles' },
  { label: 'Billing', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2" fill="currentColor"/><rect x="7" y="3" width="10" height="4" rx="1" fill="currentColor"/></svg>
  ), href: '/billing' },
  { label: 'Virtual Reality', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="5" fill="currentColor"/><circle cx="7" cy="12" r="2" fill="#fff"/><circle cx="17" cy="12" r="2" fill="#fff"/></svg>
  ) },
  { label: 'RTL', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 7h10M7 12h10M7 17h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="3" y="5" width="4" height="14" rx="2" fill="currentColor"/></svg>
  ) },
];





export const Sidebar = component$(() => {
  const API_URL = import.meta.env.VITE_API_URL;
  const loc = useLocation();
  const currentPath = loc.url.pathname;
  const collapsed = useSignal(false); // trạng thái thu/phóng
  const role = useSignal<string | undefined>(undefined);
  const userId = useSignal<string | undefined>(undefined);
  // Tìm index của menu item có href khớp với url hiện tại
  // Lọc menu theo role
  const filteredMenu = menu.filter(item => !(item.label === 'Users' && role.value === 'user'));
  
  // Fix logic để highlight đúng tab
  const activeIndex = filteredMenu.findIndex(item => {
    if (!item.href) return false;
    
    // Dashboard route
    if (item.href === '/dashboard' && (currentPath === '/dashboard' || currentPath === '/dashboard/')) return true;
    
    // Company-related routes
    if (item.href === '/companies' && (
      currentPath.startsWith('/companies') || 
      currentPath.startsWith('/create-company') || 
      currentPath.startsWith('/edit-company')
    )) return true;
    
    // Vehicle-related routes (including status logs)
    if (item.href === '/vehicles' && (
      currentPath.startsWith('/vehicles') || 
      currentPath.startsWith('/create-vehicle') || 
      currentPath.startsWith('/edit-vehicle') ||
      currentPath.startsWith('/vehicle-status-logs')
    )) return true;
    
    // User-related routes
    if (item.href === '/users' && (
      currentPath === '/users' || 
      currentPath.startsWith('/users/') || 
      currentPath.startsWith('/create-user') || 
      currentPath.startsWith('/edit-user')
    )) return true;
    
    // Billing route
    if (item.href === '/billing' && currentPath.startsWith('/billing')) return true;
    
    return false;
  });

  const accountPages = [
  { label: 'Profile', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="currentColor"/><rect x="4" y="16" width="16" height="4" rx="2" fill="currentColor"/></svg>
  ), href: `/profile/${userId.value}` },
  { label: 'Log Out', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor"/><path d="M9 12h6M12 9l3 3-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  ), href: '/logout' },
];

  // Logic highlight cho account pages  
  const activeAccountIndex = accountPages.findIndex(item => {
    if (!item.href) return false;
    
    // Profile route
    if (item.href.startsWith('/profile/') && currentPath.startsWith('/profile/')) return true;
    
    return false;
  });

  useVisibleTask$(() => {
    function getCookie(name: string) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    }

    const accessToken = getCookie('access_token');
    if (accessToken) {
      try {
        const decoded = jwtDecode<any>(accessToken);
        const roleFromToken = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        role.value = roleFromToken;
        const userIdFromToken = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        userId.value = userIdFromToken;
      } catch (err) {
        console.error('Invalid access token', err);
      }
    }
  });

  const handleLogout = $(async (e: Event) => {
    e.preventDefault();

    // Lấy refresh_token từ cookie
    function getCookie(name: string) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    }
    const refreshToken = getCookie('refresh_token');
    const accessToken = getCookie('access_token');
    try {
      const res = await fetch(`${API_URL}/Auth/logout`, {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ refreshToken : refreshToken })
      });
      if (res.ok) {
        // Xóa cookie access_token và refresh_token
        document.cookie = 'access_token=; Max-Age=0; path=/;';
        document.cookie = 'refresh_token=; Max-Age=0; path=/;';
        // Redirect to login page
        window.location.href = '/login';
      } else {
        // Optional: handle error message from server
        const data = await res.json();
        console.error('Logout failed:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Network error during logout', err);
    }
  });

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
          {filteredMenu.map((item, idx) => (
            <div key={idx}>
              {item.href ? (
                <a href={item.href} class="block">
                  <li class={[
                    'flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition shadow-sm text-sm',
                    activeIndex === idx ? 'bg-cyan-500 text-white font-bold' : 'bg-white text-gray-700 hover:bg-gray-100 font-medium'
                  ]} title={collapsed.value ? item.label : undefined}>
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
                <li class={[
                  'flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition shadow-sm text-sm',
                  activeIndex === idx ? 'bg-cyan-500 text-white font-bold' : 'bg-white text-gray-700 hover:bg-gray-100 font-medium'
                ]} title={collapsed.value ? item.label : undefined}>
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
              )}
            </div>
          ))}
        </ul>
        {/* Account pages */}
        <div class={[collapsed.value ? 'hidden' : 'mt-8 mb-2 px-2 text-xs font-bold text-gray-400 tracking-widest']}>ACCOUNT PAGES</div>
        <ul class="flex flex-col gap-2">
          {accountPages.map((item, idx) => (
            <div key={idx}>
              {item.label === 'Log Out' ? (
                <li
                  class="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer bg-white hover:bg-gray-100 shadow-sm font-medium text-sm"
                  title={collapsed.value ? item.label : undefined}
                  onClick$={handleLogout}
                  style={{ userSelect: 'none' }}
                >
                  <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-[#344767]">
                    {item.icon}
                  </span>
                  {!collapsed.value && <span class="ml-2">{item.label}</span>}
                </li>
              ) : item.href ? (
                <a href={item.href} class="block">
                  <li class={[
                    'flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition shadow-sm text-sm',
                    activeAccountIndex === idx ? 'bg-cyan-500 text-white font-bold' : 'bg-white text-gray-700 hover:bg-gray-100 font-medium'
                  ]} title={collapsed.value ? item.label : undefined}>
                    <span class={[
                      'w-8 h-8 flex items-center justify-center rounded-lg',
                      activeAccountIndex === idx ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-[#344767]'
                    ]}>
                      {item.icon}
                    </span>
                    {!collapsed.value && (
                      <span class={activeAccountIndex === idx ? 'text-white font-bold ml-2' : 'text-gray-700 ml-2'}>{item.label}</span>
                    )}
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
              )}
            </div>
          ))}
        </ul>
      </nav>
    </aside>
  );
});