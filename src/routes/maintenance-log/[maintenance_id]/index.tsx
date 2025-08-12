import { component$, useSignal, useStore, useVisibleTask$, $ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { Sidebar } from '../../../components/dashboard/Slidebar';
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader';
import { fetchWithAuth, getCookie } from '../../../utils/api';
import { jwtDecode } from 'jwt-decode';

interface MaintenanceLog {
  id?: string;
  maintenance_id: string;
  action: string;
  note: string;
  created_by: string;
  created_at: string;
}

export default component$(() => {
  const loc = useLocation();
  const maintenanceId = loc.params.maintenance_id;
  const API_ROOT = 'https://localhost:44391/api';

  const form = useStore<MaintenanceLog>({
    maintenance_id: maintenanceId,
    action: '',
    note: '',
    created_by: '',
    created_at: new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
  });

  const loading = useSignal<boolean>(true);
  const saving = useSignal<boolean>(false);
  const error = useSignal<string>('');
  const success = useSignal<string>('');

  // Load existing log info
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    loading.value = true;
    error.value = '';
    success.value = '';
    try {
      // Prefill created_by from current logged-in user if available
      try {
        const token = getCookie('access_token');
        if (token) {
          const decoded = jwtDecode<any>(token);
          const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]; // id
          const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded.email || decoded.preferred_username;
          const name = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.name || decoded.unique_name;
          const createdBy = email || name || userId;
          if (createdBy && !form.created_by) {
            form.created_by = String(createdBy);
          }
        }
      } catch {}

      const res = await fetchWithAuth(`${API_ROOT}/MaintenanceLog/${maintenanceId}`);
      if (res.ok) {
        // Some APIs return 204 or empty body; avoid throwing on res.json()
        const dataText = await res.text().catch(() => '');
        const data = dataText ? JSON.parse(dataText) : null;
        // Support both a single object or array response
        const first = Array.isArray(data) ? (data[0] ?? null) : data;
        if (first) {
          form.id = first.id ?? form.id;
          form.maintenance_id = String(first.maintenance_id ?? maintenanceId);
          form.action = String(first.action ?? form.action);
          form.note = String(first.note ?? form.note);
          form.created_by = String(first.created_by ?? form.created_by);
          const createdAt = first.created_at || first.createdAt || form.created_at;
          if (createdAt) {
            const dt = new Date(createdAt);
            if (!isNaN(dt.getTime())) {
              form.created_at = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
            }
          }
          // If API does not include created_by, keep prefilled value from token
        } else {
          // No content/null/empty array: treat as no log yet. Do not set error.
          error.value = '';
        }
      } else if (res.status === 404 || res.status === 204) {
        // No log exists yet; not an error
        error.value = '';
      } else {
        // Other error statuses
        const errMsg = await res.text().catch(() => '');
        error.value = errMsg || 'Failed to load maintenance log';
      }
    } catch (e) {
      console.error('Failed to load maintenance log', e);
      // Swallow JSON parse errors for empty bodies
      if (!String(e).toLowerCase().includes('json')) {
        error.value = 'Failed to load maintenance log';
      }
    } finally {
      loading.value = false;
    }
  });

  const handleSave = $(async () => {
    saving.value = true;
    error.value = '';
    success.value = '';
    try {
      // Ensure we send correct property names and Guid strings
      // Prefer GUID from token for createdBy if the current field isn't a valid GUID
      let createdByValue = form.created_by?.trim();
      const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!createdByValue || !guidRegex.test(createdByValue)) {
        try {
          const token = getCookie('access_token');
          if (token) {
            const decoded = jwtDecode<any>(token);
            const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]; 
            if (userId && typeof userId === 'string' && guidRegex.test(userId)) {
              createdByValue = userId;
            }
          }
        } catch {}
      }

      const payload: any = {
        maintenanceId: form.maintenance_id, // must be GUID string
        action: form.action.trim(),
        note: form.note.trim(),
        createdBy: createdByValue,
      };

      const res = await fetchWithAuth(`${API_ROOT}/MaintenanceLog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        success.value = 'Saved maintenance log successfully';
      } else {
        const err = await res.json().catch(() => ({}));
        error.value = err.message || 'Failed to save maintenance log';
      }
    } catch (e) {
      console.error('Save maintenance log error', e);
      error.value = 'An error occurred while saving maintenance log';
    } finally {
      saving.value = false;
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
          <h1 class="text-2xl font-bold mb-6">Maintenance Log</h1>

          <div class="bg-white rounded shadow p-6 min-h-[400px] max-w-2xl">
            {loading.value ? (
              <div class="space-y-4">
                <div class="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-24 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <div class="space-y-4">
                {error.value && (
                  <div class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error.value}</div>
                )}
                {success.value && (
                  <div class="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success.value}</div>
                )}

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Maintenance ID</label>
                  <input
                    type="text"
                    value={form.maintenance_id}
                    readOnly
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Action</label>
                  <input
                    type="text"
                    value={form.action}
                    onInput$={(e) => (form.action = (e.target as HTMLInputElement).value)}
                    placeholder="E.g., INSPECTED, REPAIRED, CLEANED"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    rows={4}
                    value={form.note}
                    onInput$={(e) => (form.note = (e.target as HTMLTextAreaElement).value)}
                    placeholder="Details about the maintenance action"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                    <input
                      type="text"
                      value={form.created_by}
                      onInput$={(e) => (form.created_by = (e.target as HTMLInputElement).value)}
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                    <input
                      type="datetime-local"
                      value={form.created_at}
                      onInput$={(e) => (form.created_at = (e.target as HTMLInputElement).value)}
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div class="pt-4 flex items-center gap-3">
                  <button
                    onClick$={handleSave}
                    disabled={saving.value}
                    class={`px-4 py-2 rounded-lg text-white ${saving.value ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                  >
                    {saving.value ? 'Saving…' : 'Save'}
                  </button>
                  <a href="/maintenance-schedules" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Back</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
});


