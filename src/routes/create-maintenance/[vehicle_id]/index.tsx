import { component$, useSignal, useVisibleTask$, $, useStore, PropFunction } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { Sidebar } from '../../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader';
import { fetchWithAuth } from '../../../utils/api';

interface VehicleSummary {
  id: string;
  licensePlate: string;
  brand: string;
  companyName?: string;
}

export default component$(() => {
  const loc = useLocation();
  const vehicleId = loc.params.vehicle_id;
  const API_URL = import.meta.env.VITE_API_URL;

  const vehicle = useSignal<VehicleSummary | null>(null);
  const loadingVehicle = useSignal<boolean>(true);

  const formData = useStore({
    title: '',
    description: '',
    scheduledDate: '',
  });

  const submitting = useSignal<boolean>(false);
  const error = useSignal<string>('');

  const today = new Date().toISOString().split('T')[0];

  // Calendaring data for highlighting
  const maintenanceDates = useStore<string[]>([]); // existing maintenance dates (YYYY-MM-DD)
  const bookedDates = useStore<string[]>([]); // YYYY-MM-DD dates that are already booked
  const ruleDates = useStore<string[]>([]); // YYYY-MM-DD dates with special pricing rules
  const rulePriceByDate = useStore<Record<string, number>>({}); // map date -> price per day

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/Vehicles/${vehicleId}`);
      const data = await res.json();
      vehicle.value = {
        id: data.id,
        licensePlate: data.licensePlate,
        brand: data.brand,
        companyName: data.companyName || data.company?.name,
      };
    } catch (e) {
      console.error('Failed to fetch vehicle', e);
      vehicle.value = null;
    } finally {
      loadingVehicle.value = false;
    }
  });

  // Fetch maintenance, booked dates and rule dates for this vehicle to decorate the calendar
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (!vehicleId) return;
    try {
      // Clear previous
      maintenanceDates.splice(0, maintenanceDates.length);
      bookedDates.splice(0, bookedDates.length);
      ruleDates.splice(0, ruleDates.length);
      for (const k of Object.keys(rulePriceByDate)) delete rulePriceByDate[k];

      const [maintRes, bookedRes, ruleRes, vehicleRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/Maintenance`).catch(() => undefined as unknown as Response),
        fetchWithAuth(`${API_URL}/Booking/booked-dates/${vehicleId}`).catch(() => undefined as unknown as Response),
        fetchWithAuth(`${API_URL}/VehiclePricingRule/${vehicleId}`).catch(() => undefined as unknown as Response),
        fetchWithAuth(`${API_URL}/Vehicles/${vehicleId}`).catch(() => undefined as unknown as Response),
      ]);

      // Maintenance days (SCHEDULED/IN_PROGRESS)
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

      // Booked days
      if (bookedRes && bookedRes.ok) {
        const bookedData = await bookedRes.json().catch(() => []);
        if (Array.isArray(bookedData)) {
          for (const d of bookedData) {
            if (!d) continue;
            const dt = new Date(String(d).length > 10 ? d : `${d}T00:00:00`);
            if (isNaN(dt.getTime())) continue;
            const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
            bookedDates.push(key);
          }
        }
      }

      // Pricing Rule days
      if (ruleRes && ruleRes.ok) {
        const data = await ruleRes.json().catch(() => []);
        const rules = Array.isArray(data) ? data : data ? [data] : [];

        // Determine base price from vehicle details if needed
        let basePrice = 0;
        if (vehicleRes && vehicleRes.ok) {
          const vehicle = await vehicleRes.json().catch(() => ({} as any));
          const activeRule = vehicle?.vehiclePricingRules && vehicle.vehiclePricingRules.length > 0
            ? vehicle.vehiclePricingRules[0]
            : null;
          basePrice = Number(activeRule?.pricePerDay || vehicle?.pricePerDay || 0) || 0;
        }

        for (const r of rules) {
          const startRaw = r?.effectiveDate || r?.effective_date;
          const endRaw = r?.expiryDate || r?.expiry_date || r?.expiredDate;
          if (!startRaw || !endRaw) continue;
          const start = new Date(startRaw);
          const end = new Date(endRaw);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;
          const perDay = Number(r?.pricePerDay) || (Number(r?.holidayMultiplier) ? Number(r.holidayMultiplier) * basePrice : 0);
          const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
          const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
          while (d <= endDay) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            ruleDates.push(key);
            if (perDay > 0) rulePriceByDate[key] = perDay;
            d.setDate(d.getDate() + 1);
          }
        }
      }

      // De-duplicate
      const uniqMaint = Array.from(new Set([...maintenanceDates]));
      const uniqBooked = Array.from(new Set([...bookedDates]));
      const uniqRule = Array.from(new Set([...ruleDates]));
      maintenanceDates.splice(0, maintenanceDates.length, ...uniqMaint);
      bookedDates.splice(0, bookedDates.length, ...uniqBooked);
      ruleDates.splice(0, ruleDates.length, ...uniqRule);
    } catch (e) {
      console.error('Failed to load booked/rule dates for maintenance calendar', e);
    }
  });

  const handleSubmit = $(async () => {
    if (!formData.title.trim() || !formData.scheduledDate) {
      error.value = 'Please fill in all required fields';
      return;
    }

    submitting.value = true;
    error.value = '';

    try {
      const response = await fetchWithAuth(`${API_URL}/Maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: vehicleId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          scheduledDate: formData.scheduledDate,
        }),
      });

      if (response.ok) {
        window.location.href = '/maintenance-schedules';
      } else {
        const errorData = await response.json().catch(() => ({}));
        error.value = errorData.message || 'Failed to create maintenance schedule';
      }
    } catch (err) {
      console.error('Error creating maintenance schedule:', err);
      error.value = 'An error occurred while creating the maintenance schedule';
    } finally {
      submitting.value = false;
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
          <h1 class="text-2xl font-bold mb-6">Create Maintenance Schedule</h1>
          <div class="bg-white rounded shadow p-6 min-h-[400px]">
            {loadingVehicle.value ? (
              <div class="flex justify-center items-center min-h-[200px]">
                <div class="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : vehicle.value ? (
              <div class="max-w-xl">
                <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span class="text-sm font-medium text-blue-900">
                      Vehicle: {vehicle.value.brand} {vehicle.value.licensePlate}
                    </span>
                  </div>
                </div>

                {error.value && (
                  <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                      <span class="text-sm text-red-700">{error.value}</span>
                    </div>
                  </div>
                )}

                <form preventdefault:submit onSubmit$={handleSubmit} class="space-y-4">
                  <div>
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                      Title <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onInput$={(e) => {
                        formData.title = (e.target as HTMLInputElement).value;
                        if (error.value) error.value = '';
                      }}
                      placeholder="Enter maintenance title"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      disabled={submitting.value}
                    />
                  </div>

                  <div>
                    <label for="scheduledDate" class="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Date <span class="text-red-500">*</span>
                    </label>
                    <SingleDatePicker
                      value={formData.scheduledDate}
                      onChange$={$((date: string) => {
                        formData.scheduledDate = date;
                        if (error.value) error.value = '';
                      })}
                      min={today}
                      maintenanceDates={maintenanceDates}
                      bookedDates={bookedDates}
                      ruleDates={ruleDates}
                      rulePriceByDate={rulePriceByDate}
                      disabled={submitting.value}
                    />
                  </div>

                  <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onInput$={(e) => {
                        formData.description = (e.target as HTMLTextAreaElement).value;
                        if (error.value) error.value = '';
                      }}
                      placeholder="Enter maintenance description"
                      rows={4}
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                      disabled={submitting.value}
                    />
                  </div>

                  <div class="flex gap-3 justify-end pt-4">
                    <a
                      href="/vehicles"
                      class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </a>
                    <button
                      type="submit"
                      disabled={submitting.value}
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting.value && (
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {submitting.value ? 'Creating...' : 'Create Schedule'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div class="flex justify-center items-center min-h-[200px]">
                <p class="text-red-500">Failed to load vehicle data</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
});

// Single-date picker with decorated dates (booked and pricing-rule days)
interface SingleDatePickerProps {
  value?: string;
  min?: string;
  disabled?: boolean;
  maintenanceDates?: string[];
  bookedDates?: string[];
  ruleDates?: string[];
  rulePriceByDate?: Record<string, number>;
  onChange$: PropFunction<(dateIso: string) => void>;
}

const SingleDatePicker = component$<SingleDatePickerProps>(({
  value = '',
  min,
  disabled = false,
  maintenanceDates = [],
  bookedDates = [],
  ruleDates = [],
  rulePriceByDate = {},
  onChange$,
}) => {
  const monthOffset = useSignal(0);
  const selected = useSignal<string | null>(value || null);

  const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const fromIso = (iso: string) => new Date(`${iso}T00:00:00`);
  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const fmtMonthTitle = (date: Date) => `Tháng ${String(date.getMonth() + 1).padStart(2, '0')} ${date.getFullYear()}`;

  const buildMonth = (baseDate: Date) => {
    const first = startOfMonth(baseDate);
    const last = endOfMonth(baseDate);
    const firstDow = ((first.getDay() + 6) % 7) + 1; // 1..7 Mon..Sun
    const days: Date[] = [];
    for (let i = 1; i < firstDow; i++) days.push(new Date(first.getFullYear(), first.getMonth(), 1 - (firstDow - i)));
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(baseDate.getFullYear(), baseDate.getMonth(), d));
    while (days.length % 7 !== 0) {
      const lastDate = days[days.length - 1];
      days.push(new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1));
    }
    while (days.length < 42) {
      const lastDate = days[days.length - 1];
      days.push(new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1));
    }
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return { title: fmtMonthTitle(baseDate), weeks, inMonth: (d: Date) => d.getMonth() === baseDate.getMonth() };
  };

  const onPick = $((iso: string) => {
    if (disabled) return;
    if (min && iso < min) return;
    if (bookedDates.includes(iso)) return;
    selected.value = iso;
    onChange$(iso);
  });

  const base = new Date();
  base.setMonth(base.getMonth() + monthOffset.value);
  const month = buildMonth(base);

  const formatVnd = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div class={`border border-gray-200 rounded-lg p-2 bg-white ${disabled ? 'opacity-60' : ''}`}>
      <div class="flex items-center justify-between mb-2">
        <button type="button" onClick$={() => (monthOffset.value = monthOffset.value - 1)} class="px-2 py-1 text-gray-600 hover:text-gray-800 border rounded">◀</button>
        <div class="text-sm text-gray-700 font-medium">{month.title}</div>
        <button type="button" onClick$={() => (monthOffset.value = monthOffset.value + 1)} class="px-2 py-1 text-gray-600 hover:text-gray-800 border rounded">▶</button>
      </div>
      <div class="space-y-1">
        {month.weeks.map((week, wi) => (
          <div key={wi} class="flex items-center justify-between gap-1 h-8 rounded-full bg-gray-100 px-2">
            {week.map((d, di) => {
              const iso = toIso(d);
              const inMonth = month.inMonth(d);
              const isBooked = bookedDates.includes(iso);
              const isMaint = maintenanceDates.includes(iso);
              const isRule = ruleDates.includes(iso);
              const rulePrice = isRule ? Number((rulePriceByDate as any)[iso] || 0) : 0;
              const isMinBlocked = !!min && iso < min;
              const isSelected = selected.value === iso;
              const baseClasses = 'w-7 h-7 rounded-full cursor-pointer select-none flex items-center justify-center text-[12px]';
              const color = isSelected
                ? 'bg-red-600 text-white'
                : inMonth
                  ? (
                    isBooked
                      ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300 cursor-not-allowed'
                      : isMaint
                        ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300 cursor-not-allowed'
                        : isMinBlocked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isRule
                          ? 'bg-purple-100 text-purple-800 ring-1 ring-purple-300'
                          : 'bg-transparent hover:bg-white text-gray-800'
                  )
                  : 'bg-transparent text-gray-400';
              return (
                <button
                  key={di}
                  disabled={disabled || isBooked || isMaint || isMinBlocked}
                  onClick$={() => onPick(iso)}
                  title={isBooked ? 'Booked' : isMaint ? 'Scheduled maintenance' : isRule ? `Special pricing: ${rulePrice > 0 ? formatVnd(rulePrice) + '/ngày' : ''}` : isMinBlocked ? 'Past date' : ''}
                  class={`${baseClasses} ${color}`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div class="flex items-center gap-4 mt-3 text-xs text-gray-600">
        <div class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded bg-blue-200 ring-1 ring-blue-300"></span>Booked</div>
        <div class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded bg-yellow-200 ring-1 ring-yellow-300"></span>Maintenance</div>
        <div class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded bg-purple-200 ring-1 ring-purple-300"></span>Rule price</div>
        <div class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded bg-red-600"></span>Selected</div>
      </div>
    </div>
  );
});

