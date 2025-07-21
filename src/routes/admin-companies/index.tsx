import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { apiGetCompanies, apiAddCompany, apiUpdateCompany, apiDeleteCompany, apiGetCompanyVehicles } from '../../services/company-api';
import type { Company } from '../../mock-data/companies';
import type { Vehicle } from '../../mock-data/vehicles';
import AdminNav from '../../components/AdminNav';

export default component$(() => {
  const companies = useSignal<Company[]>([]);
  const loading = useSignal(true);
  const editingCompany = useSignal<Partial<Company> | null>(null);
  const showForm = useSignal(false);
  const companyVehicles = useSignal<Record<number, Vehicle[]>>({});

  useTask$(async () => {
    loading.value = true;
    companies.value = await apiGetCompanies();
    // Lấy danh sách xe cho từng công ty
    const vehiclesMap: Record<number, Vehicle[]> = {};
    for (const c of companies.value) {
      vehiclesMap[c.id] = apiGetCompanyVehicles(c.id);
    }
    companyVehicles.value = vehiclesMap;
    loading.value = false;
  });

  const handleEdit = $((c: Company) => {
    editingCompany.value = { ...c };
    showForm.value = true;
  });

  const handleAdd = $(() => {
    editingCompany.value = {
      name: '',
      vehicleIds: [],
      revenue: 0,
    };
    showForm.value = true;
  });

  const handleDelete = $(async (id: number) => {
    await apiDeleteCompany(id);
    // Gọi lại useTask$ bằng cách cập nhật signal loading
    loading.value = true;
  });

  const handleSave = $(async () => {
    if (!editingCompany.value) return;
    if (!editingCompany.value.id) {
      const { name, vehicleIds, revenue } = editingCompany.value;
      await apiAddCompany({ name: name || '', vehicleIds: vehicleIds || [], revenue: revenue || 0 });
    } else {
      await apiUpdateCompany(editingCompany.value.id, editingCompany.value as Partial<Omit<Company, 'id'>>);
    }
    loading.value = true;
    showForm.value = false;
    editingCompany.value = null;
  });

  return (
    <main class="p-4 max-w-5xl mx-auto">
      <AdminNav />
      <h1 class="text-3xl font-bold mb-6 text-indigo-700">Quản lý doanh nghiệp</h1>
      <button class="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick$={handleAdd}>Thêm doanh nghiệp</button>
      {loading.value ? (
        <div>Đang tải...</div>
      ) : (
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border rounded shadow">
            <thead>
              <tr>
                <th class="px-3 py-2 border">ID</th>
                <th class="px-3 py-2 border">Tên doanh nghiệp</th>
                <th class="px-3 py-2 border">Doanh thu</th>
                <th class="px-3 py-2 border">Danh sách xe</th>
                <th class="px-3 py-2 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {companies.value.map((c) => (
                <tr key={c.id} class="hover:bg-indigo-50">
                  <td class="border px-2 py-1">{c.id}</td>
                  <td class="border px-2 py-1">{c.name}</td>
                  <td class="border px-2 py-1 text-right">{c.revenue.toLocaleString()}đ</td>
                  <td class="border px-2 py-1">
                    <ul class="list-disc pl-4">
                      {companyVehicles.value[c.id]?.map((v) => (
                        <li key={v.id}>{v.type} - {v.brand} ({v.licensePlate})</li>
                      ))}
                    </ul>
                  </td>
                  <td class="border px-2 py-1 space-x-2">
                    <button class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" onClick$={() => handleEdit(c)}>Sửa</button>
                    <button class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick$={() => handleDelete(c.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm.value && editingCompany.value && (
        <div class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 class="text-xl font-bold mb-4">{editingCompany.value.id ? 'Sửa' : 'Thêm'} doanh nghiệp</h2>
            <div class="space-y-2">
              <input class="w-full border rounded px-3 py-2" placeholder="Tên doanh nghiệp" value={editingCompany.value.name} onInput$={e => editingCompany.value!.name = (e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Doanh thu" type="number" value={editingCompany.value.revenue} onInput$={e => editingCompany.value!.revenue = +(e.target as HTMLInputElement).value} />
            </div>
            <div class="flex gap-2 mt-4">
              <button class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick$={handleSave}>Lưu</button>
              <button class="px-4 py-2 bg-gray-300 rounded" onClick$={() => { showForm.value = false; editingCompany.value = null; }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}); 