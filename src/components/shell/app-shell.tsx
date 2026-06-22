'use client';

import type { ReactNode } from 'react';
import { AppSidebar } from './app-sidebar';
import { AppTopbar } from './app-topbar';

type Props = {
  children: ReactNode;
  aside?: ReactNode;
  navigation?: ReactNode;
};

export function AppShell({ children, aside, navigation }: Props) {
  return (
    <div className="app-shell">
      <AppSidebar navigation={navigation} />
      <div className="app-shell__content">
        <AppTopbar />
        <main className="app-shell__main">
          <div className={`app-shell__body${aside ? '' : ' app-shell__body--full'}`}>
            <section className="app-shell__primary">{children}</section>
            {aside ? <aside className="app-shell__aside">{aside}</aside> : null}
          </div>
        </main>
      </div>
    </div>
  );
}
