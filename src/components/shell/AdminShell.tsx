"use client";

import { useState, type ReactNode } from "react";
import {
  AppBar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  ExpandMore,
  Menu as MenuIcon,
} from "@mui/icons-material";

export interface ShellMenuItem {
  label: ReactNode;
  icon?: ReactNode;
  href?: string;
  url?: string;
  target?: string;
}

interface AdminShellProps {
  brand: string;
  logo?: ReactNode;
  brandHref?: string;
  homeHref?: string;
  pageTitle: string;
  menu: ReadonlyArray<{
    label: string;
    icon?: string | ReactNode;
    items: ReadonlyArray<ShellMenuItem>;
  }>;
  activePath: string;
  onNavigate: (href: string) => void;
  user: ReactNode;
  children: ReactNode;
}

const DRAWER_WIDTH = 280;

export function AdminShell({
  brand,
  logo,
  brandHref = "/",
  pageTitle,
  menu,
  activePath,
  onNavigate,
  user,
  children,
}: AdminShellProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  const handleCollapseToggle = () => {
    setCollapsed((prev) => !prev);
  };

  const handleMenuItemClick = (item: ShellMenuItem) => {
    if (item.href) {
      onNavigate(item.href);
      if (isMobile) setDrawerOpen(false);
    } else if (item.url) {
      if (item.target === "_blank") {
        window.open(item.url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = item.url;
      }
    }
  };

  const toggleSubMenu = (label: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const renderMenuItems = (items: ReadonlyArray<ShellMenuItem>) => {
    return items.map((item, index) => {
      const labelText =
        typeof item.label === "string" ? item.label : `menu-item-${index}`;
      const isActive = Boolean(
        item.href === activePath ||
          (item.href && activePath.startsWith(`${item.href}/`)),
      );
      return (
        <ListItem
          key={`${labelText}-${index}`}
          disablePadding
sx={{
              "& .MuiListItemButton-root": {
                py: 1,
                px: 1.5,
                borderRadius: 1,
                backgroundColor: isActive ? "primary.light" : "transparent",
                color: isActive ? "primary.main" : "text.primary",
                "&:hover": {
                  backgroundColor: isActive ? "primary.main" : "action.hover",
                },
                "& .MuiListItemIcon-root": {
                  color: isActive ? "primary.main" : "inherit",
                },
              },
            }}
        >
          <ListItemButton
            onClick={() => handleMenuItemClick(item)}
            selected={isActive}
          >
            {item.icon ? (
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                {item.icon}
              </ListItemIcon>
            ) : null}
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      );
    });
  };

  const renderNavList = (showLabels: boolean) => (
    <List component="nav" aria-label="Main navigation" sx={{ px: 1 }}>
      {menu.map((section) => (
        <Box key={section.label}>
          {showLabels ? (
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                py: 1,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontSize: "0.72rem",
                fontWeight: 700,
                display: "block",
              }}
            >
              {section.label}
            </Typography>
          ) : null}
          {renderMenuItems(section.items)}
        </Box>
      ))}
    </List>
  );

  const brandBlock = (
    <Typography
      variant="h6"
      component="a"
      href={brandHref}
      sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
        fontWeight: 700,
        color: "text.primary",
        textDecoration: "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {logo}
      <span>{brand}</span>
    </Typography>
  );

  const drawerWidth = collapsed && !isMobile ? 72 : DRAWER_WIDTH;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "text.primary",
          zIndex: 1200,
        }}
      >
        <Toolbar>
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open navigation menu"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <IconButton
              color="inherit"
              aria-label={collapsed ? "expand sidebar" : "collapse sidebar"}
              edge="start"
              onClick={handleCollapseToggle}
              sx={{ mr: 2 }}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }} component="h1">
            <span style={{ display: "none" }}>{pageTitle}</span>
            {brandBlock}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {user}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? drawerOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: isMobile ? "block" : "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed && !isMobile ? "center" : "flex-start",
            px: 1,
          }}
        >
          {collapsed && !isMobile ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>{logo}</Box>
          ) : (
            brandBlock
          )}
          {isMobile ? (
            <IconButton onClick={handleDrawerToggle} aria-label="close navigation menu">
              <ChevronLeft />
            </IconButton>
          ) : null}
        </Toolbar>
        <Divider />
        <Box sx={{ flexGrow: 1, overflowY: "auto", py: 1 }}>
          {renderNavList(!collapsed || isMobile)}
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 11,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export function AdminShellSubMenu({
  label,
  children,
  defaultExpanded = false,
}: {
  label: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <Box>
      <ListItemButton
        onClick={() => setExpanded((prev) => !prev)}
        sx={{ py: 1, px: 1.5, borderRadius: 1 }}
      >
        <ListItemText primary={label} />
        <ExpandMore
          style={{
            transform: expanded ? "none" : "rotate(-90deg)",
            transition: "transform 150ms ease",
          }}
        />
      </ListItemButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 1 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}
