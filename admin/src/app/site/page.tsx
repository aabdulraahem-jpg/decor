'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import {
  SiteContent,
  Showcase,
  getSiteContent,
  updateSiteContent,
  listShowcaseAdmin,
  createShowcase,
  updateShowcase,
  deleteShowcase,
  uploadSiteImage,
} from '@/lib/api';

export default function SitePage() {
  const [tab, setTab] = useState<'hero' | 'showcase'>('hero');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-navy">محتوى الموقع الرئيسي</h1>
        <p className="text-gray-500 text-sm">عدّل اسم العلامة، نصوص البنر، صورة الواجهة، وأمثلة التصاميم التي تظهر في الصفحة الرئيسية.</p>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('hero')} className={'px-4 py-2 rounded-full text-sm font-medium ' + (tab === 'hero' ? 'bg-navy text-white' : 'bg-gray-100 text-navy')}>📰 البنر والنصوص</button>
        <button onClick={() => setTab('showcase')} className={'px-4 py-2 rounded-full text-sm font-medium ' + (tab === 'showcase' ? 'bg-navy text-white' : 'bg-gray-100 text-navy')}>🖼️ أمثلة التصاميم</button>
      </div>

      {tab === 'hero' ? <HeroEditor /> : <ShowcaseEditor />}
    </div>
  );
}

function HeroEditor() {
  const [data, setData] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { void getSiteContent().then(setData); }, []);

  async function handleHeroUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    setUploading(true);
    try {
      const { url } = await uploadSiteImage(file);
      setData({ ...data, heroImageUrl: url });
    } catch (err) { alert(err instanceof Error ? err.message : 'فشل الرفع'); }
    finally { setUploading(false); e.target.value = ''; }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setSuccess(false);
    try {
      const updated = await updateSiteContent(data);
      setData(updated);
      setSuccess(true);
    } catch (err) { alert(err instanceof Error ? err.message : 'فشل الحفظ'); }
    finally { setSaving(false); }
  }

  if (!data) return <div className="text-gray-400">جارٍ التحميل...</div>;

  return (
    <form onSubmit={save} className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="card space-y-3">
          <div className="font-bold text-navy">العلامة</div>
          <Field label="اسم العلامة">
            <input className="input" value={data.brandName} onChange={(e) => setData({ ...data, brandName: e.target.value })} required />
          </Field>
          <Field label="شعار قصير (تحت الاسم)">
            <input className="input" value={data.brandTagline ?? ''} onChange={(e) => setData({ ...data, brandTagline: e.target.value })} placeholder="مثال: ديكور رايق بلمسة الذكاء" />
          </Field>
        </div>

        <div className="card space-y-3">
          <div className="font-bold text-navy">البنر الرئيسي</div>
          <Field label="نص علوي صغير (Eyebrow)">
            <input className="input" value={data.heroEyebrow ?? ''} onChange={(e) => setData({ ...data, heroEyebrow: e.target.value })} placeholder="مثال: جديد · مدعوم بـ gpt-image-2" />
          </Field>
          <Field label="العنوان الرئيسي *">
            <input className="input text-lg font-bold" value={data.heroTitle} onChange={(e) => setData({ ...data, heroTitle: e.target.value })} required />
          </Field>
          <Field label="النص الفرعي">
            <textarea className="input" rows={3} value={data.heroSubtitle ?? ''} onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })} />
          </Field>
          <Field label="صورة البنر (تظهر بجانب النص)">
            <input type="file" accept="image/*" onChange={handleHeroUpload} />
            {data.heroImageUrl && <img src={data.heroImageUrl} alt="" className="mt-2 w-full h-48 object-cover rounded-xl" />}
            {uploading && <div className="text-xs text-gray-500 mt-1">يرفع...</div>}
            {data.heroImageUrl && (
              <button type="button" onClick={() => setData({ ...data, heroImageUrl: '' })} className="text-xs text-red-600 hover:underline mt-1">حذف الصورة</button>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="نص الزر الأساسي">
              <input className="input" value={data.ctaPrimary} onChange={(e) => setData({ ...data, ctaPrimary: e.target.value })} />
            </Field>
            <Field label="نص الزر الثانوي (اختياري)">
              <input className="input" value={data.ctaSecondary ?? ''} onChange={(e) => setData({ ...data, ctaSecondary: e.target.value })} />
            </Field>
          </div>
        </div>

        <div className="card space-y-3">
          <div className="font-bold text-navy">سطر الثقة + العرض المجاني</div>
          <Field label="سطر الثقة (تحت أزرار CTA)">
            <input className="input" value={data.trustLine ?? ''} onChange={(e) => setData({ ...data, trustLine: e.target.value })} placeholder="بدون بطاقة ائتمان · 5 تصاميم مجانية..." />
          </Field>
          <Field label="نص العرض المجاني (يظهر في الصفحة)">
            <input className="input" value={data.freeQuotaText ?? ''} onChange={(e) => setData({ ...data, freeQuotaText: e.target.value })} />
          </Field>
        </div>

        <div className="flex gap-3 items-center">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'يحفظ...' : 'حفظ التغييرات'}</button>
          {success && <span className="text-green-600 text-sm">✅ حُفظ بنجاح</span>}
        </div>
      </div>

      {/* Live preview */}
      <aside className="lg:col-span-1">
        <div className="sticky top-4">
          <div className="text-xs text-gray-500 mb-2">معاينة مصغّرة</div>
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-cream">
            <div className="p-4 bg-gradient-to-br from-cream to-white">
              {data.heroEyebrow && <div className="badge bg-gold/15 text-gold-dark mb-2 inline-block">{data.heroEyebrow}</div>}
              <div className="text-lg font-black text-navy mb-1">{data.heroTitle}</div>
              {data.heroSubtitle && <div className="text-xs text-gray-500 mb-3">{data.heroSubtitle}</div>}
              <div className="flex gap-2">
                <span className="bg-gold text-navy text-xs font-bold px-3 py-1.5 rounded-lg">{data.ctaPrimary}</span>
                {data.ctaSecondary && <span className="bg-white border text-xs font-medium px-3 py-1.5 rounded-lg">{data.ctaSecondary}</span>}
              </div>
              {data.trustLine && <div className="text-[10px] text-gray-400 mt-2">{data.trustLine}</div>}
            </div>
            {data.heroImageUrl ? (
              <img src={data.heroImageUrl} alt="" className="w-full h-32 object-cover" />
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-gold/30 to-navy/10 flex items-center justify-center text-3xl">🛋️</div>
            )}
          </div>
        </div>
      </aside>
    </form>
  );
}

