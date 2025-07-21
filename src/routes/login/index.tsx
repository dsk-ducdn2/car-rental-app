import { component$, useSignal } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../../state/auth';

export default component$(() => {
  const email = useSignal('');
  const password = useSignal('');
  const role = useSignal('User');
  const nav = useNavigate();
  const { login } = useAuth();
  const error = useSignal('');

  return (
    <main class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <form class="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-6" preventdefault:submit onSubmit$={async () => {
        const u = await login(email.value, password.value);
        if (u && u.role === role.value) {
          error.value = '';
          nav('/');
        } else {
          error.value = 'Sai thông tin đăng nhập hoặc vai trò!';
        }
      }}>
        <h2 class="text-2xl font-bold text-indigo-700 mb-2 text-center">Đăng nhập</h2>
        <div>
          <label class="block text-gray-600 mb-1">Email</label>
          <input type="email" class="w-full border rounded px-3 py-2" bind:value={email} required />
        </div>
        <div>
          <label class="block text-gray-600 mb-1">Mật khẩu</label>
          <input type="password" class="w-full border rounded px-3 py-2" bind:value={password} required />
        </div>
        <div>
          <label class="block text-gray-600 mb-1">Vai trò</label>
          <select class="w-full border rounded px-3 py-2" bind:value={role}>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        {error.value && <div class="text-red-500 text-sm text-center">{error.value}</div>}
        <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 transition">Đăng nhập</button>
        <div class="text-center text-sm mt-2">
          Chưa có tài khoản? <a href="/register" class="text-indigo-600 hover:underline">Đăng ký</a>
        </div>
      </form>
    </main>
  );
}); 