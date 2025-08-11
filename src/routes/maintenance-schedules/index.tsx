import { component$, useStore, useVisibleTask$, useSignal, useComputed$, $ } from '@builder.io/qwik';
import { Sidebar } from '../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { fetchWithAuth } from '../../utils/api';

interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  vehicleName: string;
  title: string;
  description: string;
  scheduledDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: {
    id: string;
    licensePlate: string;
    brand: string;
    companyName: string;
  };
}

// Normalize API status
// Only 3 statuses are used now:
// 1 -> SCHEDULED, 3 -> IN_PROGRESS, 4 -> FINISHED
// Any legacy value (including 2 or 'REMINDER_SENT') will be coerced to SCHEDULED
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
  // Fallback: coerce any string to uppercase; default to SCHEDULED
  const upper = str.toUpperCase();
  if (upper === 'REMINDER_SENT') return 'SCHEDULED';
  if (upper === 'SCHEDULED' || upper === 'IN_PROGRESS' || upper === 'FINISHED') return upper;
  return 'SCHEDULED';
};

const transformMaintenanceData = (schedules: any[]) => {
  if (!Array.isArray(schedules)) return [];
  return schedules.map((schedule, index) => {
    const vehicle = schedule.vehicle || {};
    const brand = vehicle.brand || schedule.brand || '';
    const license = vehicle.licensePlate || schedule.licensePlate || '';
    return {
      id: schedule.id || `schedule-${index}`,
      vehicleId: schedule.vehicleId || vehicle.id || '',
      vehicleName: `${brand} ${license}`.trim() || schedule.vehicleName || 'N/A',
      title: schedule.title || 'N/A',
      description: schedule.description || 'N/A',
      scheduledDate: schedule.scheduledDate ? String(schedule.scheduledDate).split('T')[0] : 'N/A',
      status: normalizeStatus(schedule.status || 'scheduled'),
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
      vehicle: vehicle,
    } as MaintenanceSchedule;
  });
};

