import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/90",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/90",
      },
      size: {
        default: "h-9 px-3 py-2 text-sm sm:h-10 sm:px-4 sm:text-base",
        sm: "h-8 px-2 py-1 text-xs sm:h-9 sm:px-3 sm:text-sm rounded-md",
        lg: "h-10 px-4 py-2 text-sm sm:h-11 sm:px-8 sm:text-base rounded-md",
        xl: "h-12 px-6 py-3 text-base sm:h-14 sm:px-10 sm:text-lg rounded-lg",
        icon: "h-9 w-9 sm:h-10 sm:w-10 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0",
        "icon-sm": "h-8 w-8 sm:h-9 sm:w-9 min-h-[40px] min-w-[40px] md:min-h-0 md:min-w-0",
        "icon-lg": "h-10 w-10 sm:h-12 sm:w-12 min-h-[48px] min-w-[48px] md:min-h-0 md:min-w-0",
        mobile: "h-12 px-4 py-3 text-base min-h-[44px] rounded-lg sm:h-10 sm:px-4 sm:py-2 sm:text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
