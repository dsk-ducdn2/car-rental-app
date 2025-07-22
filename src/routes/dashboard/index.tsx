import { component$ } from '@builder.io/qwik';
import { DashboardHeader } from '../../components/DashboardHeader';
import { DashboardFeatureCards } from '../../components/DashboardFeatureCards';
import { DashboardStatsOverview } from '../../components/DashboardStatsOverview';
import { DashboardProjectsAndOrders } from '../../components/DashboardProjectsAndOrders';
import { DashboardFooter } from '../../components/DashboardFooter';
import { Sidebar } from '../../components/Slidebar';
import { StatsCards } from '../../components/StatsCards';

export default component$(() => (
  <div class="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa]">
    {/* Sidebar: ẩn trên mobile, hiện trên md trở lên */}
    <aside class="hidden md:block w-72 flex-shrink-0">
      <Sidebar />
    </aside>
    <main class="flex-1 flex flex-col min-h-screen pb-16">
      <DashboardHeader />
      <div class="px-2 sm:px-4 md:px-8">
        <StatsCards />
        <DashboardFeatureCards />
        <DashboardStatsOverview />
        <DashboardProjectsAndOrders />
        <DashboardFooter />
      </div>
    </main>
  </div>
));
