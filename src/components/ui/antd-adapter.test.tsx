import { fireEvent, render, screen } from "@testing-library/react";
import { PlusOutlined } from "@ant-design/icons";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Button, Skeleton } from "./antd-adapter";

describe("Ant Design migration adapter", () => {
  it("renders Ant icons and preserves button behavior", () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button
        label="Add config"
        icon={<PlusOutlined aria-hidden="true" />}
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add config" }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(container.querySelector(".anticon-plus")).not.toBeNull();
  });

  it("renders geometry-compatible circular skeletons", () => {
    const { container } = render(<Skeleton shape="circle" size="2rem" />);

    expect(
      container.querySelector(".ant-skeleton-avatar-circle"),
    ).not.toBeNull();
  });
});
