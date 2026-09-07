"use client";

import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

type LoadingIconProps = {
  label?: string;
  size?: number;
};

export function LoadingIcon({
  label = "Loading workspace",
  size = 28,
}: LoadingIconProps) {
  return (
    <span className="loading-icon" role="status" aria-label={label}>
      <Spin indicator={<LoadingOutlined spin style={{ fontSize: size }} />} />
    </span>
  );
}
