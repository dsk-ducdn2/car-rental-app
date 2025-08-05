import { component$, useSignal, $, useComputed$ } from '@builder.io/qwik';
import { fetchWithAuth } from '../../utils/api';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: string;
  status: string;
  pricePerDay: number;
}

interface TableVehiclesProps {
  vehicles: Vehicle[];
}

export default component$<TableVehiclesProps>(({ vehicles }) => {
  const ITEMS_PER_PAGE = 8;
  const currentPage = useSignal(1);

  const showNotification = useSignal(false);
  const notificationMessage = useSignal('');
  const notificationType = useSignal<'success' | 'error'>('success');
  const API_URL = import.meta.env.VITE_API_URL;

  // Add state for delete dialog and loading bar
  const showDeleteDialog = useSignal(false);
  const deletingVehicleId = useSignal<number | null>(null);

  const totalPages = useComputed$(() =>
    Math.ceil((vehicles.length || 0) / ITEMS_PER_PAGE)
  );

  const paginatedVehicles = useComputed$(() => {
    const startIndex = (currentPage.value - 1) * ITEMS_PER_PAGE;
    const endIndex = currentPage.value * ITEMS_PER_PAGE;
    return vehicles.slice(startIndex, endIndex);
  });

  const handleEdit = $(async (vehicleId: number) => {
    // Edit logic here
    window.location.href = `/edit-vehicle/${vehicleId}`;
    console.log(`Edit vehicle ${vehicleId}`);
  });

  const handleDelete = $((vehicleId: number) => {
    deletingVehicleId.value = vehicleId;
    showDeleteDialog.value = true;
  });

  const cancelDelete = $(() => {
    showDeleteDialog.value = false;
    deletingVehicleId.value = null;
  });

  const confirmDelete = $(async () => {
    if (deletingVehicleId.value === null) return;

    try {
      const response = await fetchWithAuth(`${API_URL}/Vehicles/${deletingVehicleId.value}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        notificationMessage.value = 'Vehicle deleted successfully';
        notificationType.value = 'success';
        showNotification.value = true;

        // Remove vehicle from the list (if want to update UI immediately)
        const idx = vehicles.findIndex(v => v.id === deletingVehicleId.value);
        if (idx !== -1) {
          vehicles.splice(idx, 1);
        }

        setTimeout(() => {
          showNotification.value = false;
        }, 3000);
      } else {
        notificationMessage.value = 'Failed to delete vehicle';
        notificationType.value = 'error';
        showNotification.value = true;
        setTimeout(() => {
          showNotification.value = false;
        }, 3000);
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      notificationMessage.value = 'Error occurred while deleting vehicle';
      notificationType.value = 'error';
      showNotification.value = true;
      setTimeout(() => {
        showNotification.value = false;
      }, 3000);
    }

    showDeleteDialog.value = false;
    deletingVehicleId.value = null;
  });

  const handlePreviousPage = $(() => {
    if (currentPage.value > 1) {
      currentPage.value = currentPage.value - 1;
    }
  });

  const handleNextPage = $(() => {
    if (currentPage.value < totalPages.value) {
      currentPage.value = currentPage.value + 1;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'rented':
        return 'bg-yellow-100 text-yellow-700';
      case 'maintenance':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div class="relative w-full h-full">
      {/* Success/Error Notification */}
      {showNotification.value && (
        <div 
          class={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${
            notificationType.value === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <div class="flex items-center justify-between">
            <span>{notificationMessage.value}</span>
            <button
              onClick$={() => (showNotification.value = false)}
              class={`ml-4 text-white hover:text-gray-200 ${
                notificationType.value === 'success' 
                  ? 'hover:text-green-200' 
                  : 'hover:text-red-200'
                }`}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog (Delete) */}
      {showDeleteDialog.value && (
        <div 
          class="fixed inset-0 flex items-center justify-center z-50"
          style="background-color: rgba(0, 0, 0, 0.3); backdrop-filter: blur(2px);"
        >
          <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative shadow-2xl">
            {/* Close button */}
            <button
              onClick$={cancelDelete}
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            {/* Warning icon */}
            <div class="flex justify-center mb-4">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
            </div>
            
            {/* Title */}
            <h3 class="text-lg font-semibold text-center mb-2">Delete Vehicle</h3>
            
            {/* Message */}
            <p class="text-gray-600 text-center mb-6">Are you sure you want to delete this vehicle?</p>
            
            {/* Buttons */}
            <div class="flex gap-3 justify-center">
              <button
                onClick$={cancelDelete}
                class="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick$={confirmDelete}
                class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div class="flex justify-start mb-4 px-6">
        <button
          onClick$={() => (window.location.href = '/create-vehicle')}
          class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition duration-150"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Vehicle
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white rounded-lg table-fixed">
          <thead>
            <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
              <th class="py-3 px-6 w-1/8">Make & Model</th>
              <th class="py-3 px-6 w-1/8">Year</th>
              <th class="py-3 px-6 w-1/8">License Plate</th>
              <th class="py-3 px-6 w-1/8">Type</th>
              <th class="py-3 px-6 w-1/8">Status</th>
              <th class="py-3 px-6 w-1/8">Price/Day</th>
              <th class="py-3 px-6 w-1/8">Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(paginatedVehicles.value) && paginatedVehicles.value.length > 0 ? (
              paginatedVehicles.value.map((vehicle: Vehicle, idx: number) => (
                <tr key={idx} class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="py-4 px-6">
                    <div class="font-semibold text-gray-800">{vehicle.make}</div>
                    <div class="text-sm text-gray-600">{vehicle.model}</div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="text-sm text-gray-700">{vehicle.year}</div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="text-sm text-gray-700 font-mono">{vehicle.licensePlate}</div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="text-sm text-gray-700">{vehicle.type}</div>
                  </td>
                  <td class="py-4 px-6">
                    <span class={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td class="py-4 px-6">
                    <div class="text-sm font-semibold text-gray-700">${vehicle.pricePerDay}</div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-2">
                      <button 
                        onClick$={() => handleEdit(vehicle.id)}
                        class="text-blue-600 font-semibold hover:underline text-sm px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button 
                        onClick$={() => handleDelete(vehicle.id)}
                        class="text-red-600 font-semibold hover:underline text-sm px-2 py-1 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} class="text-center py-6 text-gray-400">No vehicle data available.</td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination Controls */}
        <div class="flex justify-end items-center mt-4 pr-6">
          <div class="flex items-center gap-3">
            <button
              class={`px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium transition-colors duration-150
                ${currentPage.value === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'}`}
              disabled={currentPage.value === 1}
              onClick$={handlePreviousPage}
            >
              Previous
            </button>
            <span class="text-sm font-medium text-gray-700 select-none">Page {currentPage.value} of {totalPages.value}</span>
            <button
              class={`px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium transition-colors duration-150
                ${currentPage.value === totalPages.value ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'}`}
              disabled={currentPage.value === totalPages.value}
              onClick$={handleNextPage}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});