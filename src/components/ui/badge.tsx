import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-[#1f1f1f] bg-[#111] text-[#f5f5f5]",
        secondary: "border-[#27272a] bg-[#18181b] text-[#a1a1aa]",
        info: "border-[#1d4ed8] bg-[#0f172a] text-[#93c5fd]",
        success: "border-[#166534] bg-[#052e16] text-[#86efac]",
        destructive: "border-[#7f1d1d] bg-[#450a0a] text-[#fca5a5]",
        warning: "border-[#854d0e] bg-[#422006] text-[#fde68a]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
