import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
  {
    variants: {
      variant: {
        default: "bg-[#f5f5f5] text-[#0a0a0a] hover:bg-[#d4d4d8] focus-visible:ring-[#f5f5f5]",
        secondary:
          "border border-[#1f1f1f] bg-[#111] text-[#f5f5f5] hover:bg-[#171717] focus-visible:ring-[#3f3f46]",
        destructive: "bg-[#b91c1c] text-[#f5f5f5] hover:bg-[#991b1b] focus-visible:ring-[#b91c1c]",
        ghost:
          "text-[#a1a1aa] hover:bg-[#171717] hover:text-[#f5f5f5] focus-visible:ring-[#3f3f46]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
