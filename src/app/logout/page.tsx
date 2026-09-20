"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../features/auth/AuthProvider";
import { Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    void logout().finally(() => {
      window.setTimeout(() => router.replace("/login"), 300);
    });
  }, [logout, router]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        backgroundColor: "background.default",
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              background: "linear-gradient(135deg, #0f766e 0%, #0d6e67 100%)",
              color: "white",
              fontWeight: 700,
              fontSize: "1.5rem",
            }}
          >
            M
          </Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Mixi Config
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mt: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Signing you out...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
