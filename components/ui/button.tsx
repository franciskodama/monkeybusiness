import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'text-white font-semibold uppercase bg-primary shadow-[0_0px_0px_0px_inset,#FFF_-3px_3px_0_-1px,#0F1739_-3px_3px] transition-all duration-200 ease-in-out hover:border hover:border-primary hover:bg-accent hover:text-primary active:-translate-x-[3px] active:translate-y-[3px] active:shadow-[0_0px_0px_0px_inset,#FFF_0px_0px_0_-1px,#000_0px_0px]',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'font-semibold uppercase border border-primary bg-background transition-all duration-200 ease-in-out shadow-[0_0px_0px_0px_inset,#FFF_-3px_3px_0_-1px,#0F1739_-3px_3px] hover:bg-accent active:-translate-x-[3px] active:translate-y-[3px] active:shadow-[0_0px_0px_0px_inset,#FFF_0px_0px_0_-1px,#000_0px_0px]',
        secondary:
          'bg-secondary text-secondary-foreground transition-all duration-200 ease-in-out hover:translate-x-[5px] hover:-translate-y-[5px] hover:shadow-[0_0px_0px_0px_inset,#FFF_-5px_5px_0_-1px,#0F1739_-5px_5px]',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        xl: 'h-14 px-8',
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
  formAction?: any;
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
