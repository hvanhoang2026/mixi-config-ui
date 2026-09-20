"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { Upload } from "@mui/icons-material";

type Props = {
  visible: boolean;
  value: string;
  projectName?: string;
  serviceName?: string;
  environmentName?: string;
  onChange: (value: string) => void;
  onHide: () => void;
  onImport: () => Promise<void>;
};

export function ImportEnvDialog({
  visible,
  value,
  projectName,
  serviceName,
  environmentName,
  onChange,
  onHide,
  onImport,
}: Props) {
  const [importing, setImporting] = useState(false);

  const submitImport = async () => {
    setImporting(true);
    try {
      await onImport();
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog
      open={visible}
      onClose={() => !importing && onHide()}
      maxWidth="md"
      fullWidth
      data-testid="import-env-dialog"
      PaperProps={{ sx: { maxWidth: 760 } }}
    >
      <DialogTitle>Import Service ENV</DialogTitle>
      <DialogContent dividers>
        <Box
          data-testid="import-env-scope"
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 1,
            backgroundColor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Target scope
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {serviceName
              ? `${serviceName} / ${environmentName ?? "No environment"}`
              : "No service selected"}
            {projectName ? ` / ${projectName}` : ""}
          </Typography>
        </Box>
        <TextField
          fullWidth
          multiline
          rows={16}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste KEY=value pairs here"
          data-testid="import-env-textarea"
          sx={{ fontFamily: "monospace" }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onHide}
          disabled={importing}
          data-testid="import-env-close-button"
        >
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={importing ? undefined : <Upload />}
          disabled={importing}
          onClick={submitImport}
          data-testid="import-env-submit-button"
        >
          {importing ? "Importing..." : "Import"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}