import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const API = process.env.SUFUF_API_INTERNAL_URL ?? 'http://127.0.0.1:4000/api/v1';

interface SharePayload {
  id: string;
  generatedImageUrl: string;
  createdAt: string;
  project: { name: string; roomType: string };
  shareViewCount: number;
}

async function fetchShare(slug: string): Promise<SharePayload | null> {
  try {
    const res = await fetch(`${API}/share/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as SharePayload;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await fetchShare(params.slug);
  if (!data) return { title: 'تصميم غير موجود' };
  const title = `تصميم ${data.project.name} — صفوف رايقة`;
  return {
    title,
    description: `تصميم ديكور ${data.project.roomType} مولَّد بالذكاء الاصطناعي على منصّة صفوف رايقة.`,
    openGraph: { title, images: [{ url: data.generatedImageUrl }], type: 'article' },
    twitter: { card: 'summary_large_image', title, images: [data.generatedImageUrl] },
  };
}

export default async function SharePage({ params }: { params: { slug: string } }) {
  const data = await fetchShare(params.slug);
  if (!data) return notFound();

  return (
    <>
      <Navbar />

      <section className="hero-bg">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
          <span className="badge bg-clay/15 text-clay-dark mb-3">تصميم مشارَك · بالذكاء الاصطناعي</span>
          <h1 className="display text-3xl md:text-5xl font-black text-navy mb-2 leading-tight">
            {data.project.name}
          </h1>
          <p className="text-gray-600">{data.project.roomType}</p>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm">
            <img src={data.generatedImageUrl} alt={data.project.name} className="w-full h-auto block" />
          </div>
          <div className="text-xs text-gray-500 mt-3 flex items-center gap-3">
            <span>👁️ {data.shareViewCount.toLocaleString('ar')} مشاهدة</span>
            <span>·</span>
            <span>تمّ التوليد {new Date(data.createdAt).toLocaleDateString('ar')}</span>
          </div>
        </div>
      </section>

      {/* CTA — convert viewer to user */}
      <section className="py-14 md:py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="section-eyebrow">عجبك التصميم؟</span>
          <h2 className="section-title mt-1">صمّم بيتك بنفسك بنفس الطريقة</h2>
          <p className="section-subtitle mx-auto">
            ارفع صورة غرفتك، اختَر النمط واللون والعينات، وستحصل على تصميم مماثل خلال ثوانٍ.
            <strong className="text-navy"> 5 نقاط مجاناً </strong> عند التسجيل.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-primary text-lg px-8 py-4">سجّل مجاناً ←</Link>
            <Link href="/studio" className="btn-secondary text-lg px-7 py-3.5">جرّب الاستوديو</Link>
          </div>
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">🛡️ منشأة سعودية موثّقة</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">⚡ نتيجة خلال 30 ثانية</span>
            <span>·</span>
            <Link href="/implementation" className="text-clay-dark font-bold hover:underline">🛠️ ننفّذها لك في جدّة</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
