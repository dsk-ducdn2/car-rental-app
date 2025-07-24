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
      const res = await fetch(`${API_URL}/Users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
          name: name.value,
          phone: null
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
    <div class="min-h-screen bg-[#f6f7fa]">
      {/* Banner */}
      <div
        class="w-full h-64 md:h-72 bg-cover bg-center rounded-b-3xl flex flex-col items-center justify-center"
        style={{
          backgroundImage:
            "url('https://png.pngtree.com/background/20210715/original/pngtree-car-scene-background-picture-image_1321083.jpg')",
        }}
      >
        <h1 class="text-4xl font-bold text-white mt-8 mb-2 text-center drop-shadow">Welcome!</h1>
        <p class="text-white/90 text-lg text-center max-w-xl drop-shadow">
          Use these awesome forms to login or create new account in your project for free.
        </p>
      </div>
      {/* Register Form */}
      <div class="max-w-md mx-auto -mt-24 bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <div class="text-lg font-medium mb-6 text-center">Register with</div>
        {/* Social buttons */}
        <div class="flex gap-4 mb-6">
          <button class="w-12 h-12 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <svg width="22" height="22" fill="#3b5998" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12"/></svg>
          </button>
          <button class="w-12 h-12 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            {/* Apple logo SVG */}
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M16.365 1.43c-1.13.07-2.52.77-3.36 1.67-.8.85-1.5 2.19-1.5 3.13 0 .36.09.44.5.44.27 0 .5-.04.5-.09 0-.05.18-.41.4-.8.44-.8 1.23-1.67 1.8-1.97.41-.22 1.13-.22 1.54 0 .57.3 1.36 1.17 1.8 1.97.22.39.4.75.4.8 0 .05.23.09.5.09.41 0 .5-.08.5-.44 0-.94-.7-2.28-1.5-3.13-.84-.9-2.23-1.6-3.36-1.67z" fill="#000"/>
              <path d="M19.5 14.5c-.28.56-.6 1.09-.97 1.59-.53.7-1.1 1.38-1.8 1.38-.66 0-.93-.43-1.74-.43-.81 0-1.11.42-1.75.43-.7 0-1.23-.66-1.76-1.36-.6-.8-1.18-2.2-.98-3.47.11-.7.44-1.36.97-1.36.5 0 .7.36 1.75.36 1.05 0 1.21-.36 1.75-.36.53 0 .85.66.97 1.36.09.54.03 1.09-.13 1.6z" fill="#000"/>
            </svg>
          </button>
          <button class="w-12 h-12 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <svg width="22" height="22" fill="none" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.5 1.23 8.47 3.25l6.32-6.32C34.98 2.7 29.87 0 24 0 14.82 0 6.73 5.8 2.69 14.19l7.75 6.02C12.13 13.13 17.56 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.03l7.18 5.59C43.98 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.44 28.19a14.5 14.5 0 0 1 0-8.38l-7.75-6.02A23.97 23.97 0 0 0 0 24c0 3.91.94 7.62 2.69 10.81l7.75-6.02z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.15 15.9-5.85l-7.18-5.59c-2.01 1.35-4.59 2.15-8.72 2.15-6.44 0-11.87-3.63-13.56-8.69l-7.75 6.02C6.73 42.2 14.82 48 24 48z"/></g></svg>
          </button>
        </div>
        {/* Divider */}
        <div class="flex items-center w-full mb-6">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="mx-3 text-gray-400 font-semibold text-sm">OR</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>
        {/* Form */}
        <form class="w-full" preventdefault:submit onSubmit$={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name.value}
            onInput$={e => (name.value = (e.target as HTMLInputElement).value)}
            class="w-full mb-1 px-4 py-2 rounded border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {nameError.value && (
            <div class="text-red-500 text-xs mb-2 ml-2">{nameError.value}</div>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email.value}
            onInput$={e => (email.value = (e.target as HTMLInputElement).value)}
            class="w-full mb-1 px-4 py-2 rounded border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {emailError.value && (
            <div class="text-red-500 text-xs mb-2 ml-2">{emailError.value}</div>
          )}
          <input
            type="password"
            placeholder="Password"
            value={password.value}
            onInput$={e => (password.value = (e.target as HTMLInputElement).value)}
            class="w-full mb-1 px-4 py-2 rounded border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {passwordError.value && (
            <div class="text-red-500 text-xs mb-2 ml-2">{passwordError.value}</div>
          )}
          <div class="flex items-center mb-1">
            <input
              id="agree"
              type="checkbox"
              checked={agree.value}
              onChange$={() => (agree.value = !agree.value)}
              class="accent-indigo-700 w-5 h-5 rounded mr-2"
            />
            <label htmlFor="agree" class="text-sm">
              I AGREE THE <span class="font-bold">TERMS AND CONDITIONS</span>
            </label>
          </div>
          {submitted.value && !agree.value && (
            <div class="text-red-500 text-xs mb-3 ml-7">You must agree to the terms and conditions</div>
          )}
          <button
            type="submit"
            class="w-full py-3 rounded-lg bg-[#393869] text-white font-bold shadow text-sm tracking-wider hover:bg-[#2d2c4a] transition"
          >
            SIGN UP
          </button>
          {serverError.value && (
            <div class="text-red-500 text-xs mt-2 text-center">{serverError.value}</div>
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