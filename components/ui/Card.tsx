import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("bg-surface rounded-card shadow-card border border-white", className)}
      {...rest}
    />
  );
}

/** Card header row matching the reference: small icon chip + label + action arrow. */
export function CardTitle({
  icon,
  children,
  action,
  className,
}: {
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center gap-2.5", className)}>
      {icon && (
        <span className="grid size-7 place-items-center rounded-lg bg-ink text-white [&>svg]:size-3.5">
          {icon}
        </span>
      )}
      <span className="text-sm font-medium text-fog">{children}</span>
      {action && <span className="ml-auto">{action}</span>}
    </div>
  );
}
