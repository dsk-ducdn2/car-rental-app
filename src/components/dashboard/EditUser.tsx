import {
  component$,
  useResource$,
  useSignal,
  Resource,
  $,
} from '@builder.io/qwik';
import { fetchWithAuth } from '~/utils/api';

interface Author {
  id: number;
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

export default component$((props: { user: Author & { roleId?: number } }) => {
  const { user } = props;
  const API_URL = import.meta.env.VITE_API_URL;

  // Signals
  const name = useSignal(user.name);
  const email = useSignal(user.email);
  const phoneNumber = useSignal(user.phone);
  const selectedCompany = useSignal<string | null>(user.companyId ? String(user.companyId) : null);
  const selectedRole = useSignal(user.roleId ? String(user.roleId) : '2');

  // Resource to fetch companies
  const companiesResource = useResource$<Company[]>(async () => {
    const res = await fetchWithAuth(`${API_URL}/Companies`);
    return res.json();
  });

  // Submit handler
  const handleSubmit = $(async (e: Event) => {
    e.preventDefault();

    try {
      const body = {
        name: name.value,
        email: email.value,
        phone: phoneNumber.value,
        companyId: selectedCompany.value ?? null,
        roleId: selectedRole.value ? Number(selectedRole.value) : undefined,
      };
      console.log('Submitting user data:', body);
      const res = await fetchWithAuth(`${API_URL}/Users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert('User updated successfully');
      } else {
        alert('Failed to update user');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating user');
    }
  });

  return (
    <div class="flex justify-center items-center min-h-[60vh] bg-gray-50">
      <form
        preventdefault:submit
        onSubmit$={handleSubmit}
        class="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl space-y-6 border border-gray-200"
      >
        <h2 class="text-2xl font-bold text-gray-800 text-center">Edit User</h2>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700">Name</label>
          <input
            type="text"
            value={name.value}
            onInput$={(e) => (name.value = (e.target as HTMLInputElement).value)}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700">Email</label>
          <input
            type="email"
            value={email.value}
            onInput$={(e) => (email.value = (e.target as HTMLInputElement).value)}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700">Phone</label>
          <input
            type="text"
            value={phoneNumber.value}
            onInput$={(e) => (phoneNumber.value = (e.target as HTMLInputElement).value)}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700">Company</label>
          <Resource
            value={companiesResource}
            onPending={() => <div>Loading companies...</div>}
            onRejected={() => <div class="text-red-500">Failed to load companies</div>}
            onResolved={(companies: Company[]) => (
              <select
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={selectedCompany.value || ''}
                onChange$={(e) => {
                const value = (e.target as HTMLSelectElement).value;
                selectedCompany.value = value ? value : null;
                }}
              >
                <option value="">-- Select Company --</option>
                {companies.map((company) => (
                  <option key={company.id} value={String(company.id)}>
                    {company.name}
                  </option>
                ))}
              </select>
            )}
          />
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

        <button
          type="submit"
          class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Update User
        </button>
      </form>
    </div>
  );
});
