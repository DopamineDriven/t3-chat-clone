"use client";

import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

type AvatarProps<T extends "Root" | "Image" | "Fallback"> = {
  [P in T]: ComponentPropsWithRef<(typeof AvatarPrimitive)[P]>;
}[T];

function Avatar({ className, ref, ...props }: AvatarProps<"Root">) {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-sm",
        className
      )}
      {...props}
    />
  );
}
Avatar.displayName = AvatarPrimitive.Root.displayName;

function AvatarImage({ className, ref, ...props }: AvatarProps<"Image">) {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  );
}
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

function AvatarFallback({ className, ref, ...props }: AvatarProps<"Fallback">) {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "bg-muted flex h-full w-full items-center justify-center rounded-sm",
        className
      )}
      {...props}
    />
  );
}
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback, type AvatarProps };
