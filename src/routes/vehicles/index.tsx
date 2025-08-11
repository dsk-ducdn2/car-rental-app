import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { Sidebar } from '../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import TableVehicles from '../../components/dashboard/TableVehicles';
import { fetchWithAuth } from '../../utils/api';

interface Vehicle {
  id: string;
  companyId: string;
  companyName: string;
  licensePlate: string;
  brand: string;
  yearManufacture: number;
  status: string;
  mileage: number;
  purchaseDate: string;
  createdAt?: string;
  updatedAt?: string;
  company?: {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}

const transformVehicleData = (vehicles: any[]) => {
  if (!Array.isArray(vehicles)) return [];
  return vehicles.map((vehicle, index) => ({
    id: vehicle.id || `vehicle-${index}`,
    companyId: vehicle.companyId || '',
    companyName: vehicle.company?.name || vehicle.companyName || 'N/A',
    licensePlate: vehicle.licensePlate || 'N/A',
    brand: vehicle.brand || 'N/A',
    yearManufacture: vehicle.yearManufacture || new Date().getFullYear(),
    status: vehicle.status || 'AVAILABLE',
    mileage: vehicle.mileage || 0,
    purchaseDate: vehicle.purchaseDate ? vehicle.purchaseDate.split('T')[0] : 'N/A',
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt,
    company: vehicle.company,
  }));
};

export default component$(() => {
  const store = useStore<{ vehicles: Vehicle[]; loading: boolean }>({ 
    vehicles: [], 
    loading: true 
  });
  const API_URL = import.meta.env.VITE_API_URL;
  
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/Vehicles`);
      const data = await res.json();
      store.vehicles = transformVehicleData(data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      store.vehicles = [];
    } finally {
      store.loading = false;
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
          <h1 class="text-2xl font-bold mb-6">Vehicles table</h1>
          <div class="bg-white rounded shadow p-6 min-h-[600px]">
            {store.loading ? (
              <div class="space-y-4">
                {/* Search, Create Vehicle and Status History Section Skeleton */}
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 px-6">
                  {/* Create Vehicle Button Skeleton */}
                  <div class="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                  {/* Search Input Skeleton */}
                  <div class="flex-1 max-w-md mx-4">
                    <div class="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  {/* View Status History Button Skeleton */}
                  <div class="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full bg-white rounded-lg">
                    <thead>
                      <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                        <th class="py-3 px-6 w-1/8">Company</th>
                        <th class="py-3 px-6 w-1/8">License Plate</th>
                        <th class="py-3 px-6 w-1/8">Brand</th>
                        <th class="py-3 px-6 w-1/8">Year</th>
                        <th class="py-3 px-6 w-1/8">Mileage</th>
                        <th class="py-3 px-6 w-1/8">Status</th>
                        <th class="py-3 px-6 w-1/8">Pricing</th>
                        <th class="py-3 px-6 w-1/8">Action</th>
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
                            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="flex gap-1">
                              <div class="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                              <div class="h-4 w-1 bg-gray-200 rounded animate-pulse"></div>
                              <div class="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                              <div class="h-4 w-1 bg-gray-200 rounded animate-pulse"></div>
                              <div class="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <TableVehicles vehicles={store.vehicles} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
});