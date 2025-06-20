"use client";

import type { ComponentPropsWithRef } from "react";
import type { DialogProps as DrawerPropsRoot } from "vaul";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

type DrawerProps<T extends "Overlay" | "Content" | "Title" | "Description"> =
  ComponentPropsWithRef<(typeof DrawerPrimitive)[T]>;

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: DrawerPropsRoot) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = ({
  className,
  ref,
  ...props
}: DrawerProps<"Overlay">) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
);
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = ({
  className,
  children,
  ref,
  ...props
}: DrawerProps<"Content">) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border",
        className
      )}
      {...props}>
      <div className="bg-muted mx-auto mt-4 h-2 w-[100px] rounded-full" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
);
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: ComponentPropsWithRef<"div">) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = ({ className, ref, ...props }: DrawerProps<"Title">) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg leading-none font-semibold tracking-tight",
      className
    )}
    {...props}
  />
);
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = ({
  className,
  ref,
  ...props
}: DrawerProps<"Description">) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
);
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  type DrawerProps
};
