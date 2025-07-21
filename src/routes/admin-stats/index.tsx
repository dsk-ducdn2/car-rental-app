import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { mockStats } from '../../mock-data/stats';
import AdminNav from '../../components/AdminNav';

export default component$(() => {
  const chartRef = useSignal<HTMLCanvasElement>();
  const chartRef2 = useSignal<HTMLCanvasElement>();
  const chartRef3 = useSignal<HTMLCanvasElement>();
  const chartRef4 = useSignal<HTMLCanvasElement>();

  useVisibleTask$(() => {
    // Load Chart.js từ CDN nếu chưa có
    if (!(window as any).Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => renderCharts();
      document.body.appendChild(script);
    } else {
      renderCharts();
    }
    function renderCharts() {
      // Doanh thu ngày
      new (window as any).Chart(chartRef.value, {
        type: 'line',
        data: {
          labels: mockStats.revenue.daily.map((d: any) => d.date),
          datasets: [{ label: 'Doanh thu/ngày', data: mockStats.revenue.daily.map((d: any) => d.value), borderColor: '#6366f1', backgroundColor: '#a5b4fc', fill: true }],
        },
      });
      // Lượt thuê theo loại xe
      new (window as any).Chart(chartRef2.value, {
        type: 'bar',
        data: {
          labels: mockStats.rentByType.map((d: any) => d.type),
          datasets: [{ label: 'Lượt thuê theo loại xe', data: mockStats.rentByType.map((d: any) => d.count), backgroundColor: '#f59e42' }],
        },
      });
      // Lượt thuê theo địa phương
      new (window as any).Chart(chartRef3.value, {
        type: 'bar',
        data: {
          labels: mockStats.rentByLocation.map((d: any) => d.location),
          datasets: [{ label: 'Lượt thuê theo địa phương', data: mockStats.rentByLocation.map((d: any) => d.count), backgroundColor: '#38bdf8' }],
        },
      });
      // Tỷ lệ sử dụng xe
      new (window as any).Chart(chartRef4.value, {
        type: 'line',
        data: {
          labels: mockStats.usageRate.map((d: any) => d.date),
          datasets: [{ label: 'Tỷ lệ sử dụng xe', data: mockStats.usageRate.map((d: any) => d.rate * 100), borderColor: '#22c55e', backgroundColor: '#bbf7d0', fill: true }],
        },
        options: { scales: { y: { min: 0, max: 100, ticks: { callback: (v: any) => v + '%' } } } },
      });
    }
  });

  return (
    <main class="p-4 max-w-6xl mx-auto">
      <AdminNav />
      <h1 class="text-3xl font-bold mb-6 text-indigo-700">Thống kê hệ thống</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 class="font-semibold mb-2">Doanh thu theo ngày</h2>
          <canvas ref={chartRef} width={400} height={200}></canvas>
        </div>
        <div>
          <h2 class="font-semibold mb-2">Lượt thuê theo loại xe</h2>
          <canvas ref={chartRef2} width={400} height={200}></canvas>
        </div>
        <div>
          <h2 class="font-semibold mb-2">Lượt thuê theo địa phương</h2>
          <canvas ref={chartRef3} width={400} height={200}></canvas>
        </div>
        <div>
          <h2 class="font-semibold mb-2">Tỷ lệ sử dụng xe</h2>
          <canvas ref={chartRef4} width={400} height={200}></canvas>
        </div>
      </div>
    </main>
  );
}); 