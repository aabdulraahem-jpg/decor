import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { getAllPosts } from '@/lib/blog';

export const metadata = {
  title: 'المدوّنة — صفوف رايقة',
  description: 'مقالات في تصميم الديكور، الاتجاهات، والتكاليف، مكتوبة خصّيصاً للسوق السعودي.',
  alternates: { canonical: '/blog' },
};

export const revalidate = 600;

export default async function BlogIndex() {
  const posts = await getAllPosts();
  return (
    <>
      <Navbar />
      <section className="hero-bg">
        <div className="max-w-5xl mx-auto px-4 py-14 md:py-20 text-center">
          <span className="badge bg-clay/15 text-clay-dark mb-4">المدوّنة</span>
          <h1 className="display text-4xl md:text-5xl font-black text-navy leading-tight mb-3">
            دليلك الكامل لديكور أذكى
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            مقالات قصيرة وعمليّة في تصميم الديكور والتكاليف والاتجاهات، مكتوبة من خبرة منصّتنا
            ومشاريعنا في جدّة.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          {posts.length === 0 ? (
            <div className="text-center text-gray-400 py-12">لا توجد مقالات بعد.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="card hover:border-clay/30 hover:shadow-md transition-all">
                  <div className="text-5xl mb-3">{p.cover}</div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-2">
                    {p.category && <span className="badge bg-clay/10 text-clay-dark">{p.category}</span>}
                    <span>·</span>
                    <span>{p.readMinutes} دقائق قراءة</span>
                  </div>
                  <h2 className="font-black text-navy text-lg mb-2 leading-tight">{p.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{p.description}</p>
                  <div className="text-[11px] text-gray-400 mt-3">{formatDate(p.date)}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return iso; }
}
