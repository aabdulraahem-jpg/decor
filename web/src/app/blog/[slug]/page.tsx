import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { getAllPosts, getPost, renderMarkdown } from '@/lib/blog';

export const revalidate = 600;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) return { title: 'مقال غير موجود' };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.description, type: 'article' },
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) return notFound();

  const html = renderMarkdown(post.body);
  const all = await getAllPosts();
  const others = all.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <Navbar />

      <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <div className="text-6xl mb-4">{post.cover}</div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          {post.category && <span className="badge bg-clay/15 text-clay-dark">{post.category}</span>}
          <span>·</span>
          <span>{post.readMinutes} دقائق قراءة</span>
          <span>·</span>
          <time>{formatDate(post.date)}</time>
        </div>
        <h1 className="display text-3xl md:text-5xl font-black text-navy leading-tight mb-4">{post.title}</h1>
        {post.description && <p className="text-lg text-gray-600 leading-relaxed mb-8">{post.description}</p>}

        <div className="prose-blog" dangerouslySetInnerHTML={{ __html: html }} />

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/blog" className="btn-secondary">← كل المقالات</Link>
        </div>
      </article>

      {others.length > 0 && (
        <section className="bg-cream py-14">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-8">
              <span className="section-eyebrow">اقرأ أيضاً</span>
              <h2 className="text-2xl md:text-3xl font-black text-navy mt-1">مقالات قد تعجبك</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {others.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="card hover:border-clay/30 transition-colors">
                  <div className="text-3xl mb-2">{p.cover}</div>
                  <h3 className="font-bold text-navy mb-1">{p.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
