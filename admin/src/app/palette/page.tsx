'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  ColorEntry,
  SpaceType,
  listColorsAdmin,
  createColor,
  updateColor,
  deleteColor,
  listSpacesAdmin,
  createSpace,
  updateSpace,
  deleteSpace,
} from '@/lib/api';

export default function PalettePage() {
  const [tab, setTab] = useState<'colors' | 'spaces'>('colors');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-navy">الألوان وأنواع المساحات</h1>
        <p className="text-gray-500 text-sm">
          الألوان مشتركة ويمكن ربطها بأي عيّنة. أنواع المساحات تظهر للمستخدم في استوديو التصميم.
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('colors')} className={'px-4 py-2 rounded-full text-sm font-medium ' + (tab === 'colors' ? 'bg-navy text-white' : 'bg-gray-100 text-navy')}>🎨 الألوان</button>
        <button onClick={() => setTab('spaces')} className={'px-4 py-2 rounded-full text-sm font-medium ' + (tab === 'spaces' ? 'bg-navy text-white' : 'bg-gray-100 text-navy')}>🏠 أنواع المساحات</button>
      </div>

      {tab === 'colors' ? <ColorsPanel /> : <SpacesPanel />}
    </div>
  );
}

// ── Colors panel ────────────────────────────────────────────────────────

