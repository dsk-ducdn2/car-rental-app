import { component$, useStore, useVisibleTask$, useSignal, $ } from '@builder.io/qwik';
import { PWAInfo } from '../../components/PWAInfo';
import { fetchWithAuth, getUserIdFromToken } from '../../utils/api';

const dayMs = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export const DashboardFeatureCards = component$(() => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const loading = useSignal(true);
  const store = useStore({
    pickupsToday: 0,
    returnsToday: 0,
    activeNow: 0,
    revenueToday: 0,
    upcomingMaint7d: 0,
    idleVehiclesToday: 0,
    isAdmin: false,
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
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
      store.isAdmin = isAdmin;

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

      const today = new Date();
      const tStart = startOfDay(today);
      const tEnd = endOfDay(today);

      const bookings: any[] = bookingsRes && bookingsRes.ok ? await bookingsRes.json().catch(() => []) : [];
      let pickups = 0, returns = 0, active = 0, revenue = 0;
      const busyVehicleIds = new Set<string>();
      for (const r of (Array.isArray(bookings) ? bookings : [])) {
        const vehicleId = String(r?.vehicleId ?? r?.vehicle?.id ?? '');
        if (!vehicleId) continue;
        if (allowedVehicleIds && !allowedVehicleIds.has(vehicleId)) continue;
        const startRaw = new Date(r?.startDateTime || r?.start_datetime || r?.startDatetime || r?.startDate || '');
        const endRaw = new Date(r?.endDateTime || r?.end_datetime || r?.endDatetime || r?.endDate || '');
        if (isNaN(startRaw.getTime()) && isNaN(endRaw.getTime())) continue;
        const s0 = isNaN(startRaw.getTime()) ? endRaw : startRaw;
        const e0 = isNaN(endRaw.getTime()) ? startRaw : endRaw;
        const s = startOfDay(s0 < e0 ? s0 : e0);
        const e = endOfDay(s0 < e0 ? e0 : s0);
        const totalMs = Math.max(e.getTime() - s.getTime(), dayMs);
        const overlapStart = s > tStart ? s : tStart;
        const overlapEnd = e < tEnd ? e : tEnd;
        const overlap = Math.max(0, overlapEnd.getTime() - overlapStart.getTime());
        if (overlap > 0) {
          busyVehicleIds.add(vehicleId);
          active += (today >= s && today <= e) ? 1 : 0;
          // pickups/returns trong ngày
          if (s >= tStart && s <= tEnd) pickups += 1;
          if (e >= tStart && e <= tEnd) returns += 1;
          const total = typeof r.totalPrice === 'number' ? r.totalPrice : (typeof r.total_price === 'number' ? r.total_price : (typeof r.price === 'number' ? r.price : 0));
          revenue += total * (overlap / totalMs);
        }
      }

      // Alerts
      const maint: any[] = maintRes && maintRes.ok ? await maintRes.json().catch(() => []) : [];
      const in7 = new Date(startOfDay(today).getTime() + 7 * dayMs);
      let upcoming = 0;
      for (const m of (Array.isArray(maint) ? maint : [])) {
        const vehicleId = String(m?.vehicleId ?? m?.vehicle?.id ?? '');
        if (!vehicleId) continue;
        if (allowedVehicleIds && !allowedVehicleIds.has(vehicleId)) continue;
        const raw = m?.scheduledDate || m?.scheduled_date || m?.date || '';
        if (!raw) continue;
        const d = new Date(raw);
        if (isNaN(d.getTime())) continue;
        if (d >= tStart && d <= in7) upcoming += 1;
      }

      const vehiclesCount = allowedVehicleIds ? allowedVehicleIds.size : (Array.isArray(vehicles) ? vehicles.length : 0);
      const idle = Math.max(0, vehiclesCount - busyVehicleIds.size);

      store.pickupsToday = pickups;
      store.returnsToday = returns;
      store.activeNow = active;
      store.revenueToday = revenue;
      store.upcomingMaint7d = upcoming;
      store.idleVehiclesToday = idle;
    } finally {
      loading.value = false;
    }
  });

  const fmt = (v: number) => v.toLocaleString('vi-VN');
  const exportLoading = useSignal(false);

  const exportMonthlyReport = $(async () => {
    try {
      exportLoading.value = true;
      // Resolve scope again to avoid coupling with previous fetch
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

      const [vehiclesRes, bookingsRes] = await Promise.all([
        fetchWithAuth(`${apiUrl}/Vehicles`).catch(() => undefined as unknown as Response),
        fetchWithAuth(`${apiUrl}/Booking`).catch(() => undefined as unknown as Response),
      ]);

      const vehicles: any[] = vehiclesRes && vehiclesRes.ok ? await vehiclesRes.json().catch(() => []) : [];
      const allowedVehicleIds = (!isAdmin && userCompanyId)
        ? new Set((Array.isArray(vehicles) ? vehicles : [])
            .filter((v: any) => String(v?.companyId ?? v?.company?.id ?? '') === userCompanyId)
            .map((v: any) => String(v?.id)))
        : null;
      const idToLabel = new Map<string, string>();
      (Array.isArray(vehicles) ? vehicles : []).forEach((v: any) => {
        const brand = v?.brand || '';
        const license = v?.licensePlate || v?.license_plate || '';
        const name = `${brand} ${license}`.trim() || license || brand || 'Vehicle';
        idToLabel.set(String(v?.id), name);
      });

      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      const monthStart = startOfDay(new Date(y, m, 1));
      const monthEnd = endOfDay(new Date(y, m + 1, 0));

      const bookings: any[] = bookingsRes && bookingsRes.ok ? await bookingsRes.json().catch(() => []) : [];
      const rows: string[][] = [[
        'BookingId','VehicleId','Vehicle','Start','End','TotalPrice','RevenueInMonth','OverlapDays'
      ]];

      for (let i = 0; i < (Array.isArray(bookings) ? bookings.length : 0); i++) {
        const r: any = bookings[i];
        const vehicleId = String(r?.vehicleId ?? r?.vehicle?.id ?? '');
        if (!vehicleId) continue;
        if (allowedVehicleIds && !allowedVehicleIds.has(vehicleId)) continue;
        const sRaw = new Date(r?.startDateTime || r?.start_datetime || r?.startDatetime || r?.startDate || '');
        const eRaw = new Date(r?.endDateTime || r?.end_datetime || r?.endDatetime || r?.endDate || '');
        if (isNaN(sRaw.getTime()) && isNaN(eRaw.getTime())) continue;
        const s0 = isNaN(sRaw.getTime()) ? eRaw : sRaw;
        const e0 = isNaN(eRaw.getTime()) ? sRaw : eRaw;
        const s = startOfDay(s0 < e0 ? s0 : e0);
        const e = endOfDay(s0 < e0 ? e0 : s0);
        const totalMs = Math.max(e.getTime() - s.getTime(), dayMs);
        const overlapStart = s > monthStart ? s : monthStart;
        const overlapEnd = e < monthEnd ? e : monthEnd;
        const overlapMs = Math.max(0, overlapEnd.getTime() - overlapStart.getTime());
        if (overlapMs <= 0) continue;
        const total = typeof r.totalPrice === 'number' ? r.totalPrice : (typeof r.total_price === 'number' ? r.total_price : (typeof r.price === 'number' ? r.price : 0));
        const revenueInMonth = total * (overlapMs / totalMs);
        const overlapDays = Math.round(overlapMs / dayMs * 100) / 100;
        rows.push([
          String(r?.id || r?.bookingId || `booking-${i}`),
          vehicleId,
          idToLabel.get(vehicleId) || vehicleId,
          s.toISOString(),
          e.toISOString(),
          String(total),
          String(Math.round(revenueInMonth)),
          String(overlapDays),
        ]);
      }

      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}` + '"').join(',')).join('\n');
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-report-${y}-${String(m + 1).padStart(2,'0')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      exportLoading.value = false;
    }
  });

  return (
    <div class="flex flex-col md:flex-row gap-2 md:gap-6 mt-8">
      {/* Today overview */}
      <div class="bg-white rounded-2xl shadow p-4 md:p-8 flex-1 flex flex-col justify-between min-w-full md:min-w-[320px] min-h-[200px] mb-2 md:mb-0">
        <div class="text-blue-700 font-semibold mb-2">Today overview</div>
        {loading.value ? (
          <div class="h-24 bg-gray-100 rounded animate-pulse"></div>
        ) : (
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-gray-500">Pickups</div>
              <div class="text-xl font-bold text-gray-800">{store.pickupsToday}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Returns</div>
              <div class="text-xl font-bold text-gray-800">{store.returnsToday}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Active bookings</div>
              <div class="text-xl font-bold text-gray-800">{store.activeNow}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Revenue today</div>
              <div class="text-xl font-bold text-gray-800">{fmt(store.revenueToday)} VND</div>
            </div>
          </div>
        )}
        <a href="/booking" class="mt-4 text-sm font-semibold text-gray-600 hover:text-blue-700 flex items-center gap-1">View schedule <span class="ml-1">→</span></a>
      </div>

      {/* Quick actions */}
      <div class="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow flex-1 min-w-full md:min-w-[320px] min-h-[200px] mb-2 md:mb-0 p-6">
        <div class="text-white font-semibold mb-3">Quick actions</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <a href="/create-booking" class="bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-3 text-sm font-semibold">Create Booking</a>
          <a href="/vehicles" class="bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-3 text-sm font-semibold">Manage Vehicles</a>
          <a href="/maintenance-schedules" class="bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-3 text-sm font-semibold">Maintenance Schedules</a>
          {store.isAdmin && (
            <a href="/users" class="bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-3 text-sm font-semibold">Manage Users</a>
          )}
          <button onClick$={exportMonthlyReport} disabled={exportLoading.value} class={`bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-3 text-sm font-semibold ${exportLoading.value ? 'opacity-70 cursor-wait' : ''}`}>
            {exportLoading.value ? 'Exporting…' : 'Export Report (CSV)'}
          </button>
        </div>
      </div>

      {/* Alerts & health */}
      <div class="bg-[#1a237e] rounded-2xl shadow p-4 md:p-8 flex-1 flex flex-col justify-between min-w-full md:min-w-[320px] min-h-[200px] text-white">
        <div class="text-xl font-bold mb-2">Alerts & health</div>
        {loading.value ? (
          <div class="h-24 bg-white/10 rounded animate-pulse"></div>
        ) : (
          <ul class="space-y-2 text-white/90">
            <li>Upcoming maintenance (7d): <span class="font-semibold">{store.upcomingMaint7d}</span></li>
            <li>Idle vehicles today: <span class="font-semibold">{store.idleVehiclesToday}</span></li>
            <li>Active bookings now: <span class="font-semibold">{store.activeNow}</span></li>
          </ul>
        )}
        <a href="/maintenance-schedules" class="mt-4 text-sm font-semibold text-white flex items-center gap-1">Review schedules <span class="ml-1">→</span></a>
      </div>

      {/* PWA status */}
      <div class="bg-[#424242] rounded-2xl shadow p-4 md:p-8 flex-1 flex flex-col justify-between min-w-full md:min-w-[320px] min-h-[200px]">
        <PWAInfo />
      </div>
    </div>
  );
});