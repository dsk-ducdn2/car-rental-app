import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { apiGetUsers, apiAddUser, apiUpdateUser, apiDeleteUser } from '../../services/mock-api';
import type { User } from '../../mock-data/users';

export default component$(() => {
  const users = useSignal<User[]>([]);
  const loading = useSignal(true);
  const editingUser = useSignal<Partial<User> | null>(null);
  const showForm = useSignal(false);

  useTask$(async () => {
    loading.value = true;
    users.value = await apiGetUsers();
    loading.value = false;
  });

  const handleEdit = $((user: User) => {
    editingUser.value = { ...user };
    showForm.value = true;
  });

  const handleAdd = $(() => {
    editingUser.value = {
      email: '',
      password: '',
      role: 'User',
      vehicles: [],
    };
    showForm.value = true;
  });

  const handleDelete = $(async (id: number) => {
    await apiDeleteUser(id);
    users.value = await apiGetUsers();
  });

  const handleSave = $(async () => {
    if (!editingUser.value) return;
    if (!editingUser.value.id) {
      const { email, password, role, vehicles } = editingUser.value;
      if (email && password && role && vehicles) {
        await apiAddUser({ email, password, role, vehicles });
      }
    } else {
      await apiUpdateUser(editingUser.value.id, editingUser.value as Partial<Omit<User, 'id'>>);
    }
    users.value = await apiGetUsers();
    showForm.value = false;
    editingUser.value = null;
  });

  return (
    <main class="p-4 max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold mb-6 text-indigo-700">Quản lý người dùng</h1>
      <button class="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick$={handleAdd}>Thêm người dùng</button>
      {loading.value ? (
        <div>Đang tải...</div>
      ) : (
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border rounded shadow">
            <thead>
              <tr>
                <th class="px-3 py-2 border">ID</th>
                <th class="px-3 py-2 border">Email</th>
                <th class="px-3 py-2 border">Role</th>
                <th class="px-3 py-2 border">Xe sở hữu/thuê</th>
                <th class="px-3 py-2 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.value.map((u) => (
                <tr key={u.id} class="hover:bg-indigo-50">
                  <td class="border px-2 py-1">{u.id}</td>
                  <td class="border px-2 py-1">{u.email}</td>
                  <td class="border px-2 py-1">{u.role}</td>
                  <td class="border px-2 py-1">
                    <div class="flex flex-wrap gap-2">
                      {u.vehicles.map((v, i) => (
                        <div key={i} class="border rounded p-2 bg-gray-50 w-64">
                          <img src={v.image} alt={v.type} class="w-full h-24 object-cover rounded mb-1" width={256} height={96} />
                          <div class="font-semibold">{v.type} - {v.brand} ({v.year})</div>
                          <div>Biển số: {v.licensePlate}</div>
                          <div>Số km: {v.km.toLocaleString()}</div>
                          <div>Giá thuê: {v.price.hour.toLocaleString()}đ/h, {v.price.day.toLocaleString()}đ/ngày</div>
                          <div>Số chỗ: {v.seats}</div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td class="border px-2 py-1 space-x-2">
                    <button class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" onClick$={() => handleEdit(u)}>Sửa</button>
                    <button class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick$={() => handleDelete(u.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm.value && editingUser.value && (
        <div class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 class="text-xl font-bold mb-4">{editingUser.value.id === 0 ? 'Thêm' : 'Sửa'} người dùng</h2>
            <div class="space-y-2">
              <input class="w-full border rounded px-3 py-2" placeholder="Email" value={editingUser.value.email} onInput$={e => editingUser.value!.email = (e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Mật khẩu" type="password" value={editingUser.value.password} onInput$={e => editingUser.value!.password = (e.target as HTMLInputElement).value} />
              <select class="w-full border rounded px-3 py-2" value={editingUser.value.role} onChange$={e => editingUser.value!.role = (e.target as HTMLSelectElement).value as any}>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div class="flex gap-2 mt-4">
              <button class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick$={handleSave}>Lưu</button>
              <button class="px-4 py-2 bg-gray-300 rounded" onClick$={() => { showForm.value = false; editingUser.value = null; }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      <footer class="py-8 bg-indigo-900 text-white text-center mt-12">
        © 2025 Qwik Demo PWA. Inspired by <a href="https://www.mioto.vn/" class="underline">mioto.vn</a>
      </footer>
    </main>
  );
}); 