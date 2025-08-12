import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';

const ThemeToggle = component$(() => {
  const isDark = useSignal(false);

  useVisibleTask$(() => {
    try {
      const stored = localStorage.getItem('theme');
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldDark = stored ? stored === 'dark' : prefersDark;
      isDark.value = document.documentElement.classList.contains('dark') || shouldDark;
    } catch {}
  });

  const toggleTheme = $((): void => {
    const next = !isDark.value;
    isDark.value = next;
    const root = document.documentElement;
    if (next) {
      root.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch {}
    } else {
      root.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch {}
    }
  });

  return (
    <button
      type="button"
      aria-label={isDark.value ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick$={toggleTheme}
      class="ml-3 inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
    >
      {isDark.value ? (
        // Sun icon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 4a1 1 0 011 1v1a1 1 0 11-2 0V5a1 1 0 011-1zm0 13a4 4 0 100-8 4 4 0 000 8zm7-5a1 1 0 110 2h-1a1 1 0 110-2h1zM6 12a1 1 0 010 2H5a1 1 0 010-2h1zm10.95 4.536a1 1 0 011.414 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707zM6.757 6.757a1 1 0 010 1.414l-.707.707A1 1 0 113.636 7.88l.707-.707a1 1 0 011.414 0zm11.314-1.414a1 1 0 010 1.414l-.707.707A1 1 0 1114.95 6.05l.707-.707a1 1 0 011.414 0zM7.05 17.95a1 1 0 010 1.414l-.707.707A1 1 0 113.929 19.07l.707-.707a1 1 0 011.414 0z" />
        </svg>
      ) : (
        // Moon icon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
        </svg>
      )}
    </button>
  );
});

export default ThemeToggle;


