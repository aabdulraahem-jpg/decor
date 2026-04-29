import type { Metadata, Viewport } from 'next';
import './globals.css';
import SwRegister from '@/components/sw-register';

export const metadata: Metadata = {
  metadataBase: new URL('https://aidesigner.pro'),
  title: {
    default: 'المصمّم الأفضل — تصميم ديكور بالذكاء الاصطناعي',
    template: '%s | المصمّم الأفضل',
  },
  description:
    'تخيّل بيتك كما تتمنّاه. اختَر النمط واللون والعناصر، ودَع الذكاء الاصطناعي يصمّم لك مشهداً واقعياً بجودة احترافية — جاهز لتنفّذه. ونُنفّذ في جدّة.',
  keywords: [
    'ديكور', 'تصميم داخلي', 'ذكاء اصطناعي', 'ديكور بالذكاء الاصطناعي',
    'تصميم منازل', 'ديكور جدة', 'تنفيذ ديكور جدة', 'المصمم الأفضل', 'aidesigner',
    'مجالس', 'تصميم مجلس', 'تصميم صالة', 'AI interior design', 'Saudi Arabia',
  ],
  authors: [{ name: 'مؤسسة صفوف رايقة' }],
  creator: 'مؤسسة صفوف رايقة',
  publisher: 'مؤسسة صفوف رايقة',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://aidesigner.pro',
    siteName: 'المصمّم الأفضل',
    title: 'المصمّم الأفضل — تصميم ديكور بالذكاء الاصطناعي',
    description: 'منصّة سعودية لتوليد تصاميم الديكور بالذكاء الاصطناعي + خدمة تنفيذ احترافية في جدّة.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'المصمّم الأفضل — تصميم ديكور بالذكاء الاصطناعي',
    description: 'صمّم بيتك بالذكاء الاصطناعي، ونُنفّذه لك في جدّة.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icon-192.svg' }],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'المصمّم الأفضل', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#a8896d',
  width: 'device-width',
  initialScale: 1,
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
      <body>
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
