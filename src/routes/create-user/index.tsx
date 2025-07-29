import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import EditUser from '../../components/dashboard/EditUser';
import { Sidebar } from  '../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { fetchWithAuth } from '../../utils/api';

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
          <div class="bg-white p-6 rounded shadow">
            {store.user ? <EditUser user={store.user} /> : <p>Loading...</p>}
          </div>
        </section>
      </main>
    </div>
  );
});
