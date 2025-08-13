import { component$, useStore, useVisibleTask$, useComputed$ } from '@builder.io/qwik';
import { fetchWithAuth } from '../../utils/api';

interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  vehicleName: string;
  scheduledDate: string; // YYYY-MM-DD
  status: string;
  companyName?: string;
}

const normalizeStatus = (raw: unknown): string => {
  const mapByCode: Record<string, string> = {
    '1': 'SCHEDULED',
    '2': 'SCHEDULED',
    '3': 'IN_PROGRESS',
    '4': 'FINISHED',
  };
  if (raw === null || raw === undefined) return 'SCHEDULED';
  const str = String(raw).trim();
  if (mapByCode[str] !== undefined) return mapByCode[str];
  const upper = str.toUpperCase();
  if (upper === 'REMINDER_SENT') return 'SCHEDULED';
  if (upper === 'SCHEDULED' || upper === 'IN_PROGRESS' || upper === 'FINISHED') return upper;
  return 'SCHEDULED';
};

const transformMaintenanceData = (schedules: any[]): MaintenanceSchedule[] => {
  if (!Array.isArray(schedules)) return [];
  return schedules.map((schedule, index) => {
    const vehicle = schedule.vehicle || {};
    const brand = vehicle.brand || schedule.brand || '';
    const license = vehicle.licensePlate || schedule.licensePlate || '';
    const name = `${brand} ${license}`.trim();
    const rawDate: string = schedule.scheduledDate || schedule.scheduled_date || schedule.date || '';
    const dateOnly = rawDate ? String(rawDate).split('T')[0] : '';
    return {
      id: schedule.id || `schedule-${index}`,
      vehicleId: schedule.vehicleId || vehicle.id || '',
      vehicleName: name || schedule.vehicleName || 'N/A',
      scheduledDate: dateOnly,
      status: normalizeStatus(schedule.status || 'scheduled'),
      companyName: vehicle.companyName || schedule.companyName || undefined,
    };
  });
};

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

export const DashboardProjectsAndOrders = component$(() => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const store = useStore<{ items: MaintenanceSchedule[]; loading: boolean }>({ items: [], loading: true });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const res = await fetchWithAuth(`${apiUrl}/Maintenance`);
      const data = await res.json();
      const all = transformMaintenanceData(data);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const in3Days = new Date(today);
      in3Days.setDate(in3Days.getDate() + 3);

      store.items = all.filter((s) => {
        if (!s.scheduledDate) return false;
        const d = new Date(s.scheduledDate);
        d.setHours(0, 0, 0, 0);
        return d >= today && d <= in3Days && (s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS');
      });
    } catch (err) {
      store.items = [];
    } finally {
      store.loading = false;
    }
  });

  const hasItems = useComputed$(() => Array.isArray(store.items) && store.items.length > 0);

  return (
    <div class="flex flex-col lg:flex-row gap-2 lg:gap-6 mt-8">
      <div class="bg-white rounded-2xl shadow p-4 md:p-8 flex-1 min-w-full md:min-w-[400px] min-h-[400px] mb-2 lg:mb-0">
        <div class="flex items-center justify-between mb-4">
          <div class="text-lg font-bold">Bảo trì sắp diễn ra (3 ngày tới)</div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[600px] text-left table-fixed">
            <thead>
              <tr class="text-xs text-gray-400 uppercase">
                <th class="py-2 w-2/5">VEHICLE</th>
                <th class="py-2 w-1/5">COMPANY</th>
                <th class="py-2 w-1/5">SCHEDULED DATE</th>
                <th class="py-2 w-1/5">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {!store.loading && !hasItems.value && (
                <tr>
                  <td class="py-6 text-center text-gray-400" colSpan={4}>Không có lịch bảo trì trong 3 ngày tới.</td>
                </tr>
              )}
              {store.items.map((item) => (
                <tr key={`${item.id}`} class="border-b border-gray-200 last:border-b-0">
                  <td class="py-3 font-semibold">{item.vehicleName}</td>
                  <td class="py-3 text-gray-600">{item.companyName || '-'}</td>
                  <td class="py-3 text-gray-700">{new Date(item.scheduledDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td class="py-3">
                    <span class={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${item.status === 'FINISHED' ? 'bg-green-100 text-green-700' : item.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
  );
});