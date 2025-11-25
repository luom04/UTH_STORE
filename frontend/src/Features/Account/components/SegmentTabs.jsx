// src/Features/Account/components/SegmentTabs.jsx
export default function SegmentTabs({ value, onChange, tabs }) {
  return (
    <div className="flex gap-6 bg-white rounded-t-xl px-4 pt-3">
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            className="group relative pb-3 font-semibold text-sm md:text-base transition-colors duration-200 hover:cursor-pointer"
            onClick={() => onChange(t.key)}
          >
            <span
              className={
                active
                  ? "text-gray-900"
                  : "text-gray-500 group-hover:text-gray-900"
              }
            >
              {t.label}
            </span>

            <span
              className={[
                "absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-300 ease-out",
                active
                  ? "w-full"
                  : "w-0 group-hover:w-full group-hover:bg-gray-300",
              ].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}
