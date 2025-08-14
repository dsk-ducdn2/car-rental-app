import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export const PWAInfo = component$(() => {
  const isInstalled = useSignal(false);
  const isOnline = useSignal(true);

  useVisibleTask$(() => {
    // Kiểm tra xem PWA đã được cài đặt chưa
    const checkInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        isInstalled.value = true;
      }
    };

    // Kiểm tra trạng thái online/offline
    const checkOnlineStatus = () => {
      isOnline.value = navigator.onLine;
    };

    checkInstallation();
    checkOnlineStatus();

    // Lắng nghe sự kiện online/offline
    window.addEventListener('online', () => {
      isOnline.value = true;
    });

    window.addEventListener('offline', () => {
      isOnline.value = false;
    });

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  });

  return (
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        PWA Status
      </h3>
      
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-300">Installed:</span>
          <span class={`text-sm font-medium ${isInstalled.value ? 'text-green-600' : 'text-yellow-600'}`}>
            {isInstalled.value ? 'Installed' : 'Not installed'}
          </span>
        </div>
        
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-300">Connection:</span>
          <span class={`text-sm font-medium ${isOnline.value ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline.value ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-300">Service Worker:</span>
          <span class="text-sm font-medium text-green-600">
            Active
          </span>
        </div>
      </div>

      {!isInstalled.value && (
        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p class="text-sm text-blue-700 dark:text-blue-300">
            💡 You can install this app to use it offline and access it faster.
          </p>
        </div>
      )}
    </div>
  );
}); 