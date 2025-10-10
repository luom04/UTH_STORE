// src/utils/slugify.js
export function toSlug(input = "") {
  return String(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
    .replace(/[^a-zA-Z0-9\s-]/g, "") // loại ký tự đặc biệt
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}
