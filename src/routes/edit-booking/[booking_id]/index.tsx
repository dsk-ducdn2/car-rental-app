import { component$, useStore, useVisibleTask$, useSignal, $, } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { Sidebar } from '../../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader';
import { fetchWithAuth } from '../../../utils/api';

interface Option { id: string; label: string }

export default component$(() => {
  const API_URL = import.meta.env.VITE_API_URL;
  const loc = useLocation();
  const bookingId = loc.params.booking_id;

  const form = useStore({
    vehicleId: '',
    vehicleName: '',
    userId: '',
    userEmail: '',
    startDateTime: '',
    endDateTime: '',
    status: 'PENDING',
    totalPrice: 0,
  });

  const vehicles = useStore<Option[]>([]);
  const users = useStore<Option[]>([]);
  const loading = useSignal(true);
  const saving = useSignal(false);
  const error = useSignal('');
  const success = useSignal('');

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const [vRes, uRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/Vehicles`),
        fetchWithAuth(`${API_URL}/Users`),
      ]);
      if (vRes.ok) {
        const v = await vRes.json();
        vehicles.splice(0, vehicles.length, ...v.map((x: any, i: number) => ({ id: x.id || `v-${i}`, label: x.companyName ? `${x.brand || ''} ${x.licensePlate || ''}`.trim() : (x.name || `${x.brand || ''} ${x.licensePlate || ''}`).trim() })));
      }
      if (uRes.ok) {
        const u = await uRes.json();
        users.splice(0, users.length, ...u.map((x: any, i: number) => ({ id: x.id || `u-${i}`, label: x.email || x.gmail || `user-${i}` })));
      }

      // Load booking
      let res = await fetchWithAuth(`${API_URL}/Bookings/${bookingId}`).catch(() => undefined as unknown as Response);
      if (!res || !res.ok) res = await fetchWithAuth(`${API_URL}/Booking/${bookingId}`).catch(() => undefined as unknown as Response);
      if (res && res.ok) {
        const data = await res.json();
        const b = Array.isArray(data) ? data[0] : data;
        form.vehicleId = b.vehicleId || b.vehicle?.id || '';
        form.vehicleName = b.vehicleName || b.vehicle?.name || `${b.vehicle?.brand || ''} ${b.vehicle?.licensePlate || ''}`.trim();
        form.userId = b.userId || b.user?.id || '';
        form.userEmail = b.userEmail || b.user?.email || b.user?.gmail || '';
        form.startDateTime = (b.startDateTime || b.start_datetime || b.startDatetime || '').slice(0, 16);
        form.endDateTime = (b.endDateTime || b.end_datetime || b.endDatetime || '').slice(0, 16);
        form.status = (b.status || 'PENDING').toString().toUpperCase();
        form.totalPrice = Number(b.totalPrice ?? b.total_price ?? 0);
      }
    } catch (e) {
      console.error('Failed to load booking', e);
      error.value = 'Failed to load booking';
    } finally {
      loading.value = false;
    }
  });

  const handleSave = $(async () => {
    saving.value = true;
    error.value = '';
    success.value = '';
    try {
      // Only allow totalPrice to be updated; keep other fields from original form values
      const payload: any = {
        vehicleId: form.vehicleId,
        userId: form.userId,
        startDateTime: new Date(form.startDateTime).toISOString(),
        endDateTime: new Date(form.endDateTime).toISOString(),
        status: form.status,
        totalPrice: Number(form.totalPrice) || 0,
      };
      let res = await fetchWithAuth(`${API_URL}/Bookings/${bookingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => undefined as unknown as Response);
      if (!res || !res.ok) {
        res = await fetchWithAuth(`${API_URL}/Booking/${bookingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => undefined as unknown as Response);
      }
      if (res && res.ok) {
        success.value = 'Booking updated successfully';
        setTimeout(() => (window.location.href = '/booking'), 800);
      } else {
        const err = await res?.json().catch(() => ({} as any));
        error.value = err?.message || 'Failed to update booking';
      }
    } catch (e) {
      console.error('Update booking error', e);
      error.value = 'An error occurred while updating booking';
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
          <h1 class="text-2xl font-bold mb-6">Edit Booking</h1>
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
                  <label class="block text-sm font-medium text-gray-700 mb-1">Vehicle Name</label>
                  <input type="text" value={form.vehicleName} disabled class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">User Gmail</label>
                  <input type="text" value={form.userEmail} disabled class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Start Date Time</label>
                    <input type="datetime-local" value={form.startDateTime} disabled class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">End Date Time</label>
                    <input type="datetime-local" value={form.endDateTime} disabled class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600" />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                    <input type="number" step="1000" value={String(form.totalPrice)} onInput$={(e) => (form.totalPrice = Number((e.target as HTMLInputElement).value || 0))} class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div></div>
                </div>

                <div class="pt-4 flex items-center gap-3">
                  <button onClick$={handleSave} disabled={saving.value} class={`px-4 py-2 rounded-lg text-white ${saving.value ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}>
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


