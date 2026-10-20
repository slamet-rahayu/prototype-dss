import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata = {
  title: 'CareerPath TI - Sistem Rekomendasi Karir Bidang TI',
  description: 'Sistem Pendukung Keputusan Rekomendasi Karir Bidang Teknologi Informasi Berbasis SAW & Holland RIASEC',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-canvas text-content-primary font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
