import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap tracking-wider text-sm font-medium active:shadow-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border border-primary text-white font-bold uppercase bg-primary shadow-[6px_6px_0px_rgba(0,0,0,0.1)] transition-all duration-200 ease-in-out active:translate-x-1 active:translate-y-1 hover:bg-accent hover:text-primary active:translate-x-1 active:translate-y-1 active:shadow-[0_0px_0px_0px_inset,#FFF_0px_0px_0_-1px,#000_0px_0px]',
        destructive:
          'border border-destructive font-bold uppercase bg-destructive text-destructive-foreground shadow-[6px_6px_0px_rgba(0,0,0,0.1)] hover:bg-destructive/90 active:translate-x-1 active:translate-y-1',
        outline:
          'font-bold uppercase border border-primary bg-background transition-all duration-200 ease-in-out shadow-[6px_6px_0px_rgba(0,0,0,0.1)] active:translate-x-1 active:translate-y-1 hover:bg-accent',
        secondary:
          'font-bold uppercase border border-slate-300 bg-secondary text-secondary-foreground transition-all duration-200 ease-in-out shadow-[6px_6px_0px_rgba(0,0,0,0.1)] active:translate-x-1 active:translate-y-1',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-12 px-6 py-2',
        xs: 'h-8 px-4',
        sm: 'h-10 px-5',
        lg: 'h-14 px-8',
        xl: 'h-16 px-8',
        icon: 'h-10 w-10',
        auto: 'h-auto w-auto'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  formAction?: string | ((formData: FormData) => void);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
