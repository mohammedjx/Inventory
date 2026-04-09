import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Equipment Checkout App',
  description: 'Web app for officer badge scan and equipment checkout/check-in tracking',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
