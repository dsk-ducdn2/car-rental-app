import {
  component$,
  useSignal,
  useStore,
  $,
  useVisibleTask$,
} from '@builder.io/qwik';
import { fetchWithAuth } from '~/utils/api';
import '../../routes/index.css';

interface Author {
  id?: number;
  name: string;
  email: string;
  phone: string;
  status: boolean;
  companyId?: number;
  roleId?: number;
}

interface Company {
  id: number;
  name: string;
}

export default component$((props: { user: Author }) => {
  const { user } = props;
  const API_URL = import.meta.env.VITE_API_URL;

  const name = useSignal(user.name);
  const email = useSignal(user.email);
  const phoneNumber = useSignal(user.phone);
  const selectedCompany = useSignal<string | null>(
    user.companyId ? String(user.companyId) : null
  );
  const selectedRole = useSignal(user.roleId ? String(user.roleId) : '2');

  const toastState = useStore({ visible: false });

  const companies = useSignal<Company[]>([]);
  const loadingCompanies = useSignal(true);
  const errorCompanies = useSignal(false);

  const formErrors = useStore({
    name: '',
    email: '',
    phone: '',
  });

  const formState = useStore({
    serverError: '',
  });

  useVisibleTask$(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/Companies`);
      companies.value = await res.json();
    } catch (err) {
      console.error('Failed to load companies:', err);
      errorCompanies.value = true;
    } finally {
      loadingCompanies.value = false;
    }
  });

  const handleSubmit = $(async (e: Event) => {
    e.preventDefault();
    formErrors.name = '';
    formErrors.email = '';
    formErrors.phone = '';
    formState.serverError = '';

    let hasError = false;

    if (!name.value.trim()) {
      formErrors.name = 'Name is required';
      hasError = true;
    }
    if (!email.value.trim()) {
      formErrors.email = 'Email is required';
      hasError = true;
    }
    if (!phoneNumber.value.trim()) {
      formErrors.phone = 'Phone number is required';
      hasError = true;
    }

    if (hasError) return;

    const body = {
      name: name.value,
      email: email.value,
      phone: phoneNumber.value,
      companyId: selectedCompany.value ?? null,
      roleId: selectedRole.value ? Number(selectedRole.value) : undefined,
    };

    try {
      const isUpdate = !!user?.id;
      const url = isUpdate
        ? `${API_URL}/Users/${user.id}`
        : `${API_URL}/Users`;

      const method = isUpdate ? 'PUT' : 'POST';
      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        isUpdate
        ? (toastState.visible = true)
        : (window.location.href = '/tables');
        } else {
        const result = await res.json().catch(() => null);
        if (result && typeof result === 'object') {
          if (result.name) formErrors.name = result.name;
          if (result.email) formErrors.email = result.email;
          if (result.phone) formErrors.phone = result.phone;
          if (result.message) formState.serverError = result.message;
        } else {
          formState.serverError = 'Internal Server Error. Please try again.';
        }
      }
    } catch (err) {
      console.error(err);
      formState.serverError = 'An unexpected error occurred.';
    }
  });

  return (
    <div class="flex justify-center items-center min-h-[60vh] bg-gray-50">
      <form
        preventdefault:submit
        onSubmit$={handleSubmit}
        class="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl space-y-6 border border-gray-200"
      >
        <h2 class="text-2xl font-bold text-gray-800 text-center">
          {user?.id ? 'Edit User' : 'Create User'}
        </h2>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700">Name</label>
          <input
            type="text"
            value={name.value}
            onInput$={(e) => (name.value = (e.target as HTMLInputElement).value)}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {formErrors.name && (
            <div class="text-red-600 text-sm mt-1">{formErrors.name}</div>
          )}
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700">Email</label>
          <input
            type="email"
            value={email.value}
            onInput$={(e) => (email.value = (e.target as HTMLInputElement).value)}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {formErrors.email && (
            <div class="text-red-600 text-sm mt-1">{formErrors.email}</div>
          )}
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700">Phone</label>
          <input
            type="text"
            value={phoneNumber.value}
            onInput$={(e) =>
              (phoneNumber.value = (e.target as HTMLInputElement).value)
            }
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {formErrors.phone && (
            <div class="text-red-600 text-sm mt-1">{formErrors.phone}</div>
          )}
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700">Company</label>
          {loadingCompanies.value && <div>Loading companies...</div>}
          {errorCompanies.value && (
            <div class="text-red-500">Failed to load companies</div>
          )}
          {!loadingCompanies.value && !errorCompanies.value && (
            <select
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedCompany.value || ''}
              onChange$={(e) => {
                const value = (e.target as HTMLSelectElement).value;
                selectedCompany.value = value || null;
              }}
            >
              <option value="">-- Select Company --</option>
              {companies.value.map((company) => (
                <option key={company.id} value={String(company.id)}>
                  {company.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700">Role</label>
          <div class="flex gap-6 mt-2">
            <label class="inline-flex items-center">
              <input
                type="radio"
                name="role"
                value="1"
                checked={selectedRole.value === '1'}
                onChange$={() => (selectedRole.value = '1')}
                class="form-radio text-blue-600"
              />
              <span class="ml-2">Admin</span>
            </label>
            <label class="inline-flex items-center">
              <input
                type="radio"
                name="role"
                value="2"
                checked={selectedRole.value === '2'}
                onChange$={() => (selectedRole.value = '2')}
                class="form-radio text-blue-600"
              />
              <span class="ml-2">User</span>
            </label>
          </div>
        </div>

        {formState.serverError && (
          <div class="text-red-600 text-sm font-medium text-center">
            {formState.serverError}
          </div>
        )}

        <button
          type="submit"
          class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {user?.id ? 'Update User' : 'Create User'}
        </button>
      </form>

      {toastState.visible && (
        <div class="toast-success">
          <div class="font-semibold">Save successful!</div>
          <div class="toast-progress"></div>
        </div>
      )}
    </div>
  );
});
