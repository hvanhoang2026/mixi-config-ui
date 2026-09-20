"use client";

import {
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Select,
  MenuItem,
  TextField,
  Typography,
  Skeleton,
  Box,
  Chip,
} from "@mui/material";
import {
  Cloud,
  Storage,
  Folder,
  Search,
} from "@mui/icons-material";
import type { ReactNode } from "react";

type Dashboard = {
  totalProjects?: number;
  totalServices?: number;
  totalEnvironments?: number;
  totalConfigs?: number;
};

type Option = {
  id: string;
  name: string;
};

type Props = {
  dashboard?: Dashboard;
  loading?: boolean;
  projectName?: string;
  services: Option[];
  environments: Option[];
  selectedServiceId: string;
  selectedEnvironmentId: string;
  search: string;
  actions?: ReactNode;
  onServiceChange: (value: string) => void;
  onEnvironmentChange: (value: string) => void;
  onSearchChange: (value: string) => void;
};

export function DashboardHeader({
  dashboard,
  loading = false,
  projectName,
  services,
  environments,
  selectedServiceId,
  selectedEnvironmentId,
  search,
  actions,
  onServiceChange,
  onEnvironmentChange,
  onSearchChange,
}: Props) {
  return (
    <Card
      data-testid="dashboard-header"
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        p: 3,
        backgroundColor: "background.paper",
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "text.secondary",
              display: "block",
              mb: 1,
            }}
          >
            Platform configuration ledger
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontSize: "1.75rem",
              fontWeight: 700,
              lineHeight: 1.2,
              mb: 1,
              color: "text.primary",
            }}
          >
            Configuration control
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 2, lineHeight: 1.6 }}
          >
            Select an operational scope, review governed values, and publish
            changes without losing service context.
          </Typography>
          {loading ? (
            <Skeleton variant="text" width="160" />
          ) : projectName ? (
            <Typography color="text.secondary">
              Current project:{' '}
              <Typography component="span" fontWeight={600}>
                {projectName}
              </Typography>
            </Typography>
          ) : null}
        </Grid>

        <Grid item xs={12} lg={6}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "text.secondary",
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Service
                </Typography>
                {loading ? (
                  <Skeleton variant="rectangular" height={40} />
                ) : (
                  <Select
                    value={selectedServiceId || ""}
                    onChange={(e) => onServiceChange(e.target.value)}
                    displayEmpty
                    sx={{ width: "100%", "& .MuiSelect-select": { paddingTop: 10, paddingBottom: 10 } }}
                    data-testid="service-selector"
                  >
                    <MenuItem value="">{services.length === 0 && "No services available"}</MenuItem>
                    {services.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "text.secondary",
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Environment
                </Typography>
                {loading ? (
                  <Skeleton variant="rectangular" height={40} />
                ) : (
                  <Select
                    value={selectedEnvironmentId || ""}
                    onChange={(e) => onEnvironmentChange(e.target.value)}
                    displayEmpty
                    sx={{ width: "100%", "& .MuiSelect-select": { paddingTop: 10, paddingBottom: 10 } }}
                    data-testid="environment-selector"
                  >
                    <MenuItem value="">{environments.length === 0 && "No environments available"}</MenuItem>
                    {environments.map((e) => (
                      <MenuItem key={e.id} value={e.id}>
                        {e.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </Grid>
            </Grid>

            {loading ? (
              <Skeleton variant="rectangular" height={40} width="100%" />
            ) : (
              <TextField
                fullWidth
                placeholder="Search service config keys"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                size="small"
                data-testid="config-search-input"
                aria-label="Search configuration keys"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {loading ? (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Skeleton variant="circular" width={120} height={40} />
                <Skeleton variant="circular" width={120} height={40} />
                <Skeleton variant="circular" width={120} height={40} />
              </Box>
            ) : actions ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {actions}
              </Box>
            ) : null}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            {[
              {
                title: "Services",
                value: dashboard?.totalServices,
                suffix: "Registered workloads",
                icon: <Cloud fontSize="large" />,
              },
              {
                title: "Environments",
                value: dashboard?.totalEnvironments,
                suffix: "Deployment scopes",
                icon: <Storage fontSize="large" />,
              },
              {
                title: "Config keys",
                value: dashboard?.totalConfigs,
                suffix: "Governed values",
                icon: <Folder fontSize="large" />,
              },
            ].map((stat) => (
              <Grid key={stat.title} item xs={12} sm={4}>
                {loading ? (
                  <Card variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
                    <Skeleton variant="text" width="100%" />
                  </Card>
                ) : (
                  <Card variant="outlined" sx={{ p: 2, borderColor: "divider", height: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: "primary.light",
                          color: "primary.contrastText",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          {stat.title}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            lineHeight: 1.2,
                            mb: 0.5,
                            color: "text.primary",
                          }}
                        >
                          {stat.value ?? 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.suffix}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                )}
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
}