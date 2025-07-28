import { component$, useSignal, $, useComputed$ } from '@builder.io/qwik';
import { fetchWithAuth } from '../../utils/api';

interface Author {
  id: number;
  avatar: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: boolean; // true for active, false for deactive
}

interface TableAuthorsProps {
  authors: Author[];
}

export default component$<TableAuthorsProps>(({ authors }) => {
  const ITEMS_PER_PAGE = 8;
  const currentPage = useSignal(1);
  const showConfirmDialog = useSignal(false);
  const selectedUserId = useSignal<number | null>(null);
  const showNotification = useSignal(false);
  const notificationMessage = useSignal('');
  const notificationType = useSignal<'success' | 'error'>('success');
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Use useComputed$ to ensure paginatedAuthors updates when currentPage or authors change
  const totalPages = useComputed$(() => Math.ceil((authors?.length || 0) / ITEMS_PER_PAGE));
  
  const paginatedAuthors = useComputed$(() => {
    const startIndex = (currentPage.value - 1) * ITEMS_PER_PAGE;
    const endIndex = currentPage.value * ITEMS_PER_PAGE;
    return authors.slice(startIndex, endIndex);
  });

  const handleStatusToggle = $((authorId: number) => {
    selectedUserId.value = authorId;
    showConfirmDialog.value = true;
  });

  const confirmStatusChange = $(async () => {
    if (selectedUserId.value === null) return;
    
    // Get token from cookies
    function getCookie(name: string) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    }
    
    const token = getCookie('access_token');
    if (!token) {
      notificationMessage.value = 'Authentication token not found';
      notificationType.value = 'error';
      showNotification.value = true;
      setTimeout(() => {
        showNotification.value = false;
      }, 3000);
      return;
    }
    
    try {
      const response = await fetchWithAuth(`${API_URL}/Users/changeStatusUser`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedUserId.value),
      });
      if (response.status === 200) {
        notificationMessage.value = 'Change status successfully';
        notificationType.value = 'success';
        showNotification.value = true;
        
        // Update the toggle status immediately
        const author = authors.find(a => a.id === selectedUserId.value);
        if (author) {
          author.status = !author.status; // Toggle the status
        }
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          showNotification.value = false;
        }, 3000);
      }
      else {
        notificationMessage.value = 'Failed to change status';
        notificationType.value = 'error';
        showNotification.value = true;
        
        setTimeout(() => {
          showNotification.value = false;
        }, 3000);
      }
    } catch (error) {
      console.error('Error changing status:', error);
      notificationMessage.value = 'Error occurred while changing status';
      notificationType.value = 'error';
      showNotification.value = true;
      
      setTimeout(() => {
        showNotification.value = false;
      }, 3000);
    }
    
    // Close dialog
    showConfirmDialog.value = false;
    selectedUserId.value = null;
  });

  const cancelStatusChange = $(() => {
    showConfirmDialog.value = false;
    selectedUserId.value = null;
  });

  const handleEdit = $((authorId: number) => {
    // Edit logic here
    console.log(`Edit author ${authorId}`);
  });

  const handleDelete = $((authorId: number) => {
    // Delete logic here
    console.log(`Delete author ${authorId}`);
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
    <div class="relative">
      {/* Notification */}
      {showNotification.value && (
        <div class={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 transition-all duration-300 ${
          notificationType.value === 'success' 
            ? 'border-green-500' 
            : 'border-red-500'
        }`}>
          <div class="flex items-center p-4">
            {/* Success Icon */}
            {notificationType.value === 'success' && (
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            )}
            
            {/* Error Icon */}
            {notificationType.value === 'error' && (
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              </div>
            )}
            
            {/* Message */}
            <div class="ml-3 flex-1">
              <p class={`text-sm font-medium ${
                notificationType.value === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notificationMessage.value}
              </p>
            </div>
            
            {/* Close button */}
            <div class="ml-4 flex-shrink-0">
              <button
                onClick$={() => showNotification.value = false}
                class={`inline-flex text-gray-400 hover:text-gray-600 focus:outline-none ${
                  notificationType.value === 'success' ? 'hover:text-green-600' : 'hover:text-red-600'
                }`}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog.value && (
        <div 
          class="fixed inset-0 flex items-center justify-center z-50"
          style="background-color: rgba(0, 0, 0, 0.3); backdrop-filter: blur(2px);"
        >
          <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative shadow-2xl">
            {/* Close button */}
            <button
              onClick$={cancelStatusChange}
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
            <h3 class="text-lg font-semibold text-center mb-2">Change Status</h3>
            
            {/* Message */}
            <p class="text-gray-600 text-center mb-6">Are you sure you would like to do this?</p>
            
            {/* Buttons */}
            <div class="flex gap-3 justify-center">
              <button
                onClick$={cancelStatusChange}
                class="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick$={confirmStatusChange}
                class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white rounded-lg">
          <thead>
            <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
              <th class="py-3 px-6">Author</th>
              <th class="py-3 px-6">Email</th>
              <th class="py-3 px-6">Phone Number</th>
              <th class="py-3 px-6">Status</th>
              <th class="py-3 px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(paginatedAuthors.value) && paginatedAuthors.value.length > 0 ? (
              paginatedAuthors.value.map((author: Author, idx: number) => (
                <tr key={idx} class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="py-4 px-6 flex items-center gap-3">
                    <img 
                      src={author.avatar || 'https://via.placeholder.com/40x40'} 
                      alt={author.name} 
                      class="w-10 h-10 rounded-full object-cover border" 
                      width="40" 
                      height="40" 
                    />
                    <div>
                      <div class="font-semibold text-gray-800">{author.name}</div>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="text-sm text-gray-700">{author.email}</div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="text-sm text-gray-700">{author.phoneNumber}</div>
                  </td>
                  <td class="py-4 px-6">
                    <button
                      onClick$={() => handleStatusToggle(author.id)}
                      class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        author.status 
                          ? 'bg-blue-600' 
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        class={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                          author.status ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span class={`ml-2 text-xs font-medium ${
                      author.status ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {author.status ? 'Active' : 'Deactive'}
                    </span>
                  </td>
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-2">
                      <button 
                        onClick$={() => handleEdit(author.id)}
                        class="text-blue-600 font-semibold hover:underline text-sm px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button 
                        onClick$={() => handleDelete(author.id)}
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
                <td colSpan={5} class="text-center py-6 text-gray-400">Không có dữ liệu người dùng.</td>
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