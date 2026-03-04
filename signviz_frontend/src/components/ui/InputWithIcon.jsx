import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputWithIcon = ({ 
  label, 
  id, 
  type = "text", 
  icon: Icon, 
  placeholder, 
  className = "",
  error,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-primary block">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#17635D] transition-colors duration-200">
            <Icon className="h-5 w-5" />
          </div>
        )}
        
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          className={`
            w-full bg-white text-slate-900 placeholder:text-slate-400
            border border-slate-200 rounded-xl
            ${Icon ? 'pl-10' : 'pl-4'} 
            ${isPassword ? 'pr-10' : 'pr-4'} 
            py-3
            focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500
            transition-all duration-300
            shadow-sm
            ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : ''}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default InputWithIcon;
