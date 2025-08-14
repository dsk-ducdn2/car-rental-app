import { component$, useVisibleTask$, useSignal, useStore } from '@builder.io/qwik';
import { fetchWithAuth, getUserIdFromToken } from '../../utils/api';

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

interface BookingRow {
  id: string;
  vehicleId: string;
  startIso: string;
  endIso: string;
  totalPrice: number;
}

const toBooking = (row: BookingApiShape, index: number): BookingRow => {
  const id = row.id || row.bookingId || `booking-${index}`;
  const vehicleId = row.vehicleId || row.vehicle?.id || '';
  const start = row.startDateTime || row.start_datetime || row.startDatetime || row.startDate || '';
  const end = row.endDateTime || row.end_datetime || row.endDatetime || row.endDate || '';
  const total = typeof row.totalPrice === 'number'
    ? row.totalPrice
    : (typeof row.total_price === 'number'
      ? row.total_price
      : (typeof row.price === 'number' ? row.price : 0));
  return {
    id: String(id),
    vehicleId: String(vehicleId),
    startIso: start,
    endIso: end,
    totalPrice: Number(total) || 0,
  };
};

const aggregateMonthlyRevenue = (rows: BookingRow[], year: number): number[] => {
  const months = Array.from({ length: 12 }, () => 0);
  const dayMs = 24 * 60 * 60 * 1000;

  const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  const endOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

  const yearStart = new Date(year, 0, 1, 0, 0, 0, 0);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

  for (const b of rows) {
    const startRaw = new Date(b.startIso || '');
    const endRaw = new Date(b.endIso || '');
    if (isNaN(startRaw.getTime()) && isNaN(endRaw.getTime())) continue;
    const s0 = isNaN(startRaw.getTime()) ? endRaw : startRaw;
    const e0 = isNaN(endRaw.getTime()) ? startRaw : endRaw;
    const start = s0 < e0 ? s0 : e0;
    const end = s0 < e0 ? e0 : s0;

    // Inclusive both edges: use start-of-day and end-of-day
    const realStart = startOfDay(start);
    const realEnd = endOfDay(end);

    let totalMs = realEnd.getTime() - realStart.getTime();
    if (totalMs <= 0) totalMs = dayMs; // at least one day

    // Clip to the target year (still inclusive)
    const clipStart = realStart < yearStart ? yearStart : realStart;
    const clipEnd = realEnd > yearEnd ? yearEnd : realEnd;
    if (clipEnd < clipStart) continue;

    let cursor = new Date(clipStart);
    while (cursor <= clipEnd) {
      const mEnd = endOfMonth(cursor);
      const segmentEnd = mEnd < clipEnd ? mEnd : clipEnd;
      const segmentMs = segmentEnd.getTime() - cursor.getTime();
      const fraction = segmentMs > 0 ? segmentMs / totalMs : 0;
      months[cursor.getMonth()] += (Number(b.totalPrice) || 0) * fraction;
      // move to next day start after segmentEnd (keeps inclusivity without double-count)
      const next = new Date(segmentEnd.getTime() + 1);
      cursor = startOfDay(next);
    }
  }
  return months;
};

