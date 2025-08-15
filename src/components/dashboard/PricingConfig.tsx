import {
  component$,
  useSignal,
  useStore,
  $,
  useVisibleTask$,
  type QRL,
} from '@builder.io/qwik';
import { fetchWithAuth } from '../../utils/api';

interface VehiclePricingRuleDto {
  vehicleId?: string;
  pricePerDay?: number;
  holidayMultiplier?: number;
  effectiveDate?: string;
  expiryDate?: string;
}

interface PricingRule {
  id: string;
  holidayMultiplier: number;
  effectiveDate: string;
  expiryDate: string;
  calculatedPrice: number;
}

interface PricingConfigProps {
  vehicleId: string;
  onClose: QRL<() => void>;
  onSuccess: QRL<() => void>;
}

export default component$<PricingConfigProps>(({ vehicleId, onClose, onSuccess }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const loading = useSignal(true);
  const originalPricePerDay = useSignal(0); // Store original price from vehicle details
  const pricingRules = useSignal<PricingRule[]>([]);

  const toastState = useStore({ visible: false });

  const formState = useStore({
    serverError: '',
  });

  // Helper function to calculate price
  const calculatePrice = $((multiplier: number) => {
    return originalPricePerDay.value * multiplier;
  });

  // Helper function to check if two date ranges overlap
  const checkDateOverlap = $((start1: string, end1: string, start2: string, end2: string) => {
    const startDate1 = new Date(start1);
    const endDate1 = new Date(end1);
    const startDate2 = new Date(start2);
    const endDate2 = new Date(end2);
    
    // Check if ranges overlap: start1 <= end2 && start2 <= end1
    return startDate1 <= endDate2 && startDate2 <= endDate1;
  });

  // Removed unused validateDateRanges helper to satisfy linter

  // Add new pricing rule
  const addPricingRule = $(async () => {
    // Clear previous errors
    formState.serverError = '';
    
    const today = new Date().toISOString().split('T')[0];
    
    const calculatedPrice = await calculatePrice(1);
    
    const newRule: PricingRule = {
      id: Math.random().toString(36).substr(2, 9),
      holidayMultiplier: 1,
      effectiveDate: today,
      expiryDate: today,
      calculatedPrice: calculatedPrice
    };
    
    pricingRules.value = [...pricingRules.value, newRule];
  });

  // Delete pricing rule
  const deletePricingRule = $((ruleId: string) => {
    pricingRules.value = pricingRules.value.filter(rule => rule.id !== ruleId);
  });

  // Update pricing rule
  const updatePricingRule = $(async (ruleId: string, field: keyof PricingRule, value: any) => {
    // Clear previous errors
    formState.serverError = '';
    
    const updatedRules = await Promise.all(
      pricingRules.value.map(async (rule) => {
        if (rule.id === ruleId) {
          const updatedRule = { ...rule, [field]: value };
          // Recalculate price if multiplier changed
          if (field === 'holidayMultiplier') {
            updatedRule.calculatedPrice = await calculatePrice(parseFloat(value) || 0);
          }
          
          return updatedRule;
        }
        return rule;
      })
    );
    pricingRules.value = updatedRules;
  });

  // Fetch vehicle details and current pricing
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      // First, fetch vehicle details to get original price_per_day
      const vehicleRes = await fetchWithAuth(`${API_URL}/Vehicles/${vehicleId}`);
      if (vehicleRes.ok) {
        const vehicleData = await vehicleRes.json();
        // Get the original price from vehicle pricing rules or default
        const activePricingRule = vehicleData.vehiclePricingRules && vehicleData.vehiclePricingRules.length > 0 
          ? vehicleData.vehiclePricingRules[0] 
          : null;
        originalPricePerDay.value = activePricingRule?.pricePerDay || 100; // Default to 100 if no price found
      }

      // Then fetch current pricing configuration
      const res = await fetchWithAuth(`${API_URL}/VehiclePricingRule/${vehicleId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          // Check if data is an array (multiple records) or single object
          const dataArray = Array.isArray(data) ? data : [data];
          
          // Convert existing pricing rules to rule format
          const existingRules: PricingRule[] = dataArray.map((item: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            holidayMultiplier: item.holidayMultiplier || 1,
            effectiveDate: item.effectiveDate ? item.effectiveDate.split('T')[0] : '',
            expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
            calculatedPrice: item.pricePerDay || 0
          }));
          
          pricingRules.value = existingRules;
        }
      } else {
        // No existing pricing, leave rules empty - user will create manually
        pricingRules.value = [];
      }
    } catch (error) {
      console.error('Failed to fetch vehicle or pricing data:', error);
    } finally {
      loading.value = false;
    }
  });

  const handleSubmit = $(async (e: Event) => {
    e.preventDefault();
    
    // Clear previous errors
    formState.serverError = '';

    // If no pricing rules exist, send an empty array to clear all rules
    if (pricingRules.value.length === 0) {
      try {
        const url = `https://localhost:44391/api/VehiclePricingRule?vehicleId=${vehicleId}`;
        
        // Send an empty array to clear all pricing rules for this vehicle
        const body: VehiclePricingRuleDto[] = [];



        const res = await fetchWithAuth(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          await res.json();

          toastState.visible = true;
          setTimeout(() => {
            toastState.visible = false;
            onSuccess();
            onClose();
          }, 2000);
        } else {
          console.error('API Error:', res.status, res.statusText);
          const result = await res.json().catch(() => null);
          console.error('Error response:', result);
          
          if (result && result.message) {
            formState.serverError = result.message;
          } else if (result && result.errors) {
            // Handle validation errors
            const errorMessages = Object.values(result.errors).flat().join(', ');
            formState.serverError = `Validation errors: ${errorMessages}`;
          } else {
            formState.serverError = `Server Error (${res.status}): ${res.statusText}. Please check the request format.`;
          }
        }
      } catch (err) {
        console.error(err);
        formState.serverError = 'An unexpected error occurred.';
      }
      return;
    }

    // Validate each rule
    for (const rule of pricingRules.value) {
      if (!rule.effectiveDate || !rule.expiryDate) {
        formState.serverError = 'All fields are required for each pricing rule';
        return;
      }
      if (rule.effectiveDate > rule.expiryDate) {
        formState.serverError = 'Expiry date must be equal to or after effective date';
        return;
      }
      if (rule.holidayMultiplier <= 0) {
        formState.serverError = 'Holiday multiplier must be greater than 0';
        return;
      }
    }

    // Final check for overlapping date ranges between all rules
    for (let i = 0; i < pricingRules.value.length; i++) {
      for (let j = i + 1; j < pricingRules.value.length; j++) {
        const rule1 = pricingRules.value[i];
        const rule2 = pricingRules.value[j];
        const hasOverlap = await checkDateOverlap(rule1.effectiveDate, rule1.expiryDate, rule2.effectiveDate, rule2.expiryDate);
        if (hasOverlap) {
          formState.serverError = `Date ranges overlap between rules: (${rule1.effectiveDate} to ${rule1.expiryDate}) and (${rule2.effectiveDate} to ${rule2.expiryDate})`;
          return;
        }
      }
    }

    try {
      // Send all pricing rules as an array to match the new API
      const url = `https://localhost:44391/api/VehiclePricingRule?vehicleId=${vehicleId}`;
      
      // Format dates to include time as shown in the example
      const formatDateTime = (dateStr: string) => {
        // Create date with specific time format: YYYY-MM-DDTHH:mm:ss.sssZ
        const date = new Date(dateStr + 'T08:34:51.137Z');
        return date.toISOString();
      };
      
      // Convert all pricing rules to the format expected by the API
      const body = pricingRules.value.map(rule => ({
        vehicleId: vehicleId,
        pricePerDay: rule.calculatedPrice, // Use the calculated price instead of 0
        holidayMultiplier: rule.holidayMultiplier,
        effectiveDate: formatDateTime(rule.effectiveDate),
        expiryDate: formatDateTime(rule.expiryDate),
      }));



      const res = await fetchWithAuth(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await res.json();

        toastState.visible = true;
        setTimeout(() => {
          toastState.visible = false;
          onSuccess();
          onClose();
        }, 2000);
      } else {
        console.error('API Error:', res.status, res.statusText);
        const result = await res.json().catch(() => null);
        console.error('Error response:', result);
        
        if (result && result.message) {
          formState.serverError = result.message;
        } else if (result && result.errors) {
          // Handle validation errors
          const errorMessages = Object.values(result.errors).flat().join(', ');
          formState.serverError = `Validation errors: ${errorMessages}`;
        } else {
          formState.serverError = `Server Error (${res.status}): ${res.statusText}. Please check the request format.`;
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
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 relative shadow-2xl max-h-[90vh] overflow-y-auto">
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
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} class="space-y-2">
                <div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <form preventdefault:submit onSubmit$={handleSubmit} class="space-y-6">
            {/* Original Price Display */}
            <div class="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-gray-800">
                ${(originalPricePerDay.value || 0).toFixed(2)}
              </div>
              <div class="text-sm text-gray-600 mt-1">Original Vehicle Price per Day</div>
            </div>

            {/* Pricing Rules Table */}
            <div class="space-y-3">
              {pricingRules.value.length > 0 && (
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <h4 class="text-md font-semibold text-gray-800">Pricing Rules</h4>
                    <button
                      type="button"
                      onClick$={addPricingRule}
                      class="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Add Rule
                    </button>
                  </div>
                  <div class="grid grid-cols-5 gap-4 text-sm font-semibold text-gray-700 px-3 py-2 bg-gray-100 rounded-lg">
                    <div>Multiplier</div>
                    <div>Effective Date</div>
                    <div>Expiry Date</div>
                    <div>Calculated Price</div>
                    <div>Actions</div>
                  </div>
                </div>
              )}

              {pricingRules.value.length === 0 ? (
                <div class="text-center py-8 text-gray-500">
                  <div class="mb-4">
                    <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <p class="text-lg font-medium mb-2">No Pricing Rules</p>
                  <p class="text-sm mb-4">Create your first pricing rule to configure vehicle pricing, or save to clear all existing rules</p>
                  <button
                    type="button"
                    onClick$={addPricingRule}
                    class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Create First Rule
                  </button>
                </div>
              ) : (
                pricingRules.value.map((rule) => (
                <div key={rule.id} class="grid grid-cols-5 gap-4 items-center px-3 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  {/* Holiday Multiplier */}
                  <div>
                    <input
                      type="number"
                      value={rule.holidayMultiplier}
                      onInput$={$(async (e) => await updatePricingRule(rule.id, 'holidayMultiplier', parseFloat((e.target as HTMLInputElement).value) || 0))}
                      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="1"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  {/* Effective Date */}
                  <div>
                    <input
                      type="date"
                      value={rule.effectiveDate}
                      onInput$={$(async (e) => await updatePricingRule(rule.id, 'effectiveDate', (e.target as HTMLInputElement).value))}
                      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <input
                      type="date"
                      value={rule.expiryDate}
                      onInput$={$(async (e) => await updatePricingRule(rule.id, 'expiryDate', (e.target as HTMLInputElement).value))}
                      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* Calculated Price */}
                  <div>
                    <div class="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm font-semibold text-blue-800">
                      ${(rule.calculatedPrice || 0).toFixed(2)}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div>
                    <button
                      type="button"
                      onClick$={() => deletePricingRule(rule.id)}
                      class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )))}
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
          <div class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            Pricing rules saved successfully!
          </div>
        )}
      </div>
    </div>
  );
});