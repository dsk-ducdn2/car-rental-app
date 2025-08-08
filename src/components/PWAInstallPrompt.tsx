import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';

export const PWAInstallPrompt = component$(() => {
  const deferredPrompt = useSignal<any>(null);
  const showInstallPrompt = useSignal(false);

  useVisibleTask$(() => {
    // Lắng nghe sự kiện beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt.value = e;
      showInstallPrompt.value = true;
    });

    // Kiểm tra nếu đã cài đặt
    if (window.matchMedia('(display-mode: standalone)').matches) {
      showInstallPrompt.value = false;
    }
  });

  const installApp = $(async () => {
    if (deferredPrompt.value) {
      deferredPrompt.value.prompt();
      const { outcome } = await deferredPrompt.value.userChoice;
      if (outcome === 'accepted') {
        // User accepted the install prompt
      } else {
        // User dismissed the install prompt
      }
      deferredPrompt.value = null;
      showInstallPrompt.value = false;
    }
  });

  const dismissPrompt = $(() => {
    showInstallPrompt.value = false;
  });

  return (
    <>
      {showInstallPrompt.value && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-white font-semibold text-lg">Cài đặt ứng dụng</h3>
                <p class="text-gray-300 text-sm">Car Rental App</p>
                <p class="text-gray-400 text-xs">car-rental-app.com</p>
              </div>
            </div>
            
            <div class="flex gap-3">
              <button
                onClick$={installApp}
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cài đặt
              </button>
              <button
                onClick$={dismissPrompt}
                class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg border border-gray-500 transition-colors"
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}); 