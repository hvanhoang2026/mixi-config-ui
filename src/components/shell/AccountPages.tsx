"use client";

import { useState, type ReactNode } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Avatar,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Chip,
} from "@mui/material";
import {
  Person,
  Settings,
  Security,
  Visibility,
  VisibilityOff,
  Save,
  Edit,
  PhotoCamera,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface UserInfo {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  tenantName?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  bio?: string | null;
  birthday?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  website?: string | null;
  locale?: string;
  timeZone?: string;
  theme?: string;
  colorScheme?: "light" | "dark";
  notifications?: Record<string, boolean>;
}

interface AccountSettings {
  locale?: string;
  timeZone?: string;
  theme?: string;
  colorScheme?: "light" | "dark";
  notifications?: Record<string, boolean | undefined>;
}

interface AccountPagesProps {
  page: "profile" | "settings" | "security";
  user: UserInfo;
  settings: AccountSettings;
  activeTheme?: string;
  mfaEnabled: boolean;
  authApiBaseUrl: string;
  ecmApiBaseUrl: string;
  api: {
    updateMySettings: (token: string, nextSettings: AccountSettings) => Promise<{ profile: AccountSettings }>;
  };
  onMfaEnabledChange: (enabled: boolean) => void;
  onUserUpdated: (updates: ProfileUpdate) => void;
  onSettingsUpdated: (updates: AccountSettings) => void;
}

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  birthday: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const settingsSchema = z.object({
  locale: z.string().optional(),
  timeZone: z.string().optional(),
  theme: z.string().optional(),
  colorScheme: z.enum(["light", "dark"]).optional(),
  notifications: z.record(z.boolean().optional()).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type SettingsForm = z.infer<typeof settingsSchema>;

export type ProfileUpdate = Partial<ProfileForm> & {
  role?: string;
  avatarUrl?: string;
};

export function AccountPages({
  page,
  user,
  settings,
  activeTheme,
  mfaEnabled,
  authApiBaseUrl,
  ecmApiBaseUrl,
  api,
  onMfaEnabledChange,
  onUserUpdated,
  onSettingsUpdated,
}: AccountPagesProps) {
  const [activeTab, setActiveTab] = useState(page);
  const [message, setMessage] = useState<{ severity: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl ?? null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.fullName ?? user.name ?? "",
      email: user.email ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
      bio: user.bio ?? "",
      birthday: user.birthday ?? "",
      address: user.address ?? "",
      city: user.city ?? "",
      country: user.country ?? "",
      jobTitle: user.jobTitle ?? "",
      department: user.department ?? "",
      website: user.website ?? "",
    },
  });

  const settingsForm = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      locale: settings.locale ?? "en",
      timeZone: settings.timeZone ?? "UTC",
      theme: settings.theme ?? activeTheme ?? "system",
      colorScheme: settings.colorScheme ?? "light",
      notifications: settings.notifications ?? {},
    },
  });

  const handleProfileSubmit = async (data: ProfileForm) => {
    setSaving(true);
    setMessage(null);
    try {
      onUserUpdated(data);
      setMessage({ severity: "success", text: "Profile updated successfully" });
    } catch (error) {
      setMessage({ severity: "error", text: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSubmit = async (data: SettingsForm) => {
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("mixi.shared.accessToken");
      if (token) {
        await api.updateMySettings(token, data);
      }
      onSettingsUpdated(data);
      setMessage({ severity: "success", text: "Settings saved successfully" });
    } catch (error) {
      setMessage({ severity: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleMfaToggle = async () => {
    setMessage(null);
    try {
      onMfaEnabledChange(!mfaEnabled);
      setMessage({
        severity: "success",
        text: mfaEnabled ? "MFA disabled" : "MFA enabled",
      });
    } catch (error) {
      setMessage({ severity: "error", text: "Failed to update MFA" });
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderProfileTab = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card>
        <CardHeader
          avatar={
            <Avatar
              src={avatarPreview ?? undefined}
              alt={user.name}
              sx={{ width: 60, height: 60, fontSize: "1.5rem" }}
            >
              {avatarPreview ? null : user.name.charAt(0).toUpperCase()}
            </Avatar>
          }
          title="Profile Information"
          subheader="Manage your personal information and avatar"
          action={
            <Button
              variant="outlined"
              startIcon={<PhotoCamera />}
              onClick={() => document.getElementById("avatar-upload")?.click()}
              size="small"
            >
              Change Avatar
            </Button>
          }
        />
        <CardContent>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  {...profileForm.register("fullName")}
                  error={!!profileForm.formState.errors.fullName}
                  helperText={profileForm.formState.errors.fullName?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  {...profileForm.register("email")}
                  error={!!profileForm.formState.errors.email}
                  helperText={profileForm.formState.errors.email?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  {...profileForm.register("firstName")}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  {...profileForm.register("lastName")}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  {...profileForm.register("phone")}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  {...profileForm.register("jobTitle")}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  {...profileForm.register("department")}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  type="url"
                  {...profileForm.register("website")}
                  error={!!profileForm.formState.errors.website}
                  helperText={profileForm.formState.errors.website?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Birthday"
                  type="date"
                  {...profileForm.register("birthday")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Bio"
                  {...profileForm.register("bio")}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  {...profileForm.register("address")}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  {...profileForm.register("city")}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  {...profileForm.register("country")}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={() => profileForm.reset()}>
                Reset
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Account Information" subheader="Read-only account details" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user.role}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Tenant
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user.tenantName ?? "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const renderSettingsTab = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card>
        <CardHeader title="Appearance" subheader="Customize how the application looks" />
        <CardContent>
          <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Language"
                  {...settingsForm.register("locale")}
                  SelectProps={{ native: true }}
                >
                  <option value="en">English</option>
                  <option value="vi">Vietnamese</option>
                  <option value="zh">Chinese</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Time Zone"
                  {...settingsForm.register("timeZone")}
                  SelectProps={{ native: true }}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Ho_Chi_Minh">Ho Chi Minh</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Theme"
                  {...settingsForm.register("theme")}
                  SelectProps={{ native: true }}
                >
                  <option value="system">System Default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="high-contrast">High Contrast</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Color Scheme"
                  {...settingsForm.register("colorScheme")}
                  SelectProps={{ native: true }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </TextField>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Notifications
            </Typography>
            <Grid container spacing={2}>
              {[
                { key: "email", label: "Email Notifications" },
                { key: "push", label: "Push Notifications" },
                { key: "inApp", label: "In-App Notifications" },
                { key: "marketing", label: "Marketing Emails" },
              ].map((notification) => (
                <Grid item xs={12} sm={6} key={notification.key}>
                  <FormControlLabel
                    control={
                      <Switch
                        {...settingsForm.register(`notifications.${notification.key}`)}
                        checked={settingsForm.watch(`notifications.${notification.key}`) ?? true}
                      />
                    }
                    label={notification.label}
                  />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );

  const renderSecurityTab = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card>
        <CardHeader
          title="Two-Factor Authentication"
          subheader="Add an extra layer of security to your account"
        />
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {mfaEnabled ? "MFA Enabled" : "MFA Disabled"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mfaEnabled
                  ? "Your account is protected with two-factor authentication"
                  : "Enable MFA to add an extra layer of security"}
              </Typography>
            </Box>
            <Button
              variant={mfaEnabled ? "outlined" : "contained"}
              startIcon={mfaEnabled ? <Security /> : <Security />}
              onClick={handleMfaToggle}
              disabled={saving}
            >
              {mfaEnabled ? "Disable MFA" : "Enable MFA"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Change Password" subheader="Update your password" />
        <CardContent>
          <form>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type={showCurrentPassword ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="contained" startIcon={<Save />} disabled={saving}>
                Update Password
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Active Sessions" subheader="Manage your active login sessions" />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Session management feature coming soon.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", width: "100%" }}>
      {message && (
        <Alert
          severity={message.severity}
          onClose={() => setMessage(null)}
          sx={{ mb: 2 }}
        >
          {message.text}
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value as "profile" | "settings" | "security")}
        variant="fullWidth"
        sx={{ mb: 3, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Tab
          icon={<Person />}
          label="Profile"
          value="profile"
          disabled={page !== "profile"}
        />
        <Tab
          icon={<Settings />}
          label="Settings"
          value="settings"
          disabled={page !== "settings"}
        />
        <Tab
          icon={<Security />}
          label="Security"
          value="security"
          disabled={page !== "security"}
        />
      </Tabs>

      {activeTab === "profile" && renderProfileTab()}
      {activeTab === "settings" && renderSettingsTab()}
      {activeTab === "security" && renderSecurityTab()}
    </Box>
  );
}