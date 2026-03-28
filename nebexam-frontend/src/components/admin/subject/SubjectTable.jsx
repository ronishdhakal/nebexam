import Link from 'next/link';

export default function SubjectTable({ subjects, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Streams</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {subjects.map((subject) => (
            <tr key={subject.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-500">{subject.subject_code}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{subject.name}</td>
              <td className="px-4 py-3 text-gray-600">Class {subject.class_level}</td>
              <td className="px-4 py-3 text-gray-600">{subject.streams.join(', ')}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${subject.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {subject.is_published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="px-4 py-3 flex gap-3">
                <Link href={`/admin/subjects/${subject.slug}`} className="text-blue-600 hover:underline">Edit</Link>
                <button onClick={() => onDelete(subject.slug)} className="text-red-500 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {subjects.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">No subjects found.</div>
      )}
    </div>
  );
}