import { component$, useSignal, useVisibleTask$, $, useStore } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { Sidebar } from '../../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader';
import { fetchWithAuth } from '../../../utils/api';

interface VehicleSummary {
  id: string;
  licensePlate: string;
  brand: string;
  companyName?: string;
}

export default component$(() => {
  const loc = useLocation();
  const vehicleId = loc.params.vehicle_id;
  const API_URL = import.meta.env.VITE_API_URL;

  const vehicle = useSignal<VehicleSummary | null>(null);
  const loadingVehicle = useSignal<boolean>(true);

  const formData = useStore({
    title: '',
    description: '',
    scheduledDate: '',
  });

  const submitting = useSignal<boolean>(false);
  const error = useSignal<string>('');

  const today = new Date().toISOString().split('T')[0];

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/Vehicles/${vehicleId}`);
      const data = await res.json();
      vehicle.value = {
        id: data.id,
        licensePlate: data.licensePlate,
        brand: data.brand,
        companyName: data.companyName || data.company?.name,
      };
    } catch (e) {
      console.error('Failed to fetch vehicle', e);
      vehicle.value = null;
    } finally {
      loadingVehicle.value = false;
    }
  });

  const handleSubmit = $(async () => {
    if (!formData.title.trim() || !formData.scheduledDate) {
      error.value = 'Please fill in all required fields';
      return;
    }

    submitting.value = true;
    error.value = '';

    try {
      const response = await fetchWithAuth(`${API_URL}/Maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: vehicleId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          scheduledDate: formData.scheduledDate,
        }),
      });

      if (response.ok) {
        window.location.href = '/maintenance-schedules';
      } else {
        const errorData = await response.json().catch(() => ({}));
        error.value = errorData.message || 'Failed to create maintenance schedule';
      }
    } catch (err) {
      console.error('Error creating maintenance schedule:', err);
      error.value = 'An error occurred while creating the maintenance schedule';
    } finally {
      submitting.value = false;
    }
  });

  return (
    <div class="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa]">
      <aside class="hidden md:block md:w-64 lg:w-72 xl:w-80 flex-shrink-0">
        <Sidebar />
      </aside>
      <main class="flex-1 w-full flex flex-col min-h-screen pb-16">
        <DashboardHeader />
        <div class="px-2 sm:px-4 md:px-8">
          <h1 class="text-2xl font-bold mb-6">Create Maintenance Schedule</h1>
          <div class="bg-white rounded shadow p-6 min-h-[400px]">
            {loadingVehicle.value ? (
              <div class="flex justify-center items-center min-h-[200px]">
                <div class="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : vehicle.value ? (
              <div class="max-w-xl">
                <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span class="text-sm font-medium text-blue-900">
                      Vehicle: {vehicle.value.brand} {vehicle.value.licensePlate}
                    </span>
                  </div>
                </div>

                {error.value && (
                  <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                      <span class="text-sm text-red-700">{error.value}</span>
                    </div>
                  </div>
                )}

                <form preventdefault:submit onSubmit$={handleSubmit} class="space-y-4">
                  <div>
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                      Title <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onInput$={(e) => {
                        formData.title = (e.target as HTMLInputElement).value;
                        if (error.value) error.value = '';
                      }}
                      placeholder="Enter maintenance title"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      disabled={submitting.value}
                    />
                  </div>

                  <div>
                    <label for="scheduledDate" class="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Date <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="scheduledDate"
                      type="date"
                      value={formData.scheduledDate}
                      onInput$={(e) => {
                        formData.scheduledDate = (e.target as HTMLInputElement).value;
                        if (error.value) error.value = '';
                      }}
                      min={today}
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      disabled={submitting.value}
                    />
                  </div>

                  <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onInput$={(e) => {
                        formData.description = (e.target as HTMLTextAreaElement).value;
                        if (error.value) error.value = '';
                      }}
                      placeholder="Enter maintenance description"
                      rows={4}
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                      disabled={submitting.value}
                    />
                  </div>

                  <div class="flex gap-3 justify-end pt-4">
                    <a
                      href="/vehicles"
                      class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </a>
                    <button
                      type="submit"
                      disabled={submitting.value}
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting.value && (
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {submitting.value ? 'Creating...' : 'Create Schedule'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div class="flex justify-center items-center min-h-[200px]">
                <p class="text-red-500">Failed to load vehicle data</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
});


