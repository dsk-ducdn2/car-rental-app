import { component$, useSignal } from '@builder.io/qwik';

interface Author {
  avatar: string;
  name: string;
  email: string;
  function: string;
  org: string;
  status: string;
  employed: string;
}

interface TableAuthorsProps {
  authors: Author[];
}

export default component$<TableAuthorsProps>(({ authors }) => {
  const ITEMS_PER_PAGE = 8;
  const currentPage = useSignal(1);
  const totalPages = Math.ceil((authors?.length || 0) / ITEMS_PER_PAGE);

  const paginatedAuthors = authors.slice(
    (currentPage.value - 1) * ITEMS_PER_PAGE,
    currentPage.value * ITEMS_PER_PAGE
  );

  return (
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white rounded-lg">
        <thead>
          <tr class="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
            <th class="py-3 px-6">Author</th>
            <th class="py-3 px-6">Function</th>
            <th class="py-3 px-6">Status</th>
            <th class="py-3 px-6">Employed</th>
            <th class="py-3 px-6">Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(paginatedAuthors) && paginatedAuthors.length > 0 ? (
            paginatedAuthors.map((author: Author, idx: number) => (
              <tr key={idx} class="border-b border-gray-200 hover:bg-gray-50">
                <td class="py-4 px-6 flex items-center gap-3">
                  <img src={author.avatar} alt={author.name} class="w-10 h-10 rounded-full object-cover border" />
                  <div>
                    <div class="font-semibold text-gray-800">{author.name}</div>
                    <div class="text-xs text-gray-500">{author.email}</div>
                  </div>
                </td>
                <td class="py-4 px-6">
                  <div class="font-medium text-gray-700 text-sm">{author.function}</div>
                  <div class="text-xs text-gray-400">{author.org}</div>
                </td>
                <td class="py-4 px-6">
                  <span class={`px-3 py-1 rounded-full text-xs font-bold ${author.status === 'ONLINE' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'}`}>{author.status}</span>
                </td>
                <td class="py-4 px-6 text-sm text-gray-700">{author.employed}</td>
                <td class="py-4 px-6">
                  <button class="text-blue-600 font-semibold hover:underline text-sm">EDIT</button>
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
            onClick$={() => currentPage.value = Math.max(1, currentPage.value - 1)}
          >
            Previous
          </button>
          <span class="text-sm font-medium text-gray-700 select-none">Page {currentPage.value} of {totalPages}</span>
          <button
            class={`px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium transition-colors duration-150
              ${currentPage.value === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'}`}
            disabled={currentPage.value === totalPages}
            onClick$={() => currentPage.value = Math.min(totalPages, currentPage.value + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}); 