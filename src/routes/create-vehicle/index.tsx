import { component$ } from '@builder.io/qwik';
import { Sidebar } from '../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import EditVehicle from '../../components/dashboard/EditVehicle';

export default component$(() => {
  // Empty vehicle for creation
  const emptyVehicle = {
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    type: '',
    status: 'Available',
    pricePerDay: 0,
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
          <h1 class="text-2xl font-bold mb-6">Create Vehicle</h1>
          <div class="bg-white rounded shadow p-6">
            <EditVehicle vehicle={emptyVehicle} />
          </div>
        </div>
      </main>
    </div>
  );
});