// src/components/product/SpecsTable.jsx

// 🎯 Label mapping cho các trường specs
const SPEC_LABELS = {
  // Monitor specs
  model: "Model",
  size: "Kích thước màn hình",
  resolution: "Độ phân giải",
  panel: "Tấm nền",
  screenType: "Kiểu màn hình",
  refreshRate: "Tần số quét",
  responseTime: "Thời gian phản hồi",
  brightness: "Độ sáng",
  colorSpace: "Không gian màu",
  ports: "Cổng kết nối",
  vesaMount: "Chuẩn VESA",
  flickerFree: "Chống nhấp nháy",
  warranty: "Bảo hành",
  accessories: "Phụ kiện đi kèm",
  adaptiveSync: "Công nghệ đồng bộ",
  aspectRatio: "Tỷ lệ khung hình",
  displayColors: "Màu sắc hiển thị",
  contrastRatio: "Tỷ lệ tương phản",
  surfaceType: "Bề mặt",
  mechanicalDesign: "Thiết kế cơ khí",
  weight: "Trọng lượng",
  packageDimensions: "Kích thước đóng gói",

  // PC/Laptop specs
  cpu: "CPU",
  gpu: "Card đồ họa",
  ram: "RAM",
  storage: "Ổ cứng",
  motherboard: "Bo mạch chủ",
  psu: "Nguồn",
  case: "Vỏ case",
  cooling: "Tản nhiệt",
  os: "Hệ điều hành",

  // Keyboard specs
  switchType: "Loại switch",
  keycaps: "Keycaps",
  layout: "Layout",
  connection: "Kết nối",
  battery: "Pin",
  rgbLighting: "Đèn LED RGB",

  // Mouse specs
  sensor: "Cảm biến",
  dpi: "DPI",
  pollingRate: "Tần số polling",
  buttons: "Số nút",

  // Headset specs
  driver: "Driver",
  frequency: "Tần số",
  impedance: "Trở kháng",
  microphone: "Microphone",
  cable: "Cáp",

  // Generic
  brand: "Thương hiệu",
  color: "Màu sắc",
  material: "Chất liệu",
  dimensions: "Kích thước",
};

export default function SpecsTable({ specs = {} }) {
  // Filter chỉ lấy các field có giá trị
  const validSpecs = Object.entries(specs).filter(([key, value]) => {
    // Loại bỏ các giá trị rỗng, null, undefined, empty string
    if (!value) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
  });

  // Nếu không có specs nào, không render
  if (validSpecs.length === 0) {
    return (
      <div className="text-gray-500 italic">
        Chưa có thông tin cấu hình chi tiết.
      </div>
    );
  }

  // 🆕 Check nếu quá 10 thông số thì cần scroll
  const needsScroll = validSpecs.length > 10;
  const maxHeight = needsScroll ? "max-h-[520px]" : ""; // ~10 rows * 52px

  return (
    <div
      className={`overflow-x-auto ${
        needsScroll ? "overflow-y-auto" : ""
      } ${maxHeight} border border-gray-200 rounded-lg`}
    >
      <table className="min-w-[520px] w-full text-sm border-collapse">
        <tbody>
          {validSpecs.map(([key, value]) => (
            <tr
              key={key}
              className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
            >
              <td className="py-3 px-4 font-medium text-gray-700 w-48 align-top bg-gray-50">
                {SPEC_LABELS[key] || key}
              </td>
              <td className="py-3 px-4 text-gray-900 leading-relaxed">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🆕 Hiển thị số lượng thông số */}
      {needsScroll && (
        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent py-2 text-center text-xs text-gray-500">
          Hiển thị {validSpecs.length} thông số (cuộn để xem thêm)
        </div>
      )}
    </div>
  );
}
