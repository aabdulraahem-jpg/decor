import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://sufuf.pro'),
  title: {
    default: 'صفوف رايقة — تصميم ديكور بالذكاء الاصطناعي',
    template: '%s | صفوف رايقة',
  },
  description:
    'تخيّل بيتك كما تتمنّاه. اختَر النمط واللون والعناصر، ودَع الذكاء الاصطناعي يصمّم لك مشهداً واقعياً بجودة احترافية — جاهز لتنفّذه. ونُنفّذ في جدّة.',
  keywords: [
    'ديكور', 'تصميم داخلي', 'ذكاء اصطناعي', 'ديكور بالذكاء الاصطناعي',
    'تصميم منازل', 'ديكور جدة', 'تنفيذ ديكور جدة', 'صفوف رايقة', 'sufuf',
    'مجالس', 'تصميم مجلس', 'تصميم صالة', 'AI interior design', 'Saudi Arabia',
  ],
  authors: [{ name: 'مؤسسة صفوف رايقة' }],
  creator: 'مؤسسة صفوف رايقة',
  publisher: 'مؤسسة صفوف رايقة',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://sufuf.pro',
    siteName: 'صفوف رايقة',
    title: 'صفوف رايقة — تصميم ديكور بالذكاء الاصطناعي',
    description: 'منصّة سعودية لتوليد تصاميم الديكور بالذكاء الاصطناعي + خدمة تنفيذ احترافية في جدّة.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'صفوف رايقة — تصميم ديكور بالذكاء الاصطناعي',
    description: 'صمّم بيتك بالذكاء الاصطناعي، ونُنفّذه لك في جدّة.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [{ url: '/favicon.ico' }],
  },
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
