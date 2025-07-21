import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { apiGetVehicles, apiUpdateVehicle } from '../../services/vehicle-api';
import type { Vehicle } from '../../mock-data/vehicles';
import AdminNav from '../../components/AdminNav';

export default component$(() => {
  const vehicles = useSignal<Vehicle[]>([]);
  const loading = useSignal(true);
  const editingVehicle = useSignal<Vehicle | null>(null);
  const showForm = useSignal(false);

  useTask$(async () => {
    loading.value = true;
    vehicles.value = await apiGetVehicles();
    loading.value = false;
  });

  const handleEdit = $((v: Vehicle) => {
    editingVehicle.value = { ...v };
    showForm.value = true;
  });

  const handleSave = $(async () => {
    if (!editingVehicle.value) return;
    await apiUpdateVehicle(editingVehicle.value.id, { flexiblePrice: editingVehicle.value.flexiblePrice });
    vehicles.value = await apiGetVehicles();
    showForm.value = false;
    editingVehicle.value = null;
  });

  return (
    <main class="p-4 max-w-4xl mx-auto">
      <AdminNav />
      <h1 class="text-3xl font-bold mb-6 text-indigo-700">Cấu hình giá thuê linh hoạt</h1>
      {loading.value ? (
        <div>Đang tải...</div>
      ) : (
        <table class="min-w-full bg-white border rounded shadow">
          <thead>
            <tr>
              <th class="px-3 py-2 border">ID</th>
              <th class="px-3 py-2 border">Loại xe</th>
              <th class="px-3 py-2 border">Biển số</th>
              <th class="px-3 py-2 border">Giá ngày thường</th>
              <th class="px-3 py-2 border">Giá cuối tuần</th>
              <th class="px-3 py-2 border">Giá ngày lễ</th>
              <th class="px-3 py-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.value.map((v) => (
              <tr key={v.id} class="hover:bg-indigo-50">
                <td class="border px-2 py-1">{v.id}</td>
                <td class="border px-2 py-1">{v.type}</td>
                <td class="border px-2 py-1">{v.licensePlate}</td>
                <td class="border px-2 py-1">{v.flexiblePrice.weekday.toLocaleString()}đ</td>
                <td class="border px-2 py-1">{v.flexiblePrice.weekend.toLocaleString()}đ</td>
                <td class="border px-2 py-1">{v.flexiblePrice.holiday.toLocaleString()}đ</td>
                <td class="border px-2 py-1">
                  <button class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" onClick$={() => handleEdit(v)}>Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm.value && editingVehicle.value && (
        <div class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">Cấu hình giá thuê xe #{editingVehicle.value.id}</h2>
            <div class="space-y-2">
              <input class="w-full border rounded px-3 py-2" placeholder="Giá ngày thường" type="number" value={editingVehicle.value.flexiblePrice.weekday} onInput$={e => editingVehicle.value!.flexiblePrice.weekday = +(e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Giá cuối tuần" type="number" value={editingVehicle.value.flexiblePrice.weekend} onInput$={e => editingVehicle.value!.flexiblePrice.weekend = +(e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Giá ngày lễ" type="number" value={editingVehicle.value.flexiblePrice.holiday} onInput$={e => editingVehicle.value!.flexiblePrice.holiday = +(e.target as HTMLInputElement).value} />
            </div>
            <div class="flex gap-2 mt-4">
              <button class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick$={handleSave}>Lưu</button>
              <button class="px-4 py-2 bg-gray-300 rounded" onClick$={() => { showForm.value = false; editingVehicle.value = null; }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}); 