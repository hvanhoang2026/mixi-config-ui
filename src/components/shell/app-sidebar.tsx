import Link from 'next/link';
import type { ReactNode } from 'react';

const menuItems = [
  {
    section: 'Workspace',
    items: [
      { label: 'Config Center', icon: 'pi pi-sliders-h', href: '/config-center', active: true },
      { label: 'Mixi Admin', icon: 'pi pi-arrow-up-right', href: 'http://localhost:3000/main' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Runtime Config', icon: 'pi pi-bolt', href: '/config-center#runtime' },
      { label: 'History Audit', icon: 'pi pi-history', href: '/config-center#history' },
    ],
  },
];

type Props = {
  navigation?: ReactNode;
};

export function AppSidebar({ navigation }: Props) {
  return (
    <aside data-testid="auto-app-sidebar-1-aside" className="app-sidebar">
      <nav data-testid="auto-app-sidebar-2-nav" className="app-sidebar__nav">
        {menuItems.map((group) => (
          <div data-testid="auto-app-sidebar-3-div" key={group.section} className="app-sidebar__group">
            <div data-testid="auto-app-sidebar-4-div" className="app-sidebar__section">{group.section}</div>
            {group.items.map((item) => (
              <Link
                key={item.label}
                data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                href={item.href}
                className={`app-sidebar__link${item.active ? ' is-active' : ''}`}
              >
                <i data-testid="auto-app-sidebar-5-i" className={`pi ${item.icon}`} />
                <span data-testid="auto-app-sidebar-6-span">{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
        {navigation ? (
          <div data-testid="auto-app-sidebar-7-div" className="app-sidebar__group">
            <div data-testid="auto-app-sidebar-8-div" className="app-sidebar__section">Content</div>
            {navigation}
          </div>
        ) : null}
      </nav>
    </aside>
  );
}
