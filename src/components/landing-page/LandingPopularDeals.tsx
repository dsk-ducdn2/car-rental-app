import { component$ } from '@builder.io/qwik';

export default component$(() => {
  const cars = [
    {
      id: 1,
      name: "Jaguar XE L P250",
      image: "https://th.bing.com/th/id/R.55e4b57b92caca296b082e94c2643058?rik=VaAkmYfqj%2fIw7A&pid=ImgRaw&r=0",
      rating: 4.8,
      reviews: 2436,
      features: ["4 Passagers", "Auto", "Air Conditioning", "4 Doors"],
      price: 1800,
    },
    {
      id: 2,
      name: "Audi R8",
      image: "https://cdn.motor1.com/images/mgl/vxoJ0Y/s1/2023-audi-r8-v10-gt-rwd.jpg",
      rating: 4.6,
      reviews: 1936,
      features: ["2 Passagers", "Auto", "Air Conditioning", "2 Doors"],
      price: 2100,
    },
    {
      id: 3,
      name: "BMW M3",
      image: "https://tse1.mm.bing.net/th/id/OIP.JJ7HU3Bd11sDDHHqr83-tQHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      rating: 4.5,
      reviews: 2036,
      features: ["4 Passagers", "Auto", "Air Conditioning", "4 Doors"],
      price: 1600,
    },
    {
      id: 4,
      name: "Lamborghini Huracan",
      image: "https://pugachev.miami/wp-content/uploads/2019/11/Rent-Lamborghini-Huracan-LP-610-in-Miami-1-obr.jpg",
      rating: 4.3,
      reviews: 2236,
      features: ["2 Passagers", "Auto", "Air Conditioning", "2 Doors"],
      price: 2300,
    },
  ];

  return (
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col items-center mb-12">
          <span class="px-5 py-1 rounded-lg bg-[#e60ff] text-[#2563eb] font-semibold text-sm mb-4">POPULAR RENTAL DEALS</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 text-center">Most popular cars rental deals</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cars.map((car) => (
            <div key={car.id} class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div class="relative">
                <img src={car.image} alt={car.name} class="w-full h-48 object-cover" width="300" height="192" />
                <div class="absolute top-3 right-3 white rounded-full p-1">
                  <svg width="20" height="20" fill="#facc15" viewBox="0 0 20 20">
                    <polygon points="10 12.597 7.64 14,12.14 15.82,19 15.274.18 19.2 6,12.14 0.49 0.64" />
                  </svg>
                </div>
              </div>
              
              <div class="p-6">
                <h3 class="font-bold text-lg mb-2">{car.name}</h3>
                
                <div class="flex items-center gap-1 mb-3">
                  <svg width="16" height="16" fill="#facc15" viewBox="0 0 20 20">
                    <polygon points="10 12.597 7.64 14,12.14 15.82,19 15.274.18 19.2 6,12.14 0.49 0.64" />
                  </svg>
                  <span class="text-sm text-gray-600">{car.rating} ({car.reviews.toLocaleString()} reviews)</span>
                </div>
                
                <div class="grid grid-cols-2 gap-2 mb-4">
                  {car.features.map((feature, index) => (
                    <div key={index} class="flex items-center gap-1 text-xs text-gray-500">
                      <svg width="12" height="12" fill="#6b7280" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 000-16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-.414z" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="text-2xl font-bold text-[#2563eb]">${car.price.toLocaleString()}</div>
                  <button class="px-4 py-2 bg-[#2563eb] text-white rounded-lg font-semibold hover:bg-[#18a0fb] transition flex items-center gap-2">
                    Rent Now
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10.293 0.293a1 1 0 011.414 0 6a1 1 0 010 1.414 6a1 1 0 01-0.414 1.414L14.586 11H3a1 1 0 010-2.172l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div class="text-center">
          <button class="px-8 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2 mx-auto">
            Show all vehicles
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10.293 0.293a1 1 0 011.414 0 6a1 1 0 010 1.414 6a1 1 0 01-0.414 1.414L14.586 11H3a1 1 0 010-2.172l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}); 