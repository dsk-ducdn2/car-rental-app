import { component$ } from '@builder.io/qwik';

export const DashboardFeatureCards = component$(() => (
  <div class="flex flex-col md:flex-row gap-2 md:gap-6 mt-8">
    {/* Card 1 */}
    <div class="bg-white rounded-2xl shadow p-4 md:p-8 flex-1 flex flex-col justify-between min-w-full md:min-w-[320px] mb-2 md:mb-0">
      <div>
        <div class="text-blue-700 font-semibold mb-2">Build by developers</div>
        <div class="text-2xl font-bold mb-2">Soft UI Dashboard</div>
        <div class="text-gray-500 mb-6">
          From colors, cards, typography to complex elements, you will find the full documentation.
        </div>
      </div>
      <a href="#" class="text-sm font-semibold text-gray-600 hover:text-blue-700 flex items-center gap-1">
        READ MORE <span class="ml-1">→</span>
      </a>
    </div>
    {/* Card 2 */}
    <div class="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow flex-1 flex items-center justify-center min-w-full md:min-w-[320px] mb-2 md:mb-0">
      {/* Rocket image: dùng ảnh minh họa hoặc SVG */}
      <img
        src="https://img.freepik.com/premium-vector/rocket-clipart-cartoon-style-vector-illustration_761413-4022.jpg?semt=ais_hybrid&w=740"
        alt="Rocket"
        class="h-48 object-contain"
        style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.10))' }}
        width="300"
        height="192"
      />
    </div>
    {/* Card 3 */}
    <div class="bg-[#1a237e] rounded-2xl shadow p-4 md:p-8 flex-1 flex flex-col justify-between min-w-full md:min-w-[320px]">
      <div>
        <div class="text-white text-xl font-bold mb-2">Work with the rockets</div>
        <div class="text-white/80 mb-6">
          Wealth creation is an evolutionarily recent positive-sum game. It is all about who take the opportunity first.
        </div>
      </div>
      <a href="#" class="text-sm font-semibold text-white flex items-center gap-1">
        READ MORE <span class="ml-1">→</span>
      </a>
    </div>
  </div>
));