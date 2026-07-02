import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import '@w-iris/themes/base.css';
import '@w-iris/themes/light.css';
import '@w-iris/react/styles.css';
import './globals.css';
import type { ReactNode } from 'react';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
