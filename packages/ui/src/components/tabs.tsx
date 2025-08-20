"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@marble/ui/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "default" | "underline";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center",
      variant === "default" && "h-10 rounded-md bg-muted p-1",
      variant === "underline" && "h-10 border-b border-border",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "default" | "underline";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variant === "default" &&
        "rounded-sm px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs",
      variant === "underline" &&
        "px-4 py-2 -mb-px border-transparent hover:bg-muted border-b-2 data-[state=active]:text-primary data-[state=active]:border-primary",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
