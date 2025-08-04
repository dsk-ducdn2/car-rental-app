import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import EditUser from '../../../components/dashboard/EditUser';
import { Sidebar } from  '../../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader';
import { fetchWithAuth } from '../../../utils/api';

export default component$(() => {
  const loc = useLocation();
  const userId = loc.params.user_id;
  const API_URL = import.meta.env.VITE_API_URL;

  const store = useStore({
    user: null as null | {
      id: number;
      name: string;
      email: string;
      phone: string;
      companyId: number;
      roleId: number;
      status: boolean;
    },
    loading: true
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/Users/${userId}`);
      const data = await res.json();
      store.user = {
        id: data.id,
        name: data.name || data.email?.split('@')[0],
        email: data.email,
        phone: data.phone || '',
        companyId: data.companyId,
        roleId: data.roleId,
        status: data.status === '1',
      };
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      store.loading = false;
    }
  });

  return (
    <div class="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <aside class="hidden md:block md:w-64">
        <Sidebar />
      </aside>
      <main class="flex-1">
        <DashboardHeader />
        <section class="p-6">
          <div class="bg-white p-6 rounded shadow min-h-[500px]">
            {store.loading ? (
              <div class="flex justify-center items-center min-h-[400px] bg-gray-50">
                <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl space-y-6 border border-gray-200">
                  <div class="h-8 bg-gray-200 rounded animate-pulse mb-6"></div>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} class="space-y-2">
                      <div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                  <div class="h-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ) : store.user ? (
              <EditUser user={store.user} />
            ) : (
              <div class="flex justify-center items-center min-h-[400px]">
                <p class="text-red-500">Failed to load user data</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
});
