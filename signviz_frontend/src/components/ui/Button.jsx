import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  // Primary — Indigo 600
  primary:
    'bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow-md transition-all border-0 rounded-xl',

  // Secondary — Slate 100
  secondary:
    'bg-secondary hover:bg-slate-200 text-secondary-foreground shadow-sm hover:shadow-md border-0 rounded-xl',

  // Gradient — Indigo to Violet
  gradient:
    'bg-gradient-to-br from-primary to-accent text-white shadow-md hover:shadow-lg hover:scale-[1.02] border-0 rounded-xl',

  // Outlined — Indigo border
  outline:
    'border-2 border-primary/20 bg-transparent hover:bg-primary/5 text-primary hover:border-primary/40 transition-all rounded-xl',

  // Ghost — transparent
  ghost:
    'hover:bg-primary/10 text-primary transition-colors rounded-xl',

  // Accent — Violet
  accent:
    'bg-accent hover:bg-violet-600 text-white shadow-sm rounded-xl',

  // Link
  link: 'text-primary underline-offset-4 hover:underline decoration-primary/30',
};

const Button = forwardRef(
  ({ className, variant = 'primary', size = 'default', isLoading, asChild, children, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 active:scale-95',
          size === 'default' && 'h-11 px-6 text-sm',
          size === 'sm'      && 'h-9 px-4 text-xs',
          size === 'lg'      && 'h-12 px-8 text-base',
          buttonVariants[variant] ?? buttonVariants.primary,
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
export { Button };