import { component$, useSignal, $, useComputed$ } from '@builder.io/qwik';
import { fetchWithAuth } from '../../utils/api';

interface Company {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;

}

interface TableCompaniesProps {
  companies: Company[];
}

export default component$<TableCompaniesProps>(({ companies }) => {
  const ITEMS_PER_PAGE = 8;
  const currentPage = useSignal(1);

  const showNotification = useSignal(false);
  const notificationMessage = useSignal('');
  const notificationType = useSignal<'success' | 'error'>('success');
  const API_URL = import.meta.env.VITE_API_URL;

  // Add state for delete dialog and loading bar
  const showDeleteDialog = useSignal(false);
  const deletingCompanyId = useSignal<number | null>(null);

  // Add search functionality
  const searchTerm = useSignal('');

  // Filter companies based on search term
  const filteredCompanies = useComputed$(() => {
    if (!searchTerm.value.trim()) {
      return companies;
    }
    
    const searchLower = searchTerm.value.toLowerCase().trim();
    return companies.filter((company) => 
      company.name.toLowerCase().includes(searchLower) ||
      company.email.toLowerCase().includes(searchLower) ||
      company.phone.toLowerCase().includes(searchLower) ||
      company.address.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = useComputed$(() =>
    Math.ceil((filteredCompanies.value.length || 0) / ITEMS_PER_PAGE)
  );

  const paginatedCompanies = useComputed$(() => {
    const startIndex = (currentPage.value - 1) * ITEMS_PER_PAGE;
    const endIndex = currentPage.value * ITEMS_PER_PAGE;
    return filteredCompanies.value.slice(startIndex, endIndex);
  });





  const handleEdit = $(async (companyId: number) => {
    // Edit logic here
    window.location.href = `/edit-company/${companyId}`;

  });

  const handleDelete = $((companyId: number) => {
    deletingCompanyId.value = companyId;
    showDeleteDialog.value = true;
  });

  const cancelDelete = $(() => {
    showDeleteDialog.value = false;
    deletingCompanyId.value = null;
  });

  const confirmDelete = $(async () => {
    if (deletingCompanyId.value === null) return;

    try {
      const response = await fetchWithAuth(`${API_URL}/Companies/${deletingCompanyId.value}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        notificationMessage.value = 'Company deleted successfully';
        notificationType.value = 'success';
        showNotification.value = true;

        // Remove company from the list (if want to update UI immediately)
        const idx = companies.findIndex(c => c.id === deletingCompanyId.value);
        if (idx !== -1) {
          companies.splice(idx, 1);
        }

        setTimeout(() => {
          showNotification.value = false;
        }, 3000);
      } else {
        notificationMessage.value = 'Failed to delete company';
        notificationType.value = 'error';
        showNotification.value = true;
        setTimeout(() => {
          showNotification.value = false;
        }, 3000);
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      notificationMessage.value = 'Error occurred while deleting company';
      notificationType.value = 'error';
      showNotification.value = true;
      setTimeout(() => {
        showNotification.value = false;
      }, 3000);
    }

    showDeleteDialog.value = false;
    deletingCompanyId.value = null;
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
            <h3 class="text-lg font-semibold text-center mb-2">Delete Company</h3>
            
            {/* Message */}
            <p class="text-gray-600 text-center mb-6">Are you sure you want to delete this company?</p>
            
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
      
      {/* Search and Create Company Section */}
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 px-6">
        {/* Search Input */}
        <div class="flex-1 max-w-md">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, phone, or address..."
              value={searchTerm.value}
              onInput$={(e) => {
                searchTerm.value = (e.target as HTMLInputElement).value;
                currentPage.value = 1; // Reset to first page when searching
              }}
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            {searchTerm.value && (
              <button
                onClick$={() => {
                  searchTerm.value = '';
                  currentPage.value = 1;
                }}
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg class="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Create Company Button */}
        <button
          onClick$={() => (window.location.href = '/create-company')}
          class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition duration-150"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Company
        </button>
      </div>

      {/* Search Results Info */}
      {searchTerm.value && (
        <div class="px-6 mb-4">
          <p class="text-sm text-gray-600">
            {filteredCompanies.value.length === 0 ? (
              <>No companies found for "<span class="font-medium">{searchTerm.value}</span>"</>
            ) : (
              <>Found {filteredCompanies.value.length} compan{filteredCompanies.value.length !== 1 ? 'ies' : 'y'} for "<span class="font-medium">{searchTerm.value}</span>"</>
            )}
          </p>
        </div>
      )}

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white rounded-lg table-fixed">
          <thead>
            <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
              <th class="py-3 px-6 w-1/5">Company Name</th>
              <th class="py-3 px-6 w-1/5">Email</th>
              <th class="py-3 px-6 w-1/5">Phone Number</th>
              <th class="py-3 px-6 w-1/5">Address</th>
              <th class="py-3 px-6 w-1/5">Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(paginatedCompanies.value) && paginatedCompanies.value.length > 0 ? (
              paginatedCompanies.value.map((company: Company, idx: number) => (
                <tr key={idx} class="group hoverable-row border-b border-gray-200 hover:bg-gray-50">
                  <td class="py-4 px-6">
                    <div class="row-text font-semibold text-gray-800 transition-colors">{company.name}</div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="row-text text-sm text-gray-700 transition-colors">{company.email}</div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="row-text text-sm text-gray-700 transition-colors">{company.phone}</div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="row-text text-sm text-gray-700 transition-colors">{company.address}</div>
                  </td>

                  <td class="py-4 px-6">
                    <div class="flex items-center gap-2">
                      <button 
                        onClick$={() => handleEdit(company.id)}
                        class="text-blue-600 font-semibold hover:underline text-sm px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button 
                        onClick$={() => handleDelete(company.id)}
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
                <td colSpan={6} class="text-center py-6 text-gray-400">No company data available.</td>
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