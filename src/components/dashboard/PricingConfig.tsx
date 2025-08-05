import {
  component$,
  useSignal,
  useStore,
  $,
  useVisibleTask$,
  type QRL,
} from '@builder.io/qwik';
import { fetchWithAuth } from '../../utils/api';

interface VehiclePricing {
  id?: string;
  vehicleId: string;
  pricePerDay: number;
  weekendMultiplier: number;
  holidayMultiplier: number;
  effectiveDate: string;
  expiryDate: string;
}

interface PricingConfigProps {
  vehicleId: string;
  onClose: QRL<() => void>;
  onSuccess: QRL<() => void>;
}

export default component$<PricingConfigProps>(({ vehicleId, onClose, onSuccess }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const loading = useSignal(true);
  const currentPricing = useSignal<VehiclePricing | null>(null);

  const pricePerDay = useSignal('0');
  const weekendMultiplier = useSignal('1.2');
  const holidayMultiplier = useSignal('1.5');
  const effectiveDate = useSignal('');
  const expiryDate = useSignal('');

  const toastState = useStore({ visible: false });

  const formErrors = useStore({
    pricePerDay: '',
    weekendMultiplier: '',
    holidayMultiplier: '',
    effectiveDate: '',
    expiryDate: '',
  });

  const formState = useStore({
    serverError: '',
  });

  // Fetch current pricing
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/VehiclePricing/vehicle/${vehicleId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          currentPricing.value = data;
          pricePerDay.value = data.pricePerDay.toString();
          weekendMultiplier.value = data.weekendMultiplier.toString();
          holidayMultiplier.value = data.holidayMultiplier.toString();
          effectiveDate.value = data.effectiveDate ? data.effectiveDate.split('T')[0] : '';
          expiryDate.value = data.expiryDate ? data.expiryDate.split('T')[0] : '';
        }
      } else {
        // No existing pricing, set defaults
        const today = new Date().toISOString().split('T')[0];
        effectiveDate.value = today;
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        expiryDate.value = nextYear.toISOString().split('T')[0];
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    } finally {
      loading.value = false;
    }
  });

  const handleSubmit = $(async (e: Event) => {
    e.preventDefault();
    
    // Clear previous errors
    formErrors.pricePerDay = '';
    formErrors.weekendMultiplier = '';
    formErrors.holidayMultiplier = '';
    formErrors.effectiveDate = '';
    formErrors.expiryDate = '';
    formState.serverError = '';

    // Client-side validation
    let hasError = false;

    if (!pricePerDay.value.trim() || parseFloat(pricePerDay.value) <= 0) {
      formErrors.pricePerDay = 'Price per day must be greater than 0';
      hasError = true;
    }

    if (!weekendMultiplier.value.trim() || parseFloat(weekendMultiplier.value) <= 0) {
      formErrors.weekendMultiplier = 'Weekend multiplier must be greater than 0';
      hasError = true;
    }

    if (!holidayMultiplier.value.trim() || parseFloat(holidayMultiplier.value) <= 0) {
      formErrors.holidayMultiplier = 'Holiday multiplier must be greater than 0';
      hasError = true;
    }

    if (!effectiveDate.value.trim()) {
      formErrors.effectiveDate = 'Effective date is required';
      hasError = true;
    }

    if (!expiryDate.value.trim()) {
      formErrors.expiryDate = 'Expiry date is required';
      hasError = true;
    }

    if (effectiveDate.value && expiryDate.value && effectiveDate.value >= expiryDate.value) {
      formErrors.expiryDate = 'Expiry date must be after effective date';
      hasError = true;
    }

    // Stop submission if validation fails
    if (hasError) {
      return;
    }

    // Use single upsert API endpoint
    const url = `${API_URL}/VehiclePricing/vehicle/${vehicleId}`;
    
    const body = {
      vehicleId: vehicleId,
      pricePerDay: parseFloat(pricePerDay.value),
      weekendMultiplier: parseFloat(weekendMultiplier.value),
      holidayMultiplier: parseFloat(holidayMultiplier.value),
      effectiveDate: effectiveDate.value,
      expiryDate: expiryDate.value,
    };

    try {
      const res = await fetchWithAuth(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toastState.visible = true;
        setTimeout(() => {
          toastState.visible = false;
          onSuccess();
          onClose();
        }, 2000);
      } else {
        const result = await res.json().catch(() => null);
        if (result && result.message) {
          formState.serverError = result.message;
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
    <div 
      class="fixed inset-0 flex items-center justify-center z-50"
      style="background-color: rgba(0, 0, 0, 0.3); backdrop-filter: blur(2px);"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick$={onClose}
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        {/* Title */}
        <h3 class="text-lg font-semibold text-center mb-6">Vehicle Pricing Configuration</h3>
        
        {loading.value ? (
          <div class="space-y-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} class="space-y-2">
                <div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <form preventdefault:submit onSubmit$={handleSubmit} class="space-y-4">
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

            <div>
              <label class="block text-sm font-semibold mb-1 text-gray-700">Weekend Multiplier</label>
              <input
                type="number"
                value={weekendMultiplier.value}
                onInput$={(e) => (weekendMultiplier.value = (e.target as HTMLInputElement).value)}
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g., 1.2 (120%)"
                min="0"
                step="0.1"
              />
              {formErrors.weekendMultiplier && (
                <div class="text-red-600 text-sm mt-1">{formErrors.weekendMultiplier}</div>
              )}
              <div class="text-xs text-gray-500 mt-1">Multiplier for weekend rates (e.g., 1.2 = 20% increase)</div>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1 text-gray-700">Holiday Multiplier</label>
              <input
                type="number"
                value={holidayMultiplier.value}
                onInput$={(e) => (holidayMultiplier.value = (e.target as HTMLInputElement).value)}
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g., 1.5 (150%)"
                min="0"
                step="0.1"
              />
              {formErrors.holidayMultiplier && (
                <div class="text-red-600 text-sm mt-1">{formErrors.holidayMultiplier}</div>
              )}
              <div class="text-xs text-gray-500 mt-1">Multiplier for holiday rates (e.g., 1.5 = 50% increase)</div>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1 text-gray-700">Effective Date</label>
              <input
                type="date"
                value={effectiveDate.value}
                onInput$={(e) => (effectiveDate.value = (e.target as HTMLInputElement).value)}
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {formErrors.effectiveDate && (
                <div class="text-red-600 text-sm mt-1">{formErrors.effectiveDate}</div>
              )}
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1 text-gray-700">Expiry Date</label>
              <input
                type="date"
                value={expiryDate.value}
                onInput$={(e) => (expiryDate.value = (e.target as HTMLInputElement).value)}
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {formErrors.expiryDate && (
                <div class="text-red-600 text-sm mt-1">{formErrors.expiryDate}</div>
              )}
            </div>

            {formState.serverError && (
              <div class="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {formState.serverError}
              </div>
            )}

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                onClick$={onClose}
                class="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Pricing
              </button>
            </div>
          </form>
        )}

        {/* Toast Notification */}
        {toastState.visible && (
          <div class="fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            Pricing updated successfully!
          </div>
        )}
      </div>
    </div>
  );
});