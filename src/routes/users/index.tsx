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
  const store = useStore<{ authors: Author[]; loading: boolean }>({ 
    authors: [], 
    loading: true 
  });
  const API_URL = import.meta.env.VITE_API_URL;
  
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/Users`);
      const data = await res.json();
      store.authors = transformUserData(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      store.authors = [];
    } finally {
      store.loading = false;
    }
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
          <div class="bg-white rounded shadow p-6 min-h-[600px]">
            {store.loading ? (
              <div class="space-y-4">
                <div class="flex justify-start mb-4 px-6">
                  <div class="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full bg-white rounded-lg table-fixed">
                    <thead>
                      <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                        <th class="py-3 px-6 w-1/5">Author</th>
                        <th class="py-3 px-6 w-1/5">Email</th>
                        <th class="py-3 px-6 w-1/5">Phone Number</th>
                        <th class="py-3 px-6 w-1/5">Status</th>
                        <th class="py-3 px-6 w-1/5">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <tr key={idx} class="border-b border-gray-200">
                          <td class="py-4 px-6">
                            <div class="flex items-center gap-3">
                              <div class="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                              <div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="h-6 w-11 bg-gray-200 rounded-full animate-pulse"></div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="flex gap-2">
                              <div class="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                              <div class="h-6 w-14 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <TableAuthors authors={store.authors} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}); 