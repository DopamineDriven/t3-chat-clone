"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = ({
  className,
  value,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof ProgressPrimitive.Root>) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "bg-secondary relative h-4 w-full overflow-hidden rounded-full",
      className
    )}
    {...props}>
    <ProgressPrimitive.Indicator
      className="bg-primary h-full w-full flex-1 transition-all"
      style={{
        transform: value
          ? `translateX(-${100 - value}%)`
          : `translateX(-${100}%)`
      }}
    />
  </ProgressPrimitive.Root>
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
