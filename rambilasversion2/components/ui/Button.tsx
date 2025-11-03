interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'link' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className, 
  ...props 
}: ButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out transform disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  
  const variantClasses = {
    primary: "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 border border-transparent",
    secondary: "text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500 border border-transparent",
    danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 border border-transparent",
    destructive: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 border border-transparent",
    link: "text-indigo-600 hover:text-indigo-800 focus:ring-indigo-500 border border-transparent shadow-none",
    outline: "text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500 border border-gray-300",
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};