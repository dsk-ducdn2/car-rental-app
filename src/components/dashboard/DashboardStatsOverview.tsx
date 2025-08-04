import { component$, useVisibleTask$, useSignal } from '@builder.io/qwik';

export const DashboardStatsOverview = component$(() => {
  const chartLoaded = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // Dynamic import Chart.js để chỉ chạy phía client
    import('chart.js/auto').then((Chart) => {
      const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
      if (ctx) {
        new Chart.default(ctx, {
          type: 'line',
          data: {
            labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
              {
                label: 'Mobile apps',
                data: [10, 100, 200, 150, 220, 250, 200, 220, 250],
                borderColor: '#00bcd4',
                backgroundColor: 'rgba(0,188,212,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
              },
              {
                label: 'Websites',
                data: [20, 80, 120, 180, 200, 210, 250, 230, 240],
                borderColor: '#21294c',
                backgroundColor: 'rgba(33,41,76,0.1)',
                fill: false,
                tension: 0.4,
                pointRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: true },
            },
            scales: {
              y: { beginAtZero: true },
            },
          },
        });
        chartLoaded.value = true;
      }
    });
  });

  return (
    <div class="flex flex-col md:flex-row gap-2 md:gap-6 mt-8">
      {/* Card trái */}
      <div class="bg-white rounded-2xl shadow p-4 md:p-8 flex-1 min-w-full md:min-w-[400px] min-h-[280px] flex flex-col justify-between mb-2 md:mb-0">
        <div>
          <div class="text-lg font-bold mb-2">Active Users</div>
          <div class="text-blue-600 font-semibold text-sm mb-6 h-[20px]">
            (+23%) <span class="text-gray-400 font-normal">THAN LAST WEEK</span>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 md:gap-8 items-end min-h-[120px]">
          {/* Users */}
          <div class="min-w-[80px]">
            <div class="flex items-center gap-2 mb-1 h-[26px]">
              <span class="bg-pink-500 rounded p-1 w-[26px] h-[26px] flex items-center justify-center">
                {/* User icon */}
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z"/></svg>
              </span>
              <span class="text-xs text-gray-500">Users</span>
            </div>
            <div class="text-2xl font-bold h-[32px] flex items-center">36K</div>
            <div class="h-1 bg-cyan-400 rounded mt-1 w-16"></div>
          </div>
          {/* Clicks */}
          <div class="min-w-[80px]">
            <div class="flex items-center gap-2 mb-1 h-[26px]">
              <span class="bg-blue-500 rounded p-1 w-[26px] h-[26px] flex items-center justify-center">
                {/* Clicks icon */}
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M9 17H7v-2h2v2zm0-4H7v-6h2v6zm4 4h-2v-2h2v2zm0-4h-2v-6h2v6zm4 4h-2v-2h2v2zm0-4h-2v-6h2v6z"/></svg>
              </span>
              <span class="text-xs text-gray-500">Clicks</span>
            </div>
            <div class="text-2xl font-bold h-[32px] flex items-center">2M</div>
            <div class="h-1 bg-cyan-400 rounded mt-1 w-16"></div>
          </div>
          {/* Sales */}
          <div class="min-w-[80px]">
            <div class="flex items-center gap-2 mb-1 h-[26px]">
              <span class="bg-orange-400 rounded p-1 w-[26px] h-[26px] flex items-center justify-center">
                {/* Sales icon */}
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M21 7l-1 2H4L3 7h18zm-2.38 4l-1.24 6.45A2 2 0 0115.42 19H8.58a2 2 0 01-1.96-1.55L5.38 11h13.24z"/></svg>
              </span>
              <span class="text-xs text-gray-500">Sales</span>
            </div>
            <div class="text-2xl font-bold h-[32px] flex items-center">$435</div>
            <div class="h-1 bg-cyan-400 rounded mt-1 w-16"></div>
          </div>
          {/* Items */}
          <div class="min-w-[80px]">
            <div class="flex items-center gap-2 mb-1 h-[26px]">
              <span class="bg-pink-500 rounded p-1 w-[26px] h-[26px] flex items-center justify-center">
                {/* Items icon */}
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M20 6H4V4h16v2zm0 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8h16zm-2 2H6v10h12V10z"/></svg>
              </span>
              <span class="text-xs text-gray-500">Items</span>
            </div>
            <div class="text-2xl font-bold h-[32px] flex items-center">43</div>
            <div class="h-1 bg-cyan-400 rounded mt-1 w-16"></div>
          </div>
        </div>
      </div>
      {/* Card phải: Chart */}
      <div class="bg-white rounded-2xl shadow p-4 md:p-8 flex-1 min-w-full md:min-w-[400px] min-h-[280px]">
        <div class="flex items-center gap-2 mb-2">
          <div class="font-bold">Sales Overview</div>
        </div>
        <div class="text-green-500 text-sm font-semibold mb-4">
          ↑ 4% MORE <span class="text-gray-400 font-normal">IN 2021</span>
        </div>
        <div class="overflow-x-auto">
          <div class="w-full h-[180px] min-h-[180px] relative">
            {!chartLoaded.value && (
              <div class="absolute inset-0 bg-gray-100 rounded animate-pulse flex items-center justify-center">
                <div class="text-gray-400 text-sm">Loading chart...</div>
              </div>
            )}
            <canvas id="salesChart" width="100%" height="180" class="w-full h-full"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
});