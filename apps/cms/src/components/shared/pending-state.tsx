import type { PropsWithChildren, ReactNode } from "react";

export type PendingStateProps = PropsWithChildren<{
  icon: React.ElementType;
  title?: string;
  description?: ReactNode;
  learnMore?: string;
}>;

export function PendingState({
  icon: Icon,
  title,
  description,
  learnMore,
  children,
}: PendingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-y-4">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
        <Icon className="size-6" />
      </div>
      {title && (
        <p className="text-center text-base font-medium text-gray-950">
          {title}
        </p>
      )}
      {description && (
        <p className="max-w-sm text-balance text-center text-sm text-gray-500">
          {description}{" "}
          {learnMore && (
            <a
              href={learnMore}
              target="_blank"
              className="underline underline-offset-2 hover:text-gray-800"
              rel="noreferrer"
            >
              Learn more ↗
            </a>
          )}
        </p>
      )}
      {children}
    </div>
  );
}
