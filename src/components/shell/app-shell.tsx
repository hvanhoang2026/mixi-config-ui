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
    <div data-testid="auto-app-shell-1-div" className="app-shell">
      <AppSidebar navigation={navigation} />
      <div data-testid="auto-app-shell-2-div" className="app-shell__content">
        <AppTopbar />
        <main data-testid="auto-app-shell-3-main" className="app-shell__main">
          <div data-testid="auto-app-shell-4-div" className={`app-shell__body${aside ? '' : ' app-shell__body--full'}`}>
            <section data-testid="auto-app-shell-5-section" className="app-shell__primary">{children}</section>
            {aside ? <aside data-testid="auto-app-shell-6-aside" className="app-shell__aside">{aside}</aside> : null}
          </div>
        </main>
      </div>
    </div>
  );
}
