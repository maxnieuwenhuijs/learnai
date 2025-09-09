import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
        secondary:
          "border-transparent bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
        destructive:
          "border-transparent bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100",
        outline: "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300",
        success: "border-transparent bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
        warning: "border-transparent bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
        info: "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
