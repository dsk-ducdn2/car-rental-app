import { component$, useStore, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { fetchWithAuth, getUserIdFromToken } from '../../utils/api';

interface BookingApiShape {
  vehicleId?: string;
  vehicle?: { id?: string } | null;
  startDateTime?: string; start_datetime?: string; startDatetime?: string; startDate?: string;
  endDateTime?: string; end_datetime?: string; endDatetime?: string; endDate?: string;
  totalPrice?: number; total_price?: number; price?: number;
}

interface MaintenanceShape {
  vehicleId?: string;
  vehicle?: { id?: string } | null;
  scheduledDate?: string; scheduled_date?: string; date?: string;
  status?: string | number | null;
}

const dayMs = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const startOfMonth = (y: number, m: number) => new Date(y, m, 1, 0, 0, 0, 0);
const endOfMonth = (y: number, m: number) => new Date(y, m + 1, 0, 23, 59, 59, 999);

const moneyOf = (r: BookingApiShape): number =>
  typeof r.totalPrice === 'number' ? r.totalPrice : (typeof r.total_price === 'number' ? r.total_price : (typeof r.price === 'number' ? r.price : 0));

const getStart = (r: BookingApiShape) => r.startDateTime || r.start_datetime || r.startDatetime || r.startDate || '';
const getEnd = (r: BookingApiShape) => r.endDateTime || r.end_datetime || r.endDatetime || r.endDate || '';

const overlapMsInclusive = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => {
  const s = aStart > bStart ? aStart : bStart;
  const e = aEnd < bEnd ? aEnd : bEnd;
  const v = e.getTime() - s.getTime();
  return v > 0 ? v : 0;
};

export const StatsCards = component$(() => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const loading = useSignal(true);
  const store = useStore({
    revenueThisMonth: 0,
    revenuePrevMonth: 0,
    bookingsThisMonth: 0,
    bookingsPrevMonth: 0,
    fleetUtilizationPct: 0,
    unavailableVehicles: 0,
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      // Determine scope
      let isAdmin = false;
      let userCompanyId: string | null = null;
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
      } catch {}

      const [vehiclesRes, bookingsRes, maintRes] = await Promise.all([
        fetchWithAuth(`${apiUrl}/Vehicles`).catch(() => undefined as unknown as Response),
        fetchWithAuth(`${apiUrl}/Booking`).catch(() => undefined as unknown as Response),
        fetchWithAuth(`${apiUrl}/Maintenance`).catch(() => undefined as unknown as Response),
      ]);

      const vehicles: any[] = vehiclesRes && vehiclesRes.ok ? await vehiclesRes.json().catch(() => []) : [];
      const allowedVehicleIds = (!isAdmin && userCompanyId)
        ? new Set((Array.isArray(vehicles) ? vehicles : [])
            .filter((v: any) => String(v?.companyId ?? v?.company?.id ?? '') === userCompanyId)
            .map((v: any) => String(v?.id)))
        : null;

      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      const curStart = startOfMonth(y, m);
      const curEnd = endOfMonth(y, m);
      const prevM = m === 0 ? 11 : m - 1;
      const prevY = m === 0 ? y - 1 : y;
      const prevStart = startOfMonth(prevY, prevM);
      const prevEnd = endOfMonth(prevY, prevM);

      // Bookings
      const bookings: BookingApiShape[] = bookingsRes && bookingsRes.ok ? await bookingsRes.json().catch(() => []) : [];
      let revenueThis = 0; let revenuePrev = 0; let countThis = 0; let countPrev = 0; let bookedMsThis = 0;
      for (const r of bookings) {
        const vehicleId = String(r.vehicleId || r.vehicle?.id || '');
        if (!vehicleId) continue;
        if (allowedVehicleIds && !allowedVehicleIds.has(vehicleId)) continue;
        const total = moneyOf(r);
        const sRaw = new Date(getStart(r));
        const eRaw = new Date(getEnd(r));
        if (isNaN(sRaw.getTime()) && isNaN(eRaw.getTime())) continue;
        const s0 = isNaN(sRaw.getTime()) ? eRaw : sRaw;
        const e0 = isNaN(eRaw.getTime()) ? sRaw : eRaw;
        const s = startOfDay(s0 < e0 ? s0 : e0);
        const e = endOfDay(s0 < e0 ? e0 : s0);
        const totalMs = Math.max(e.getTime() - s.getTime(), dayMs);

        // Current month
        const overlapThis = overlapMsInclusive(s, e, curStart, curEnd);
        if (overlapThis > 0) {
          countThis += 1;
          bookedMsThis += overlapThis;
          revenueThis += total * (overlapThis / totalMs);
        }
        // Previous month
        const overlapPrev = overlapMsInclusive(s, e, prevStart, prevEnd);
        if (overlapPrev > 0) {
          countPrev += 1;
          revenuePrev += total * (overlapPrev / totalMs);
        }
      }

      // Fleet utilization
      const vehiclesCount = (allowedVehicleIds ? allowedVehicleIds.size : (Array.isArray(vehicles) ? vehicles.length : 0)) || 0;
      const monthSpanMs = curEnd.getTime() - curStart.getTime();
      const denom = vehiclesCount > 0 ? vehiclesCount * monthSpanMs : 0;
      const utilization = denom > 0 ? Math.min(1, bookedMsThis / denom) : 0;

      // Maintenance / Unavailable vehicles this month
      const maint: MaintenanceShape[] = maintRes && maintRes.ok ? await maintRes.json().catch(() => []) : [];
      const unavailableIds = new Set<string>();
      for (const mItem of maint) {
        const vehicleId = String(mItem.vehicleId || mItem.vehicle?.id || '');
        if (!vehicleId) continue;
        if (allowedVehicleIds && !allowedVehicleIds.has(vehicleId)) continue;
        const raw = mItem.scheduledDate || mItem.scheduled_date || mItem.date || '';
        if (!raw) continue;
        const d = new Date(raw);
        if (isNaN(d.getTime())) continue;
        if (d >= curStart && d <= curEnd) unavailableIds.add(vehicleId);
      }

      store.revenueThisMonth = revenueThis;
      store.revenuePrevMonth = revenuePrev;
      store.bookingsThisMonth = countThis;
      store.bookingsPrevMonth = countPrev;
      store.fleetUtilizationPct = Math.round(utilization * 1000) / 10; // 1 decimal
      store.unavailableVehicles = unavailableIds.size;
    } finally {
      loading.value = false;
    }
  });

  const formatCurrency = (v: number) => v.toLocaleString('vi-VN');
  const deltaPct = (cur: number, prev: number) => {
    if (!prev) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 1000) / 10; // 1 decimal
  };

  return (
  <div class="flex flex-col md:flex-row gap-2 md:gap-6 mt-8">
      {/* Doanh thu tháng này */}
      <div class="bg-white rounded-lg shadow p-6 w-full md:w-1/4 min-h-[100px] flex flex-col justify-center">
        {loading.value ? (
          <div class="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <div>
            <div class="text-xs text-gray-500 mb-1">Revenue (MTD)</div>
            <div class="text-2xl font-bold text-gray-800">{formatCurrency(store.revenueThisMonth)} VND</div>
            <div class={`${deltaPct(store.revenueThisMonth, store.revenuePrevMonth) >= 0 ? 'text-green-600' : 'text-red-600'} text-sm font-semibold`}>
              {deltaPct(store.revenueThisMonth, store.revenuePrevMonth)}%
              <span class="text-gray-400 font-normal ml-1">vs last month</span>
            </div>
          </div>
        )}
      </div>

      {/* Số booking tháng này */}
      <div class="bg-white rounded-lg shadow p-6 w-full md:w-1/4 min-h-[100px] flex flex-col justify-center">
        {loading.value ? (
          <div class="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <div>
            <div class="text-xs text-gray-500 mb-1">Bookings (MTD)</div>
            <div class="text-2xl font-bold text-gray-800">{store.bookingsThisMonth.toLocaleString()}</div>
            <div class={`${deltaPct(store.bookingsThisMonth, store.bookingsPrevMonth) >= 0 ? 'text-green-600' : 'text-red-600'} text-sm font-semibold`}>
              {deltaPct(store.bookingsThisMonth, store.bookingsPrevMonth)}%
              <span class="text-gray-400 font-normal ml-1">vs last month</span>
            </div>
          </div>
        )}
      </div>

      {/* Fleet Utilization */}
      <div class="bg-white rounded-lg shadow p-6 w-full md:w-1/4 min-h-[100px] flex flex-col justify-center">
        {loading.value ? (
          <div class="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <div>
            <div class="text-xs text-gray-500 mb-1">Fleet Utilization</div>
            <div class="text-2xl font-bold text-gray-800">{store.fleetUtilizationPct.toFixed(1)}%</div>
            <div class="text-gray-400 text-sm">Booked time / Capacity (month)</div>
          </div>
        )}
    </div>

      {/* Xe không khả dụng */}
      <div class="bg-white rounded-lg shadow p-6 w-full md:w-1/4 min-h-[100px] flex flex-col justify-center">
        {loading.value ? (
          <div class="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <div>
            <div class="text-xs text-gray-500 mb-1">Unavailable Vehicles</div>
            <div class="text-2xl font-bold text-gray-800">{store.unavailableVehicles.toLocaleString()}</div>
            <div class="text-gray-400 text-sm">In maintenance this month</div>
    </div>
        )}
    </div>
    </div>
  );
});