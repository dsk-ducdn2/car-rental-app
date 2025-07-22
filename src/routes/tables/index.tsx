import { component$ } from '@builder.io/qwik';
import TableAuthors from '../../components/dashboard/TableAuthors';
import { Sidebar } from '../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';

export default component$(() => {
  return (
    <div class="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa]">
      {/* Sidebar: ẩn trên mobile, hiện trên md trở lên */}
      <aside class="hidden md:block md:w-64 lg:w-72 xl:w-80 flex-shrink-0">
        <Sidebar />
      </aside>
      <main class="flex-1 w-full flex flex-col min-h-screen pb-16">
        <DashboardHeader />
        <div class="px-2 sm:px-4 md:px-8">
          <h1 class="text-2xl font-bold mb-6">Authors table</h1>
          <div class="bg-white rounded shadow p-6">
            <TableAuthors />
          </div>
        </div>
      </main>
    </div>
  );
}); 