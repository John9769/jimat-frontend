export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-900 border border-gray-800 rounded-2xl p-4 ${onClick ? 'cursor-pointer hover:border-green-500 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  );
}