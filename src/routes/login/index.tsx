import { component$, useSignal } from '@builder.io/qwik';

export default component$(() => {
  const remember = useSignal(false);
  return (
    <div class="min-h-screen flex flex-col md:flex-row">
      {/* Left: Sign In Form */}
      <div class="flex-1 flex items-center justify-center bg-white">
        <form class="w-full max-w-md mx-auto p-8">
          <div class="text-gray-500 text-center mb-6 text-base">Enter your email and password to sign in</div>
          {/* Email */}
          <div class="mb-4">
            <label class="block font-semibold mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              class="w-full px-4 py-2 rounded border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
            />
          </div>
          {/* Password */}
          <div class="mb-4">
            <label class="block font-semibold mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              class="w-full px-4 py-2 rounded border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
            />
          </div>
          {/* Remember me - custom switch */}
          <div class="flex items-center mb-6">
            <input
              id="remember"
              type="checkbox"
              checked={remember.value}
              onChange$={() => (remember.value = !remember.value)}
              class="hidden"
            />
            <label htmlFor="remember" class="relative inline-block w-12 h-6 mr-3 align-middle select-none cursor-pointer">
              <span
                class={[
                  'block w-12 h-6 rounded-full transition-colors duration-200',
                  remember.value ? 'bg-[#4B4A75]' : 'bg-gray-200',
                ]}
              ></span>
              <span
                class={[
                  'absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200',
                  remember.value ? 'translate-x-6' : 'translate-x-0',
                ]}
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}
              ></span>
            </label>
            <span class="font-semibold text-sm">REMEMBER ME</span>
          </div>
          {/* Sign In Button */}
          <button
            type="submit"
            class="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold shadow text-sm tracking-wider"
          >
            SIGN IN
          </button>
          {/* Sign Up Link */}
          <div class="mt-8 text-center text-gray-400 text-sm">
            DON'T HAVE AN ACCOUNT?{' '}
            <a href="/register" class="text-blue-500 font-semibold hover:underline">SIGN UP</a>
          </div>
        </form>
      </div>
      {/* Right: Custom background image, hidden on mobile */}
      <div class="hidden md:flex flex-1 items-center justify-center">
        <div
          class="w-full h-full min-h-screen rounded-br-3xl"
          style={{
            backgroundImage: 'url(https://png.pngtree.com/thumb_back/fw800/background/20240522/pngtree-abstract-backkground-of-the-front-of-a-car-image_15683380.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        ></div>
      </div>
    </div>
  );
});