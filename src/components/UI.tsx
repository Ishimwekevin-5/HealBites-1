import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-[#5A5A40] text-white hover:bg-[#4A4A30] shadow-sm',
      secondary: 'bg-white text-[#5A5A40] border border-[#5A5A40] hover:bg-[#F5F5F0]',
      outline: 'bg-transparent border border-gray-200 text-gray-700 hover:bg-gray-50',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-2.5',
      lg: 'px-8 py-3.5 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          variant === 'primary' ? variants.primary : variant === 'secondary' ? variants.secondary : variant === 'outline' ? variants.outline : variants.ghost,
          size === 'sm' ? sizes.sm : size === 'md' ? sizes.md : sizes.lg,
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

interface CardProps {
  children: ReactNode;
  className?: string;
  key?: string | number;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white rounded-[32px] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden', className)}>
      {children}
    </div>
  );
}
