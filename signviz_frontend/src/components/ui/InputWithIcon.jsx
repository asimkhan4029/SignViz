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
        <label htmlFor={id} className="text-sm font-medium text-text-secondary block px-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors duration-200">
            <Icon className="h-5 w-5" />
          </div>
        )}
        
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          className={`
            input-brand
            ${Icon ? 'pl-11' : 'pl-4'} 
            ${isPassword ? 'pr-11' : 'pr-4'} 
            ${error ? 'border-error focus:ring-error/10 focus:border-error' : ''}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary focus:outline-none transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-error font-medium mt-1.5 px-1">{error}</p>}
    </div>
  );
};

export default InputWithIcon;
