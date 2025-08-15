import { component$, useStore, useVisibleTask$, useComputed$ } from '@builder.io/qwik';
import { fetchWithAuth, getUserIdFromToken } from '../../utils/api';

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

interface BookingApiShape {
  id?: string;
  bookingId?: string;
  vehicleId?: string;
  vehicle?: { id?: string } | null;
  startDateTime?: string;
  start_datetime?: string;
  startDatetime?: string;
  startDate?: string;
  endDateTime?: string;
  end_datetime?: string;
  endDatetime?: string;
  endDate?: string;
  totalPrice?: number;
  total_price?: number;
  price?: number;
}

interface TopVehicleRevenue {
  vehicleId: string;
  vehicleName: string;
  revenue: number;
}

const startOfMonth = (y: number, m: number) => new Date(y, m, 1, 0, 0, 0, 0);
const endOfMonth = (y: number, m: number) => new Date(y, m + 1, 0, 23, 59, 59, 999);

const normalizeMoney = (row: BookingApiShape): number => {
  if (typeof row.totalPrice === 'number') return row.totalPrice;
  if (typeof row.total_price === 'number') return row.total_price;
  if (typeof row.price === 'number') return row.price;
  return 0;
};

export const DashboardProjectsAndOrders = component$(() => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const store = useStore<{ items: MaintenanceSchedule[]; loading: boolean; topVehicles: TopVehicleRevenue[]; topLoading: boolean }>({ items: [], loading: true, topVehicles: [], topLoading: true });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      // Resolve current user/company to filter maintenance for non-admin users
      let isAdmin = false;
      let userCompanyId: string | null = null;
      let allowedVehicleIds: Set<string> | null = null;
      try {
        const uid = getUserIdFromToken();
        if (uid) {
          const uRes = await fetchWithAuth(`${apiUrl}/Users/${uid}`);
          if (uRes.ok) {
            const u = await uRes.json();
            isAdmin = Number(u?.roleId) === 1;
            if (u?.companyId) userCompanyId = String(u.companyId);
          }
        }
      } catch (err) {
        void err;
      }

      const [maintRes, vehiclesRes, bookingsRes] = await Promise.all([
        fetchWithAuth(`${apiUrl}/Maintenance`),
        fetchWithAuth(`${apiUrl}/Vehicles`).catch(() => undefined as unknown as Response),
        fetchWithAuth(`${apiUrl}/Booking`).catch(() => undefined as unknown as Response),
      ]);
      const data = await maintRes.json();
      let all = transformMaintenanceData(data);

      // If user is not admin, restrict to maintenance for vehicles in user's company
      let vehicles: any[] = [];
      if (vehiclesRes && vehiclesRes.ok) {
        vehicles = await vehiclesRes.json().catch(() => []);
      }
      if (!isAdmin && userCompanyId) {
        allowedVehicleIds = new Set(
          (Array.isArray(vehicles) ? vehicles : [])
            .filter((v: any) => String(v?.companyId ?? v?.company?.id ?? '') === userCompanyId)
            .map((v: any) => String(v?.id))
        );
        all = all.filter((m) => allowedVehicleIds!.has(String(m.vehicleId)));
      }

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

      // Compute top 5 vehicles by revenue for the current month
      try {
        const topByVehicle: Record<string, number> = {};
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        const monthStart = startOfMonth(y, m);
        const monthEnd = endOfMonth(y, m);
        const dayMs = 24 * 60 * 60 * 1000;

        const rows: BookingApiShape[] = bookingsRes && bookingsRes.ok ? await bookingsRes.json().catch(() => []) : [];
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          const vehicleId = String(r.vehicleId || r.vehicle?.id || '');
          if (!vehicleId) continue;
          if (allowedVehicleIds && !allowedVehicleIds.has(vehicleId)) continue;
          const total = normalizeMoney(r);
          const sRaw = new Date(r.startDateTime || r.start_datetime || r.startDatetime || r.startDate || '');
          const eRaw = new Date(r.endDateTime || r.end_datetime || r.endDatetime || r.endDate || '');
          if (isNaN(sRaw.getTime()) && isNaN(eRaw.getTime())) continue;
          const s0 = isNaN(sRaw.getTime()) ? eRaw : sRaw;
          const e0 = isNaN(eRaw.getTime()) ? sRaw : eRaw;
          const s = new Date(Math.min(s0.getTime(), e0.getTime()));
          const e = new Date(Math.max(s0.getTime(), e0.getTime()));
          const realStart = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
          const realEnd = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
          const totalMs = Math.max(realEnd.getTime() - realStart.getTime(), dayMs);
          const clipStart = realStart < monthStart ? monthStart : realStart;
          const clipEnd = realEnd > monthEnd ? monthEnd : realEnd;
          if (clipEnd < clipStart) continue;
          const overlapMs = clipEnd.getTime() - clipStart.getTime();
          const fraction = overlapMs > 0 ? overlapMs / totalMs : 0;
          topByVehicle[vehicleId] = (topByVehicle[vehicleId] || 0) + total * fraction;
        }

        // Map to names and sort
        const idToName = new Map<string, string>();
        (Array.isArray(vehicles) ? vehicles : []).forEach((v: any) => {
          const brand = v?.brand || '';
          const license = v?.licensePlate || v?.license_plate || '';
          const name = `${brand} ${license}`.trim() || license || brand || 'Vehicle';
          idToName.set(String(v?.id), name);
        });

        const list: TopVehicleRevenue[] = Object.entries(topByVehicle)
          .map(([vehicleId, revenue]) => ({ vehicleId, revenue, vehicleName: idToName.get(vehicleId) || vehicleId }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        store.topVehicles = list;
      } catch (err) {
        void err;
        store.topVehicles = [];
      } finally {
        store.topLoading = false;
      }
    } catch {
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
          <div class="text-lg font-bold">Upcoming Maintenance (Next 3 Days)</div>
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
                  <td class="py-6 text-center text-gray-400" colSpan={4}>No maintenance scheduled for the next 3 days.</td>
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
        <div class="font-bold mb-2">Top Vehicles by Revenue</div>
        <div class="text-green-500 text-sm font-semibold mb-4">↑ Top 5 <span class="text-gray-400 font-normal">THIS MONTH</span></div>
        {store.topLoading ? (
          <ul class="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} class="flex items-center gap-3">
                <div class="w-2 h-8 bg-gray-200 rounded"></div>
                <div class="flex-1">
                  <div class="h-4 w-40 bg-gray-200 rounded mb-1"></div>
                  <div class="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul class="space-y-4">
            {store.topVehicles.length === 0 && (
              <li class="text-gray-400 text-sm">No data for this month.</li>
            )}
            {store.topVehicles.map((v) => (
              <li key={v.vehicleId} class="flex items-start gap-3">
                <div class="w-1.5 mt-1.5 h-6 rounded bg-blue-500"></div>
                <div class="flex-1">
                  <div class="font-semibold text-sm text-gray-800">{v.vehicleName}</div>
                  <div class="text-xs text-gray-500">{v.revenue.toLocaleString()} VND</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});