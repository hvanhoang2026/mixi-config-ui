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
  CircularProgress,
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

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 52,
    borderRadius: 1.5,
    backgroundColor: "background.paper",
    transition: "box-shadow 150ms ease, border-color 150ms ease",
    "&.Mui-focused": {
      boxShadow: "0 0 0 3px rgba(15, 118, 110, 0.14)",
    },
  },
  "& .MuiInputBase-input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 100px var(--mui-palette-background-paper) inset",
    WebkitTextFillColor: "var(--mui-palette-text-primary)",
    caretColor: "var(--mui-palette-text-primary)",
  },
};

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
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 6 },
        backgroundColor: "background.default",
        backgroundImage:
          "linear-gradient(rgba(15, 118, 110, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 118, 110, 0.035) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <Card
        component="section"
        aria-labelledby="login-title"
        sx={{
          maxWidth: 472,
          width: "100%",
          overflow: "hidden",
          borderRadius: { xs: 2, sm: 3 },
          borderColor: "rgba(15, 118, 110, 0.18)",
          borderTop: "4px solid",
          borderTopColor: "primary.main",
          boxShadow: "0 24px 56px -32px rgba(15, 23, 42, 0.38)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2.5,
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 800,
                fontSize: "1.25rem",
                letterSpacing: "-0.04em",
              }}
              aria-hidden="true"
            >
              M
            </Box>
            <Typography
              id="login-title"
              component="h1"
              variant="h4"
              sx={{ fontWeight: 700, letterSpacing: "-0.025em", mb: 0.75 }}
            >
              Mixi Config
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 360 }}
            >
              {showMfa ? "Security verification" : "Sign in to your account"}
            </Typography>
          </Box>

          {message && (
            <Alert
              severity={message.severity}
              onClose={() => setMessage(null)}
              role="status"
              sx={{ mb: 3, borderRadius: 1.5 }}
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
                <Grid container spacing={2.5}>
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
                      sx={fieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Security color="action" aria-hidden="true" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: "flex", gap: 2, mb: 1, mt: 1 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    fullWidth
                    onClick={handleBackToEmail}
                    startIcon={<Person />}
                    sx={{ minHeight: 48 }}
                  >
                    Use another account
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      autoComplete="email"
                      {...form.register("email")}
                      error={!!form.formState.errors.email}
                      helperText={form.formState.errors.email?.message}
                      sx={fieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" aria-hidden="true" />
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
                      sx={fieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" aria-hidden="true" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              onClick={() =>
                                setShowPassword((visible) => !visible)
                              }
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
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
                      sx={{
                        ml: -0.5,
                        "& .MuiFormControlLabel-label": {
                          color: "text.secondary",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            <Box sx={{ mt: 3.5 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                aria-busy={loading}
                startIcon={
                  showMfa ? (
                    <Security />
                  ) : loading ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : (
                    <Person />
                  )
                }
                sx={{ minHeight: 52, borderRadius: 1.5, fontWeight: 700 }}
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

          <Divider sx={{ my: 3.5 }} />
          <Typography variant="body2" color="text.secondary">
            Don&apos;t have an account?{" "}
            <MuiLink
              href="/register"
              variant="body2"
              color="primary"
              sx={{ fontWeight: 700 }}
            >
              Register
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
