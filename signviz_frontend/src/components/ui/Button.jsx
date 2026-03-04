import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  primary: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-sm hover:shadow-lg border-0',
  secondary: 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-sm hover:shadow-lg border-0',
  accent: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl', // Keeping generic for now or mapping to primary
  outline: 'border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700 hover:border-cyan-500 hover:text-cyan-600',
  ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
  link: 'text-cyan-600 underline-offset-4 hover:underline',
};

const Button = forwardRef(({ className, variant = 'primary', size = 'default', isLoading, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
        size === 'default' && 'h-11 px-5 py-2',
        size === 'sm' && 'h-9 rounded-lg px-3 text-sm',
        size === 'lg' && 'h-14 rounded-2xl px-8 text-lg',
        buttonVariants[variant],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
