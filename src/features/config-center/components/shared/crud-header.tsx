"use client";

import type { ReactNode } from "react";
import { Button, Box } from "@mui/material";
import { Add } from "@mui/icons-material";

type Props = {
  onAdd: () => void;
  actions?: ReactNode;
};

export function CrudHeader({ onAdd, actions }: Props) {
  return (
    <Box
      data-testid="crud-header"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 2,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {actions}
      </Box>
      <Button
        data-testid="add-new-button"
        variant="contained"
        startIcon={<Add />}
        onClick={onAdd}
        size="small"
      >
        Add new
      </Button>
    </Box>
  );
}