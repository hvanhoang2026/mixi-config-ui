import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Button, Skeleton } from "./antd-adapter";

describe("Ant Design migration adapter", () => {
  it("maps legacy icon names to Ant icons and preserves button behavior", () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button label="Add config" icon="pi pi-plus" onClick={onClick} />,
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