function ShowcaseEditor() {
  const [items, setItems] = useState<Showcase[]>([]);
  const [editing, setEditing] = useState<Showcase | null>(null);
  const empty: Partial<Showcase> = { title: '', description: '', imageUrl: '', badge: '', sortOrder: 0, isActive: true };
  const [form, setForm] = useState<Partial<Showcase>>(empty);
  const [uploading, setUploading] = useState(false);

  async function load() { setItems(await listShowcaseAdmin()); }
  useEffect(() => { void load(); }, []);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const { url } = await uploadSiteImage(file); setForm((f) => ({ ...f, imageUrl: url })); }
    catch (err) { alert(err instanceof Error ? err.message : 'فشل الرفع'); }
    finally { setUploading(false); e.target.value = ''; }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form.imageUrl) { alert('ارفع صورة العمل أولاً'); return; }
    try {
      if (editing) await updateShowcase(editing.id, form);
      else await createShowcase({ title: form.title!, imageUrl: form.imageUrl!, description: form.description ?? undefined, badge: form.badge ?? undefined, sortOrder: form.sortOrder ?? 0, isActive: form.isActive ?? true });
      setEditing(null); setForm(empty); await load();
    } catch (err) { alert(err instanceof Error ? err.message : 'فشل الحفظ'); }
  }

  async function remove(s: Showcase) {
    if (!confirm(`حذف "${s.title}"؟`)) return;
    try { await deleteShowcase(s.id); await load(); }
    catch (err) { alert(err instanceof Error ? err.message : 'فشل الحذف'); }
  }

  function startEdit(s: Showcase) { setEditing(s); setForm(s); }
  function cancel() { setEditing(null); setForm(empty); }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <form onSubmit={save} className="card lg:col-span-1 h-fit space-y-3">
        <div className="font-bold text-navy">{editing ? `تعديل ${editing.title}` : 'إضافة مثال جديد'}</div>
        <Field label="الصورة *">
          <input type="file" accept="image/*" onChange={handleUpload} />
          {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 w-full h-40 object-cover rounded-xl" />}
          {uploading && <div className="text-xs text-gray-500 mt-1">يرفع...</div>}
        </Field>
        <Field label="العنوان *">
          <input className="input" value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="مثال: مجلس عربي معاصر" />
        </Field>
        <Field label="شارة (Badge — اختياري)">
          <input className="input" value={form.badge ?? ''} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="مثال: مودرن خليجي" />
        </Field>
        <Field label="الوصف (اختياري)">
          <textarea className="input" rows={2} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ترتيب">
            <input type="number" className="input" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </Field>
          <Field label="مفعّل">
            <select className="input" value={form.isActive ? '1' : '0'} onChange={(e) => setForm({ ...form, isActive: e.target.value === '1' })}>
              <option value="1">نعم</option>
              <option value="0">لا</option>
            </select>
          </Field>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1">{editing ? 'حفظ التعديلات' : 'إضافة'}</button>
          {editing && <button type="button" onClick={cancel} className="btn-secondary">إلغاء</button>}
        </div>
      </form>

      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.length === 0 ? (
          <div className="col-span-3 card text-center py-10 text-gray-400">لا توجد أمثلة بعد</div>
        ) : items.map((s) => (
          <div key={s.id} className="group relative card p-2">
            {s.imageUrl ? (
              <img src={s.imageUrl} alt={s.title} className="w-full h-32 object-cover rounded-lg" />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">📷</div>
            )}
            <div className="mt-2 text-sm font-bold text-navy truncate">{s.title}</div>
            {s.badge && <div className="text-[10px] inline-block bg-gold/15 text-gold-dark rounded px-2 py-0.5">{s.badge}</div>}
            {!s.isActive && <div className="text-[10px] text-red-500 mt-1">مخفي</div>}
            <div className="opacity-0 group-hover:opacity-100 absolute top-1 left-1 flex gap-1">
              <button onClick={() => startEdit(s)} className="bg-white/95 rounded-full px-2 py-0.5 text-[10px]">تعديل</button>
              <button onClick={() => void remove(s)} className="bg-white/95 text-red-600 rounded-full px-2 py-0.5 text-[10px]">حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
