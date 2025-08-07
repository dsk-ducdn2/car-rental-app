import {
  component$,
  useSignal,
  useStore,
  $,
  useVisibleTask$,
} from '@builder.io/qwik';
import { fetchWithAuth, getUserIdFromToken } from '~/utils/api';
import '../../routes/index.css';

interface Vehicle {
  id?: string;
  companyId: string;
  companyName?: string;
  licensePlate: string;
  brand: string;
  yearManufacture: number;
  status: string;
  mileage: number;
  purchaseDate: string;
  pricePerDay: number;
}

interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export default component$((props: { vehicle: Vehicle }) => {
  const { vehicle } = props;
  const API_URL = import.meta.env.VITE_API_URL;

  const companyId = useSignal(vehicle.companyId || '');
  const licensePlate = useSignal(vehicle.licensePlate);
  const brand = useSignal(vehicle.brand);
  const yearManufacture = useSignal(vehicle.yearManufacture.toString());
  const status = useSignal(vehicle.status);
  const mileage = useSignal(vehicle.mileage.toString());
  const purchaseDate = useSignal(vehicle.purchaseDate);
  const price = useSignal(vehicle.pricePerDay.toString());

  const toastState = useStore({ visible: false });
  const companies = useSignal<Company[]>([]);
  const companiesLoading = useSignal(true);

  const formErrors = useStore({
    companyId: '',
    licensePlate: '',
    brand: '',
    yearManufacture: '',
    status: '',
    mileage: '',
    purchaseDate: '',
    price: '',
  });

  const formState = useStore({
    serverError: '',
  });

  // Fetch companies for dropdown
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/Companies`);
      const data = await res.json();
      companies.value = Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      companies.value = [];
    } finally {
      companiesLoading.value = false;
    }
  });

  const handleSubmit = $(async (e: Event) => {
    e.preventDefault();
    formErrors.companyId = '';
    formErrors.licensePlate = '';
    formErrors.brand = '';
    formErrors.yearManufacture = '';
    formErrors.status = '';
    formErrors.mileage = '';
    formErrors.purchaseDate = '';
    formErrors.price = '';
    formState.serverError = '';

    // Client-side validation
    let hasError = false;

    if (!companyId.value.trim()) {
      formErrors.companyId = 'Please select a company';
      hasError = true;
    }

    if (!licensePlate.value.trim()) {
      formErrors.licensePlate = 'License plate is required';
      hasError = true;
    }

    if (!brand.value.trim()) {
      formErrors.brand = 'Brand is required';
      hasError = true;
    }

    if (!yearManufacture.value.trim()) {
      formErrors.yearManufacture = 'Year is required';
      hasError = true;
    } else {
      const yearNumber = parseInt(yearManufacture.value);
      if (isNaN(yearNumber) || yearNumber < 1900 || yearNumber > new Date().getFullYear() + 1) {
        formErrors.yearManufacture = 'Please enter a valid year';
        hasError = true;
      }
    }

    if (!status.value.trim()) {
      formErrors.status = 'Status is required';
      hasError = true;
    }

    if (!mileage.value.trim()) {
      formErrors.mileage = 'Mileage is required';
      hasError = true;
    } else {
      const mileageNumber = parseFloat(mileage.value);
      if (isNaN(mileageNumber) || mileageNumber < 0) {
        formErrors.mileage = 'Please enter a valid mileage';
        hasError = true;
      }
    }

    if (!purchaseDate.value.trim()) {
      formErrors.purchaseDate = 'Purchase date is required';
      hasError = true;
    }

    if (!price.value.trim()) {
      formErrors.price = 'Price is required';
      hasError = true;
    } else {
      const priceNumber = parseFloat(price.value);
      if (isNaN(priceNumber) || priceNumber < 0) {
        formErrors.price = 'Please enter a valid price';
        hasError = true;
      }
    }

    // Stop submission if validation fails
    if (hasError) {
      return;
    }

    const isUpdate = Boolean(vehicle?.id);
    const url = isUpdate 
      ? `${API_URL}/Vehicles/${vehicle.id}` 
      : `${API_URL}/Vehicles`;
    
    // Get UserId from token
    const userId = getUserIdFromToken();
    
    const body = {
      companyId: companyId.value,
      licensePlate: licensePlate.value,
      brand: brand.value,
      yearManufacture: parseInt(yearManufacture.value),
      status: status.value,
      mileage: parseFloat(mileage.value),
      purchaseDate: purchaseDate.value,
      pricePerDay: parseFloat(price.value),
      userId: userId,
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
          window.location.href = '/vehicles';
        }
      } else {
        const result = await res.json().catch(() => null);
        if (result && typeof result === 'object') {
          if (result.companyId) formErrors.companyId = result.companyId;
          if (result.licensePlate) formErrors.licensePlate = result.licensePlate;
          if (result.brand) formErrors.brand = result.brand;
          if (result.yearManufacture) formErrors.yearManufacture = result.yearManufacture;
          if (result.status) formErrors.status = result.status;
          if (result.mileage) formErrors.mileage = result.mileage;
          if (result.purchaseDate) formErrors.purchaseDate = result.purchaseDate;
          if (result.pricePerDay) formErrors.price = result.pricePerDay;
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
          {vehicle?.id ? 'Edit Vehicle' : 'Create Vehicle'}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-1 text-gray-700">Company</label>
            {companiesLoading.value ? (
              <div class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100">
                <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <select
                value={companyId.value}
                onChange$={(e) => (companyId.value = (e.target as HTMLSelectElement).value)}
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select a company</option>
                {companies.value.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            )}
            {formErrors.companyId && (
              <div class="text-red-600 text-sm mt-1">{formErrors.companyId}</div>
            )}
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1 text-gray-700">License Plate</label>
            <input
              type="text"
              value={licensePlate.value}
              onInput$={(e) => (licensePlate.value = (e.target as HTMLInputElement).value)}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
              placeholder="e.g., ABC-123"
            />
            {formErrors.licensePlate && (
              <div class="text-red-600 text-sm mt-1">{formErrors.licensePlate}</div>
            )}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-1 text-gray-700">Brand</label>
            <input
              type="text"
              value={brand.value}
              onInput$={(e) => (brand.value = (e.target as HTMLInputElement).value)}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g., Toyota, Honda, Ford"
            />
            {formErrors.brand && (
              <div class="text-red-600 text-sm mt-1">{formErrors.brand}</div>
            )}
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1 text-gray-700">Year Manufacture</label>
            <input
              type="number"
              value={yearManufacture.value}
              onInput$={(e) => (yearManufacture.value = (e.target as HTMLInputElement).value)}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g., 2023"
              min="1900"
              max={new Date().getFullYear() + 1}
            />
            {formErrors.yearManufacture && (
              <div class="text-red-600 text-sm mt-1">{formErrors.yearManufacture}</div>
            )}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-1 text-gray-700">Mileage (km)</label>
            <input
              type="number"
              value={mileage.value}
              onInput$={(e) => (mileage.value = (e.target as HTMLInputElement).value)}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g., 50000"
              min="0"
              step="1"
            />
            {formErrors.mileage && (
              <div class="text-red-600 text-sm mt-1">{formErrors.mileage}</div>
            )}
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1 text-gray-700">Status</label>
            <select
              value={status.value}
              onChange$={(e) => (status.value = (e.target as HTMLSelectElement).value)}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select status</option>
              <option value="AVAILABLE">Available</option>
              <option value="RENTED">Rented</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
            {formErrors.status && (
              <div class="text-red-600 text-sm mt-1">{formErrors.status}</div>
            )}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-1 text-gray-700">Purchase Date</label>
            <input
              type="date"
              value={purchaseDate.value}
              onInput$={(e) => (purchaseDate.value = (e.target as HTMLInputElement).value)}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {formErrors.purchaseDate && (
              <div class="text-red-600 text-sm mt-1">{formErrors.purchaseDate}</div>
            )}
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1 text-gray-700">Price (VND)</label>
            <input
              type="number"
              value={price.value}
              onInput$={(e) => (price.value = (e.target as HTMLInputElement).value)}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g., 500000"
              min="0"
              step="1000"
            />
            {formErrors.price && (
              <div class="text-red-600 text-sm mt-1">{formErrors.price}</div>
            )}
          </div>
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
          {vehicle?.id ? 'Update Vehicle' : 'Create Vehicle'}
        </button>
      </form>

      {/* Toast Notification */}
      {toastState.visible && (
        <div class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Vehicle updated successfully!
        </div>
      )}
    </div>
  );
});