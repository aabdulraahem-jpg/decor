import { requireAuth } from '@/lib/auth';
import { getStats } from '@/lib/api';
import StatCard from '@/components/stat-card';

export default async function DashboardPage() {
  const token = await requireAuth();

  let stats = null;
  let fetchError = '';
  try {
    stats = await getStats(token);
  } catch (e) {
    fetchError = e instanceof Error ? e.message.slice(0, 200) : 'unknown';
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-navy mb-2">لوحة التحكم</h1>
      <p className="text-gray-500 mb-8">نظرة عامة على أداء منصة صفوف رايقة</p>

      {stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="إجمالي المستخدمين" value={stats.totalUsers.toLocaleString('ar')} icon="👥" />
            <StatCard
              label="الإيرادات الإجمالية"
              value={`${stats.totalRevenueSar.toLocaleString('ar', { minimumFractionDigits: 2 })} ﷼`}
              icon="💰"
              highlight
            />
            <StatCard label="المعاملات الناجحة" value={stats.successfulTransactions.toLocaleString('ar')} icon="✅" sub={`من ${stats.totalTransactions.toLocaleString('ar')} إجمالي`} />
            <StatCard label="النقاط المتداولة" value={stats.pointsInCirculation.toLocaleString('ar')} icon="⭐" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="المشاريع" value={stats.totalProjects.toLocaleString('ar')} icon="🏠" />
            <StatCard label="التصاميم المُولَّدة" value={stats.totalDesigns.toLocaleString('ar')} icon="🎨" />
            <StatCard
              label="متوسط الإيراد/مستخدم"
              value={`${stats.totalUsers > 0 ? (stats.totalRevenueSar / stats.totalUsers).toFixed(2) : '0'} ﷼`}
              icon="📈"
            />
          </div>
        </>
      ) : (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📡</div>
          <div>تعذّر تحميل الإحصائيات. تحقق من اتصال API.</div>
          {fetchError && <div className="text-xs text-red-400 mt-2 ltr text-left max-w-lg mx-auto">{fetchError}</div>}
        </div>
      )}
    </div>
  );
}