function ColorsPanel() {
  const [colors, setColors] = useState<ColorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ColorEntry | null>(null);
  const empty = { code: '', name: '', hex: '#000000', family: '', sortOrder: 0, isActive: true };
  const [form, setForm] = useState<Partial<ColorEntry>>(empty);

  async function load() {
    setLoading(true);
    try { setColors(await listColorsAdmin()); } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await updateColor(editing.id, form);
      } else {
        await createColor({ code: form.code!, name: form.name!, hex: form.hex!, family: form.family ?? undefined, sortOrder: form.sortOrder, isActive: form.isActive });
      }
      setForm(empty); setEditing(null); await load();
    } catch (e) { alert(e instanceof Error ? e.message : 'فشل الحفظ'); }
  }

  async function remove(c: ColorEntry) {
    if (!confirm(`حذف اللون ${c.name} (${c.code})؟`)) return;
    try { await deleteColor(c.id); await load(); }
    catch (e) { alert(e instanceof Error ? e.message : 'فشل الحذف'); }
  }

  function startEdit(c: ColorEntry) { setEditing(c); setForm(c); }
  function cancel() { setEditing(null); setForm(empty); }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <form onSubmit={save} className="card lg:col-span-1 h-fit space-y-3">
        <div className="font-bold text-navy">{editing ? `تعديل ${editing.name}` : 'إضافة لون جديد'}</div>
        <div className="flex gap-3 items-center">
          <input
            type="color"
            value={form.hex ?? '#000000'}
            onChange={(e) => setForm({ ...form, hex: e.target.value })}
            className="w-16 h-16 rounded-xl border border-gray-200 cursor-pointer"
          />
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">الكود</label>
            <input className="input ltr font-mono text-sm" value={form.hex ?? ''} onChange={(e) => setForm({ ...form, hex: e.target.value })} placeholder="#D4B896" required />
          </div>
        </div>
        <label className="block">
          <span className="block text-xs text-gray-500 mb-1">رقم اللون (مثل C-001)</span>
          <input className="input ltr" value={form.code ?? ''} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="C-001" required pattern="[A-Z0-9-]+" />
        </label>
        <label className="block">
          <span className="block text-xs text-gray-500 mb-1">الاسم</span>
          <input className="input" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="بيج صحراوي" required />
        </label>
        <label className="block">
          <span className="block text-xs text-gray-500 mb-1">العائلة (اختياري)</span>
          <select className="input" value={form.family ?? ''} onChange={(e) => setForm({ ...form, family: e.target.value })}>
            <option value="">— غير محدد —</option>
            <option value="warm">دافئ</option>
            <option value="cool">بارد</option>
            <option value="neutral">حيادي</option>
            <option value="earth">ترابي</option>
            <option value="bold">جريء</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs text-gray-500 mb-1">ترتيب</span>
            <input type="number" className="input" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </label>
          <label className="block">
            <span className="block text-xs text-gray-500 mb-1">مفعّل</span>
            <select className="input" value={form.isActive ? '1' : '0'} onChange={(e) => setForm({ ...form, isActive: e.target.value === '1' })}>
              <option value="1">نعم</option>
              <option value="0">لا</option>
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1">{editing ? 'حفظ التعديلات' : 'إضافة'}</button>
          {editing && <button type="button" onClick={cancel} className="btn-secondary">إلغاء</button>}
        </div>
      </form>

      <div className="lg:col-span-2 card p-3">
        <div className="text-sm text-gray-500 mb-3 px-1">{loading ? 'جارٍ التحميل...' : `${colors.length} لون`}</div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {colors.map((c) => (
            <div key={c.id} className="group relative">
              <div
                className="aspect-square rounded-xl border border-gray-100 shadow-inner"
                style={{ background: c.hex }}
              />
              <div className="text-xs font-bold text-navy mt-2 truncate">{c.name}</div>
              <div className="text-[10px] font-mono text-gray-500 ltr">{c.code} · {c.hex}{!c.isActive && ' · مخفي'}</div>
              <div className="opacity-0 group-hover:opacity-100 absolute top-1 left-1 flex gap-1">
                <button onClick={() => startEdit(c)} className="bg-white/95 rounded-full px-2 py-0.5 text-[10px]">تعديل</button>
                <button onClick={() => void remove(c)} className="bg-white/95 text-red-600 rounded-full px-2 py-0.5 text-[10px]">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Spaces panel ────────────────────────────────────────────────────────

function SpacesPanel() {
  const [spaces, setSpaces] = useState<SpaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SpaceType | null>(null);
  const empty: Partial<SpaceType> = { slug: '', name: '', icon: '', description: '', sortOrder: 0, isActive: true };
  const [form, setForm] = useState<Partial<SpaceType>>(empty);

  async function load() {
    setLoading(true);
    try { setSpaces(await listSpacesAdmin()); } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      if (editing) { await updateSpace(editing.id, form); }
      else { await createSpace({ slug: form.slug!, name: form.name!, description: form.description ?? undefined, icon: form.icon ?? undefined, sortOrder: form.sortOrder, isActive: form.isActive }); }
      setForm(empty); setEditing(null); await load();
    } catch (e) { alert(e instanceof Error ? e.message : 'فشل الحفظ'); }
  }

  async function remove(s: SpaceType) {
    if (!confirm(`حذف ${s.name}؟`)) return;
    try { await deleteSpace(s.id); await load(); }
    catch (e) { alert(e instanceof Error ? e.message : 'فشل الحذف'); }
  }

  function startEdit(s: SpaceType) { setEditing(s); setForm(s); }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <form onSubmit={save} className="card lg:col-span-1 h-fit space-y-3">
        <div className="font-bold text-navy">{editing ? `تعديل ${editing.name}` : 'إضافة مساحة جديدة'}</div>
        <label className="block">
          <span className="block text-xs text-gray-500 mb-1">الاسم (للمستخدم)</span>
          <input className="input" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="حديقة منزلية" required />
        </label>
        <label className="block">
          <span className="block text-xs text-gray-500 mb-1">المعرّف (slug)</span>
          <input className="input ltr" value={form.slug ?? ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="garden" pattern="[a-z0-9-]+" required />
        </label>
        <label className="block">
          <span className="block text-xs text-gray-500 mb-1">إيموجي/أيقونة (اختياري)</span>
          <input className="input" value={form.icon ?? ''} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🌳" maxLength={4} />
        </label>
        <label className="block">
          <span className="block text-xs text-gray-500 mb-1">الوصف (اختياري)</span>
          <textarea className="input" rows={2} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs text-gray-500 mb-1">ترتيب</span>
            <input type="number" className="input" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </label>
          <label className="block">
            <span className="block text-xs text-gray-500 mb-1">مفعّل</span>
            <select className="input" value={form.isActive ? '1' : '0'} onChange={(e) => setForm({ ...form, isActive: e.target.value === '1' })}>
              <option value="1">نعم</option>
              <option value="0">لا</option>
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1">{editing ? 'حفظ' : 'إضافة'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(empty); }} className="btn-secondary">إلغاء</button>}
        </div>
      </form>

      <div className="lg:col-span-2 card p-3">
        <div className="text-sm text-gray-500 mb-3 px-1">{loading ? '...' : `${spaces.length} نوع`}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {spaces.map((s) => (
            <div key={s.id} className="group relative card p-3">
              <div className="text-2xl mb-1">{s.icon ?? '🏠'}</div>
              <div className="font-semibold text-navy">{s.name}</div>
              <div className="text-[11px] text-gray-400 ltr">{s.slug}{!s.isActive && ' · مخفي'}</div>
              <div className="opacity-0 group-hover:opacity-100 absolute top-2 left-2 flex gap-1">
                <button onClick={() => startEdit(s)} className="bg-white/95 rounded-full px-2 py-0.5 text-[10px] border">تعديل</button>
                <button onClick={() => void remove(s)} className="bg-white/95 text-red-600 rounded-full px-2 py-0.5 text-[10px] border">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
