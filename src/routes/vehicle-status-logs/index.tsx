import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { Sidebar } from '../../components/dashboard/Slidebar';
import VehicleStatusLogs from '../../components/dashboard/VehicleStatusLogs';

export default component$(() => {
  return (
    <div class="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div class="flex">
        <Sidebar />
        <main class="flex-1 ml-64">
          <div class="px-2 sm:px-4 md:px-8 py-6">
            <VehicleStatusLogs />
          </div>
        </main>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Vehicle Status History - Car Rental Management',
  meta: [
    {
      name: 'description',
      content: 'Track vehicle status change history and logs',
    },
  ],
};