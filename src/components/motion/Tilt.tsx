import type { ReactNode } from "react";

/**
 * Formerly a pointer-driven 3D tilt. Retired with the marketplace redesign
 * (cards now lift with a shadow via their own hover styles); kept as a plain
 * wrapper so existing call sites need no changes.
 */
export function Tilt({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
  glare?: boolean;
}) {
  return <div className={className}>{children}</div>;
}
