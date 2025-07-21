import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { apiGetVehicles, apiAddVehicle, apiUpdateVehicle, apiDeleteVehicle } from '../../services/vehicle-api';
import type { Vehicle, VehicleStatus } from '../../mock-data/vehicles';
import AdminNav from '../../components/AdminNav';

const statusOptions: VehicleStatus[] = ['Available', 'Rented', 'Reserved', 'Maintenance'];
const sortOptions = [
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'rentCount', label: 'Lượt thuê nhiều' },
];

export default component$(() => {
  const vehicles = useSignal<Vehicle[]>([]);
  const loading = useSignal(true);
  const editingVehicle = useSignal<Partial<Vehicle> | null>(null);
  const showForm = useSignal(false);
  const filterStatus = useSignal<VehicleStatus | ''>('');
  const sortBy = useSignal<'rating' | 'rentCount' | ''>('');

  const fetchVehicles = $(async () => {
    loading.value = true;
    vehicles.value = await apiGetVehicles({
      status: filterStatus.value || undefined,
      sortBy: sortBy.value || undefined,
    });
    loading.value = false;
  });

  useTask$(({ track }) => {
    track(() => filterStatus.value);
    track(() => sortBy.value);
    fetchVehicles();
  });

  const handleEdit = $((v: Vehicle) => {
    editingVehicle.value = { ...v };
    showForm.value = true;
  });

  const handleAdd = $(() => {
    editingVehicle.value = {
      image: '',
      type: '',
      licensePlate: '',
      km: 0,
      brand: '',
      year: new Date().getFullYear(),
      price: { hour: 0, day: 0, month: 0 },
      seats: 4,
      status: 'Available',
      rating: 0,
      rentCount: 0,
    };
    showForm.value = true;
  });

  const handleDelete = $(async (id: number) => {
    await apiDeleteVehicle(id);
    await fetchVehicles();
  });

  const handleSave = $(async () => {
    if (!editingVehicle.value) return;
    if (!editingVehicle.value.id) {
      const { image, type, licensePlate, km, brand, year, price, seats, status, rating, rentCount } = editingVehicle.value;
      await apiAddVehicle({ image, type, licensePlate, km, brand, year, price, seats, status, rating, rentCount } as Omit<Vehicle, 'id'>);
    } else {
      await apiUpdateVehicle(editingVehicle.value.id, editingVehicle.value as Partial<Omit<Vehicle, 'id'>>);
    }
    await fetchVehicles();
    showForm.value = false;
    editingVehicle.value = null;
  });

  // Gợi ý xe nổi bật: top 2 theo rating hoặc rentCount
  const featured = () => {
    if (!vehicles.value.length) return [];
    return [...vehicles.value]
      .sort((a, b) => b.rating + b.rentCount - (a.rating + a.rentCount))
      .slice(0, 2);
  };

  return (
    <main class="p-4 max-w-7xl mx-auto">
      <AdminNav />
      <h1 class="text-3xl font-bold mb-6 text-indigo-700">Quản lý xe</h1>
      <div class="flex flex-wrap gap-4 mb-4 items-center">
        <button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick$={handleAdd}>Thêm xe</button>
        <select class="border rounded px-3 py-2" value={filterStatus.value} onChange$={e => { filterStatus.value = (e.target as HTMLSelectElement).value as VehicleStatus || ''; }}>
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select class="border rounded px-3 py-2" value={sortBy.value} onChange$={e => { sortBy.value = (e.target as HTMLSelectElement).value as any; }}>
          <option value="">Sắp xếp</option>
          {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-2">Xe nổi bật</h2>
        <div class="flex gap-4 flex-wrap">
          {featured().map((v) => (
            <div key={v.id} class="border rounded-lg p-4 bg-yellow-50 w-72">
              <img src={v.image} alt={v.type} class="w-full h-32 object-cover rounded mb-2" width={288} height={128} />
              <div class="font-bold text-lg">{v.type} - {v.brand} ({v.year})</div>
              <div>Đánh giá: <span class="font-semibold">{v.rating}</span> ★</div>
              <div>Lượt thuê: <span class="font-semibold">{v.rentCount}</span></div>
              <div>Trạng thái: <span class="font-semibold">{v.status}</span></div>
              {(() => {
                const kmToNext = v.maintenance.cycleKm - (v.km - v.maintenance.lastMaintenanceKm);
                const lastDate = new Date(v.maintenance.lastMaintenanceDate);
                const nextDate = new Date(lastDate);
                nextDate.setMonth(lastDate.getMonth() + v.maintenance.cycleMonths);
                const daysToNext = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                if (kmToNext <= 0 || daysToNext <= 0) {
                  return <div class="text-red-600 font-bold mt-2">Đến hạn bảo trì!</div>;
                }
                return null;
              })()}
            </div>
          ))}
        </div>
      </div>
      {loading.value ? (
        <div>Đang tải...</div>
      ) : (
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border rounded shadow">
            <thead>
              <tr>
                <th class="px-3 py-2 border">ID</th>
                <th class="px-3 py-2 border">Ảnh</th>
                <th class="px-3 py-2 border">Loại xe</th>
                <th class="px-3 py-2 border">Biển số</th>
                <th class="px-3 py-2 border">Hãng</th>
                <th class="px-3 py-2 border">Năm</th>
                <th class="px-3 py-2 border">Số km</th>
                <th class="px-3 py-2 border">Giá thuê (h/ngày/tháng)</th>
                <th class="px-3 py-2 border">Số chỗ</th>
                <th class="px-3 py-2 border">Trạng thái</th>
                <th class="px-3 py-2 border">Đánh giá</th>
                <th class="px-3 py-2 border">Lượt thuê</th>
                <th class="px-3 py-2 border">Bảo trì</th>
                <th class="px-3 py-2 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.value.map((v) => (
                <tr key={v.id} class="hover:bg-indigo-50">
                  <td class="border px-2 py-1">{v.id}</td>
                  <td class="border px-2 py-1"><img src={v.image} alt={v.type} class="w-20 h-12 object-cover rounded" width={80} height={48} /></td>
                  <td class="border px-2 py-1">{v.type}</td>
                  <td class="border px-2 py-1">{v.licensePlate}</td>
                  <td class="border px-2 py-1">{v.brand}</td>
                  <td class="border px-2 py-1">{v.year}</td>
                  <td class="border px-2 py-1">{v.km.toLocaleString()}</td>
                  <td class="border px-2 py-1">{v.price.hour.toLocaleString()}đ / {v.price.day.toLocaleString()}đ / {v.price.month.toLocaleString()}đ</td>
                  <td class="border px-2 py-1">{v.seats}</td>
                  <td class="border px-2 py-1">{v.status}</td>
                  <td class="border px-2 py-1">{v.rating} ★</td>
                  <td class="border px-2 py-1">{v.rentCount}</td>
                  <td class="border px-2 py-1">
                    <div>
                      <div>Chu kỳ: {v.maintenance.cycleKm}km / {v.maintenance.cycleMonths} tháng</div>
                      <div>Lần cuối: {v.maintenance.lastMaintenanceKm}km, {new Date(v.maintenance.lastMaintenanceDate).toLocaleDateString()}</div>
                      {(() => {
                        const kmToNext = v.maintenance.cycleKm - (v.km - v.maintenance.lastMaintenanceKm);
                        const lastDate = new Date(v.maintenance.lastMaintenanceDate);
                        const nextDate = new Date(lastDate);
                        nextDate.setMonth(lastDate.getMonth() + v.maintenance.cycleMonths);
                        const daysToNext = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        if (kmToNext <= 0 || daysToNext <= 0) {
                          return <div class="text-red-600 font-bold">Đến hạn bảo trì!</div>;
                        }
                        return <div class="text-green-700">Còn {kmToNext}km / {daysToNext} ngày</div>;
                      })()}
                    </div>
                  </td>
                  <td class="border px-2 py-1 space-x-2">
                    <button class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" onClick$={() => handleEdit(v)}>Sửa</button>
                    <button class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick$={() => handleDelete(v.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm.value && editingVehicle.value && (
        <div class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 class="text-xl font-bold mb-4">{editingVehicle.value.id ? 'Sửa' : 'Thêm'} xe</h2>
            <div class="space-y-2">
              <input class="w-full border rounded px-3 py-2" placeholder="Ảnh (URL)" value={editingVehicle.value.image} onInput$={e => editingVehicle.value!.image = (e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Loại xe" value={editingVehicle.value.type} onInput$={e => editingVehicle.value!.type = (e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Biển số" value={editingVehicle.value.licensePlate} onInput$={e => editingVehicle.value!.licensePlate = (e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Hãng" value={editingVehicle.value.brand} onInput$={e => editingVehicle.value!.brand = (e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Năm" type="number" value={editingVehicle.value.year} onInput$={e => editingVehicle.value!.year = +(e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Số km" type="number" value={editingVehicle.value.km} onInput$={e => editingVehicle.value!.km = +(e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Số chỗ" type="number" value={editingVehicle.value.seats} onInput$={e => editingVehicle.value!.seats = +(e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Giá thuê/giờ" type="number" value={editingVehicle.value.price?.hour} onInput$={e => editingVehicle.value!.price!.hour = +(e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Giá thuê/ngày" type="number" value={editingVehicle.value.price?.day} onInput$={e => editingVehicle.value!.price!.day = +(e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Giá thuê/tháng" type="number" value={editingVehicle.value.price?.month} onInput$={e => editingVehicle.value!.price!.month = +(e.target as HTMLInputElement).value} />
              <select class="w-full border rounded px-3 py-2" value={editingVehicle.value.status} onChange$={e => editingVehicle.value!.status = (e.target as HTMLSelectElement).value as VehicleStatus}>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input class="w-full border rounded px-3 py-2" placeholder="Đánh giá" type="number" min={0} max={5} step={0.1} value={editingVehicle.value.rating} onInput$={e => editingVehicle.value!.rating = +(e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Lượt thuê" type="number" value={editingVehicle.value.rentCount} onInput$={e => editingVehicle.value!.rentCount = +(e.target as HTMLInputElement).value} />
              <div class="font-semibold mt-4">Cấu hình bảo trì</div>
              <input class="w-full border rounded px-3 py-2" placeholder="Chu kỳ bảo trì (km)" type="number" value={editingVehicle.value.maintenance?.cycleKm} onInput$={e => editingVehicle.value!.maintenance!.cycleKm = +(e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Chu kỳ bảo trì (tháng)" type="number" value={editingVehicle.value.maintenance?.cycleMonths} onInput$={e => editingVehicle.value!.maintenance!.cycleMonths = +(e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Km lần bảo trì gần nhất" type="number" value={editingVehicle.value.maintenance?.lastMaintenanceKm} onInput$={e => editingVehicle.value!.maintenance!.lastMaintenanceKm = +(e.target as HTMLInputElement).value} />
              <input class="w-full border rounded px-3 py-2" placeholder="Ngày bảo trì gần nhất" type="date" value={editingVehicle.value.maintenance?.lastMaintenanceDate} onInput$={e => editingVehicle.value!.maintenance!.lastMaintenanceDate = (e.target as HTMLInputElement).value} />
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