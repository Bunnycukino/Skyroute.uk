import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SkyRoute OK',
  description: 'C209/C208 management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
