// src/Features/Admin/components/products/DynamicSpecsFields.jsx

import { useState, useEffect } from "react";
import { Plus, X, FileText } from "lucide-react";
import { SPECS_TEMPLATES } from "../../constants/productSpecs";

export default function DynamicSpecsFields({
  category,
  specs = {},
  onChange,
  disabled,
}) {
  const [fields, setFields] = useState(() => {
    // Load existing specs khi component mount
    return Object.entries(specs);
  });

  // Update fields khi specs prop thay đổi (khi edit sản phẩm)
  useEffect(() => {
    if (Object.keys(specs).length > 0) {
      setFields(Object.entries(specs));
    }
  }, [specs]);

  // Load template cho category
  const loadTemplate = () => {
    const template = SPECS_TEMPLATES[category] || [];
    if (template.length === 0) {
      alert("Category này chưa có template!");
      return;
    }

    // Merge template với specs hiện tại
    const mergedFields = [...fields];

    template.forEach((t) => {
      // Chỉ thêm nếu chưa có key này
      const exists = mergedFields.some(([k]) => k === t.key);
      if (!exists) {
        mergedFields.push([t.key, specs[t.key] || ""]);
      }
    });

    setFields(mergedFields);
    updateSpecs(mergedFields);
  };

  // Thêm field mới (custom)
  const addField = () => {
    const newFields = [...fields, ["", ""]];
    setFields(newFields);
  };

  // Xóa field
  const removeField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    updateSpecs(newFields);
  };

  // Update key hoặc value
  const updateField = (index, key, value) => {
    const newFields = [...fields];
    if (key !== undefined) newFields[index][0] = key;
    if (value !== undefined) newFields[index][1] = value;
    setFields(newFields);
    updateSpecs(newFields);
  };

  // Convert fields array → specs object
  const updateSpecs = (fieldsArray) => {
    const specsObj = Object.fromEntries(fieldsArray.filter(([k, v]) => k && v));
    onChange(specsObj);
  };

  // Check nếu key này có trong template
  const isTemplateKey = (key) => {
    const template = SPECS_TEMPLATES[category] || [];
    return template.some((t) => t.key === key);
  };

  // Get template info
  const getTemplateInfo = (key) => {
    const template = SPECS_TEMPLATES[category] || [];
    return template.find((t) => t.key === key);
  };

  const hasTemplate = category && (SPECS_TEMPLATES[category] || []).length > 0;

  return (
    <div className="space-y-4">
      {/* Header với 2 nút */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-700">📋 Thông số kỹ thuật</h4>

        <div className="flex items-center gap-2">
          {/* Nút load template */}
          {hasTemplate && (
            <button
              type="button"
              onClick={loadTemplate}
              disabled={disabled}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
              title="Tự động điền các trường thông dụng"
            >
              <FileText size={16} />
              Load template {category}
            </button>
          )}

          {/* Nút thêm field */}
          <button
            type="button"
            onClick={addField}
            disabled={disabled}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            <Plus size={16} />
            Thêm trường
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-2">
        {fields.map(([key, value], index) => {
          const templateInfo = getTemplateInfo(key);
          const isTemplate = isTemplateKey(key);

          return (
            <div
              key={index}
              className={`flex gap-2 p-3 rounded-lg border ${
                isTemplate
                  ? "bg-purple-50 border-purple-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              {/* Key input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={templateInfo?.label || "Tên thuộc tính"}
                  value={key}
                  onChange={(e) =>
                    updateField(index, e.target.value, undefined)
                  }
                  disabled={disabled}
                  className={`w-full px-3 py-2 border rounded focus:ring-2 focus:border-blue-500 disabled:bg-white disabled:opacity-50 ${
                    isTemplate
                      ? "border-purple-300 font-medium bg-white"
                      : "border-gray-300"
                  }`}
                />
                {isTemplate && templateInfo && (
                  <span className="text-xs text-purple-600 mt-1 block">
                    {templateInfo.label}
                  </span>
                )}
              </div>

              {/* Value input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={templateInfo?.placeholder || "Giá trị"}
                  value={value}
                  onChange={(e) =>
                    updateField(index, undefined, e.target.value)
                  }
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:opacity-50"
                />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeField(index)}
                disabled={disabled}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                title="Xóa trường này"
              >
                <X size={20} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-sm font-medium">Chưa có thông số kỹ thuật</p>
          <p className="text-xs mt-1">
            {hasTemplate
              ? `Nhấn "Load template ${category}" để tự động thêm fields, hoặc "Thêm trường" để tự nhập`
              : 'Nhấn "Thêm trường" để thêm specs'}
          </p>
        </div>
      )}

      {/* Help text */}
      <div className="flex items-start gap-2 text-xs text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
        <div className="shrink-0 mt-0.5">💡</div>
        <div>
          <div className="font-medium mb-1">Hướng dẫn:</div>
          <ul className="space-y-1">
            {hasTemplate && (
              <li>
                • Các trường{" "}
                <span className="text-purple-600 font-medium">màu tím</span> là
                từ template (gợi ý)
              </li>
            )}
            <li>• Có thể thêm/xóa/sửa bất kỳ trường nào</li>
            <li>• Để trống key hoặc value sẽ không lưu trường đó</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
