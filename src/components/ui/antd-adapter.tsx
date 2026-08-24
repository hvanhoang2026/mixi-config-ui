"use client";

import {
  AntdButton,
  AntdCheckbox,
  AntdInput,
  AntdModal,
  AntdSelect,
  AntdTextArea,
} from "@w-iris/react";
import { Skeleton as AntSkeleton } from "antd";
import React, { type CSSProperties, type ReactNode } from "react";

type AdapterProps = {
  icon?: ReactNode;
  children?: ReactNode;
  [key: string]: unknown;
};

export function Button({ icon, ...props }: AdapterProps) {
  return <AntdButton {...props} icon={icon} />;
}

export const Checkbox = AntdCheckbox;
export const Dialog = AntdModal;
export const Dropdown = AntdSelect;
export const InputText = AntdInput;
export const InputTextarea = AntdTextArea;

type SkeletonProps = {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  borderRadius?: CSSProperties["borderRadius"];
  shape?: "circle" | "square";
  size?: CSSProperties["width"];
  className?: string;
};

export function Skeleton({
  width = "100%",
  height = "1rem",
  borderRadius,
  shape,
  size,
  className,
}: SkeletonProps) {
  if (shape === "circle") {
    const avatarSize = toPixels(size ?? width ?? height);
    return (
      <AntSkeleton.Avatar
        active
        className={className}
        shape="circle"
        size={avatarSize}
      />
    );
  }

  return (
    <AntSkeleton.Input
      active
      block
      className={className}
      style={{ width, height, minWidth: 0, borderRadius }}
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
