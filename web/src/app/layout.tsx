import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'صفوف رايقة — تصميم ديكور بالذكاء الاصطناعي',
  description: 'حوّل غرفتك إلى تحفة بضغطة واحدة. اختر العينات وقل ما تتمنى، ودَع الذكاء الاصطناعي يصمّم لك بدقّة 4K.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
