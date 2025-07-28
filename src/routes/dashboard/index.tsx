import { component$ } from '@builder.io/qwik';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { DashboardFeatureCards } from '../../components/dashboard/DashboardFeatureCards';
import { DashboardStatsOverview } from '../../components/dashboard/DashboardStatsOverview';
import { DashboardProjectsAndOrders } from '../../components/dashboard/DashboardProjectsAndOrders';
import { DashboardFooter } from '../../components/dashboard/DashboardFooter';
import { Sidebar } from '../../components/dashboard/Slidebar';
import { StatsCards } from '../../components/dashboard/StatsCards';
import { PWAInfo } from '../../components/PWAInfo';

export default component$(() => (
  <div class="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa]">
    {/* Sidebar: ẩn trên mobile, hiện trên md trở lên */}
    <aside class="hidden md:block md:w-64 lg:w-72 xl:w-80 flex-shrink-0">
      <Sidebar />
    </aside>
    <main class="flex-1 w-full flex flex-col min-h-screen pb-16">
      <DashboardHeader />
      <div class="px-2 sm:px-4 md:px-8">
        <StatsCards />
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div class="lg:col-span-2">
            <DashboardFeatureCards />
          </div>
          <div>
            <PWAInfo />
          </div>
        </div>
        <DashboardStatsOverview />
        <DashboardProjectsAndOrders />
        <DashboardFooter />
      </div>
    </main>
  </div>
));
