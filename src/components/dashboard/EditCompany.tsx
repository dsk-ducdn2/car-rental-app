import {
  component$,
  useSignal,
  useStore,
  $,
} from '@builder.io/qwik';
import { fetchWithAuth } from '~/utils/api';
import '../../routes/index.css';

interface Company {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export default component$((props: { company: Company }) => {
  const { company } = props;
  const API_URL = import.meta.env.VITE_API_URL;

  const name = useSignal(company.name);
  const address = useSignal(company.address);
  const phoneNumber = useSignal(company.phone);
  const email = useSignal(company.email);

  const toastState = useStore({ visible: false });

  const formErrors = useStore({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const formState = useStore({
    serverError: '',
  });

  const handleSubmit = $(async (e: Event) => {
    e.preventDefault();
    formErrors.name = '';
    formErrors.address = '';
    formErrors.phone = '';
    formErrors.email = '';
    formState.serverError = '';

    // Client-side validation
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

    // Stop submission if validation fails
    if (hasError) {
      return;
    }

    const isUpdate = Boolean(company?.id);
    const url = isUpdate 
      ? `${API_URL}/Companies/${company.id}` 
      : `${API_URL}/Companies`;
    
    const body = {
      name: name.value,
      address: address.value,
      phone: phoneNumber.value,
      email: email.value,
    };

    try {
      const res = await fetchWithAuth(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        if (isUpdate) {
          toastState.visible = true;
          // Auto-hide toast after 3 seconds
          setTimeout(() => {
            toastState.visible = false;
          }, 3000);
        } else {
          window.location.href = '/companies';
        }
      } else {
        const result = await res.json().catch(() => null);
        if (result && typeof result === 'object') {
          if (result.name) formErrors.name = result.name;
          if (result.address) formErrors.address = result.address;
          if (result.phone) formErrors.phone = result.phone;
          if (result.email) formErrors.email = result.email;
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
          {company?.id ? 'Edit Company' : 'Create Company'}
        </h2>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700">Company Name</label>
          <input
            type="text"
            value={name.value}
            onInput$={(e) => (name.value = (e.target as HTMLInputElement).value)}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter company name"
          />
          {formErrors.name && (
            <div class="text-red-600 text-sm mt-1">{formErrors.name}</div>
          )}
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700">Address</label>
          <input
            type="text"
            value={address.value}
            onInput$={(e) => (address.value = (e.target as HTMLInputElement).value)}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter company address"
          />
          {formErrors.address && (
            <div class="text-red-600 text-sm mt-1">{formErrors.address}</div>
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
            placeholder="Enter phone number"
          />
          {formErrors.phone && (
            <div class="text-red-600 text-sm mt-1">{formErrors.phone}</div>
          )}
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700">Email</label>
          <input
            type="email"
            value={email.value}
            onInput$={(e) => (email.value = (e.target as HTMLInputElement).value)}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter email address"
          />
          {formErrors.email && (
            <div class="text-red-600 text-sm mt-1">{formErrors.email}</div>
          )}
        </div>



        {formState.serverError && (
          <div class="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            {formState.serverError}
          </div>
        )}

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 font-semibold transition duration-200"
        >
          {company?.id ? 'Update Company' : 'Create Company'}
        </button>
      </form>

      {/* Toast Notification */}
      {toastState.visible && (
        <div class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Company updated successfully!
        </div>
      )}
    </div>
  );
});