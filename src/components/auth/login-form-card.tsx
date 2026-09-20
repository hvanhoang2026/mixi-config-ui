"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../features/auth/AuthProvider";
import { getSafeNextPath } from "../../features/auth/safe-redirect";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  TextField,
  Typography,
} from "@mui/material";
import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  Security,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
  mfaCode: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginFormCard() {
  const { login, loading, isAuthenticated, initialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [message, setMessage] = useState<{
    severity: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;
    const next = getSafeNextPath(searchParams.get("next"));
    router.replace(next);
  }, [initialized, isAuthenticated, router, searchParams]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  if (!initialized) return null;

  const handleSubmit = async (data: LoginForm) => {
    setMessage(null);
    try {
      const result = await login(
        data.email,
        data.password,
        data.remember,
        showMfa ? data.mfaCode : undefined,
      );
      if (result?.requiresMfa) {
        setShowMfa(true);
        form.setValue("mfaCode", "");
        setMessage({
          severity: "info",
          text: "Enter the 6-digit MFA code from your authenticator app.",
        });
      }
    } catch (error) {
      setMessage({
        severity: "error",
        text: error instanceof Error ? error.message : "Invalid credentials",
      });
    }
  };

  const handleBackToEmail = () => {
    setShowMfa(false);
    setMessage(null);
  };

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
      <Card
        sx={{
          maxWidth: 440,
          width: "100%",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
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
                background:
                  "linear-gradient(135deg, #0f766e 0%, #0d6e67 100%)",
                color: "white",
                fontWeight: 700,
                fontSize: "1.5rem",
              }}
            >
              M
            </Box>
            <Typography
              variant="h5"
              fontWeight={700}
              color="text.primary"
              gutterBottom
            >
              Mixi Config
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {showMfa ? "Security verification" : "Sign in to your account"}
            </Typography>
          </Box>

          {message && (
            <Alert
              severity={message.severity}
              onClose={() => setMessage(null)}
              sx={{ mb: 3 }}
            >
              {message.text}
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {showMfa ? (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Enter the 6-digit MFA code for{" "}
                  <strong>{form.watch("email")}</strong>.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="MFA Code"
                      type="text"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      {...form.register("mfaCode", {
                        valueAsNumber: undefined,
                        onChange: (e) =>
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                      })}
                      placeholder="123456"
                      error={!!form.formState.errors.mfaCode}
                      helperText={form.formState.errors.mfaCode?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Security color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: "flex", gap: 2, mb: 2, mt: 1 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    fullWidth
                    onClick={handleBackToEmail}
                    startIcon={<Person />}
                  >
                    Use another account
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      autoComplete="email"
                      {...form.register("email")}
                      error={!!form.formState.errors.email}
                      helperText={form.formState.errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      {...form.register("password")}
                      error={!!form.formState.errors.password}
                      helperText={form.formState.errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Checkbox {...form.register("remember")} />}
                      label="Remember me"
                    />
                  </Grid>
                </Grid>
              </>
            )}

            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={
                  showMfa
                    ? <Security />
                    : loading
                      ? undefined
                      : <Person />}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                {loading
                  ? showMfa
                    ? "Verifying..."
                    : "Signing in..."
                  : showMfa
                    ? "Verify code"
                    : "Sign In"}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Don&apos;t have an account?{" "}
            <MuiLink href="/register" variant="body2" color="primary">
              Register
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}