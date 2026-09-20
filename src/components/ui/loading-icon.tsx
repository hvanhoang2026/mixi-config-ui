"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

type LoadingIconProps = {
  label?: string;
  size?: number;
};

export function LoadingIcon({
  label = "Loading workspace",
  size = 28,
}: LoadingIconProps) {
  return (
    <Box
      className="loading-icon"
      role="status"
      aria-label={label}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <CircularProgress size={size} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
