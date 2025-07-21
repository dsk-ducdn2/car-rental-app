import { component$ } from '@builder.io/qwik';

const navs = [
  { href: '/admin-vehicles', label: 'Quản lý xe' },
  { href: '/admin-vehicles/flexible-price', label: 'Giá thuê linh hoạt' },
  { href: '/admin-companies', label: 'Quản lý doanh nghiệp' },
  { href: '/admin-stats', label: 'Thống kê' },
];

export default component$(() => {
  return (
    <nav class="flex flex-wrap gap-2 mb-6">
      {navs.map((n) => (
        <a
          key={n.href}
          href={n.href}
          class="px-4 py-2 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition"
        >
          {n.label}
        </a>
      ))}
    </nav>
  );
}); 