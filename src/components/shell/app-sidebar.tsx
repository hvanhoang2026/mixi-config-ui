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
    <aside className="app-sidebar">
      <nav className="app-sidebar__nav">
        {menuItems.map((group) => (
          <div key={group.section} className="app-sidebar__group">
            <div className="app-sidebar__section">{group.section}</div>
            {group.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`app-sidebar__link${item.active ? ' is-active' : ''}`}
              >
                <i className={`pi ${item.icon}`} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
        {navigation ? (
          <div className="app-sidebar__group">
            <div className="app-sidebar__section">Content</div>
            {navigation}
          </div>
        ) : null}
      </nav>
    </aside>
  );
}