export default component$(() => {
  const store = useStore<{ schedules: MaintenanceSchedule[]; loading: boolean }>({ 
    schedules: [], 
    loading: true 
  });
  
  const ITEMS_PER_PAGE = 8;
  const currentPage = useSignal(1);
  const searchTerm = useSignal('');
  const startDate = useSignal('');
  const endDate = useSignal('');
  // Removed status filter; only search remains
  
  const API_URL = import.meta.env.VITE_API_URL;

  // Notification and delete dialog state
  const showNotification = useSignal(false);
  const notificationMessage = useSignal('');
  const notificationType = useSignal<'success' | 'error'>('success');
  const showDeleteDialog = useSignal(false);
  const deletingScheduleId = useSignal<string | null>(null);

  // Filter schedules based on search term and status
  const filteredSchedules = useComputed$(() => {
    let filtered = store.schedules;
    
    if (searchTerm.value.trim()) {
      const searchLower = searchTerm.value.toLowerCase().trim();
      filtered = filtered.filter((schedule) => 
        schedule.vehicleName.toLowerCase().includes(searchLower) ||
        schedule.title.toLowerCase().includes(searchLower) ||
        schedule.description.toLowerCase().includes(searchLower) ||
        schedule.status.toLowerCase().includes(searchLower)
      );
    }
    
    if (startDate.value || endDate.value) {
      let from = startDate.value;
      let to = endDate.value;
      if (from && to && from > to) {
        // swap to keep a valid range
        const temp = from;
        from = to;
        to = temp;
      }
      filtered = filtered.filter((schedule) => {
        const d = schedule.scheduledDate;
        if (!d || d === 'N/A') return false;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }
    
    return filtered;
  });

  const totalPages = useComputed$(() =>
    Math.ceil((filteredSchedules.value.length || 0) / ITEMS_PER_PAGE)
  );

  const paginatedSchedules = useComputed$(() => {
    const startIndex = (currentPage.value - 1) * ITEMS_PER_PAGE;
    const endIndex = currentPage.value * ITEMS_PER_PAGE;
    return filteredSchedules.value.slice(startIndex, endIndex);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/Maintenance`);
      const data = await res.json();
      store.schedules = transformMaintenanceData(data);
    } catch (error) {
      console.error('Failed to fetch maintenance schedules:', error);
      store.schedules = [];
    } finally {
      store.loading = false;
    }
  });

  const handlePreviousPage = $(() => {
    if (currentPage.value > 1) {
      currentPage.value = currentPage.value - 1;
    }
  });

  const handleNextPage = $(() => {
    if (currentPage.value < totalPages.value) {
      currentPage.value = currentPage.value + 1;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-700';
      case 'FINISHED':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'N/A') return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openDelete = $((scheduleId: string) => {
    deletingScheduleId.value = scheduleId;
    showDeleteDialog.value = true;
  });

  const cancelDelete = $(() => {
    showDeleteDialog.value = false;
    deletingScheduleId.value = null;
  });

  const confirmDelete = $(async () => {
    if (!deletingScheduleId.value) return;
    try {
      const endpoint = `${API_URL}/Maintenance/${deletingScheduleId.value}`;
      const response = await fetchWithAuth(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const idx = store.schedules.findIndex(s => s.id === deletingScheduleId.value);
        if (idx !== -1) {
          store.schedules.splice(idx, 1);
        }
        notificationMessage.value = 'Schedule deleted successfully';
        notificationType.value = 'success';
      } else {
        notificationMessage.value = 'Failed to delete schedule';
        notificationType.value = 'error';
      }
    } catch (err) {
      console.error('Error deleting maintenance schedule:', err);
      notificationMessage.value = 'An error occurred while deleting schedule';
      notificationType.value = 'error';
    } finally {
      showNotification.value = true;
      setTimeout(() => {
        showNotification.value = false;
      }, 3000);
      showDeleteDialog.value = false;
      deletingScheduleId.value = null;
    }
  });

  return (
    <div class="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa]">
      {/* Sidebar: hidden on mobile, show on md and up */}
      <aside class="hidden md:block md:w-64 lg:w-72 xl:w-80 flex-shrink-0">
        <Sidebar />
      </aside>
      <main class="flex-1 w-full flex flex-col min-h-screen pb-16">
        <DashboardHeader />
        <div class="px-2 sm:px-4 md:px-8">
          <h1 class="text-2xl font-bold mb-6">Maintenance Schedules</h1>
          <div class="bg-white rounded shadow p-6 min-h-[600px]">
            {store.loading ? (
              <div class="space-y-4">
                {/* Search Section Skeleton (only search) */}
                <div class="flex flex-col lg:flex-row lg:items-center gap-4 mb-4 px-6">
                  <div class="flex-1 max-w-md">
                    <div class="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full bg-white rounded-lg">
                    <thead>
                      <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                        <th class="py-3 px-6">Vehicle</th>
                        <th class="py-3 px-6">Title</th>
                        <th class="py-3 px-6">Scheduled Date</th>
                        <th class="py-3 px-6">Status</th>
                        <th class="py-3 px-6">Description</th>
                        <th class="py-3 px-6">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <tr key={idx} class="border-b border-gray-200">
                          <td class="py-4 px-6">
                            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div class="relative w-full h-full">
                {/* Notifications */}
                {showNotification.value && (
                  <div 
                    class={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${notificationType.value === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                  >
                    <div class="flex items-center justify-between gap-6">
                      <span>{notificationMessage.value}</span>
                      <button onClick$={() => (showNotification.value = false)} class="text-white/90 hover:text-white">✕</button>
                    </div>
                  </div>
                )}

                {/* Delete confirmation dialog */}
                {showDeleteDialog.value && (
                  <div class="fixed inset-0 flex items-center justify-center z-50" style="background-color: rgba(0, 0, 0, 0.3); backdrop-filter: blur(2px);">
                    <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative shadow-2xl">
                      <button onClick$={cancelDelete} class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
                      <div class="flex justify-center mb-4">
                        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                          </svg>
                        </div>
                      </div>
                      <h3 class="text-lg font-semibold text-center mb-2">Delete Schedule</h3>
                      <p class="text-gray-600 text-center mb-6">Are you sure you want to delete this maintenance schedule?</p>
                      <div class="flex gap-3 justify-center">
                        <button onClick$={cancelDelete} class="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                        <button onClick$={confirmDelete} class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search + Date Range Filter */}
                <div class="flex flex-col lg:flex-row lg:items-center gap-4 mb-4 px-6">
                  <div class="flex-1 max-w-md">
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search schedules..."
                        value={searchTerm.value}
                        onInput$={(e) => {
                          searchTerm.value = (e.target as HTMLInputElement).value;
                          currentPage.value = 1;
                        }}
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                  {/* Date range filters */}
                  <div class="flex items-center gap-3">
                    <div>
                      <input
                        type="date"
                        value={startDate.value}
                        onInput$={(e) => {
                          startDate.value = (e.target as HTMLInputElement).value;
                          currentPage.value = 1;
                        }}
                        class="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                    <span class="hidden lg:inline text-gray-400">–</span>
                    <div>
                      <input
                        type="date"
                        value={endDate.value}
                        onInput$={(e) => {
                          endDate.value = (e.target as HTMLInputElement).value;
                          currentPage.value = 1;
                        }}
                        class="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                    {(startDate.value || endDate.value) && (
                      <button
                        onClick$={() => {
                          startDate.value = '';
                          endDate.value = '';
                          currentPage.value = 1;
                        }}
                        class="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Results Info */}
                {searchTerm.value && (
                  <div class="px-6 mb-4">
                    <p class="text-sm text-gray-600">
                      {filteredSchedules.value.length === 0 ? (
                        <>No schedules found for "<span class="font-medium">{searchTerm.value}</span>"</>
                      ) : (
                        <>Found {filteredSchedules.value.length} schedule{filteredSchedules.value.length !== 1 ? 's' : ''} for "<span class="font-medium">{searchTerm.value}</span>"</>
                      )}
                    </p>
                  </div>
                )}

                <div class="overflow-x-auto">
                  <table class="min-w-full bg-white rounded-lg">
                    <thead>
                      <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                        <th class="py-3 px-6">Vehicle</th>
                        <th class="py-3 px-6">Title</th>
                        <th class="py-3 px-6">Scheduled Date</th>
                        <th class="py-3 px-6">Status</th>
                        <th class="py-3 px-6">Description</th>
                        <th class="py-3 px-6">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(paginatedSchedules.value) && paginatedSchedules.value.length > 0 ? (
                        paginatedSchedules.value.map((schedule: MaintenanceSchedule, idx: number) => (
                          <tr key={idx} class="border-b border-gray-200 hover:bg-gray-50">
                            <td class="py-4 px-6">
                              <div class="text-sm text-gray-700 font-semibold">{schedule.vehicleName}</div>
                              {schedule.vehicle?.companyName && (
                                <div class="text-xs text-gray-500">{schedule.vehicle.companyName}</div>
                              )}
                            </td>
                            <td class="py-4 px-6">
                              <div class="text-sm text-gray-700 font-medium">{schedule.title}</div>
                            </td>
                            <td class="py-4 px-6">
                              <div class="text-sm text-gray-700">{formatDate(schedule.scheduledDate)}</div>
                            </td>
                            <td class="py-4 px-6">
                              <span class={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.status)}`}>
                                {schedule.status}
                              </span>
                            </td>
                            <td class="py-4 px-6">
                              <div class="text-sm text-gray-700 max-w-xs truncate" title={schedule.description}>
                                {schedule.description}
                              </div>
                            </td>
                            <td class="py-4 px-6">
                              <button
                                onClick$={() => openDelete(schedule.id)}
                                class="text-red-600 font-semibold hover:underline text-sm px-2 py-1 rounded hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} class="text-center py-6 text-gray-400">No maintenance schedules available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div class="flex justify-end items-center mt-4 pr-6">
                  <div class="flex items-center gap-3">
                    <button
                      class={`px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium transition-colors duration-150
                        ${currentPage.value === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'}`}
                      disabled={currentPage.value === 1}
                      onClick$={handlePreviousPage}
                    >
                      Previous
                    </button>
                    <span class="text-sm font-medium text-gray-700 select-none">Page {currentPage.value} of {totalPages.value}</span>
                    <button
                      class={`px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium transition-colors duration-150
                        ${currentPage.value === totalPages.value ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'}`}
                      disabled={currentPage.value === totalPages.value}
                      onClick$={handleNextPage}
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
