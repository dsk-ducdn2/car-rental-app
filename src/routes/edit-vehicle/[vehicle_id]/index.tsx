import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import EditVehicle from '../../../components/dashboard/EditVehicle';
import { Sidebar } from  '../../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader';
import { fetchWithAuth } from '../../../utils/api';

export default component$(() => {
  const loc = useLocation();
  const vehicleId = loc.params.vehicle_id;
  const API_URL = import.meta.env.VITE_API_URL;

  const store = useStore({
    vehicle: null as null | {
      id: string;
      companyId: string;
      companyName?: string;
      licensePlate: string;
      brand: string;
      yearManufacture: number;
      status: string;
      mileage: number;
      purchaseDate: string;
      pricePerDay: number;
    },
    loading: true
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/Vehicles/${vehicleId}`);
      const data = await res.json();
      // Get the active pricing rule (the one with the latest effective date or current price)
      const activePricingRule = data.vehiclePricingRules && data.vehiclePricingRules.length > 0 
        ? data.vehiclePricingRules[0] 
        : null;
      
      store.vehicle = {
        id: data.id,
        companyId: data.companyId || '',
        companyName: data.companyName || data.company?.name || '',
        licensePlate: data.licensePlate || '',
        brand: data.brand || '',
        yearManufacture: data.yearManufacture || new Date().getFullYear(),
        status: data.status || 'AVAILABLE',
        mileage: data.mileage || 0,
        purchaseDate: data.purchaseDate ? data.purchaseDate.split('T')[0] : '',
        pricePerDay: activePricingRule?.pricePerDay || 0,
      };
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
    } finally {
      store.loading = false;
    }
  });

  return (
    <div class="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <aside class="hidden md:block md:w-64">
        <Sidebar />
      </aside>
      <main class="flex-1">
        <DashboardHeader />
        <section class="p-6">
          <div class="bg-white p-6 rounded shadow min-h-[500px]">
            {store.loading ? (
              <div class="flex justify-center items-center min-h-[400px] bg-gray-50">
                <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl space-y-6 border border-gray-200">
                  <div class="h-8 bg-gray-200 rounded animate-pulse mb-6"></div>
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div key={idx} class="space-y-2">
                      <div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                  <div class="h-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ) : store.vehicle ? (
              <EditVehicle vehicle={store.vehicle} />
            ) : (
              <div class="flex justify-center items-center min-h-[400px]">
                <p class="text-red-500">Failed to load vehicle data</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
});