export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false
}) {
  const base = 'px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-green-500 hover:bg-green-400 text-gray-950 disabled:opacity-50',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50',
    danger: 'bg-red-600 hover:bg-red-500 text-white disabled:opacity-50',
    ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 disabled:opacity-50',
    outline: 'border border-green-500 text-green-500 hover:bg-green-500 hover:text-gray-950 disabled:opacity-50'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}