import { component$, useStore} from '@builder.io/qwik';
import EditUser from '../../components/dashboard/EditUser';
import { Sidebar } from  '../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';

export default component$(() => {

  const store = useStore({
    user: {
      id: 0,
      name: '',
      email: '',
      phone: '',
      companyId: 0,
      roleId: 2,
      status: true,
    },
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
            <EditUser user={store.user} />
          </div>
        </section>
      </main>
    </div>
  );
});
