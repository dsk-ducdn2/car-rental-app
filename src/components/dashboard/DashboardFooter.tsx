import { component$ } from '@builder.io/qwik';

export const DashboardFooter = component$(() => (
  <footer class="fixed bottom-0 left-0 z-50 w-full bg-white/80 rounded-t-2xl shadow-sm py-2 px-4 flex justify-center items-center text-sm text-gray-400">
    <span>© 2025, made by DucDN</span>
    <svg class="mx-1" width="16" height="16" fill="#6366f1" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    <span>by for a better web.</span>
  </footer>
)); 