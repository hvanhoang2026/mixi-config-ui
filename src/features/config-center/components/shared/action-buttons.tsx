"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Delete, Edit, History } from "@mui/icons-material";
import type { EntityItem, EntityType } from "../../form-types";

type Props = {
  type: EntityType;
  row: EntityItem;
  onEdit: (type: EntityType, item: EntityItem) => void;
  onDelete: (type: EntityType, id: string) => Promise<void>;
  onHistory?: (configId: string) => void;
};

export function ActionButtons({
  type,
  row,
  onEdit,
  onDelete,
  onHistory,
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const displayName =
    (row as { name?: string; code?: string; key?: string }).name ??
    (row as { code?: string }).code ??
    (row as { key?: string }).key ??
    row.id;

  const confirmDelete = () => {
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(type, row.id);
    setDeleteOpen(false);
  };

  return (
    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
      <Tooltip title="Edit">
        <IconButton
          data-testid={`edit-${type}-${row.id}`}
          size="small"
          onClick={() => onEdit(type, row)}
          aria-label={`Edit ${type}`}
        >
          <Edit fontSize="small" />
        </IconButton>
      </Tooltip>
      {type === "config" && onHistory && (
        <Tooltip title="History">
          <IconButton
            data-testid={`history-config-${row.id}`}
            size="small"
            onClick={() => onHistory(row.id)}
            aria-label="View history"
          >
            <History fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Delete">
        <IconButton
          size="small"
          color="error"
          data-testid={`delete-${type}-${row.id}`}
          onClick={confirmDelete}
          aria-label={`Delete ${type}`}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="sm">
        <DialogTitle>Confirm Delete {type.charAt(0).toUpperCase() + type.slice(1)}?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete <strong>&quot;{displayName}&quot;</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}