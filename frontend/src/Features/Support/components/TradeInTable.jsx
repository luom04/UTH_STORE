// src/features/support/components/TradeInTable.jsx
export default function TradeInTable({
  title = "",
  columns = [], // ["Hãng", "Dòng", "Giá thu từ (nghìn)"]
  rows = [], // [["NVIDIA","RTX 3060 12G","4400-5200"], ...]
  maxHeight = 360,
  className = "",
}) {
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white shadow-sm ${className}`}
    >
      {title ? (
        <div className="px-4 py-3 border-b border-gray-100">
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
      ) : null}

      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full text-sm">
          {!!columns.length && (
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c}
                    className="px-3 py-2 text-left font-semibold text-gray-700"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="border-t border-gray-100">
                {r.map((cell, i) => (
                  <td key={i} className="px-3 py-2 text-gray-800">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
