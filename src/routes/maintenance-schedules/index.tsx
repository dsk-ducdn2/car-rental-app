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

// Normalize various status formats from API to UI-friendly values
const normalizeStatus = (raw: unknown): string => {
  const mapByCode: Record<string, string> = {
    '0': 'scheduled',
    '1': 'scheduled',
    '2': 'in_progress',
    '3': 'completed',
    '4': 'cancelled',
  };
  if (raw === null || raw === undefined) return 'scheduled';
  const str = String(raw).trim();
  if (mapByCode[str] !== undefined) return mapByCode[str];
  return str.toLowerCase().replace(/\s+/g, '_');
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
  const statusFilter = useSignal('all');
  
  const API_URL = import.meta.env.VITE_API_URL;

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
    
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter((schedule) => 
        schedule.status.toLowerCase() === statusFilter.value.toLowerCase()
      );
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
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
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
                {/* Search and Filter Section Skeleton (no create button) */}
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 px-6">
                  <div class="flex-1 max-w-md">
                    <div class="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div class="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div class="relative w-full h-full">
                {/* Search and Filter Section (search aligned left, removed create button) */}
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 px-6">
                  {/* Search Input - aligned to the left */}
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

                  {/* Status Filter */}
                  <select
                    value={statusFilter.value}
                    onChange$={(e) => {
                      statusFilter.value = (e.target as HTMLSelectElement).value;
                      currentPage.value = 1;
                    }}
                    class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
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
                                {schedule.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td class="py-4 px-6">
                              <div class="text-sm text-gray-700 max-w-xs truncate" title={schedule.description}>
                                {schedule.description}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} class="text-center py-6 text-gray-400">No maintenance schedules available.</td>
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
