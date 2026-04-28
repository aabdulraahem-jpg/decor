'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import DesignCard from '@/components/design-card';
import { listMyProjects, getMyProject, Project, Design } from '@/lib/api';

export default function HistoryPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [designsByProject, setDesignsByProject] = useState<Record<string, Design[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const list = await listMyProjects();
        setProjects(list);
        const byId: Record<string, Design[]> = {};
        await Promise.all(list.map(async (p) => {
          const full = await getMyProject(p.id).catch(() => ({ designs: [] }));
          byId[p.id] = (full as { designs: Design[] }).designs ?? [];
        }));
        setDesignsByProject(byId);
      } catch (e) {
        if (e instanceof Error && e.message.includes('401')) router.push('/login');
        else setError('فشل التحميل');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-navy">تصاميمي</h1>
            <p className="text-gray-500 text-sm">جميع المشاريع والتصاميم التي أنشأتها</p>
          </div>
          <Link href="/studio" className="btn-primary">+ تصميم جديد</Link>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

        {loading ? (
          <div className="text-center py-16 text-gray-400">جارٍ التحميل...</div>
        ) : projects.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">🎨</div>
            <h2 className="text-xl font-bold text-navy mb-2">لا توجد تصاميم بعد</h2>
            <p className="text-gray-500 mb-4">ابدأ مشروعك الأول الآن</p>
            <Link href="/studio" className="btn-primary inline-block">أنشئ تصميماً</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((p) => {
              const designs = designsByProject[p.id] ?? [];
              return (
                <div key={p.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-bold text-navy">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.roomType} · {new Date(p.createdAt).toLocaleDateString('ar-SA')}</div>
                    </div>
                    <div className="text-xs text-gray-500">{designs.length} تصميم</div>
                  </div>
                  {designs.length === 0 ? (
                    <div className="text-sm text-gray-400 py-6 text-center">لا توجد تصاميم لهذا المشروع</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {designs.map((d) => (
                        <DesignCard key={d.id} design={d} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
