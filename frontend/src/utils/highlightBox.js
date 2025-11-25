// src/utils/highlightBox.js

// -------- helpers chung --------
const clean = (s) => String(s ?? "").trim();
const nonEmpty = (v) => v != null && clean(v) !== "";

// Lấy phần trước dấu "/" để ngắn gọn: "RTX 4060 / 8GB" -> "RTX 4060"
const preSlash = (s) => clean(s).split("/")[0].trim();

// Map object keys về lowercase để tra cứu alias không phân biệt hoa/thường
function lowerKeyMap(obj = {}) {
  const out = {};
  for (const k of Object.keys(obj)) out[k.toLowerCase()] = obj[k];
  return out;
}

// Lấy giá trị theo danh sách alias (trả về cái đầu tiên có dữ liệu)
function getByAliases(src = {}, ...aliases) {
  const m = lowerKeyMap(src);
  for (const key of aliases) {
    const v = m[String(key).toLowerCase()];
    if (nonEmpty(v)) return v;
  }
  return undefined;
}

// Đọc từ highlightText nếu có (key:value; key2:value2)
function parseHighlightText(text) {
  const map = {};
  const s = clean(text);
  if (!s) return map;
  s.split(";").forEach((pair) => {
    const [k, v] = pair.split(":");
    if (nonEmpty(k) && nonEmpty(v)) map[clean(k).toLowerCase()] = clean(v);
  });
  return map;
}

// ------ formatters ------
function fmtInch(v) {
  const s = String(v ?? "");
  const m = s.match(/(\d+(?:\.\d+)?)/);
  return m ? `${m[1]} inch` : clean(v);
}

function fmtHz(v) {
  const s = String(v ?? "");
  const m = s.match(/(\d{2,4})/);
  return m ? `${m[1]} Hz` : clean(v);
}

function fmtStorage(v) {
  const s = String(v ?? "");
  const tb = s.match(/(\d+(?:\.\d+)?)\s*tb/i);
  const gb = s.match(/(\d+(?:\.\d+)?)\s*gb/i);
  if (tb) return `${tb[1]} TB`;
  if (gb) return `${gb[1]} GB`;
  return clean(v);
}

// Bắt W x H từ nhiều format: "1920x1080", "1920 × 1080", "1920 1080", "(1920 x 1080)"
function parseResolutionWH(input) {
  const s = String(input || "")
    .toLowerCase()
    .replace(/[()\[\]]/g, "");
  const m = s.match(/(\d{3,5})\D+(\d{3,5})/);
  if (!m) return null;
  const w = parseInt(m[1], 10);
  const h = parseInt(m[2], 10);
  if (!w || !h) return null;
  return `${w}x${h}`;
}

const RES_TEXT = {
  "7680x4320": "8K UHD",
  "5120x2880": "5K",
  "5120x2160": "5K2K UW",
  "5120x1440": "DQHD",
  "3840x2160": "4K UHD",
  "3440x1440": "UWQHD",
  "2560x1600": "WQXGA",
  "2560x1440": "QHD (2K)",
  "2560x1080": "UW-FHD",
  "1920x1200": "WUXGA",
  "1920x1080": "Full HD", // yêu cầu của bạn
  "1600x900": "HD+",
  "1366x768": "HD",
  "1280x720": "HD",
};

// Luôn trả TEXT cho độ phân giải (không hiện số nếu map được)
export function fmtResolution(v) {
  const key = parseResolutionWH(v);
  if (key && RES_TEXT[key]) return RES_TEXT[key];

  // fallback nếu user đã nhập text
  const lower = String(v || "").toLowerCase();
  if (/full\s*hd|fhd|1080p/.test(lower)) return "Full HD";
  if (/4k/.test(lower)) return "4K UHD";
  if (/2k|qhd/.test(lower)) return "QHD (2K)";
  if (/uwqhd/.test(lower)) return "UWQHD";
  if (/hd\+/.test(lower)) return "HD+";
  if (/\bhd\b/.test(lower)) return "HD";
  return clean(v);
}

function yes(v) {
  const s = String(v ?? "").toLowerCase();
  return ["1", "true", "yes", "y", "on", "rgb", "led"].some((t) =>
    s.includes(t)
  );
}
function isWireless(v) {
  const s = String(v ?? "").toLowerCase();
  return /(wireless|bluetooth|2\.4|dongle|speednova)/.test(s);
}

