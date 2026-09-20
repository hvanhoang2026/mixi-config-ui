"use client";

import { useState, type ReactNode } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Person,
  Settings,
  Security,
  Logout,
  ExpandMore,
} from "@mui/icons-material";

interface UserInfo {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  tenantName?: string | null;
}

interface UserMenuProps {
  user: UserInfo;
  items?: ReactNode;
  onLogout: () => Promise<void>;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await onLogout();
  };

  const handleProfileClick = (page: string) => {
    handleMenuClose();
    window.location.href = `/${page}`;
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Tooltip title={`${user.name} (${user.role})`}>
        <IconButton
          onClick={handleMenuOpen}
          sx={{
            p: 0.5,
            borderRadius: 2,
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              src={user.avatarUrl ?? undefined}
              alt={user.name}
              sx={{
                width: 32,
                height: 32,
                fontSize: "0.875rem",
                fontWeight: 600,
                backgroundColor: "primary.main",
              }}
            >
              {user.avatarUrl ? null : user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  color: "text.primary",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 150,
                }}
              >
                {user.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.75rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 150,
                }}
              >
                {user.email}
              </Typography>
            </Box>
            <ExpandMore sx={{ fontSize: 18, color: "text.secondary" }} />
          </Box>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            minWidth: 240,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 3,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          {user.tenantName && (
            <Typography variant="caption" color="text.secondary">
              {user.tenantName}
            </Typography>
          )}
        </Box>
        <MenuItem
          onClick={() => handleProfileClick("profile")}
          disabled={anchorEl === null}
        >
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <MenuItem
          onClick={() => handleProfileClick("settings")}
          disabled={anchorEl === null}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <MenuItem
          onClick={() => handleProfileClick("security")}
          disabled={anchorEl === null}
        >
          <ListItemIcon>
            <Security fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Security" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Sign out" />
        </MenuItem>
      </Menu>
    </Box>
  );
}