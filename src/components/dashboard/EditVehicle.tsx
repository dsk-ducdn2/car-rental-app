import {
  component$,
  useSignal,
  useStore,
  $,
} from '@builder.io/qwik';
import { fetchWithAuth } from '~/utils/api';
import '../../routes/index.css';

interface Vehicle {
  id?: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: string;
  status: string;
  pricePerDay: number;
}

export default component$((props: { vehicle: Vehicle }) => {
  const { vehicle } = props;
  const API_URL = import.meta.env.VITE_API_URL;

  const make = useSignal(vehicle.make);
  const model = useSignal(vehicle.model);
  const year = useSignal(vehicle.year.toString());
  const licensePlate = useSignal(vehicle.licensePlate);
  const type = useSignal(vehicle.type);
  const status = useSignal(vehicle.status);
  const pricePerDay = useSignal(vehicle.pricePerDay.toString());

  const toastState = useStore({ visible: false });

  const formErrors = useStore({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    type: '',
    status: '',
    pricePerDay: '',
  });

  const formState = useStore({
    serverError: '',
  });

  const handleSubmit = $(async (e: Event) => {
    e.preventDefault();
    formErrors.make = '';
    formErrors.model = '';
    formErrors.year = '';
    formErrors.licensePlate = '';
    formErrors.type = '';
    formErrors.status = '';
    formErrors.pricePerDay = '';
    formState.serverError = '';

    // Client-side validation
    let hasError = false;

    if (!make.value.trim()) {
      formErrors.make = 'Make is required';
      hasError = true;
    }

    if (!model.value.trim()) {
      formErrors.model = 'Model is required';
      hasError = true;
    }

    if (!year.value.trim()) {
      formErrors.year = 'Year is required';
      hasError = true;
    } else {
      const yearNumber = parseInt(year.value);
      if (isNaN(yearNumber) || yearNumber < 1900 || yearNumber > new Date().getFullYear() + 1) {
        formErrors.year = 'Please enter a valid year';
        hasError = true;
      }
    }

    if (!licensePlate.value.trim()) {
      formErrors.licensePlate = 'License plate is required';
      hasError = true;
    }

    if (!type.value.trim()) {
      formErrors.type = 'Vehicle type is required';
      hasError = true;
    }

    if (!status.value.trim()) {
      formErrors.status = 'Status is required';
      hasError = true;
    }

    if (!pricePerDay.value.trim()) {
      formErrors.pricePerDay = 'Price per day is required';
      hasError = true;
    } else {
      const priceNumber = parseFloat(pricePerDay.value);
      if (isNaN(priceNumber) || priceNumber <= 0) {
        formErrors.pricePerDay = 'Please enter a valid price';
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
    
    const body = {
      make: make.value,
      model: model.value,
      year: parseInt(year.value),
      licensePlate: licensePlate.value,
      type: type.value,
      status: status.value,
      pricePerDay: parseFloat(pricePerDay.value),
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
          if (result.make) formErrors.make = result.make;
          if (result.model) formErrors.model = result.model;
          if (result.year) formErrors.year = result.year;
          if (result.licensePlate) formErrors.licensePlate = result.licensePlate;
          if (result.type) formErrors.type = result.type;
          if (result.status) formErrors.status = result.status;
          if (result.pricePerDay) formErrors.pricePerDay = result.pricePerDay;
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
            <label class="block text-sm font-semibold mb-1 text-gray-700">Make</label>
            <input
              type="text"
              value={make.value}
              onInput$={(e) => (make.value = (e.target as HTMLInputElement).value)}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g., Toyota, Honda"
            />
            {formErrors.make && (
              <div class="text-red-600 text-sm mt-1">{formErrors.make}</div>
            )}
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1 text-gray-700">Model</label>
            <input
              type="text"
              value={model.value}
              onInput$={(e) => (model.value = (e.target as HTMLInputElement).value)}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g., Camry, Civic"
            />
            {formErrors.model && (
              <div class="text-red-600 text-sm mt-1">{formErrors.model}</div>
            )}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold mb-1 text-gray-700">Year</label>
            <input
              type="number"
              value={year.value}
              onInput$={(e) => (year.value = (e.target as HTMLInputElement).value)}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g., 2023"
              min="1900"
              max={new Date().getFullYear() + 1}
            />
            {formErrors.year && (
              <div class="text-red-600 text-sm mt-1">{formErrors.year}</div>
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
            <label class="block text-sm font-semibold mb-1 text-gray-700">Vehicle Type</label>
            <select
              value={type.value}
              onChange$={(e) => (type.value = (e.target as HTMLSelectElement).value)}
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select type</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Convertible">Convertible</option>
              <option value="Coupe">Coupe</option>
            </select>
            {formErrors.type && (
              <div class="text-red-600 text-sm mt-1">{formErrors.type}</div>
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
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            {formErrors.status && (
              <div class="text-red-600 text-sm mt-1">{formErrors.status}</div>
            )}
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-700">Price Per Day ($)</label>
          <input
            type="number"
            value={pricePerDay.value}
            onInput$={(e) => (pricePerDay.value = (e.target as HTMLInputElement).value)}
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g., 50.00"
            min="0"
            step="0.01"
          />
          {formErrors.pricePerDay && (
            <div class="text-red-600 text-sm mt-1">{formErrors.pricePerDay}</div>
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