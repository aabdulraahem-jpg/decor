'use client';

import { useEffect, useState } from 'react';
import {
  listCustomElements,
  createCustomElement,
  updateCustomElement,
  deleteCustomElement,
  CustomElementRow,
  CustomElementInput,
} from '@/lib/api';

function getToken() {
  return document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? '';
}

const EMPTY: Partial<CustomElementInput> = {
  kindCode: '',
  label: '',
  icon: '🌟',
  category: 'EXTERIOR',
  hint: '',
  variants: [''],
  askLength: false,
  askWidth: false,
  askHeight: false,
  askArea: false,
  defaultUnit: 'm',
  notesPlaceholder: '',
  drawHint: '',
  isActive: true,
  sortOrder: 0,
};

export default function CustomElementsAdminPage() {
  const [items, setItems] = useState<CustomElementRow[] | null>(null);
  const [editing, setEditing] = useState<CustomElementRow | null>(null);
  const [draft, setDraft] = useState<Partial<CustomElementInput>>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const list = await listCustomElements(getToken());
      setItems(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل التحميل');
    }
  }
  useEffect(() => { void load(); }, []);

  function startCreate() { setEditing(null); setDraft(EMPTY); setError(''); }
  function startEdit(it: CustomElementRow) {
    setEditing(it);
    setDraft({
      kindCode: it.kindCode, label: it.label, icon: it.icon, category: it.category,
      hint: it.hint ?? '', variants: it.variants.length > 0 ? it.variants : [''],
      askLength: it.askLength, askWidth: it.askWidth, askHeight: it.askHeight, askArea: it.askArea,
      defaultUnit: it.defaultUnit, notesPlaceholder: it.notesPlaceholder ?? '', drawHint: it.drawHint ?? '',
      isActive: it.isActive, sortOrder: it.sortOrder,
    });
    setError('');
  }

  async function save() {
    setBusy(true); setError('');
    try {
      const cleanVariants = (draft.variants ?? []).filter((v) => v.trim().length > 0);
      const payload = { ...draft, variants: cleanVariants };
      if (editing) {
        await updateCustomElement(getToken(), editing.id, payload);
      } else {
        await createCustomElement(getToken(), payload);
      }
      await load();
      startCreate();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل الحفظ');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('حذف هذا العنصر نهائياً؟')) return;
    await deleteCustomElement(getToken(), id);
    await load();
  }

  function setVariant(i: number, v: string) {
    setDraft((d) => {
      const variants = [...(d.variants ?? [])];
      variants[i] = v;
      return { ...d, variants };
    });
  }
  function addVariant() {
    setDraft((d) => ({ ...d, variants: [...(d.variants ?? []), ''] }));
  }
  function removeVariant(i: number) {
    setDraft((d) => ({ ...d, variants: (d.variants ?? []).filter((_, k) => k !== i) }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy">عناصر الاسكتش المخصّصة</h1>
          <p className="text-gray-500 text-sm">عناصر إضافية تظهر للمستخدم في محرّر الاسكتش بجانب العناصر الافتراضية.</p>
        </div>
        <button onClick={startCreate} className="px-4 py-2 rounded-xl bg-clay text-white font-bold text-sm hover:bg-clay-dark">
          + عنصر جديد
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4">
        {/* List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {items === null ? (
            <div className="p-8 text-center text-gray-400 text-sm">جارٍ التحميل…</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">لا توجد عناصر مخصّصة بعد. اضغط "عنصر جديد" أعلاه.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((it) => (
                <li key={it.id} className={`px-4 py-3 hover:bg-cream/50 ${editing?.id === it.id ? 'bg-cream' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <button onClick={() => startEdit(it)} className="text-right flex-1">
                      <div className="font-bold text-navy text-sm">
                        <span className="ml-1.5 text-base">{it.icon}</span>
                        {it.label}
                        {!it.isActive && <span className="badge bg-gray-200 text-gray-600 mr-2 text-[10px]">معطَّل</span>}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1 font-mono" dir="ltr">
                        {it.category} · {it.kindCode} · {it.variants.length} variants · {it.defaultUnit}
                      </div>
                      {it.hint && <div className="text-[11px] text-gray-500 mt-0.5">{it.hint}</div>}
                    </button>
                    <button onClick={() => remove(it.id)} className="text-red-500 hover:bg-red-50 rounded px-1.5 text-sm" aria-label="حذف">×</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h2 className="font-bold text-navy">{editing ? `تعديل: ${editing.label}` : 'إضافة عنصر جديد'}</h2>

          <div className="grid grid-cols-2 gap-3">
            <Field label="الاسم العربي *" value={draft.label ?? ''} onChange={(v) => setDraft((d) => ({ ...d, label: v }))} placeholder="مثال: نافورة" />
            <Field label="رمز الكيان (إنكليزي كبير، مثال: FOUNTAIN) *" value={draft.kindCode ?? ''} onChange={(v) => setDraft((d) => ({ ...d, kindCode: v.toUpperCase().replace(/[^A-Z0-9_]/g, '') }))} disabled={!!editing} ltr />
            <Field label="إيموجي *" value={draft.icon ?? ''} onChange={(v) => setDraft((d) => ({ ...d, icon: v }))} placeholder="🌊" />
            <div>
              <label className="block text-xs text-gray-600 mb-1">الفئة</label>
              <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={draft.category ?? 'EXTERIOR'} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as 'INTERIOR' | 'EXTERIOR' }))}>
                <option value="INTERIOR">داخلي</option>
                <option value="EXTERIOR">خارجي</option>
              </select>
            </div>
          </div>

          <Field label="تلميح (Hint)" value={draft.hint ?? ''} onChange={(v) => setDraft((d) => ({ ...d, hint: v }))} placeholder="ما يفيد المستخدم لاختياره" />

          <div>
            <label className="block text-xs text-gray-600 mb-1">الأنواع المتاحة (variants) *</label>
            <div className="space-y-1.5">
              {(draft.variants ?? []).map((v, i) => (
                <div key={i} className="flex gap-1.5">
                  <input type="text" value={v} onChange={(e) => setVariant(i, e.target.value)} placeholder={`نوع #${i + 1}`} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
                  <button onClick={() => removeVariant(i)} className="px-2 text-red-500 hover:bg-red-50 rounded">×</button>
                </div>
              ))}
              <button onClick={addVariant} className="text-clay-dark text-xs hover:underline">+ إضافة نوع</button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">حقول المقاسات المطلوبة</label>
            <div className="flex flex-wrap gap-3 text-xs">
              {([
                ['askLength', 'طول'],
                ['askWidth', 'عرض'],
                ['askHeight', 'ارتفاع/عمق'],
                ['askArea', 'مساحة (م²)'],
              ] as const).map(([k, label]) => (
                <label key={k} className="inline-flex items-center gap-1.5">
                  <input type="checkbox" className="accent-clay" checked={!!draft[k]} onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.checked }))} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">الوحدة الافتراضية</label>
              <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={draft.defaultUnit ?? 'm'} onChange={(e) => setDraft((d) => ({ ...d, defaultUnit: e.target.value as 'm' | 'cm' | 'in' }))}>
                <option value="m">متر</option>
                <option value="cm">سنتيمتر</option>
                <option value="in">بوصة</option>
              </select>
              <p className="text-[10px] text-gray-500 mt-1">المستخدم يستطيع تغييرها على كل عنصر.</p>
            </div>
            <Field label="ترتيب العرض" value={String(draft.sortOrder ?? 0)} onChange={(v) => setDraft((d) => ({ ...d, sortOrder: Number(v) || 0 }))} ltr />
          </div>

          <Field label="placeholder للملاحظات" value={draft.notesPlaceholder ?? ''} onChange={(v) => setDraft((d) => ({ ...d, notesPlaceholder: v }))} placeholder="مثال: مع إضاءة LED مخفية..." />
          <Field label="إرشاد الرسم في الاسكتش" value={draft.drawHint ?? ''} onChange={(v) => setDraft((d) => ({ ...d, drawHint: v }))} placeholder="كيف يرسمه المستخدم في صورة الاسكتش" />

          <label className="inline-flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" className="accent-clay" checked={!!draft.isActive} onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))} />
            <span>نشط (يظهر للمستخدم)</span>
          </label>

          {error && <div className="bg-red-50 text-red-700 rounded-lg p-2 text-xs">{error}</div>}

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button onClick={save} disabled={busy} className="flex-1 px-4 py-2 rounded-xl bg-clay text-white font-bold text-sm disabled:opacity-50 hover:bg-clay-dark">
              {busy ? 'جارٍ الحفظ…' : editing ? 'حفظ التعديلات' : 'إنشاء العنصر'}
            </button>
            {editing && (
              <button onClick={startCreate} className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">إلغاء</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, disabled, ltr }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; ltr?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-600 mb-1">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
             className={`w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm ${disabled ? 'bg-gray-50 text-gray-500' : ''} ${ltr ? 'font-mono text-left' : ''}`}
             dir={ltr ? 'ltr' : undefined} />
    </label>
  );
}
