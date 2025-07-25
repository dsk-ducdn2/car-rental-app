import { component$, useSignal, $ } from '@builder.io/qwik';

export default component$(() => {
  const agree = useSignal(false);
  const submitted = useSignal(false);

  // Thêm signals cho value và error của từng trường
  const name = useSignal('');
  const email = useSignal('');
  const password = useSignal('');

  const nameError = useSignal('');
  const emailError = useSignal('');
  const passwordError = useSignal('');
  const serverError = useSignal('');

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = $(async (e: Event) => {
    submitted.value = true;
    let valid = true;

    // Name
    if (!name.value.trim()) {
      nameError.value = 'Required fields';
      valid = false;
    } else {
      nameError.value = '';
    }

    // Email
    if (!email.value.trim()) {
      emailError.value = 'Required fields';
      valid = false;
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.value)) {
      emailError.value = 'Invalid email';
      valid = false;
    } else {
      emailError.value = '';
    }

    // Password
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

    e.preventDefault(); // Ngăn reload form
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
        window.location.href = '/login';
      } else {
        const data = await res.json();
        serverError.value = data?.message || 'Registration failed. Please try again!';
      }
    } catch (err) {
      serverError.value = (err as any)?.message || 'Unable to connect to server!';
    }
  });
  return (
    <div class="min-h-screen bg-gradient-to-br from-[#f6f7fa] to-[#e9eaf3] flex flex-col">
      {/* Banner */}
      <div
        class="w-full h-64 md:h-72 bg-cover bg-center rounded-b-3xl flex flex-col items-center justify-center shadow-lg"
        style={{
          backgroundImage:
            "url('https://png.pngtree.com/background/20210715/original/pngtree-car-scene-background-picture-image_1321083.jpg')",
        }}
      >
        <h1 class="text-4xl font-extrabold text-white mt-8 mb-2 text-center drop-shadow-lg tracking-wide">Welcome!</h1>
        <p class="text-white/90 text-lg text-center max-w-xl drop-shadow">
          Use these awesome forms to login or create new account in your project for free.
        </p>
      </div>
      {/* Register Form */}
      <div class="max-w-md w-full mx-auto -mt-24 bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-gray-100">
        <div class="text-2xl font-bold mb-8 text-center text-[#393869] tracking-wide">Register</div>
        {/* Form */}
        <form class="w-full" preventdefault:submit onSubmit$={handleSubmit}>
          <div class="mb-4">
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
          <div class="mb-4">
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
          <div class="mb-4">
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
            <label htmlFor="agree" class="text-sm select-none">
              I AGREE THE <span class="font-bold text-[#393869]">TERMS AND CONDITIONS</span>
            </label>
          </div>
          {submitted.value && !agree.value && (
            <div class="text-red-500 text-xs mb-3 ml-8">You must agree to the terms and conditions</div>
          )}
          <button
            type="submit"
            class="w-full py-3 rounded-xl bg-[#393869] text-white font-bold shadow-md text-base tracking-wider hover:bg-[#2d2c4a] transition-all duration-200 mt-2"
          >
            SIGN UP
          </button>
          {serverError.value && (
            <div class="text-red-500 text-xs mt-3 text-center">{serverError.value}</div>
          )}
        </form>
        {/* Sign In Link */}
        <div class="mt-8 text-center text-gray-400 text-sm">
          ALREADY HAVE AN ACCOUNT?{' '}
          <a href="/login" class="text-[#393869] font-bold hover:underline">SIGN IN</a>
        </div>
      </div>
    </div>
  );
});