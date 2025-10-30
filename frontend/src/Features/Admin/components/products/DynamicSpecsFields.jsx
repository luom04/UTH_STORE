// src/Features/Admin/components/products/DynamicSpecsFields.jsx
import { useEffect } from "react";
import { SPECS_TEMPLATES } from "../../constants/productSpecs";

export default function DynamicSpecsFields({
  category,
  specs,
  onChange,
  disabled,
}) {
  const template = SPECS_TEMPLATES[category] || [];

  // Reset specs khi đổi category
  useEffect(() => {
    if (!category) return;

    const newSpecs = {};
    template.forEach((field) => {
      // Giữ lại giá trị cũ nếu có, không thì để trống
      newSpecs[field.key] =
        specs?.[field.key] ?? (field.type === "checkbox" ? false : "");
    });
    onChange(newSpecs);
  }, [category]);

  const handleFieldChange = (key, value) => {
    onChange({ ...specs, [key]: value });
  };

  if (!category) {
    return (
      <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg border border-dashed">
        💡 Chọn danh mục sản phẩm ở trên để hiển thị các trường thông số kỹ
        thuật
      </div>
    );
  }

  if (template.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg border">
        ℹ️ Danh mục này chưa có template thông số kỹ thuật
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-700">📋 Thông số kỹ thuật</h4>
        <span className="text-xs text-gray-500">
          {template.filter((f) => f.required).length} trường bắt buộc
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {template.map((field) => (
          <div key={field.key} className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Text input */}
            {field.type === "text" && (
              <input
                type="text"
                value={specs?.[field.key] || ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="rounded-lg border px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                required={field.required}
                disabled={disabled}
              />
            )}

            {/* Number input */}
            {field.type === "number" && (
              <input
                type="number"
                value={specs?.[field.key] || ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="rounded-lg border px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                required={field.required}
                disabled={disabled}
              />
            )}

            {/* Select dropdown */}
            {field.type === "select" && (
              <select
                value={specs?.[field.key] || ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                required={field.required}
                disabled={disabled}
              >
                <option value="">-- Chọn --</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {/* Checkbox */}
            {field.type === "checkbox" && (
              <label className="flex items-center mt-1">
                <input
                  type="checkbox"
                  checked={!!specs?.[field.key]}
                  onChange={(e) =>
                    handleFieldChange(field.key, e.target.checked)
                  }
                  className="mr-2 w-4 h-4 disabled:opacity-50"
                  disabled={disabled}
                />
                <span className="text-sm text-gray-600">Có</span>
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
