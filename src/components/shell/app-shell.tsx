'use client';

import type { ReactNode } from 'react';
import { AppSidebar } from './app-sidebar';
import { AppTopbar } from './app-topbar';

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  aside?: ReactNode;
  navigation?: ReactNode;
};

export function AppShell({ title, subtitle, children, aside, navigation }: Props) {
  return (
    <div className="app-shell">
      <AppSidebar navigation={navigation} />
      <div className="app-shell__content">
        <AppTopbar />
        <main className="app-shell__main">
          <header className="page-header">
            <div>
              <span className="page-header__eyebrow">Mixi Platform</span>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            <div className="page-header__meta">
              <span className="page-header__chip">
                <i className="pi pi-shield" />
                Secure config workspace
              </span>
              <span className="page-header__chip page-header__chip--soft">
                <i className="pi pi-sync" />
                Live operational controls
              </span>
            </div>
          </header>

          <div className="app-shell__body">
            <section className="app-shell__primary">{children}</section>
            {aside ? <aside className="app-shell__aside">{aside}</aside> : null}
          </div>
        </main>
      </div>
    </div>
  );
}
