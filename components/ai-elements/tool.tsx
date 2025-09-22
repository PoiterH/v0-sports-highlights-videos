"use client";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  CodeIcon,
  Loader2Icon,
  SearchIcon,
  TerminalIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible className={cn("space-y-2", className)} {...props} />
);

const toolIcons = {
  web_search: SearchIcon,
  code_execution: CodeIcon,
  terminal: TerminalIcon,
} as const;

const toolLabels = {
  web_search: "Web Search",
  code_execution: "Code Execution",
  terminal: "Terminal",
} as const;

export type ToolHeaderProps = ComponentProps<typeof CollapsibleTrigger> & {
  type: keyof typeof toolIcons | string;
  state: "input-available" | "output-available" | "running" | "error";
};

export const ToolHeader = ({
  className,
  type,
  state,
  ...props
}: ToolHeaderProps) => {
  const IconComponent = toolIcons[type as keyof typeof toolIcons] || CodeIcon;
  const label = toolLabels[type as keyof typeof toolLabels] || type;

  const getStateInfo = () => {
    switch (state) {
      case "running":
        return {
          icon: <Loader2Icon className="size-3 animate-spin" />,
          badge: "Running",
          variant: "secondary" as const,
        };
      case "output-available":
        return {
          icon: <ChevronDownIcon className="size-3" />,
          badge: "Completed",
          variant: "default" as const,
        };
      case "error":
        return {
          icon: <ChevronDownIcon className="size-3" />,
          badge: "Error",
          variant: "destructive" as const,
        };
      default:
        return {
          icon: <ChevronDownIcon className="size-3" />,
          badge: "Available",
          variant: "secondary" as const,
        };
    }
  };

  const stateInfo = getStateInfo();

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center gap-2 rounded-md border p-3 text-left text-sm hover:bg-accent/50",
        className
      )}
      {...props}
    >
      <IconComponent className="size-4 flex-shrink-0" />
      <span className="flex-1 font-medium">{label}</span>
      <Badge variant={stateInfo.variant}>{stateInfo.badge}</Badge>
      {stateInfo.icon}
    </CollapsibleTrigger>
  );
};

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn("space-y-2 overflow-hidden", className)}
    {...props}
  />
);

export type ToolInputProps = {
  input: unknown;
  className?: string;
};

export const ToolInput = ({ input, className }: ToolInputProps) => {
  const formatInput = (data: unknown) => {
    if (typeof data === "string") {
      return data;
    }
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm font-medium text-muted-foreground">Input:</div>
      <div className="rounded-md bg-muted p-3">
        <pre className="text-sm">{formatInput(input)}</pre>
      </div>
    </div>
  );
};

export type ToolOutputProps = {
  output?: unknown;
  errorText?: string;
  className?: string;
};

export const ToolOutput = ({
  output,
  errorText,
  className,
}: ToolOutputProps) => {
  const formatOutput = (data: unknown) => {
    if (typeof data === "string") {
      return data;
    }
    return JSON.stringify(data, null, 2);
  };

  if (errorText) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="text-sm font-medium text-destructive">Error:</div>
        <div className="rounded-md bg-destructive/10 p-3 text-destructive">
          <pre className="text-sm">{errorText}</pre>
        </div>
      </div>
    );
  }

  if (!output) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm font-medium text-muted-foreground">Output:</div>
      <div className="rounded-md bg-muted p-3">
        <SyntaxHighlighter
          language="json"
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.875rem",
          }}
        >
          {formatOutput(output)}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};