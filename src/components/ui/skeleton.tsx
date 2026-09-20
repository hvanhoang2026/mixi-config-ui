"use client";

import { Skeleton as MuiSkeleton } from "@mui/material";
import React, { type CSSProperties } from "react";

type SkeletonProps = {
  width?: CSSProperties["width"] | number;
  height?: CSSProperties["height"] | number;
  borderRadius?: CSSProperties["borderRadius"];
  shape?: "circle" | "square";
  variant?: "text" | "rectangular" | "circular" | "rounded";
  size?: CSSProperties["width"];
  className?: string;
};

export function Skeleton({
  width = "100%",
  height = "1rem",
  borderRadius,
  shape,
  variant,
  size,
  className,
}: SkeletonProps) {
  if (shape === "circle" || variant === "circular") {
    const avatarSize = toPixels(size ?? width ?? height);
    return (
      <MuiSkeleton
        variant="circular"
        animation="wave"
        className={className}
        width={avatarSize}
        height={avatarSize}
      />
    );
  }

  return (
    <MuiSkeleton
      variant={variant ?? "rectangular"}
      animation="wave"
      className={className}
      style={{ minWidth: 0, borderRadius }}
      width={width}
      height={height}
    />
  );
}

function toPixels(value: CSSProperties["width"]): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 32;
  if (value.endsWith("rem")) return Number.parseFloat(value) * 16;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 32;
}