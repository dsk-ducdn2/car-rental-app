import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { Sidebar } from '../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import TableCompanies from '../../components/dashboard/TableCompanies';
import { fetchWithAuth } from '../../utils/api';

interface Company {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: boolean;
}

const transformCompanyData = (companies: any[]) => {
  if (!Array.isArray(companies)) return [];
  return companies.map((company, index) => ({
    id: company.id || index,
    name: company.name || 'N/A',
    address: company.address || 'N/A',
    phone: company.phone || 'N/A',
    email: company.email || 'N/A',
    status: company.status === true || company.status === '1', // Convert "1" to true (active), "0" to false (deactive)
  }));
};

export default component$(() => {
  const store = useStore<{ companies: Company[]; loading: boolean }>({ 
    companies: [], 
    loading: true 
  });
  const API_URL = import.meta.env.VITE_API_URL;
  
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/Companies`);
      const data = await res.json();
      store.companies = transformCompanyData(data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      store.companies = [];
    } finally {
      store.loading = false;
    }
  });

  return (
    <div class="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa]">
      {/* Sidebar: hidden on mobile, show on md and up */}
      <aside class="hidden md:block md:w-64 lg:w-72 xl:w-80 flex-shrink-0">
        <Sidebar />
      </aside>
      <main class="flex-1 w-full flex flex-col min-h-screen pb-16">
        <DashboardHeader />
        <div class="px-2 sm:px-4 md:px-8">
          <h1 class="text-2xl font-bold mb-6">Companies table</h1>
          <div class="bg-white rounded shadow p-6 min-h-[600px]">
            {store.loading ? (
              <div class="space-y-4">
                <div class="flex justify-start mb-4 px-6">
                  <div class="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full bg-white rounded-lg">
                    <thead>
                                          <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                      <th class="py-3 px-6 w-1/5">Company Name</th>
                      <th class="py-3 px-6 w-1/5">Email</th>
                      <th class="py-3 px-6 w-1/5">Phone Number</th>
                      <th class="py-3 px-6 w-1/5">Address</th>
                      <th class="py-3 px-6 w-1/5">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <tr key={idx} class="border-b border-gray-200">
                          <td class="py-4 px-6">
                            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td class="py-4 px-6">
                            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
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
              <TableCompanies companies={store.companies} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
});