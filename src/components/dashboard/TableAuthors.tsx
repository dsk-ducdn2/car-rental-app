import { component$ } from '@builder.io/qwik';

const authors = [
  {
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'JOHN MICHAEL',
    email: 'JOHN@CREATIVE-TIM.COM',
    function: 'MANAGER',
    org: 'ORGANIZATION',
    status: 'ONLINE',
    employed: '23/04/18',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'ALEXA LIRAS',
    email: 'ALEXA@CREATIVE-TIM.COM',
    function: 'PROGRAMATOR',
    org: 'DEVELOPER',
    status: 'OFFLINE',
    employed: '11/01/19',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/54.jpg',
    name: 'LAURENT PERRIER',
    email: 'LAURENT@CREATIVE-TIM.COM',
    function: 'EXECUTIVE',
    org: 'PROJECTS',
    status: 'ONLINE',
    employed: '19/09/17',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
    name: 'MICHAEL LEVI',
    email: 'MICHAEL@CREATIVE-TIM.COM',
    function: 'PROGRAMATOR',
    org: 'DEVELOPER',
    status: 'ONLINE',
    employed: '24/12/08',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    name: 'RICHARD GRAN',
    email: 'RICHARD@CREATIVE-TIM.COM',
    function: 'MANAGER',
    org: 'EXECUTIVE',
    status: 'OFFLINE',
    employed: '04/10/21',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    name: 'MIRIAM ERIC',
    email: 'MIRIAM@CREATIVE-TIM.COM',
    function: 'PROGRAMATOR',
    org: 'DEVELOPER',
    status: 'OFFLINE',
    employed: '14/09/20',
  },
];

export default component$(() => {
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
          {authors.map((author, idx) => (
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
                <span class={`px-3 py-1 rounded-full text-xs font-bold ${author.status === 'ONLINE' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'}`}>
                  {author.status}
                </span>
              </td>
              <td class="py-4 px-6 text-sm text-gray-700">{author.employed}</td>
              <td class="py-4 px-6">
                <button class="text-blue-600 font-semibold hover:underline text-sm">EDIT</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}); 