export const DashboardStatsOverview = component$(() => {
  const chartLoaded = useSignal(false);
  const roleIsAdmin = useSignal<boolean>(false);

  // Stats counts
  const counts = useStore({ users: 0, companies: 0, vehicles: 0, bookings: 0 });
  const countsLoading = useSignal(true);
  const countsError = useSignal<string | null>(null);

  // We will create the chart after we fetch and aggregate bookings data

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const API_URL = import.meta.env.VITE_API_URL;

    try {
      countsLoading.value = true;
      countsError.value = null;

      // Resolve current user for company-scoped counts (non-admin)
      let isAdmin = false;
      let userCompanyId: string | null = null;
      try {
        const uid = getUserIdFromToken();
        if (uid) {
          const uRes = await fetchWithAuth(`${API_URL}/Users/${uid}`);
          if (uRes.ok) {
            const u = await uRes.json();
            isAdmin = Number(u?.roleId) === 1;
            if (u?.companyId) userCompanyId = String(u.companyId);
          }
        }
      } catch (e) {
        console.error('Failed to resolve user for dashboard counts', e);
      }
      roleIsAdmin.value = isAdmin;

      // Fetch datasets (parse once)
      const [usersRes, companiesRes, vehiclesRes, bookingsRes, maintenanceRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/Users`).catch(() => undefined as unknown as Response),
        fetchWithAuth(`${API_URL}/Companies`).catch(() => undefined as unknown as Response),
        fetchWithAuth(`${API_URL}/Vehicles`).catch(() => undefined as unknown as Response),
        fetchWithAuth(`${API_URL}/Booking`).catch(() => undefined as unknown as Response),
        fetchWithAuth(`${API_URL}/Maintenance`).catch(() => undefined as unknown as Response),
      ]);

      const usersData: any[] = usersRes && usersRes.ok ? await usersRes.json().catch(() => []) : [];
      const companiesData: any[] = companiesRes && companiesRes.ok ? await companiesRes.json().catch(() => []) : [];
      const vehiclesData: any[] = vehiclesRes && vehiclesRes.ok ? await vehiclesRes.json().catch(() => []) : [];
      const bookingsData: any[] = bookingsRes && bookingsRes.ok ? await bookingsRes.json().catch(() => []) : [];
      const maintenanceData: any[] = maintenanceRes && maintenanceRes.ok ? await maintenanceRes.json().catch(() => []) : [];

      let usersCount = 0;
      let companiesCount = 0;
      let vehiclesCount = 0;
      let bookingsCount = 0;

      if (isAdmin || !userCompanyId) {
        usersCount = Array.isArray(usersData) ? usersData.length : 0;
        companiesCount = Array.isArray(companiesData) ? companiesData.length : 0;
        vehiclesCount = Array.isArray(vehiclesData) ? vehiclesData.length : 0;
        bookingsCount = Array.isArray(bookingsData) ? bookingsData.length : 0;
      } else {
        const vehiclesInCompany = (Array.isArray(vehiclesData) ? vehiclesData : []).filter(
          (x: any) => String(x?.companyId ?? x?.company?.id ?? '') === userCompanyId
        );
        vehiclesCount = vehiclesInCompany.length;

        usersCount = (Array.isArray(usersData) ? usersData : []).filter(
          (x: any) => String(x?.companyId ?? '') === userCompanyId
        ).length;

        // For user: replace company count by maintenance schedules count
        // Count maintenance items whose vehicle belongs to user's company
        const allowedIds = new Set(vehiclesInCompany.map((x: any) => String(x?.id)));
        const maintenanceCount = (Array.isArray(maintenanceData) ? maintenanceData : []).filter((m: any) => {
          const vid = String(m?.vehicleId ?? m?.vehicle?.id ?? '');
          return allowedIds.has(vid);
        }).length;
        companiesCount = maintenanceCount;

        // Bookings scoped by company vehicles
        bookingsCount = (Array.isArray(bookingsData) ? bookingsData : []).filter((b: any) => {
          const vid = String(b?.vehicleId ?? b?.vehicle?.id ?? '');
          return allowedIds.has(vid);
        }).length;
      }

      counts.users = usersCount;
      counts.companies = companiesCount;
      counts.vehicles = vehiclesCount;
      counts.bookings = bookingsCount;

      // Build revenue datasets by month for current and previous year
      const now = new Date();
      const currentYear = now.getFullYear();
      const previousYear = currentYear - 1;

      let bookings: BookingRow[] = Array.isArray(bookingsData)
        ? (bookingsData as BookingApiShape[]).map(toBooking)
        : [];

      if (!isAdmin && userCompanyId) {
        const allowedIds = new Set(
          (Array.isArray(vehiclesData) ? vehiclesData : [])
            .filter((x: any) => String(x?.companyId ?? x?.company?.id ?? '') === userCompanyId)
            .map((x: any) => String(x?.id))
        );
        bookings = bookings.filter((b) => allowedIds.has(String(b.vehicleId)));
      }

      const revenueCurrent = aggregateMonthlyRevenue(bookings, currentYear);
      const revenuePrevious = aggregateMonthlyRevenue(bookings, previousYear);

      // Create chart after data is available (client only)
      const Chart = await import('chart.js/auto');
      const ctx = document.getElementById('salesChart') as HTMLCanvasElement | null;
      if (ctx) {
        // eslint-disable-next-line no-new
        new Chart.default(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
              {
                label: `Current Year (${currentYear})`,
                data: revenueCurrent,
                borderColor: '#00bcd4',
                backgroundColor: 'rgba(0,188,212,0.12)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
              },
              {
                label: `Previous Year (${previousYear})`,
                data: revenuePrevious,
                borderColor: '#6b5b95',
                backgroundColor: 'rgba(107,91,149,0.08)',
                fill: false,
                tension: 0.4,
                pointRadius: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: (ctx) => {
                    const v = ctx.parsed.y || 0;
                    return `${ctx.dataset.label}: ${v.toLocaleString()}`;
                  },
                },
              },
            },
            scales: {
              y: { beginAtZero: true },
            },
          },
        });
        chartLoaded.value = true;
      }

    } catch (err) {
      console.error('Failed to load counts', err);
      countsError.value = 'Failed to load overview stats';
    } finally {
      countsLoading.value = false;
    }
  });

  return (
    <div class="flex flex-col md:flex-row gap-2 md:gap-6 mt-8">
      {/* Card trái */}
      <div class="bg-white rounded-2xl shadow p-4 md:p-8 flex-1 min-w-full md:min-w-[400px] min-h-[280px] flex flex-col justify-between mb-2 md:mb-0">
        <div>
          <div class="text-lg font-bold mb-2">System Overview</div>
          <div class="text-blue-600 font-semibold text-sm mb-6 h-[20px]">
            {countsError.value ? (
              <span class="text-red-500">{countsError.value}</span>
            ) : (
              <span class="text-gray-400 font-normal">Realtime counts</span>
            )}
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 md:gap-8 items-end min-h-[120px]">
          {/* Users */}
          <div class="min-w-[80px]">
            <div class="flex items-center gap-2 mb-1 h-[26px]">
              <span class="bg-pink-500 rounded p-1 w-[26px] h-[26px] flex items-center justify-center">
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z"/></svg>
              </span>
              <span class="text-xs text-gray-500">Users</span>
            </div>
            <div class="text-2xl font-bold h-[32px] flex items-center">
              {countsLoading.value ? (
                <span class="inline-block h-6 w-12 bg-gray-200 rounded animate-pulse"></span>
              ) : (
                counts.users.toLocaleString()
              )}
            </div>
            <div class="h-1 bg-cyan-400 rounded mt-1 w-16"></div>
          </div>

          {/* Companies or Maintenance (for non-admin) */}
          <div class="min-w-[80px]">
            <div class="flex items-center gap-2 mb-1 h-[26px]">
              <span class="bg-blue-500 rounded p-1 w-[26px] h-[26px] flex items-center justify-center">
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M3 13h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6zm0-2V5a2 2 0 012-2h4v8H3zm10-8h4a2 2 0 012 2v8h-6V3z"/></svg>
              </span>
              <span class="text-xs text-gray-500">{roleIsAdmin.value ? 'Companies' : 'Maintenance'}</span>
            </div>
            <div class="text-2xl font-bold h-[32px] flex items-center">
              {countsLoading.value ? (
                <span class="inline-block h-6 w-12 bg-gray-200 rounded animate-pulse"></span>
              ) : (
                counts.companies.toLocaleString()
              )}
            </div>
            <div class="h-1 bg-cyan-400 rounded mt-1 w-16"></div>
          </div>

          {/* Vehicles */}
          <div class="min-w-[80px]">
            <div class="flex items-center gap-2 mb-1 h-[26px]">
              <span class="bg-orange-400 rounded p-1 w-[26px] h-[26px] flex items-center justify-center">
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M5 16l1.5-4.5A2 2 0 018.4 10h7.2a2 2 0 011.9 1.5L19 16m-9 0h4m-8 0a2 2 0 104 0 2 2 0 10-4 0zm8 0a2 2 0 104 0 2 2 0 10-4 0zM5 13h14"/></svg>
              </span>
              <span class="text-xs text-gray-500">Vehicles</span>
            </div>
            <div class="text-2xl font-bold h-[32px] flex items-center">
              {countsLoading.value ? (
                <span class="inline-block h-6 w-12 bg-gray-200 rounded animate-pulse"></span>
              ) : (
                counts.vehicles.toLocaleString()
              )}
            </div>
            <div class="h-1 bg-cyan-400 rounded mt-1 w-16"></div>
          </div>

          {/* Bookings */}
          <div class="min-w-[80px]">
            <div class="flex items-center gap-2 mb-1 h-[26px]">
              <span class="bg-pink-500 rounded p-1 w-[26px] h-[26px] flex items-center justify-center">
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M7 3h10a2 2 0 012 2v14l-7-3-7 3V5a2 2 0 012-2z"/></svg>
              </span>
              <span class="text-xs text-gray-500">Bookings</span>
            </div>
            <div class="text-2xl font-bold h-[32px] flex items-center">
              {countsLoading.value ? (
                <span class="inline-block h-6 w-12 bg-gray-200 rounded animate-pulse"></span>
              ) : (
                counts.bookings.toLocaleString()
              )}
            </div>
            <div class="h-1 bg-cyan-400 rounded mt-1 w-16"></div>
          </div>
        </div>
      </div>
      {/* Card phải: Chart */}
      <div class="bg-white rounded-2xl shadow p-4 md:p-8 flex-1 min-w-full md:min-w-[400px] min-h-[280px]">
        <div class="flex items-center gap-2 mb-2">
          <div class="font-bold">Sales Overview</div>
        </div>
        <div class="text-green-500 text-sm font-semibold mb-4">
          ↑ 4% MORE <span class="text-gray-400 font-normal">IN 2021</span>
        </div>
        <div class="overflow-x-auto">
          <div class="w-full h-[180px] min-h-[180px] relative">
            {!chartLoaded.value && (
              <div class="absolute inset-0 bg-gray-100 rounded animate-pulse flex items-center justify-center">
                <div class="text-gray-400 text-sm">Loading chart...</div>
              </div>
            )}
            <canvas id="salesChart" width="100%" height="180" class="w-full h-full"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
});