import { component$, useStore, useVisibleTask$, useSignal, $, PropFunction } from '@builder.io/qwik';
import { getCookie } from '../../utils/api';
import { jwtDecode } from 'jwt-decode';
import { Sidebar } from '../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { fetchWithAuth } from '../../utils/api';

interface Option { id: string; label: string }

export default component$(() => {
  const API_URL = import.meta.env.VITE_API_URL;

  const form = useStore({
    vehicleId: '',
    userId: '',
    startDateTime: '',
    endDateTime: '',
    status: 'PENDING',
    totalPrice: 0,
  });

  const vehicles = useStore<Option[]>([]);
  const loading = useSignal(true);
  const saving = useSignal(false);
  const error = useSignal('');
  const success = useSignal('');
  const maintenanceDates = useStore<string[]>([]); // YYYY-MM-DD dates to highlight (maintenance)
  const bookedDates = useStore<string[]>([]); // YYYY-MM-DD dates that are already booked

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const [vRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/Vehicles`),
      ]);
      if (vRes.ok) {
        const v = await vRes.json();
        vehicles.splice(0, vehicles.length, ...v.map((x: any, i: number) => ({ id: x.id || `v-${i}`, label: x.companyName ? `${x.brand || ''} ${x.licensePlate || ''}`.trim() : (x.name || `${x.brand || ''} ${x.licensePlate || ''}`).trim() })));
      }
      // Prefill userId from JWT token
      try {
        const token = getCookie('access_token');
        if (token) {
          const decoded = jwtDecode<any>(token);
          const uid = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
          if (uid) form.userId = String(uid);
        }
      } catch {}
    } catch (e) {
      console.error('Failed to load options', e);
    } finally {
      loading.value = false;
    }
  });

  // Load disabled dates for the selected vehicle (split into maintenance vs booked)
  const loadMaintenanceDates = $(async (vehicleId: string) => {
    maintenanceDates.splice(0, maintenanceDates.length);
    bookedDates.splice(0, bookedDates.length);
    if (!vehicleId) return;
    try {
      const [maintRes, bookedRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/Maintenance`).catch(() => undefined as unknown as Response),
        fetchWithAuth(`${API_URL}/Booking/booked-dates/${vehicleId}`).catch(() => undefined as unknown as Response),
      ]);

      // Maintenance days
      if (maintRes && maintRes.ok) {
        const maintData = await maintRes.json().catch(() => []);
        if (Array.isArray(maintData)) {
          const isMaintainStatus = (raw: unknown): boolean => {
            if (raw === null || raw === undefined) return false;
            const s = String(raw).trim().toUpperCase();
            return s === '1' || s === '3' || s === 'SCHEDULED' || s === 'IN_PROGRESS';
          };

          for (const m of maintData) {
            const vid = m?.vehicleId ?? m?.vehicle?.id;
            if (String(vid) !== String(vehicleId)) continue;
            if (!isMaintainStatus(m?.status)) continue;
            const d = m?.scheduledDate ?? m?.scheduled_date ?? m?.date;
            if (!d) continue;
            const dt = new Date(d);
            if (isNaN(dt.getTime())) continue;
            const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
            maintenanceDates.push(key);
          }
        }
      }

      // Booked days (returned as array of YYYY-MM-DD)
      if (bookedRes && bookedRes.ok) {
        const bookedData = await bookedRes.json().catch(() => []);
        if (Array.isArray(bookedData)) {
          for (const d of bookedData) {
            if (!d) continue;
            // Ensure YYYY-MM-DD
            const dt = new Date(String(d).length > 10 ? d : `${d}T00:00:00`);
            if (isNaN(dt.getTime())) continue;
            const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
            bookedDates.push(key);
          }
        }
      }
      // De-duplicate within each bucket
      const uniqMaint = Array.from(new Set([...maintenanceDates]));
      const uniqBooked = Array.from(new Set([...bookedDates]));
      maintenanceDates.splice(0, maintenanceDates.length, ...uniqMaint);
      bookedDates.splice(0, bookedDates.length, ...uniqBooked);
    } catch (e) {
      console.error('Failed to load disabled dates', e);
    }
  });

  const handleSave = $(async () => {
    saving.value = true;
    error.value = '';
    success.value = '';
    try {
      const normalizeDateOnlyToISO = (dateStr: string, endOfDay = false) => {
        if (!dateStr) return '';
        const base = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
        if (endOfDay) {
          base.setHours(23, 59, 59, 999);
        }
        return base.toISOString();
      };

      const payload: any = {
        vehicleId: form.vehicleId,
        userId: form.userId,
        startDateTime: normalizeDateOnlyToISO(form.startDateTime, false),
        endDateTime: normalizeDateOnlyToISO(form.endDateTime, true),
        status: 'PENDING',
        totalPrice: Number(form.totalPrice) || 0,
      };
      let res = await fetchWithAuth(`${API_URL}/Bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => undefined as unknown as Response);
      if (!res || !res.ok) {
        res = await fetchWithAuth(`${API_URL}/Booking`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => undefined as unknown as Response);
      }
      if (res && res.ok) {
        success.value = 'Booking created successfully';
        setTimeout(() => (window.location.href = '/booking'), 800);
      } else {
        const err = await res?.json().catch(() => ({} as any));
        error.value = err?.message || 'Failed to create booking';
      }
    } catch (e) {
      console.error('Create booking error', e);
      error.value = 'An error occurred while creating booking';
    } finally {
      saving.value = false;
    }
  });

  return (
    <div class="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa]">
      <aside class="hidden md:block md:w-64 lg:w-72 xl:w-80 flex-shrink-0">
        <Sidebar />
      </aside>
      <main class="flex-1 w-full flex flex-col min-h-screen pb-16">
        <DashboardHeader />
        <div class="px-2 sm:px-4 md:px-8">
          <h1 class="text-2xl font-bold mb-6">Create Booking</h1>
          <div class="bg-white rounded shadow p-6 max-w-2xl">
            {loading.value ? (
              <div class="space-y-4">
                <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <div class="space-y-4">
                {error.value && (<div class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error.value}</div>)}
                {success.value && (<div class="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success.value}</div>)}

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                   <select
                     value={form.vehicleId}
                     onChange$={$((e: Event) => {
                       const id = (e.target as HTMLSelectElement).value;
                       form.vehicleId = id;
                       loadMaintenanceDates(id);
                     })}
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                   >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((v) => (<option key={v.id} value={v.id}>{v.label}</option>))}
                  </select>
                </div>

                {/* User selection removed; userId is taken from JWT */}

                <DateRangePicker
                  onChange$={$((start: string, end: string) => {
                    form.startDateTime = start;
                    form.endDateTime = end;
                  })}
                  maintenanceDates={maintenanceDates}
                  bookedDates={bookedDates}
                  disabled={!form.vehicleId}
                />

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Start date</label>
                     <input type="text" readOnly value={form.startDateTime} disabled={!form.vehicleId} class={`w-full px-3 py-2 border rounded-lg ${!form.vehicleId ? 'bg-gray-100 border-gray-200 text-gray-400' : 'border-gray-200 bg-gray-50'}`} />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">End date</label>
                     <input type="text" readOnly value={form.endDateTime} disabled={!form.vehicleId} class={`w-full px-3 py-2 border rounded-lg ${!form.vehicleId ? 'bg-gray-100 border-gray-200 text-gray-400' : 'border-gray-200 bg-gray-50'}`} />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                     <input type="number" step="1000" value={String(form.totalPrice)} disabled={!form.vehicleId} onInput$={(e) => (form.totalPrice = Number((e.target as HTMLInputElement).value || 0))} class={`w-full px-3 py-2 border rounded-lg ${!form.vehicleId ? 'bg-gray-100 border-gray-200 text-gray-400' : 'border-gray-300'}`} />
                  </div>
                  <div></div>
                </div>

                <div class="pt-4 flex items-center gap-3">
                  <button onClick$={handleSave} disabled={saving.value || !form.vehicleId} class={`px-4 py-2 rounded-lg text-white ${saving.value || !form.vehicleId ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}>
                    {saving.value ? 'Saving…' : 'Save'}
                  </button>
                  <a href="/booking" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Back</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
});

// Pure helper (module scope) to check if a date range intersects any blocked dates
const intersectsBlocked = (startIso: string, endIso: string, blocked: string[]): boolean => {
  const toDate = (s: string) => new Date(`${s}T00:00:00`);
  let d = toDate(startIso);
  const end = toDate(endIso);
  const seen = new Set(blocked);
  while (d <= end) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (seen.has(key)) return true;
    d.setDate(d.getDate() + 1);
  }
  return false;
};

// Inline Date Range Picker (2 months side-by-side)
interface DateRangePickerProps { onChange$: PropFunction<(start: string, end: string) => void>; disabled?: boolean }

export const DateRangePicker = component$<DateRangePickerProps & { maintenanceDates?: string[]; bookedDates?: string[] }>(({ onChange$, maintenanceDates = [], bookedDates = [], disabled = false }) => {
  const startMonthOffset = useSignal(0); // relative to today
  const selected = useStore<{ start: string | null; end: string | null }>({ start: null, end: null });

  const viDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

  // Disallow booking past dates
  const todayIso = (() => {
    const now = new Date();
    const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
  })();

  const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const fmtMonthTitle = (date: Date) =>
    `Tháng ${String(date.getMonth() + 1).padStart(2, '0')} ${date.getFullYear()}`;

  const fmtDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const buildMonth = (baseDate: Date) => {
    const first = startOfMonth(baseDate);
    const last = endOfMonth(baseDate);
    // Convert to Monday-start index (1..7), with Sunday as 7
    const firstDow = ((first.getDay() + 6) % 7) + 1; // 1 for Mon ... 7 for Sun
    const days: Date[] = [];
    for (let i = 1; i < firstDow; i++) {
      days.push(new Date(first.getFullYear(), first.getMonth(), 1 - (firstDow - i)));
    }
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(baseDate.getFullYear(), baseDate.getMonth(), d));
    }
    // Fill to 6 weeks
    while (days.length % 7 !== 0) {
      const lastDate = days[days.length - 1];
      days.push(new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1));
    }
    while (days.length < 42) {
      const lastDate = days[days.length - 1];
      days.push(new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1));
    }
    // Split into weeks
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return { title: fmtMonthTitle(baseDate), weeks, inMonth: (d: Date) => d.getMonth() === baseDate.getMonth() };
  };

  const isInRange = (iso: string) => {
    if (!selected.start || !selected.end) return false;
    return iso >= selected.start && iso <= selected.end;
  };

  const onPick = $((iso: string) => {
    // Block picking on maintenance days, booked days, and past days
    if (maintenanceDates.includes(iso) || bookedDates.includes(iso) || iso < todayIso) return;
    if (!selected.start || (selected.start && selected.end)) {
      selected.start = iso;
      selected.end = null;
    } else if (selected.start && !selected.end) {
      const startIso = iso < selected.start ? iso : selected.start;
      const endIso = iso < selected.start ? selected.start : iso;
      // Prevent selecting a range that includes past dates
      if (startIso < todayIso) return;
      if (intersectsBlocked(startIso, endIso, [...maintenanceDates, ...bookedDates])) return; // do not allow ranges that include blocked days
      selected.start = startIso;
      selected.end = endIso;
      // emit
      onChange$(selected.start, selected.end);
    }
  });

  const base = addMonths(new Date(), startMonthOffset.value);
  const left = buildMonth(base);
  const right = buildMonth(addMonths(base, 1));

  const MonthView = ({ data }: { data: ReturnType<typeof buildMonth> }) => (
    <div class="flex-1">
      <div class="flex items-center justify-center mb-1 font-semibold text-sm">{data.title}</div>
      <div class="space-y-1">
        {data.weeks.map((week, wi) => (
          <div key={wi} class="flex items-center justify-between gap-1 h-8 rounded-full bg-gray-100 px-2">
            {week.map((d, di) => {
              const iso = fmtDate(d);
              const inMonth = data.inMonth(d);
              const isStart = selected.start === iso;
              const isEnd = selected.end === iso;
              const inRange = isInRange(iso);
              const baseClasses = 'w-7 h-7 rounded-full cursor-pointer select-none flex items-center justify-center text-[12px]';
              const isMaint = maintenanceDates.includes(iso);
              const isBooked = bookedDates.includes(iso);
              const isPast = iso < todayIso;
              const color = isStart || isEnd
                ? 'bg-red-600 text-white'
                : inRange
                  ? 'bg-red-100 text-red-700'
                  : inMonth
                    ? (
                        isBooked
                          ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300 cursor-not-allowed'
                          : isMaint
                            ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300 cursor-not-allowed'
                            : isPast
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-transparent hover:bg-white text-gray-800'
                      )
                    : 'bg-transparent text-gray-400';
              const sunday = d.getDay() === 0 && inMonth && !(isStart || isEnd || inRange);
              return (
                <button
                  key={di}
                  disabled={isMaint || isBooked || isPast}
                  title={isPast ? 'Past date' : isBooked ? 'Booked' : isMaint ? 'Scheduled maintenance' : ''}
                  onClick$={() => onPick(iso)}
                  class={`${baseClasses} ${color} ${sunday ? 'text-red-500' : ''}`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div class={`relative rounded-xl border border-gray-200 p-2 w-full max-w-[701px] h-[389px] overflow-hidden shadow bg-white`}>
      {disabled && (
        <div class="absolute inset-0 bg-white/60 backdrop-blur-[1px] cursor-not-allowed z-10"></div>
      )}
      <div class="flex items-center justify-between mb-1">
        <button onClick$={() => (startMonthOffset.value = startMonthOffset.value - 1)} class="px-2 py-0.5 text-gray-600 hover:text-gray-800 border rounded-md leading-none">◀</button>
        <div class="text-sm text-gray-600">Pick date</div>
        <button onClick$={() => (startMonthOffset.value = startMonthOffset.value + 1)} class="px-2 py-0.5 text-gray-600 hover:text-gray-800 border rounded-md leading-none">▶</button>
      </div>
      <div class="flex justify-center items-center gap-4 h-[340px]">
        <div class="w-[320px] overflow-hidden">
          <MonthView data={left} />
        </div>
        <div class="w-[320px] overflow-hidden">
          <MonthView data={right} />
        </div>
      </div>
    </div>
  );
});


