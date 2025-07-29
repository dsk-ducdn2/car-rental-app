import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import TableAuthors from '../../components/dashboard/TableAuthors';
import { Sidebar } from '../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { fetchWithAuth } from '../../utils/api';
// import { useNavigate } from '@builder.io/qwik-city';

interface Author {
  id: number;
  avatar: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: boolean;
}

// Function to transform API data to match Author interface - moved outside component
const transformUserData = (users: any[]): Author[] => {
  return users.map((user, index) => ({
    id: user.id || index + 1,
    avatar: user.avatar || `https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${index + 1}.jpg`,
    name: user.name || user.email?.split('@')[0] || `User ${index + 1}`,
    email: user.email || `user${index + 1}@example.com`,
    phoneNumber: user.phoneNumber || user.phone,
    status: user.status === "1", // Convert "1" to true (active), "0" to false (deactive)
  }));
};

export default component$(() => {
  // const nav = useNavigate();
  const store = useStore<{ authors: Author[] }>({ authors: [] });
  const API_URL = import.meta.env.VITE_API_URL;
  useVisibleTask$(async () => {
    const res = await fetchWithAuth(`${API_URL}/Users`);
    const data = await res.json();
    store.authors = transformUserData(data);
  });

  return (
    <div class="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa]">
      {/* Sidebar: ẩn trên mobile, hiện trên md trở lên */}
      <aside class="hidden md:block md:w-64 lg:w-72 xl:w-80 flex-shrink-0">
        <Sidebar />
      </aside>
      <main class="flex-1 w-full flex flex-col min-h-screen pb-16">
        <DashboardHeader />
        <div class="px-2 sm:px-4 md:px-8">
          <h1 class="text-2xl font-bold mb-6">Users table</h1>
          <div class="bg-white rounded shadow p-6">
            <TableAuthors authors={store.authors} />
          </div>
        </div>
      </main>
    </div>
  );
}); 