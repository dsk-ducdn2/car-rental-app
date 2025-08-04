import { component$ } from '@builder.io/qwik';

const projects = [
  {
    logo: (
      // Adobe XD icon
      <svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#470137"/><text x="50%" y="60%" text-anchor="middle" fill="#ff61f6" font-size="12" font-weight="bold" font-family="Arial">XD</text></svg>
    ),
    name: 'SOFT UI XD VERSION',
    members: [1, 2, 3, 4],
    budget: '$14,000',
    completion: 70,
    color: 'bg-gradient-to-r from-cyan-400 to-blue-500',
  },
  {
    logo: (
      // Google icon
      <svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#fff"/><g><circle cx="12" cy="12" r="10" fill="#4285F4"/><path d="M12 2a10 10 0 0 1 7.07 2.93l-2.83 2.83A6 6 0 0 0 12 6V2z" fill="#34A853"/><path d="M12 2v4a6 6 0 0 0-4.24 1.76L4.93 4.93A10 10 0 0 1 12 2z" fill="#FBBC05"/><path d="M2 12a10 10 0 0 1 2.93-7.07l2.83 2.83A6 6 0 0 0 6 12H2z" fill="#EA4335"/></g></svg>
    ),
    name: 'ADD PROGRESS TRACK',
    members: [2, 3],
    budget: '$3,000',
    completion: 20,
    color: 'bg-gradient-to-r from-blue-400 to-blue-200',
  },
  {
    logo: (
      // Slack icon
      <svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#fff"/><g><rect x="10" y="2" width="4" height="8" rx="2" fill="#36C5F0"/><rect x="2" y="10" width="8" height="4" rx="2" fill="#2EB67D"/><rect x="14" y="10" width="8" height="4" rx="2" fill="#ECB22E"/><rect x="10" y="14" width="4" height="8" rx="2" fill="#E01E5A"/></g></svg>
    ),
    name: 'FIX PLATFORM ERRORS',
    members: [1, 4],
    budget: 'NOT SET',
    completion: 100,
    color: 'bg-green-400',
  },
  {
    logo: (
      // Spotify icon
      <svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#1ED760"/><circle cx="12" cy="12" r="8" fill="#191414"/><path d="M8 15c2.5-1 5.5-1 8 0" stroke="#1ED760" stroke-width="1.5" stroke-linecap="round"/><path d="M9 12c2-0.7 4-0.7 6 0" stroke="#1ED760" stroke-width="1.2" stroke-linecap="round"/><path d="M10 10c1.2-0.4 2.8-0.4 4 0" stroke="#1ED760" stroke-width="1" stroke-linecap="round"/></svg>
    ),
    name: 'LAUNCH OUR MOBILE APP',
    members: [1, 2, 3, 4],
    budget: '$20,500',
    completion: 100,
    color: 'bg-green-400',
  },
  {
    logo: (
      // Trello icon
      <svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#fff"/><rect x="3" y="3" width="18" height="18" rx="4" fill="#026AA7"/><rect x="6" y="6" width="4" height="12" rx="1" fill="#fff"/><rect x="14" y="6" width="4" height="7" rx="1" fill="#fff"/></svg>
    ),
    name: 'ADD THE NEW PRICING PAGE',
    members: [5],
    budget: '$500',
    completion: 30,
    color: 'bg-gradient-to-r from-cyan-400 to-blue-500',
  },
  {
    logo: (
      // Inkscape icon
      <svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#fff"/><path d="M12 4L20 18H4L12 4Z" fill="#222"/><circle cx="12" cy="18" r="2" fill="#222"/></svg>
    ),
    name: 'REDESIGN NEW ONLINE SHOP',
    members: [1, 2],
    budget: '$2,000',
    completion: 60,
    color: 'bg-gradient-to-r from-blue-400 to-blue-200',
  },
];

const membersAvatars = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/45.jpg',
  'https://randomuser.me/api/portraits/women/46.jpg',
  'https://randomuser.me/api/portraits/men/47.jpg',
];