// ===================================================================
// Main: lấy danh sách thông số box theo category
// Trả về mảng item { key, label } với các key: cpu,gpu,ram,storage,size,hz,res,panel,connection,led
// ===================================================================
export function getHighlightBox(product = {}) {
  const cat = clean(product?.category?.slug || product?.category).toLowerCase();
  const specs = product?.specs || {};
  const hiTxt = parseHighlightText(product?.highlightText); // fallback optional
  const src = { ...specs, ...hiTxt };

  // PC / DESKTOP ----------------------------------------------------------
  if (cat.includes("pc") || cat.includes("desktop")) {
    const cpu = getByAliases(src, "cpu", "processor");
    const vga = getByAliases(src, "vga", "gpu", "graphics");
    const ram = getByAliases(src, "ram", "memory");
    const storage = getByAliases(src, "storage", "ssd", "hdd", "drive");
    return [
      cpu && { key: "cpu", label: preSlash(cpu) },
      vga && { key: "gpu", label: preSlash(vga) },
      ram && { key: "ram", label: preSlash(ram) },
      storage && { key: "storage", label: preSlash(fmtStorage(storage)) },
    ].filter(Boolean);
  }

  // LAPTOP ---------------------------------------------------------------
  if (cat.includes("laptop") || cat.includes("notebook")) {
    const cpu = getByAliases(src, "cpu", "processor");
    const vga = getByAliases(src, "vga", "gpu", "graphics");
    const ram = getByAliases(src, "ram", "memory");
    const storage = getByAliases(src, "storage", "ssd", "hdd", "drive");
    const size = getByAliases(
      src,
      "screenSize",
      "size",
      "displaySize",
      "kích thước",
      "kich thuoc"
    );
    const hz = getByAliases(
      src,
      "refresh",
      "refreshRate",
      "hz",
      "tần số quét",
      "tan so quet"
    );
    return [
      cpu && { key: "cpu", label: preSlash(cpu) },
      vga && { key: "gpu", label: preSlash(vga) },
      ram && { key: "ram", label: preSlash(ram) },
      storage && { key: "storage", label: preSlash(fmtStorage(storage)) },
      size && { key: "size", label: preSlash(fmtInch(size)) },
      hz && { key: "hz", label: preSlash(fmtHz(hz)) },
    ].filter(Boolean);
  }

  // MONITOR (Màn hình) ---------------------------------------------------
  if (
    cat.includes("monitor") ||
    cat.includes("màn hình") ||
    cat.includes("man hinh") ||
    cat.includes("display")
  ) {
    const size = getByAliases(
      src,
      "size",
      "screenSize",
      "kích thước",
      "kich thuoc",
      "displaySize"
    );
    const hz = getByAliases(
      src,
      "refresh",
      "refreshRate",
      "hz",
      "tần số quét",
      "tan so quet"
    );
    const res = getByAliases(
      src,
      "resolution",
      "độ phân giải",
      "do phan giai",
      "res"
    );
    const panel = getByAliases(src, "panel", "tấm nền", "tam nen");
    return [
      size && { key: "size", label: preSlash(fmtInch(size)) },
      hz && { key: "hz", label: preSlash(fmtHz(hz)) },
      res && { key: "res", label: preSlash(fmtResolution(res)) }, // -> text (Full HD, 4K…)
      panel && { key: "panel", label: preSlash(panel) },
    ].filter(Boolean);
  }

  // MOUSE (Chuột) --------------------------------------------------------
  if (cat.includes("mouse") || cat.includes("chuột") || cat.includes("chuot")) {
    const conn = getByAliases(
      src,
      "connection",
      "connect",
      "kết nối",
      "ket noi",
      "interface"
    );
    const led = getByAliases(src, "led", "rgb", "lighting", "backlight");
    const connText = conn
      ? isWireless(conn)
        ? "Không dây"
        : "Có dây"
      : undefined;
    const ledText =
      led != null
        ? yes(led) || /rgb|led/i.test(String(led))
          ? "LED/RGB"
          : ""
        : "";
    return [
      connText && { key: "connection", label: preSlash(connText) },
      ledText && { key: "led", label: preSlash(ledText) },
    ].filter(Boolean);
  }

  // KEYBOARD (Bàn phím) --------------------------------------------------
  if (
    cat.includes("keyboard") ||
    cat.includes("bàn phím") ||
    cat.includes("ban phim")
  ) {
    const conn = getByAliases(
      src,
      "connection",
      "connect",
      "kết nối",
      "ket noi",
      "interface"
    );
    const led = getByAliases(src, "led", "rgb", "lighting", "backlight");
    const connText = conn
      ? isWireless(conn)
        ? "Không dây"
        : "Có dây"
      : undefined;
    const ledText =
      led != null
        ? yes(led) || /rgb|led/i.test(String(led))
          ? "LED/RGB"
          : ""
        : "";
    return [
      connText && { key: "connection", label: preSlash(connText) },
      ledText && { key: "led", label: preSlash(ledText) },
    ].filter(Boolean);
  }

  // Fallback cho các loại khác (ẩn nếu không có gì)
  return [];
}
