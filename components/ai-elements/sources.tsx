"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, ExternalLinkIcon } from "lucide-react";
import type { ComponentProps } from "react";

export type SourcesProps = ComponentProps<typeof Collapsible>;

export const Sources = ({ className, ...props }: SourcesProps) => (
  <Collapsible className={cn("space-y-2", className)} {...props} />
);

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  count?: number;
};

export const SourcesTrigger = ({
  className,
  count,
  children,
  ...props
}: SourcesTriggerProps) => (
  <CollapsibleTrigger asChild {...props}>
    <Button
      className={cn(
        "h-auto gap-2 p-2 text-muted-foreground hover:text-foreground",
        className
      )}
      size="sm"
      variant="ghost"
    >
      {children ?? (
        <>
          <span className="text-xs">
            {count ? `${count} source${count !== 1 ? "s" : ""}` : "Sources"}
          </span>
          <ChevronDownIcon className="size-3 transition-transform group-data-[state=open]:rotate-180" />
        </>
      )}
    </Button>
  </CollapsibleTrigger>
);

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const SourcesContent = ({
  className,
  ...props
}: SourcesContentProps) => (
  <CollapsibleContent
    className={cn("space-y-2 overflow-hidden", className)}
    {...props}
  />
);

export type SourceProps = ComponentProps<"a"> & {
  title?: string;
};

export const Source = ({
  className,
  href,
  title,
  ...props
}: SourceProps) => (
  <a
    className={cn(
      "flex items-center gap-2 rounded-md border p-3 text-sm hover:bg-accent/50",
      className
    )}
    href={href}
    rel="noopener noreferrer"
    target="_blank"
    {...props}
  >
    <div className="flex-1">
      <div className="font-medium">{title || href}</div>
      {href && <div className="text-muted-foreground text-xs">{href}</div>}
    </div>
    <ExternalLinkIcon className="size-4 flex-shrink-0" />
  </a>
);