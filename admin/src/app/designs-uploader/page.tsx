'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import {
  AdminProjectRow,
  AdminUserRow,
  addDesignToProject,
  createProjectForUser,
  deleteAdminDesign,
  getUsers,
  listUserProjects,
  uploadDesignFile,
} from '@/lib/api';

function getToken() {
  return document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? '';
}

/**
 * Admin uploader: pick a user → see their projects → create a project →
 * upload a design image (multipart) → it appears in the user's "تصاميمي"
 * page automatically as a 0-point design.
 *
 * This is the operational tool behind the implementation flow's promise of
 * free designs: clients send photos via WhatsApp, the admin prepares finals
 * elsewhere, then drops them into the user's account here.
 */
export default function DesignsUploaderPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState('');
  const [activeUser, setActiveUser] = useState<AdminUserRow | null>(null);
  const [projects, setProjects] = useState<AdminProjectRow[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState('');

  // ── Load users on mount + search ──
  useEffect(() => {
    const t = setTimeout(() => {
      void (async () => {
        try {
          const r = await getUsers(getToken(), 1, search.trim() || undefined);
          setUsers(r.users);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'فشل تحميل المستخدمين');
        }
      })();
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  // ── Load active user's projects ──
  async function reloadProjects(uid: string) {
    setLoadingProjects(true);
    try {
      const list = await listUserProjects(getToken(), uid);
      setProjects(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل المشاريع');
    } finally {
      setLoadingProjects(false);
    }
  }
  useEffect(() => {
    if (activeUser) void reloadProjects(activeUser.id);
    else setProjects([]);
  }, [activeUser]);

  // ── Create new project ──
  async function handleNewProject() {
    if (!activeUser) return;
    const name = prompt('اسم المشروع (مثال: تصاميم مجلس الضيوف)');
    if (!name?.trim()) return;
    try {
      await createProjectForUser(getToken(), activeUser.id, { name: name.trim() });
      await reloadProjects(activeUser.id);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل إنشاء المشروع');
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-navy">تصاميم المستخدمين (تنفيذ)</h1>
          <p className="text-gray-500 text-sm mt-1">
            ارفع تصاميم جاهزة لحساب أيّ مستخدم مباشرة — تظهر له في صفحة «تصاميمي» بدون أن يستهلك نقاطاً.
            مخصّص لعملاء التنفيذ في جدّة الذين أرسلوا صور المساحة عبر واتساب.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-3">{error}</div>
      )}

      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        {/* User picker */}
        <aside className="bg-white rounded-2xl border border-gray-100 p-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-auto">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 ابحث بالاسم أو البريد..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-clay outline-none mb-2"
          />
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
            المستخدمون ({users.length})
          </div>
          <div className="space-y-1">
            {users.map((u) => {
              const active = activeUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setActiveUser(u)}
                  className={`w-full text-right px-3 py-2 rounded-xl text-sm transition-colors ${
                    active ? 'bg-clay text-white' : 'hover:bg-cream text-navy'
                  }`}
                >
                  <div className="font-bold truncate">{u.name || '— بدون اسم —'}</div>
                  <div className={`text-[11px] truncate ${active ? 'text-white/80' : 'text-gray-500'}`} dir="ltr">
                    {u.email}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${active ? 'text-white/80' : 'text-gray-400'}`}>
                    💎 {u.pointsBalance} نقطة · 📁 {u._count?.projects ?? 0} مشروع
                  </div>
                </button>
              );
            })}
            {users.length === 0 && <div className="text-xs text-gray-400 text-center py-4">لا نتائج</div>}
          </div>
        </aside>

        {/* Active user's projects + upload */}
        <main className="space-y-4">
          {!activeUser ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
              ← اختر مستخدماً من القائمة لتبدأ.
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-black text-navy text-lg">
                      {activeUser.name || activeUser.email}
                    </div>
                    <div className="text-xs text-gray-500" dir="ltr">{activeUser.email}</div>
                  </div>
                  <button
                    onClick={handleNewProject}
                    className="px-4 py-2 bg-clay text-white rounded-xl text-sm font-bold hover:bg-clay-dark transition-colors"
                  >
                    + مشروع جديد
                  </button>
                </div>
              </div>

              {loadingProjects ? (
                <div className="text-center text-gray-400 py-8">جارٍ التحميل…</div>
              ) : projects.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-500">
                  لا توجد مشاريع لهذا المستخدم. اضغط «+ مشروع جديد» لإنشاء أوّل مشروع.
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onChanged={() => reloadProjects(activeUser.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Per-project card with upload form + design grid ──

function ProjectCard({ project, onChanged }: { project: AdminProjectRow; onChanged: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [spaceLabel, setSpaceLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { url } = await uploadDesignFile(file);
      await addDesignToProject(getToken(), project.id, {
        generatedImageUrl: url,
        spaceLabel: spaceLabel.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setSpaceLabel('');
      setNotes('');
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الرفع');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(designId: string) {
    if (!confirm('حذف هذا التصميم؟')) return;
    try {
      await deleteAdminDesign(getToken(), designId);
      onChanged();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحذف');
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-black text-navy">{project.name}</div>
          <div className="text-[11px] text-gray-500">
            {project.kind} · أُنشِئ {new Date(project.createdAt).toLocaleDateString('ar-SA')}
            · {project.designs.length} تصميم
          </div>
        </div>
      </div>

      {/* Upload form */}
      <div className="p-4 bg-cream/40 border-b border-gray-100 grid sm:grid-cols-3 gap-2 items-end">
        <input
          type="text"
          placeholder="اسم المساحة (اختياري — مثل: مجلس)"
          value={spaceLabel}
          onChange={(e) => setSpaceLabel(e.target.value.slice(0, 80))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-clay outline-none"
        />
        <input
          type="text"
          placeholder="ملاحظة داخلية (اختياري)"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 200))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-clay outline-none"
        />
        <label className={`block text-center cursor-pointer rounded-xl px-3 py-2 text-sm font-bold border-2 border-dashed transition-colors ${
          uploading ? 'bg-clay/30 text-white border-clay' : 'bg-white text-clay-dark border-clay/40 hover:bg-clay/5'
        }`}>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          {uploading ? '⏳ يُرفَع...' : '📤 ارفع صورة تصميم'}
        </label>
      </div>

      {error && <div className="px-4 py-2 text-sm text-red-700 bg-red-50">{error}</div>}

      {/* Design grid */}
      <div className="p-4">
        {project.designs.length === 0 ? (
          <div className="text-center text-xs text-gray-400 py-4">
            لا توجد تصاميم بعد — ارفع أوّل صورة من النموذج أعلاه.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {project.designs.map((d) => (
              <div key={d.id} className="rounded-xl overflow-hidden bg-cream border border-gray-100 group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.generatedImageUrl} alt="" className="w-full h-32 object-cover" />
                <div className="p-2">
                  {d.spaceLabel && <div className="text-[11px] font-bold text-navy truncate">{d.spaceLabel}</div>}
                  <div className="text-[10px] text-gray-500">{d.modelUsed}</div>
                </div>
                {d.modelUsed === 'admin-upload' && (
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    حذف
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
