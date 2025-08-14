import { component$, useSignal, $, useVisibleTask$ } from '@builder.io/qwik';
import { fetchWithAuth, getUserIdFromToken } from '../../utils/api';

interface VehicleStatusLog {
  id: number;
  vehicleId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
  vehicle: {
    id: string;
    companyId: string;
    licensePlate: string;
    brand: string;
    yearManufacture: number;
    status: string;
    mileage: number;
    purchaseDate: string;
    createdAt: string;
    updatedAt: string;
    company: {
      id: string;
      name: string;
      address: string;
      phone: string;
      email: string;
      createdAt: string;
      updatedAt: string;
      users: any[];
      vehicles: any[];
    };
    vehiclePricingRules: any[];
    vehicleStatusLogs: any[];
  };
  user: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    phone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    roleId: number;
    role: any;
    companyId: string;
    company: any;
    refreshTokens: any[];
    vehicleStatusLogs: any[];
  };
}

interface VehicleStatusLogsProps {
  vehicleId?: string; // Optional filter by specific vehicle
}

export default component$<VehicleStatusLogsProps>(({ vehicleId }) => {
  const statusLogs = useSignal<VehicleStatusLog[]>([]);
  const loading = useSignal(true);
  const currentPage = useSignal(1);
  const searchTerm = useSignal('');
  const selectedVehicle = useSignal('');
  const selectedStatus = useSignal('');

  const showNotification = useSignal(false);
  const notificationMessage = useSignal('');
  const notificationType = useSignal<'success' | 'error'>('success');
  const API_URL = import.meta.env.VITE_API_URL;

  const ITEMS_PER_PAGE = 10;

  const fetchStatusLogs = $(async () => {
    try {
      loading.value = true;
      let url = `${API_URL}/VehicleStatusLogs`;
      
      // Add filters if provided
      const params = new URLSearchParams();
      if (vehicleId) {
        params.append('vehicleId', vehicleId);
      }
      // Note: Search is handled client-side for vehicle name and license plate
      if (selectedVehicle.value) {
        params.append('vehicleId', selectedVehicle.value);
      }
      if (selectedStatus.value) {
        params.append('newStatus', selectedStatus.value);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // Resolve current user's role and company for filtering
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
        console.error('Failed to resolve user for status log filtering', e);
      }

      const res = await fetchWithAuth(url);
      if (res.ok) {
        const data = await res.json();
        let filteredData = Array.isArray(data) ? data : [];
        
        // Client-side filtering by search term (vehicle name/brand or license plate)
        if (searchTerm.value && filteredData.length > 0) {
          const searchLower = searchTerm.value.toLowerCase();
          filteredData = filteredData.filter((log: VehicleStatusLog) => 
            log.vehicle.brand?.toLowerCase().includes(searchLower) ||
            log.vehicle.licensePlate?.toLowerCase().includes(searchLower)
          );
        }
        
        // Client-side filtering by new status if needed
        if (selectedStatus.value && filteredData.length > 0) {
          filteredData = filteredData.filter((log: VehicleStatusLog) => 
            log.newStatus?.toUpperCase() === selectedStatus.value.toUpperCase()
          );
        }

        // If user is not admin, restrict to logs of vehicles in user's company
        if (!isAdmin && userCompanyId && filteredData.length > 0) {
          filteredData = filteredData.filter((log: VehicleStatusLog) =>
            String(log?.vehicle?.companyId ?? log?.vehicle?.company?.id ?? '') === userCompanyId
          );
        }
        
        statusLogs.value = filteredData;
      } else {
        console.error('Failed to fetch status logs:', res.status, res.statusText);
        statusLogs.value = [];
      }
    } catch (error) {
      console.error('Error fetching status logs:', error);
      statusLogs.value = [];
    } finally {
      loading.value = false;
    }
  });

  // Fetch status logs on component mount
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    await fetchStatusLogs();
  });

  const handleSearch = $(async () => {
    currentPage.value = 1;
    await fetchStatusLogs();
  });

  // Real-time search as user types
  const handleSearchInput = $(async (value: string) => {
    searchTerm.value = value;
    currentPage.value = 1;
    await fetchStatusLogs();
  });

  const clearFilters = $(async () => {
    searchTerm.value = '';
    selectedVehicle.value = '';
    selectedStatus.value = '';
    currentPage.value = 1;
    await fetchStatusLogs();
  });

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'RENTED':
        return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'OUT_OF_SERVICE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Pagination
  const totalPages = Math.ceil((statusLogs.value?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage.value - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLogs = statusLogs.value?.slice(startIndex, endIndex) || [];

  return (
    <div class="relative w-full h-full -ml-16">
      {/* Success/Error Notification */}
      {showNotification.value && (
        <div
          class={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${
            notificationType.value === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <div class="flex items-center justify-between">
            <span>{notificationMessage.value}</span>
            <button
              onClick$={() => (showNotification.value = false)}
              class={`ml-4 text-white hover:text-gray-200 ${
                notificationType.value === 'success' 
                  ? 'hover:text-green-200' 
                  : 'hover:text-red-200'
              }`}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6 -ml-16 mr-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div class="mb-4 sm:mb-0">
            <h2 class="text-2xl font-bold text-gray-900">Vehicle Status History</h2>
            <p class="text-gray-600 mt-1">Track all status changes for vehicles</p>
          </div>
          <button
            onClick$={fetchStatusLogs}
            class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition duration-150"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search vehicle name, license plate..."
              value={searchTerm.value}
              onInput$={(e) => handleSearchInput((e.target as HTMLInputElement).value)}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <select
              value={selectedStatus.value}
              onChange$={(e) => {
                selectedStatus.value = (e.target as HTMLSelectElement).value;
                handleSearch();
              }}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">All Status Changes</option>
              <option value="AVAILABLE">Changed to Available</option>
              <option value="RENTED">Changed to Rented</option>
              <option value="MAINTENANCE">Changed to Maintenance</option>
              <option value="OUT_OF_SERVICE">Changed to Out of Service</option>
            </select>
          </div>
          <div>
            <button
              onClick$={handleSearch}
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition duration-150"
            >
              Search
            </button>
          </div>
          <div>
            <button
              onClick$={clearFilters}
              class="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition duration-150"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Status Logs Table */}
      <div class="bg-white rounded-lg shadow-sm -ml-16 mr-8">
        {loading.value ? (
          <div class="p-6">
            <div class="space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} class="animate-pulse">
                  <div class="flex space-x-4">
                    <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div class="overflow-x-auto">
              <table class="min-w-full bg-white rounded-lg table-fixed">
                <thead>
                  <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                    <th class="py-3 px-6 w-1/8">Vehicle Name</th>
                    <th class="py-3 px-6 w-1/8">License Plate</th>
                    <th class="py-3 px-6 w-1/8">Old Status</th>
                    <th class="py-3 px-6 w-1/8">New Status</th>
                    <th class="py-3 px-6 w-1/8">Changed By</th>
                    <th class="py-3 px-6 w-1/8">Changed At</th>
                    <th class="py-3 px-6 w-1/8">Company</th>
                    <th class="py-3 px-6 w-1/8">Log ID</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(paginatedLogs) && paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log: VehicleStatusLog, idx: number) => (
                      <tr key={idx} class="border-b border-gray-200 hover:bg-gray-50">
                        <td class="py-4 px-6">
                          <div class="text-sm font-medium text-gray-900">{log.vehicle.brand}</div>
                          <div class="text-xs text-gray-500">Year: {log.vehicle.yearManufacture}</div>
                        </td>
                        <td class="py-4 px-6">
                          <div class="text-sm text-gray-700 font-mono">{log.vehicle.licensePlate}</div>
                        </td>
                        <td class="py-4 px-6">
                          <span class={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.oldStatus)}`}>
                            {log.oldStatus}
                          </span>
                        </td>
                        <td class="py-4 px-6">
                          <span class={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.newStatus)}`}>
                            {log.newStatus}
                          </span>
                        </td>
                        <td class="py-4 px-6">
                          <div class="text-sm text-gray-700">
                            <div class="font-medium">{log.user.name}</div>
                            <div class="text-xs text-gray-500">{log.user.email}</div>
                          </div>
                        </td>
                        <td class="py-4 px-6">
                          <div class="text-sm text-gray-700">{formatDateTime(log.changedAt)}</div>
                        </td>
                        <td class="py-4 px-6">
                          <div class="text-sm text-gray-700">{log.vehicle.company.name}</div>
                        </td>
                        <td class="py-4 px-6">
                          <div class="text-xs text-gray-500 font-mono">#{log.id}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                                      <td colSpan={8} class="text-left py-6 text-gray-400 pl-6">
                  No status change history found.
                </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div class="flex justify-end items-center mt-4 pr-6 pb-4">
                <div class="flex items-center gap-3">
                  <button
                    onClick$={() => currentPage.value = Math.max(1, currentPage.value - 1)}
                    disabled={currentPage.value <= 1}
                    class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span class="text-sm text-gray-600">
                    Page {currentPage.value} of {totalPages}
                  </span>
                  <button
                    onClick$={() => currentPage.value = Math.min(totalPages, currentPage.value + 1)}
                    disabled={currentPage.value >= totalPages}
                    class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});