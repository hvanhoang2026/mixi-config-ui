"use client";

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  HistoryOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SettingOutlined,
  SyncOutlined,
  UploadOutlined,
} from "@ant-design/icons";
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

const ICONS: Record<string, ReactNode> = {
  "pi pi-arrow-left": <ArrowLeftOutlined aria-hidden="true" />,
  "pi pi-arrow-right": <ArrowRightOutlined aria-hidden="true" />,
  "pi pi-check": <CheckOutlined aria-hidden="true" />,
  "pi pi-cog": <SettingOutlined aria-hidden="true" />,
  "pi pi-download": <DownloadOutlined aria-hidden="true" />,
  "pi pi-history": <HistoryOutlined aria-hidden="true" />,
  "pi pi-pencil": <EditOutlined aria-hidden="true" />,
  "pi pi-plus": <PlusOutlined aria-hidden="true" />,
  "pi pi-refresh": <ReloadOutlined aria-hidden="true" />,
  "pi pi-save": <SaveOutlined aria-hidden="true" />,
  "pi pi-sync": <SyncOutlined aria-hidden="true" />,
  "pi pi-trash": <DeleteOutlined aria-hidden="true" />,
  "pi pi-upload": <UploadOutlined aria-hidden="true" />,
};

type AdapterProps = {
  icon?: ReactNode | string;
  children?: ReactNode;
  [key: string]: unknown;
};

export function Button({ icon, ...props }: AdapterProps) {
  return (
    <AntdButton
      {...props}
      icon={typeof icon === "string" ? ICONS[icon] : icon}
    />
  );
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
