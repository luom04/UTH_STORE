// src/Features/Account/components/EmptyState.jsx
export default function EmptyState({ title, desc, action }) {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      {desc ? <p className="mt-1 text-gray-600">{desc}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
