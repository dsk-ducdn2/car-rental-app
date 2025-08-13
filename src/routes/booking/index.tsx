import { component$, useStore, useVisibleTask$, useSignal, useComputed$, $ } from '@builder.io/qwik';
import { Sidebar } from '../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { fetchWithAuth } from '../../utils/api';

interface BookingApiShape {
  id?: string;
  bookingId?: string;
  vehicleId?: string;
  vehicle?: { id?: string; name?: string; brand?: string; licensePlate?: string };
  vehicleName?: string;
  userId?: string;
  user?: { id?: string; email?: string; gmail?: string; name?: string };
  userEmail?: string;
  startDateTime?: string;
  start_datetime?: string;
  startDatetime?: string;
  startDate?: string;
  endDateTime?: string;
  end_datetime?: string;
  endDatetime?: string;
  endDate?: string;
  status?: string;
  totalPrice?: number;
  total_price?: number;
  price?: number;
}

interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  userId: string;
  userEmail: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
  totalPrice: number;
}

const toBooking = (row: BookingApiShape, index: number): Booking => {
  const id = row.id || row.bookingId || `booking-${index}`;
  const vehicleId = row.vehicleId || row.vehicle?.id || '';
  const vehicleName = row.vehicleName || row.vehicle?.name || [row.vehicle?.brand, row.vehicle?.licensePlate].filter(Boolean).join(' ') || 'N/A';
  const userId = row.userId || row.user?.id || '';
  const userEmail = row.userEmail || row.user?.email || row.user?.gmail || 'N/A';
  const start =
    row.startDateTime ||
    row.start_datetime ||
    row.startDatetime ||
    row.startDate ||
    '';
  const end =
    row.endDateTime ||
    row.end_datetime ||
    row.endDatetime ||
    row.endDate ||
    '';
  const total = typeof row.totalPrice === 'number'
    ? row.totalPrice
    : (typeof row.total_price === 'number'
      ? row.total_price
      : (typeof row.price === 'number' ? row.price : 0));
  return {
    id: String(id),
    vehicleId: String(vehicleId),
    vehicleName,
    userId: String(userId),
    userEmail,
    startDateTime: start,
    endDateTime: end,
    totalPrice: total,
  };
};

const transformBookings = (rows: BookingApiShape[]): Booking[] => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toBooking);
};

