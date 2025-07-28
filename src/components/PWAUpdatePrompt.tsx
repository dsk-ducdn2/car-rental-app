import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';

export const PWAUpdatePrompt = component$(() => {
  const needRefresh = useSignal(false);
  const offlineReady = useSignal(false);

  useVisibleTask$(() => {
    // Lắng nghe sự kiện cập nhật PWA
    const handleSWUpdate = () => {
      needRefresh.value = true;
    };

    const handleSWOffline = () => {
      offlineReady.value = true;
    };

    // Đăng ký các event listeners
    window.addEventListener('sw-updated', handleSWUpdate);
    window.addEventListener('sw-offline', handleSWOffline);

    return () => {
      window.removeEventListener('sw-updated', handleSWUpdate);
      window.removeEventListener('sw-offline', handleSWOffline);
    };
  });

  const updateApp = $(() => {
    // Reload trang để áp dụng cập nhật
    window.location.reload();
  });

  const dismissUpdate = $(() => {
    needRefresh.value = false;
  });

  const dismissOffline = $(() => {
    offlineReady.value = false;
  });

  return (
    <>
      {/* Thông báo cập nhật */}
      {needRefresh.value && (
        <div class="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="text-sm font-medium">Có cập nhật mới</span>
            </div>
            <div class="flex gap-2">
              <button
                onClick$={updateApp}
                class="text-xs bg-white text-blue-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                Cập nhật
              </button>
              <button
                onClick$={dismissUpdate}
                class="text-xs text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thông báo offline */}
      {offlineReady.value && (
        <div class="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium">Sẵn sàng offline</span>
            </div>
            <button
              onClick$={dismissOffline}
              class="text-xs text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}); 