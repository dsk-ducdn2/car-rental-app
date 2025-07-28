import { component$, useStore, useSignal, $ } from '@builder.io/qwik';
import LandingHeader from '../../components/landing-page/LandingHeader';
import LandingHeroSection from '../../components/landing-page/LandingHeroSection';
import LandingWhyChooseUs from '../../components/landing-page/LandingWhyChooseUs';
import './landing.css';

export default component$(() => {
  // Form registration signals
  const agree = useSignal(false);
  const submitted = useSignal(false);

  const name = useSignal('');
  const email = useSignal('');
  const password = useSignal('');

  const nameError = useSignal('');
  const emailError = useSignal('');
  const passwordError = useSignal('');
  const serverError = useSignal('');

  const API_URL = import.meta.env.VITE_API_URL;
  const toastState = useStore({
    visible: false,
  });

  const handleRegisterSubmit = $(async (e: Event) => {
    submitted.value = true;
    let valid = true;

    // Name validation
    if (!name.value.trim()) {
      nameError.value = 'Required fields';
      valid = false;
    } else {
      nameError.value = '';
    }

    // Email validation
    if (!email.value.trim()) {
      emailError.value = 'Required fields';
      valid = false;
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.value)) {
      emailError.value = 'Invalid email';
      valid = false;
    } else {
      emailError.value = '';
    }

    // Password validation
    if (!password.value) {
      passwordError.value = 'Required fields';
      valid = false;
    } else if (password.value.length < 6) {
      passwordError.value = 'Password must be 6 characters or more';
      valid = false;
    } else {
      passwordError.value = '';
    }

    if (!agree.value || !valid) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    serverError.value = '';

    try {
      const res = await fetch(`${API_URL}/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
          name: name.value
        })
      });

      if (res.ok) {
        toastState.visible = true;
        setTimeout(() => {
          toastState.visible = false;
          window.location.href = '/login';
        }, 2000);
      } else {
        const data = await res.json();
        serverError.value = data?.message || 'Registration failed. Please try again!';
      }
    } catch (err) {
      serverError.value = (err as any)?.message || 'Unable to connect to server!';
    }
  });

  return (
    <div class="min-h-screen bg-[#f8fbff] flex flex-col">
      <LandingHeader />

      <div class="min-h-[500px] flex items-center py-24">
        <LandingHeroSection />
      </div>

      {/* How it work section */}
      <section id="service-intro" class="bg-[#2d6fa3] py-20 flex flex-col items-center">
        <div class="flex flex-col items-center mb-8">
          <div class="bg-white rounded-full w-20 h-20 flex items-center justify-center mb-4">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="24" fill="#2d6fa3" fill-opacity="0.12"/>
              <g>
                <rect x="14" y="18" width="20" height="12" rx="3" fill="#2d6fa3"/>
                <rect x="18" y="22" width="12" height="4" rx="2" fill="#fff"/>
                <rect x="22" y="26" width="4" height="2" rx="1" fill="#fff"/>
              </g>
              <rect x="20" y="14" width="8" height="4" rx="2" fill="#2d6fa3"/>
              <rect x="22" y="16" width="4" height="2" rx="1" fill="#fff"/>
            </svg>
          </div>
          <h2 class="text-2xl md:text-3xl font-bold text-white">Introduction Video</h2>
        </div>
        <div class="bg-gray-100 rounded-xl flex items-center justify-center" style={{ width: '700px', height: '400px', maxWidth: '95vw' }}>
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/XMpOUEvueuM?si=DQlgKcVYgjP8r0ZK" 
            title="Introduction Video"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            style={{ borderRadius: '0.75rem' }}
          ></iframe>
        </div>
      </section>

      <div id="why-choose-us">
        <LandingWhyChooseUs />
      </div>

      {/* Business Benefits Section */}
      <section id="business-benefits" class="py-20 bg-[#f8fbff]">
        <div class="max-w-5xl mx-auto px-4 text-center">
          <span class="px-5 py-1 rounded-lg bg-[#e6f0ff] text-[#2563eb] font-semibold text-sm mb-4 inline-block">FOR BUSINESSES</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Why Your Business Needs Our System</h2>
          <p class="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
            Our Self-Drive Car Rental Management System is designed to solve the real challenges faced by car rental businesses. Discover how our platform can transform your operations and drive growth.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div class="bg-white rounded-2xl shadow p-6 flex flex-col items-start">
              <div class="text-[#2563eb] text-3xl mb-3">🚗</div>
              <div class="font-bold text-lg mb-2">Boost Operational Efficiency</div>
              <div class="text-gray-600">Automate manual tasks, reduce paperwork, and streamline every step from booking to billing. Free up your team to focus on growth, not admin.</div>
            </div>
            <div class="bg-white rounded-2xl shadow p-6 flex flex-col items-start">
              <div class="text-[#2563eb] text-3xl mb-3">📈</div>
              <div class="font-bold text-lg mb-2">Increase Revenue & Utilization</div>
              <div class="text-gray-600">Maximize fleet usage, minimize idle time, and capture more bookings with real-time availability and dynamic pricing tools.</div>
            </div>
            <div class="bg-white rounded-2xl shadow p-6 flex flex-col items-start">
              <div class="text-[#2563eb] text-3xl mb-3">🔒</div>
              <div class="font-bold text-lg mb-2">Enhance Control & Security</div>
              <div class="text-gray-600">Centralize all your data, manage permissions, and ensure compliance with robust contract and customer management features.</div>
            </div>
            <div class="bg-white rounded-2xl shadow p-6 flex flex-col items-start md:col-span-3">
              <div class="text-[#2563eb] text-3xl mb-3">💡</div>
              <div class="font-bold text-lg mb-2">Solve Real Business Problems</div>
              <div class="text-gray-600">No more lost contracts, missed maintenance, or revenue leaks. Our system gives you full visibility and control, helping you scale with confidence and deliver a superior customer experience.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" class="py-20 bg-white">
        <div class="max-w-5xl mx-auto px-4 text-center">
          <span class="px-5 py-1 rounded-lg bg-[#e6f0ff] text-[#2563eb] font-semibold text-sm mb-4 inline-block">MODERN VS. TRADITIONAL</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Why Upgrade from Excel & Paperwork?</h2>
          <p class="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
            See how our Car Rental Management System outperforms traditional methods and helps your business avoid common pitfalls.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div class="bg-[#f8fbff] rounded-2xl shadow p-6 flex flex-col items-start border border-[#e6f0ff]">
              <div class="font-bold text-lg mb-2 text-[#2563eb]">Old Way: Excel & Paperwork</div>
              <ul class="list-disc pl-5 text-gray-600 space-y-2">
                <li>Manual data entry, prone to errors</li>
                <li>Lost or misplaced contracts and records</li>
                <li>No real-time fleet overview</li>
                <li>Hard to track maintenance and service history</li>
                <li>Time-consuming reporting and analysis</li>
                <li>Limited access and collaboration</li>
              </ul>
            </div>
            <div class="bg-white rounded-2xl shadow p-6 flex flex-col items-start border border-[#23b6a0]/30">
              <div class="font-bold text-lg mb-2 text-[#23b6a0]">With Our System</div>
              <ul class="list-disc pl-5 text-gray-600 space-y-2">
                <li>Automated, error-free data management</li>
                <li>All contracts and records securely stored & searchable</li>
                <li>Instant, real-time fleet and booking overview</li>
                <li>Automated maintenance reminders & full service logs</li>
                <li>One-click analytics and business reports</li>
                <li>Cloud access for your whole team, anytime, anywhere</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" class="py-24 bg-[#f4f8fd] relative overflow-x-hidden">
        <svg class="absolute left-0 top-0 w-full h-40 md:h-56 opacity-20 -z-1" viewBox="0 0 1440 320" fill="none">
          <text x="0" y="220" font-size="320" font-weight="bold" fill="#c7e0fa" font-family="Arial, sans-serif">"</text>
          <text x="1200" y="220" font-size="320" font-weight="bold" fill="#c7e0fa" font-family="Arial, sans-serif">"</text>
        </svg>
        <div class="max-w-5xl mx-auto px-4 relative z-10">
          <div class="flex flex-col items-center mb-10">
            <span class="px-5 py-1 rounded-lg bg-[#e6f0ff] text-[#2563eb] font-semibold text-sm mb-4">TESTIMONIALS</span>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8">What people say about us?</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div class="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User 1" class="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white shadow" width="96" height="96" />
              <div class="flex items-center gap-1 mb-2">
                <span class="text-3xl font-bold">5.0</span>
                <span class="text-gray-500">stars</span>
              </div>
              <div class="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" fill="#facc15" viewBox="0 0 20 20">
                    <polygon points="10,1 12.59,7.36 19.51,7.64 14,12.14 15.82,19.02 10,15.27 4.18,19.02 6,12.14 0.49,7.64 7.41,7.36" />
                  </svg>
                ))}
              </div>
              <p class="text-gray-600 mb-6">"I have been using your services for years. Your service is great, I will continue to use your service."</p>
              <div>
                <span class="font-semibold">James Wilson</span>
                <div class="text-gray-400 text-sm">New York, US</div>
              </div>
            </div>
            {/* Card 2 */}
            <div class="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
              <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=256&q=80" alt="User 2" class="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white shadow" width="96" height="96" />
              <div class="flex items-center gap-1 mb-2">
                <span class="text-3xl font-bold">5.0</span>
                <span class="text-gray-500">stars</span>
              </div>
              <div class="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" fill="#facc15" viewBox="0 0 20 20">
                    <polygon points="10,1 12.59,7.36 19.51,7.64 14,12.14 15.82,19.02 10,15.27 4.18,19.02 6,12.14 0.49,7.64 7.41,7.36" />
                  </svg>
                ))}
              </div>
              <p class="text-gray-600 mb-6">"I feel very secure when using caretall's services. Your customer care team is very enthusiastic and the driver is always on time."</p>
              <div>
                <span class="font-semibold">Charlie Johnson</span>
                <div class="text-gray-400 text-sm">From New York, US</div>
              </div>
            </div>
            {/* Card 3 */}
            <div class="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=256&q=80" alt="User 3" class="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white shadow" width="96" height="96" />
              <div class="flex items-center gap-1 mb-2">
                <span class="text-3xl font-bold">5.0</span>
                <span class="text-gray-500">stars</span>
              </div>
              <div class="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" fill="#facc15" viewBox="0 0 20 20">
                    <polygon points="10,1 12.59,7.36 19.51,7.64 14,12.14 15.82,19.02 10,15.27 4.18,19.02 6,12.14 0.49,7.64 7.41,7.36" />
                  </svg>
                ))}
              </div>
              <p class="text-gray-600 mb-6">"The booking process is very easy and fast. I am very satisfied with the service and will recommend it to my friends."</p>
              <div>
                <span class="font-semibold">Emily Carter</span>
                <div class="text-gray-400 text-sm">From California, US</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Register Section - Replacing Contact Sales */}
      <section id="register-section" class="bg-white py-16 flex justify-center items-center border-t border-b border-gray-100">
        <div class="max-w-5xl w-full flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Left: Info */}
          <div class="flex-1 p-8 flex flex-col justify-center bg-[#f8fbff]">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Join Our Platform</h2>
            <p class="text-gray-600 mb-6">Create your account and start managing your car rental business efficiently with our comprehensive system.</p>
            <ul class="space-y-3 text-gray-700 mb-6">
              <li class="flex items-center gap-2"><span class="text-[#2563eb]">✓</span> Free trial for 14 days</li>
              <li class="flex items-center gap-2"><span class="text-[#2563eb]">✓</span> No credit card required</li>
              <li class="flex items-center gap-2"><span class="text-[#2563eb]">✓</span> Full access to all features</li>
              <li class="flex items-center gap-2"><span class="text-[#2563eb]">✓</span> 24/7 customer support</li>
            </ul>
            <div class="text-sm text-gray-500">Already have an account? <a href="/login" class="text-[#2563eb] underline">Sign in here</a></div>
          </div>
          {/* Right: Register Form */}
          <div class="flex-1 p-8 bg-white flex flex-col justify-center">
            <form class="space-y-4" preventdefault:submit onSubmit$={handleRegisterSubmit}>
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  value={name.value}
                  onInput$={e => (name.value = (e.target as HTMLInputElement).value)}
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#393869] transition-all duration-200 text-base"
                />
                {nameError.value && (
                  <div class="text-red-500 text-xs mt-1 ml-1">{nameError.value}</div>
                )}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email.value}
                  onInput$={e => (email.value = (e.target as HTMLInputElement).value)}
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#393869] transition-all duration-200 text-base"
                />
                {emailError.value && (
                  <div class="text-red-500 text-xs mt-1 ml-1">{emailError.value}</div>
                )}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password.value}
                  onInput$={e => (password.value = (e.target as HTMLInputElement).value)}
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#393869] transition-all duration-200 text-base"
                />
                {passwordError.value && (
                  <div class="text-red-500 text-xs mt-1 ml-1">{passwordError.value}</div>
                )}
              </div>
              <div class="flex items-center mb-3">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agree.value}
                  onChange$={() => (agree.value = !agree.value)}
                  class="accent-[#393869] w-5 h-5 rounded border-gray-300 mr-3 transition-all duration-150"
                />
                <label for="agree" class="text-sm select-none">
                  I AGREE THE <span class="font-bold text-[#393869]">TERMS AND CONDITIONS</span>
                </label>
              </div>
              {submitted.value && !agree.value && (
                <div class="text-red-500 text-xs mb-3 ml-8">You must agree to the terms and conditions</div>
              )}
              <button
                type="submit"
                class="w-full py-3 rounded-xl bg-[#393869] text-white font-bold shadow-md text-base tracking-wider hover:bg-[#2d2c4a] transition-all duration-200"
              >
                SIGN UP
              </button>
              {serverError.value && (
                <div class="text-red-500 text-xs mt-3 text-center">{serverError.value}</div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section class="bg-[#f8fbff] py-20 relative overflow-hidden">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-8">
          {/* Left */}
          <div class="flex-1 z-10">
            <span class="px-5 py-1 rounded-lg bg-[#e6f0ff] text-[#2563eb] font-semibold text-sm mb-4 inline-block">DOWNLOAD</span>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Download Rentcars App for <span class="text-[#2563eb]">FREE</span></h2>
            <p class="text-gray-600 mb-6">For faster, easier booking and exclusive deals.</p>
            <div class="flex gap-3 mb-8">
              <a href="#" aria-label="Get it on Google Play">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" class="h-12" width="135" height="40" />
              </a>
              <a href="#" aria-label="Download on the App Store">
                <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" class="h-12" width="135" height="40" />
              </a>
            </div>
          </div>
          {/* Right - Phone with car */}
          <div class="flex-1 flex justify-center items-center relative z-10">
            <img src="https://stimg.cardekho.com/images/carexteriorimages/930x620/Porsche/911/11757/1717680690776/front-left-side-47.jpg" alt="Phone" class="w-[320px] md:w-[400px] z-10" style={{ boxShadow: '0 8px 32px rgba(37,99,235,0.10)' }} width="400" height="267" />
            <img src="https://stimg.cardekho.com/images/carexteriorimages/930x620/Porsche/911/11757/1717680690776/front-left-side-47.jpg" alt="Car" class="absolute top-1/2 left-1/2 w-[220px] md:w-[260px] -translate-x-1/2 -translate-y-1/2 z-20" width="260" height="173" />
          </div>
          {/* Background shape */}
          <svg class="absolute left-0 top-0 w-full h-full z-0" viewBox="0 0 1440 320" fill="none">
            <polygon points="0,0 1440,0 1440,320 0,160" fill="#e6f0ff" />
          </svg>
        </div>
      </section>

      {/* Sticky CTA Widget */}
      <div id="sticky-cta-widget" class="fixed z-50 right-6 bottom-6 flex flex-col items-end">
        <div class="relative bg-gradient-to-b from-[#2d6fa3] to-[#23b6a0] rounded-xl shadow-xl px-4 pt-8 pb-4 min-w-[220px] max-w-xs flex flex-col items-center cursor-pointer group" onClick$={() => {
          const formSection = document.getElementById('register-section');
          if (formSection) (formSection as HTMLElement).scrollIntoView({ behavior: 'smooth' });
        }}>
          {/* Close button */}
          <button class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-500 text-xl font-bold border border-gray-200 shadow" style={{lineHeight:'1'}} aria-label="Close" onClick$={(e: Event) => {e.stopPropagation(); const el = document.getElementById('sticky-cta-widget'); if (el) (el as HTMLElement).style.display='none';}}>&times;</button>
          {/* Chart/Doc Icon */}
          <div class="absolute -top-8 left-4 w-16 h-16 bg-white rounded-lg shadow flex items-center justify-center rotate-[-15deg] border border-gray-100">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <rect x="3" y="3" width="32" height="32" rx="4" fill="#fff" stroke="#bbb" stroke-width="1.5"/>
              <circle cx="19" cy="13" r="6" fill="#2d6fa3"/>
              <path d="M19 13v-6A6 6 0 0 1 25 13h-6Z" fill="#f87171"/>
              <rect x="10" y="22" width="18" height="3" rx="1.5" fill="#23b6a0"/>
              <rect x="10" y="27" width="10" height="2" rx="1" fill="#fbbf24"/>
            </svg>
          </div>
          {/* Main text */}
          <div class="text-white font-bold text-lg text-center mt-2 leading-tight">Get started<br/>in 1 minute!<br/>Register now!</div>
        </div>
      </div>

      {/* Footer */}
      <footer class="bg-[#0a1a2f] text-white pt-16 pb-8 px-4">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-8">
          {/* Logo & Info */}
          <div>
            <div class="flex items-center gap-2 mb-4">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="16" fill="#2563eb"/>
                <path d="M16 8l6 10.5H10L16 8Z" fill="#fff"/>
              </svg>
              <span class="text-xl font-bold tracking-tight">RENTCARS</span>
            </div>
            <div class="text-gray-300 text-sm mb-2">25568 Hc 1, Glenallen, Alaska, 99588, USA</div>
            <div class="text-gray-300 text-sm mb-2">+603 4784 273 12</div>
            <div class="text-gray-300 text-sm mb-2">rentcars@gmail.com</div>
          </div>
          {/* Our Product */}
          <div>
            <div class="font-semibold mb-3">Our Product</div>
            <ul class="space-y-2 text-gray-300 text-sm">
              <li><a href="#" class="hover:text-white">Career</a></li>
              <li><a href="#" class="hover:text-white">Car</a></li>
              <li><a href="#" class="hover:text-white">Packages</a></li>
              <li><a href="#" class="hover:text-white">Features</a></li>
              <li><a href="#" class="hover:text-white">Priceline</a></li>
            </ul>
          </div>
          {/* Resources */}
          <div>
            <div class="font-semibold mb-3">Resources</div>
            <ul class="space-y-2 text-gray-300 text-sm">
              <li><a href="#" class="hover:text-white">Download</a></li>
              <li><a href="#" class="hover:text-white">Help Centre</a></li>
              <li><a href="#" class="hover:text-white">Guides</a></li>
              <li><a href="#" class="hover:text-white">Partner Network</a></li>
              <li><a href="#" class="hover:text-white">Cruises</a></li>
              <li><a href="#" class="hover:text-white">Developer</a></li>
            </ul>
          </div>
          {/* About Rentcars */}
          <div>
            <div class="font-semibold mb-3">About Rentcars</div>
            <ul class="space-y-2 text-gray-300 text-sm">
              <li><a href="#" class="hover:text-white">Why choose us</a></li>
              <li><a href="#" class="hover:text-white">Our Story</a></li>
              <li><a href="#" class="hover:text-white">Investor Relations</a></li>
              <li><a href="#" class="hover:text-white">Press Center</a></li>
              <li><a href="#" class="hover:text-white">Advertise</a></li>
            </ul>
          </div>
          {/* Follow Us */}
          <div>
            <div class="font-semibold mb-3">Follow Us</div>
            <div class="flex gap-4 mt-2">
              <a href="#" aria-label="Facebook" class="hover:text-[#2563eb]">
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" class="hover:text-[#2563eb]">
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.809 2.256 6.089 2.243 6.498 2.243 12c0 5.502.013 5.911.072 7.191.059 1.277.353 2.45 1.32 3.417.967.967 2.14 1.261 3.417 1.32 1.28.059 1.689.072 7.191.072s5.911-.013 7.191-.072c1.277-.059 2.45-.353 3.417-1.32.967-.967 1.261-2.14 1.32-3.417.059-1.28.072-1.689.072-7.191s-.013-5.911-.072-7.191c-.059-1.277-.353-2.45-1.32-3.417C21.05.425 19.877.131 18.6.072 17.32.013 16.911 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm7.2-10.406a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
                </svg>
              </a>
              <a href="#" aria-label="YouTube" class="hover:text-[#2563eb]">
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.386.574a2.994 2.994 0 0 0-2.112 2.112C0 8.072 0 12 0 12s0 3.928.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.5 20.5 12 20.5 12 20.5s7.5 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.928 24 12 24 12s0-3.928-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div class="border-t border-[#22304a] pt-6 text-center text-gray-400 text-sm">Copyright 2023 · Rentcars, All Rights Reserved</div>
      </footer>
      {toastState.visible && (
        <div class="toast-success">
          <div class="font-semibold">🎉 Registration successful!</div>
          <div class="toast-progress"></div>
        </div>
      )}
    </div>
  );
}); 