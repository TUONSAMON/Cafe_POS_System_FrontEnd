import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50";
  
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20",
    secondary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20",
    danger: "bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/20",
    outline: "border-2 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800",
    ghost: "text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-4 text-lg",
    icon: "p-2.5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}