const orders = [
  {
    icon: (
      <span class="bg-green-100 text-green-600 rounded-full p-2 mr-2">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z"/></svg>
      </span>
    ),
    text: '$2400, DESIGN CHANGES',
    date: '22 DEC 7:20 PM',
    color: 'text-green-600',
  },
  {
    icon: (
      <span class="bg-red-100 text-red-600 rounded-full p-2 mr-2">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13H5v-2h14v2z"/></svg>
      </span>
    ),
    text: 'NEW ORDER #1832412',
    date: '21 DEC 11 PM',
    color: 'text-red-600',
  },
  {
    icon: (
      <span class="bg-blue-100 text-blue-600 rounded-full p-2 mr-2">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 8h14v-2H7v2zm0-4h14v-2H7v2zm0-6v2h14V7H7z"/></svg>
      </span>
    ),
    text: 'SERVER PAYMENTS FOR APRIL',
    date: '21 DEC 9:34 PM',
    color: 'text-blue-600',
  },
  {
    icon: (
      <span class="bg-orange-100 text-orange-500 rounded-full p-2 mr-2">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M21 7l-1 2H4L3 7h18zm-2.38 4l-1.24 6.45A2 2 0 0115.42 19H8.58a2 2 0 01-1.96-1.55L5.38 11h13.24z"/></svg>
      </span>
    ),
    text: 'NEW CARD ADDED FOR ORDER #4395133',
    date: '20 DEC 2:20 AM',
    color: 'text-orange-500',
  },
  {
    icon: (
      <span class="bg-purple-100 text-purple-600 rounded-full p-2 mr-2">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
      </span>
    ),
    text: 'NEW CARD ADDED FOR ORDER #4395133',
    date: '18 DEC 4:54 AM',
    color: 'text-purple-600',
  },
  {
    icon: (
      <span class="bg-gray-200 text-gray-700 rounded-full p-2 mr-2">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-14C6.48 3 2 7.48 2 13s4.48 10 10 10 10-4.48 10-10S17.52 3 12 3z"/></svg>
      </span>
    ),
    text: 'NEW ORDER #9583120',
    date: '17 DEC',
    color: 'text-gray-700',
  },
];

export const DashboardProjectsAndOrders = component$(() => (
  <div class="flex flex-col lg:flex-row gap-2 lg:gap-6 mt-8">
    {/* Projects Card */}
    <div class="bg-white rounded-2xl shadow p-4 md:p-8 flex-1 min-w-full md:min-w-[400px] min-h-[400px] mb-2 lg:mb-0">
      <div class="flex items-center justify-between mb-4">
        <div class="text-lg font-bold">Projects</div>
        <div class="text-sm text-blue-500 font-semibold">✓ 30 DONE <span class="text-gray-400 font-normal">THIS MONTH</span></div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[600px] text-left table-fixed">
          <thead>
            <tr class="text-xs text-gray-400 uppercase">
              <th class="py-2 w-2/5">COMPANIES</th>
              <th class="py-2 w-1/5">MEMBERS</th>
              <th class="py-2 w-1/5">BUDGET</th>
              <th class="py-2 w-1/5">COMPLETION</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.name} class="border-b border-gray-200 last:border-b-0">
                <td class="py-3 flex items-center gap-2 font-semibold">{p.logo}{p.name}</td>
                <td class="py-3">
                  <div class="flex -space-x-2">
                    {p.members.map((m) => (
                      <div key={m} class="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                        <img 
                          src={membersAvatars[m-1]} 
                          alt={`Member ${m}`}
                          class="w-full h-full object-cover rounded-full"
                          width="28" 
                          height="28"
                          loading="lazy"
                          onError$={(e: Event) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-xs text-gray-500 font-semibold">${m}</span>`;
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </td>
                <td class="py-3 font-semibold text-gray-500">{p.budget}</td>
                <td class="py-3">
                  <div class="w-32 h-2 bg-gray-200 rounded-full">
                    <div class={`h-2 rounded-full ${p.color}`} style={{ width: `${p.completion}%` }}></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    {/* Orders Overview Card */}
    <div class="bg-white rounded-2xl shadow p-4 md:p-8 w-full lg:w-96 min-h-[400px] mt-2 lg:mt-0">
      <div class="font-bold mb-2">Orders overview</div>
      <div class="text-green-500 text-sm font-semibold mb-4">↑ 24% <span class="text-gray-400 font-normal">THIS MONTH</span></div>
      <ul class="space-y-4">
        {orders.map((o, index) => (
          <li key={index} class="flex items-start gap-2">
            <div>{o.icon}</div>
            <div>
              <div class={`font-semibold text-sm ${o.color}`}>{o.text}</div>
              <div class="text-xs text-gray-400">{o.date}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
)); 