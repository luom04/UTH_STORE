import React from "react";

/**
 * Một component Button linh hoạt, tái sử dụng.
 * @param {object} props
 * @param {'primary' | 'secondary' | 'ghost'} [props.variant='primary'] - Kiểu hiển thị của nút.
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Kích thước của nút.
 * @param {React.ReactNode} [props.startIcon] - Icon hiển thị ở đầu nút.
 * @param {React.ReactNode} [props.endIcon] - Icon hiển thị ở cuối nút.
 * @param {string} [props.href] - Nếu có, nút sẽ được render như một thẻ <a>.
 * @param {string} [props.className] - Các class Tailwind CSS tùy chỉnh để ghi đè hoặc bổ sung.
 * @param {React.ReactNode} props.children - Nội dung bên trong nút.
 * @param {boolean} [props.disabled] - Trạng thái vô hiệu hóa của nút.
 * @returns {JSX.Element}
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  startIcon,
  endIcon,
  href,
  className = "",
  disabled = false,
  ...props
}) {
  // Định nghĩa các style cơ bản, dùng chung cho mọi nút
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Định nghĩa style cho từng `variant`
  const variantStyles = {
    primary:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 cursor-pointer",
    secondary:
      "bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 focus:ring-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 cursor-pointer",
    ghost:
      "bg-transparent text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 cursor-pointer",
  };

  // Định nghĩa style cho từng `size`
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "h-11 px-5 text-sm", // Giống nút "MUA NGAY" của bạn
    lg: "px-6 py-3 text-base",
  };

  // Style khi nút bị vô hiệu hóa
  const disabledStyles = "opacity-50 cursor-not-allowed";

  // Kết hợp tất cả các class lại với nhau
  const combinedClassName = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    disabled ? disabledStyles : "",
    className,
  ]
    .join(" ")
    .trim();

  // Quyết định render thẻ `a` hay `button`
  const Component = href ? "a" : "button";

  return (
    <button
      className={combinedClassName}
      disabled={disabled}
      href={href}
      {...props}
    >
      {startIcon && <span className="mr-2 -ml-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2 -mr-1">{endIcon}</span>}
    </button>
  );
}