export default component$(() => {
  const store = useStore<{ bookings: Booking[]; loading: boolean }>({ bookings: [], loading: true });
  const API_URL = import.meta.env.VITE_API_URL;

  const ITEMS_PER_PAGE = 8;
  const currentPage = useSignal(1);
  const searchTerm = useSignal('');
  const filterDate = useSignal(''); // YYYY-MM-DD

  // Notification + delete dialog
  const showNotification = useSignal(false);
  const notificationMessage = useSignal('');
  const notificationType = useSignal<'success' | 'error'>('success');
  const showDeleteDialog = useSignal(false);
  const deletingBookingId = useSignal<string | null>(null);

  const filteredBookings = useComputed$(() => {
    let filtered = store.bookings;
    if (searchTerm.value.trim()) {
      const s = searchTerm.value.toLowerCase().trim();
      filtered = filtered.filter((b) =>
        b.vehicleName.toLowerCase().includes(s) ||
        b.userEmail.toLowerCase().includes(s)
      );
    }
    if (filterDate.value) {
      const ymd = filterDate.value; // already YYYY-MM-DD from input[type=date]
      const toYmd = (iso: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        if (isNaN(d.getTime())) return String(iso).slice(0, 10);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };
      filtered = filtered.filter((b) => {
        const s = toYmd(b.startDateTime);
        const e = toYmd(b.endDateTime);
        if (!s || !e) return false;
        return ymd >= s && ymd <= e;
      });
    }
    return filtered;
  });

  const totalPages = useComputed$(() => Math.ceil((filteredBookings.value.length || 0) / ITEMS_PER_PAGE));
  const paginatedBookings = useComputed$(() => {
    const startIndex = (currentPage.value - 1) * ITEMS_PER_PAGE;
    const endIndex = currentPage.value * ITEMS_PER_PAGE;
    return filteredBookings.value.slice(startIndex, endIndex);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      // Try plural then singular
      let res = await fetchWithAuth(`${API_URL}/Booking`).catch(() => undefined as unknown as Response);
      if (!res || !res.ok) {
        res = await fetchWithAuth(`${API_URL}/Booking`).catch(() => undefined as unknown as Response);
      }
      if (res && res.ok) {
        const data = await res.json();
        store.bookings = transformBookings(data);
      } else {
        store.bookings = [];
      }
    } catch (e) {
      console.error('Failed to fetch bookings', e);
      store.bookings = [];
    } finally {
      store.loading = false;
    }
  });

  const openDelete = $((id: string) => {
    deletingBookingId.value = id;
    showDeleteDialog.value = true;
  });

  const cancelDelete = $(() => {
    showDeleteDialog.value = false;
    deletingBookingId.value = null;
  });

  const confirmDelete = $(async () => {
    if (!deletingBookingId.value) return;
    try {
      // Try plural then singular
      let res = await fetchWithAuth(`${API_URL}/Booking/${deletingBookingId.value}`, { method: 'DELETE' }).catch(() => undefined as unknown as Response);
      if (!res || !res.ok) {
        res = await fetchWithAuth(`${API_URL}/Booking/${deletingBookingId.value}`, { method: 'DELETE' }).catch(() => undefined as unknown as Response);
      }
      if (res && res.ok) {
        const idx = store.bookings.findIndex((b) => b.id === deletingBookingId.value);
        if (idx !== -1) store.bookings.splice(idx, 1);
        notificationMessage.value = 'Booking deleted successfully';
        notificationType.value = 'success';
      } else {
        notificationMessage.value = 'Failed to delete booking';
        notificationType.value = 'error';
      }
    } catch (e) {
      console.error('Delete booking error', e);
      notificationMessage.value = 'An error occurred while deleting booking';
      notificationType.value = 'error';
    } finally {
      showNotification.value = true;
      setTimeout(() => (showNotification.value = false), 3000);
      showDeleteDialog.value = false;
      deletingBookingId.value = null;
    }
  });

  // Status column removed

  const formatDateTime = (iso: string) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    // Only return date (ngày/tháng/năm) in Vietnamese locale
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <div class="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa]">
      <aside class="hidden md:block md:w-64 lg:w-72 xl:w-80 flex-shrink-0">
        <Sidebar />
      </aside>
      <main class="flex-1 w-full flex flex-col min-h-screen pb-16">
        <DashboardHeader />
        <div class="px-2 sm:px-4 md:px-8">
          <h1 class="text-2xl font-bold mb-6">Bookings</h1>

          <div class="bg-white rounded shadow p-6 min-h-[600px]">
            {showNotification.value && (
              <div class={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${notificationType.value === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                <div class="flex items-center justify-between gap-6">
                  <span>{notificationMessage.value}</span>
                  <button onClick$={() => (showNotification.value = false)} class="text-white/90 hover:text-white">✕</button>
                </div>
              </div>
            )}

            {showDeleteDialog.value && (
              <div class="fixed inset-0 flex items-center justify-center z-50" style="background-color: rgba(0, 0, 0, 0.3); backdrop-filter: blur(2px);">
                <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative shadow-2xl">
                  <button onClick$={cancelDelete} class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
                  <h3 class="text-lg font-semibold text-center mb-2">Delete Booking</h3>
                  <p class="text-gray-600 text-center mb-6">Are you sure you want to delete this booking?</p>
                  <div class="flex gap-3 justify-center">
                    <button onClick$={cancelDelete} class="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick$={confirmDelete} class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                  </div>
                </div>
              </div>
            )}

            {store.loading ? (
              <div class="space-y-4">
                {/* Controls skeleton */}
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 px-6">
                  <div class="flex-1 max-w-md"><div class="h-10 bg-gray-200 rounded-lg animate-pulse"></div></div>
                  <div class="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full bg-white rounded-lg">
                    <thead>
                      <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                        <th class="py-3 px-6">Vehicle Name</th>
                        <th class="py-3 px-6">User Gmail</th>
                        <th class="py-3 px-6">Start</th>
                        <th class="py-3 px-6">End</th>
                        <th class="py-3 px-6">Total Price</th>
                        <th class="py-3 px-6">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <tr key={idx} class="border-b border-gray-200">
                          <td class="py-4 px-6"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                          <td class="py-4 px-6"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                          <td class="py-4 px-6"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                          <td class="py-4 px-6"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                          <td class="py-4 px-6"><div class="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                          <td class="py-4 px-6"><div class="h-6 w-28 bg-gray-200 rounded animate-pulse"></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div class="relative w-full h-full">
                {/* Controls */}
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 px-6">
                  <div class="flex-1 max-w-md">
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search by vehicle, user..."
                        value={searchTerm.value}
                        onInput$={(e) => {
                          searchTerm.value = (e.target as HTMLInputElement).value;
                          currentPage.value = 1;
                        }}
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <label class="text-sm text-gray-600">Filter date</label>
                    <input
                      type="date"
                      value={filterDate.value}
                      onInput$={(e) => {
                        filterDate.value = (e.target as HTMLInputElement).value;
                        currentPage.value = 1;
                      }}
                      class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    {filterDate.value && (
                      <button
                        onClick$={() => { filterDate.value = ''; currentPage.value = 1; }}
                        class="text-gray-600 hover:text-gray-800 text-sm px-2 py-1 border border-gray-300 rounded"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <a
                    href="/create-booking"
                    class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Create Booking
                  </a>
                </div>

                {/* Table */}
                <div class="overflow-x-auto">
                  <table class="min-w-full bg-white rounded-lg">
                    <thead>
                      <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                        <th class="py-3 px-6">Vehicle Name</th>
                        <th class="py-3 px-6">User Gmail</th>
                        <th class="py-3 px-6">Start</th>
                        <th class="py-3 px-6">End</th>
                        <th class="py-3 px-6">Total Price</th>
                        <th class="py-3 px-6">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(paginatedBookings.value) && paginatedBookings.value.length > 0 ? (
                        paginatedBookings.value.map((b, idx) => (
                          <tr key={idx} class="group hoverable-row border-b border-gray-200 hover:bg-gray-50">
                            <td class="py-4 px-6"><div class="row-text text-sm text-gray-800 transition-colors">{b.vehicleName}</div></td>
                            <td class="py-4 px-6"><div class="row-text text-sm text-gray-700 transition-colors">{b.userEmail}</div></td>
                            <td class="py-4 px-6"><div class="row-text text-sm text-gray-700 transition-colors">{formatDateTime(b.startDateTime)}</div></td>
                            <td class="py-4 px-6"><div class="row-text text-sm text-gray-700 transition-colors">{formatDateTime(b.endDateTime)}</div></td>
                            <td class="py-4 px-6"><div class="row-text text-sm text-gray-700 transition-colors">{b.totalPrice.toLocaleString()}</div></td>
                            <td class="py-4 px-6">
                              <div class="flex items-center gap-2">
                                <button onClick$={() => openDelete(b.id)} class="text-red-600 font-semibold hover:underline text-sm px-2 py-1 rounded hover:bg-red-50">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} class="text-center py-6 text-gray-400">No bookings available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div class="flex justify-end items-center mt-4 pr-6">
                  <div class="flex items-center gap-3">
                    <button
                      class={`px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium transition-colors ${currentPage.value === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'}`}
                      disabled={currentPage.value === 1}
                      onClick$={() => (currentPage.value = currentPage.value - 1)}
                    >
                      Previous
                    </button>
                    <span class="text-sm font-medium text-gray-700 select-none">Page {currentPage.value} of {totalPages.value}</span>
                    <button
                      class={`px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium transition-colors ${currentPage.value === totalPages.value ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'}`}
                      disabled={currentPage.value === totalPages.value}
                      onClick$={() => (currentPage.value = currentPage.value + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
});


