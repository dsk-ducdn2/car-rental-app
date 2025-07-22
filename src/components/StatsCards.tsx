import { component$ } from '@builder.io/qwik';

export const StatsCards = component$(() => (
  <div class="flex flex-col md:flex-row gap-2 md:gap-6 mt-8">
    <div class="bg-white rounded-lg shadow p-6 w-full md:w-1/4 flex flex-col items-center mb-2 md:mb-0">
      <span class="text-green-600 font-bold">+55%</span>
    </div>
    <div class="bg-white rounded-lg shadow p-6 w-full md:w-1/4 flex flex-col items-center mb-2 md:mb-0">
      <span class="text-green-600 font-bold">+3%</span>
    </div>
    <div class="bg-white rounded-lg shadow p-6 w-full md:w-1/4 flex flex-col items-center mb-2 md:mb-0">
      <span class="text-red-600 font-bold">-2%</span>
    </div>
    <div class="bg-white rounded-lg shadow p-6 w-full md:w-1/4 flex flex-col items-center">
      <span class="text-green-600 font-bold">+5%</span>
    </div>
  </div>
));