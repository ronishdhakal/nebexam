import Link from 'next/link';

export default function AreaList({ areas, onDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[500px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Subject</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Class</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Order</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {areas.map((area) => (
            <tr key={area.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3.5 font-medium text-slate-900">{area.name}</td>
              <td className="px-5 py-3.5 text-slate-500">{area.subject_name}</td>
              <td className="px-5 py-3.5 text-slate-500">{area.subject_class_level ? `Class ${area.subject_class_level}` : '—'}</td>
              <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{area.order}</td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/areas/${area.id}`} className="text-[#1CA3FD] hover:text-[#0e8fe0] text-xs font-medium">Edit</Link>
                  <button onClick={() => onDelete(area.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {areas.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">No areas found.</div>
      )}
    </div>
  );
}
