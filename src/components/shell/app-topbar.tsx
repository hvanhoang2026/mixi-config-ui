import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useAuth } from '../../features/auth/AuthProvider';
import { readStoredAuth } from '../../features/auth/authStorage';

export function AppTopbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const overlayRef = useRef<OverlayPanel>(null);
  const [storedAvatarUrl, setStoredAvatarUrl] = useState<string | null>(null);
  const displayName = user?.fullName || user?.email || 'User';
  const email = user?.email || 'No email';
  const avatarText = displayName.slice(0, 2).toUpperCase();
  const avatarUrl = user?.avatarUrl || storedAvatarUrl;

  useEffect(() => {
    const stored = readStoredAuth();
    setStoredAvatarUrl(stored?.user?.avatarUrl ?? null);
  }, []);

  async function handleLogout() {
    overlayRef.current?.hide();
    await logout();
    router.replace('/login');
  }

  return (
    <div className="app-topbar">
      <a href="/config-center" className="app-topbar__brand">
        <div className="app-topbar__brand-mark">M</div>
        <span>MIXI CONFIG</span>
      </a>

      <div className="app-topbar__search">
        <i className="pi pi-search" />
        <InputText placeholder="Search project, env, key..." />
      </div>

      <div className="app-topbar__actions">
        <Button icon="pi pi-calendar" rounded text severity="secondary" className="app-topbar__action" />
        <Button icon="pi pi-cog" rounded text severity="secondary" className="app-topbar__action" />
        <button
          type="button"
          className="app-topbar__profile app-topbar__profile-button"
          onClick={(event) => overlayRef.current?.toggle(event)}
          aria-haspopup
          aria-controls="app-topbar-profile-panel"
        >
          <div className="app-topbar__avatar">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="app-topbar__avatar-image" />
            ) : (
              avatarText
            )}
          </div>
          <div className="app-topbar__profile-copy">
            <strong>{displayName}</strong>
          </div>
          <i className="pi pi-angle-down app-topbar__profile-caret" />
        </button>
        <OverlayPanel ref={overlayRef} id="app-topbar-profile-panel" className="app-topbar__panel">
          <div className="app-topbar__panel-card">
            <div className="app-topbar__panel-header">
              <div className="app-topbar__avatar app-topbar__avatar--large">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={displayName} className="app-topbar__avatar-image" />
                ) : (
                  avatarText
                )}
              </div>
              <div className="app-topbar__panel-copy">
                <strong>{displayName}</strong>
                <span>{email}</span>
                <small>{user?.tenantName || 'Config Center workspace'}</small>
              </div>
            </div>
            <button type="button" className="app-topbar__panel-item" onClick={handleLogout}>
              <i className="pi pi-sign-out" />
              <span>Logout</span>
            </button>
          </div>
        </OverlayPanel>
      </div>
    </div>
  );
}
