import { component$, useSignal, $ } from '@builder.io/qwik';

export default component$(() => {
  const remember = useSignal(false);
  const email = useSignal('');
  const password = useSignal('');
  const emailError = useSignal('');
  const passwordError = useSignal('');
  const loginError = useSignal('');
  const API_URL = import.meta.env.VITE_API_URL;

  // Hàm validate QRL
  const validate = $( () => {
    let valid = true;
    emailError.value = '';
    passwordError.value = '';
    if (!email.value) {
      emailError.value = 'Email is required.';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      emailError.value = 'Invalid email format.';
      valid = false;
    }
    if (!password.value) {
      passwordError.value = 'Password is required.';
      valid = false;
    } else if (password.value.length < 6) {
      passwordError.value = 'Password must be at least 6 characters.';
      valid = false;
    }
    return valid;
  });

  // Xử lý submit
  const handleSubmit = $(async (e: Event) => {
    e.preventDefault();
    loginError.value = '';
    if (await validate()) {
      try {
        const res = await fetch(`${API_URL}/Auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value,
            RememberMe: remember.value, // gửi thêm RememberMe
          }),
        });
        if (!res.ok) {
          throw new Error('Login failed');
        }
        const data = await res.json();
        // Giả sử API trả về { access_token, refresh_token }
        document.cookie = `access_token=${data.access_token}; path=/; secure`;
        window.location.href = '/dashboard';
      } catch (err: any) {
        loginError.value = 'Login failed. Please check your credentials.';
      }
    }
  });

  return (
    <div class="min-h-screen flex flex-col md:flex-row">
      {/* Left: Sign In Form */}
      <div class="flex-1 flex items-center justify-center bg-white">
        <form class="w-full max-w-md mx-auto p-8" preventdefault:submit onSubmit$={handleSubmit}>
          <div class="text-gray-500 text-center mb-6 text-base">Enter your email and password to sign in</div>
          {/* Email */}
          <div class="mb-4">
            <label class="block font-semibold mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              class="w-full px-4 py-2 rounded border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              value={email.value}
              onInput$={$(e => {
                const target = e.target as HTMLInputElement | null;
                email.value = target?.value || '';
              })}
            />
            {emailError.value && (
              <div class="text-red-500 text-xs mt-1">{emailError.value}</div>
            )}
          </div>
          {/* Password */}
          <div class="mb-4">
            <label class="block font-semibold mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              class="w-full px-4 py-2 rounded border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              value={password.value}
              onInput$={$(e => {
                const target = e.target as HTMLInputElement | null;
                password.value = target?.value || '';
              })}
            />
            {passwordError.value && (
              <div class="text-red-500 text-xs mt-1">{passwordError.value}</div>
            )}
          </div>
          {/* Hiển thị lỗi đăng nhập nếu có */}
          {loginError.value && (
            <div class="text-red-500 text-xs mb-2">{loginError.value}</div>
          )}
          {/* Remember me - custom switch */}
          <div class="flex items-center mb-6">
            <input
              id="remember"
              type="checkbox"
              checked={remember.value}
              onChange$={$(() => (remember.value = !remember.value))}
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