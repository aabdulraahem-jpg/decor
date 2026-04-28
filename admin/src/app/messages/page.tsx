'use client';

import { useEffect, useState } from 'react';
import {
  listContactMessages,
  getMessagesStats,
  updateContactMessage,
  ContactMessageRow,
  MessageStatus,
  MessageKind,
} from '@/lib/api';

function getToken() {
  return document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? '';
}

const STATUS_LABELS: Record<MessageStatus, { label: string; cls: string }> = {
  NEW: { label: 'جديدة', cls: 'bg-clay/20 text-clay-dark' },
  READ: { label: 'مقروءة', cls: 'bg-blue-100 text-blue-700' },
  REPLIED: { label: 'تم الرد', cls: 'bg-emerald-100 text-emerald-700' },
  ARCHIVED: { label: 'أرشيف', cls: 'bg-gray-200 text-gray-600' },
};

const KIND_LABELS: Record<MessageKind, string> = {
  GENERAL: 'استفسار عام',
  IMPLEMENTATION: '🛠️ تنفيذ ديكور (جدّة)',
  PARTNERSHIP: 'شراكة',
  SUPPORT: 'دعم فني',
};

export default function MessagesPage() {
  const [rows, setRows] = useState<ContactMessageRow[]>([]);
  const [stats, setStats] = useState<{ total: number; unread: number; implementation: number } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterKind, setFilterKind] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [list, s] = await Promise.all([
        listContactMessages(getToken(), filterStatus, filterKind),
        getMessagesStats(getToken()),
      ]);
      setRows(list);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filterStatus, filterKind]);

  const active = rows.find((r) => r.id === activeId) ?? null;

  async function changeStatus(id: string, status: MessageStatus) {
    await updateContactMessage(getToken(), id, { status });
    void load();
  }

  async function saveNote() {
    if (!active) return;
    await updateContactMessage(getToken(), active.id, { adminNote: note });
    setNote('');
    void load();
  }

  const fmtDate = (s: string) =>
    new Date(s).toLocaleString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-navy">الرسائل والطلبات</h1>
          <p className="text-gray-500 text-sm">رسائل تواصل العملاء + طلبات تنفيذ ديكور في جدّة</p>
        </div>
        {stats && (
          <div className="flex gap-3 flex-wrap">
            <Stat label="إجمالي" value={stats.total} />
            <Stat label="جديدة" value={stats.unread} accent="clay" />
            <Stat label="طلبات تنفيذ" value={stats.implementation} accent="sage" />
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        <FilterRow
          label="الحالة"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[['', 'الكل'], ['NEW', 'جديدة'], ['READ', 'مقروءة'], ['REPLIED', 'تم الرد'], ['ARCHIVED', 'أرشيف']]}
        />
        <FilterRow
          label="النوع"
          value={filterKind}
          onChange={setFilterKind}
          options={[['', 'الكل'], ['GENERAL', 'عام'], ['IMPLEMENTATION', 'تنفيذ'], ['PARTNERSHIP', 'شراكة'], ['SUPPORT', 'دعم']]}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4">
        {/* List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">جارٍ التحميل…</div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">لا توجد رسائل</div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
              {rows.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => { setActiveId(r.id); setNote(r.adminNote ?? ''); if (r.status === 'NEW') void changeStatus(r.id, 'READ'); }}
                    className={`w-full text-right px-4 py-3 hover:bg-cream transition-colors ${activeId === r.id ? 'bg-cream' : ''} ${r.status === 'NEW' ? 'border-r-4 border-clay' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="font-bold text-navy text-sm truncate">{r.name}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_LABELS[r.status].cls}`}>{STATUS_LABELS[r.status].label}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mb-1">{KIND_LABELS[r.kind]}</div>
                    <div className="text-xs text-gray-600 line-clamp-1">{r.subject ?? r.message.slice(0, 60)}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{fmtDate(r.createdAt)}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          {!active ? (
            <div className="text-center text-gray-400 py-16 text-sm">اختر رسالة من القائمة لعرض تفاصيلها</div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-3 gap-3">
                <div>
                  <div className="text-xs text-gray-500">{KIND_LABELS[active.kind]}</div>
                  <h2 className="font-black text-navy text-lg">{active.subject ?? active.name}</h2>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_LABELS[active.status].cls}`}>{STATUS_LABELS[active.status].label}</span>
              </div>

              <dl className="grid grid-cols-2 gap-2 text-sm bg-cream rounded-xl p-3 mb-4">
                <Row k="الاسم" v={active.name} />
                <Row k="البريد" v={<a href={`mailto:${active.email}`} className="text-clay-dark font-bold" dir="ltr">{active.email}</a>} />
                <Row k="الجوال" v={active.phone ? <a href={`https://wa.me/${active.phone.replace(/^0/, '966').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold" dir="ltr">{active.phone}</a> : '—'} />
                <Row k="التاريخ" v={fmtDate(active.createdAt)} />
                <Row k="IP" v={active.ipAddress ?? '—'} />
                <Row k="إيميل التنبيه" v={active.emailSent ? '✅ أُرسل' : '⚠️ لم يُرسل'} />
              </dl>

              <div className="bg-cream/50 border border-gray-100 rounded-xl p-4 mb-4 whitespace-pre-wrap leading-loose text-sm text-navy">
                {active.message}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">ملاحظة داخلية (للفريق فقط)</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-clay focus:ring-2 focus:ring-clay/15 outline-none"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="مثال: تم التواصل واتساب، الموعد الثلاثاء 4 مساءً"
                />
                <button onClick={saveNote} className="mt-2 px-4 py-1.5 bg-navy text-white text-sm rounded-lg hover:bg-navy-lighter">حفظ الملاحظة</button>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                {(['NEW', 'READ', 'REPLIED', 'ARCHIVED'] as MessageStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(active.id, s)}
                    disabled={active.status === s}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${active.status === s ? 'bg-navy text-white border-navy cursor-default' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    {STATUS_LABELS[s].label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: 'clay' | 'sage' }) {
  const cls = accent === 'clay' ? 'bg-clay/10 text-clay-dark' : accent === 'sage' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700';
  return (
    <div className={`px-4 py-2 rounded-xl ${cls}`}>
      <div className="text-[11px] font-bold opacity-70">{label}</div>
      <div className="text-xl font-black">{value.toLocaleString('ar')}</div>
    </div>
  );
}

function FilterRow({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-xs text-gray-500 ml-1">{label}:</span>
      {options.map(([v, l]) => (
        <button
          key={v || 'all'}
          onClick={() => onChange(v)}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${value === v ? 'bg-navy text-white border-navy' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <>
      <dt className="text-gray-500 text-[11px]">{k}</dt>
      <dd className="text-navy font-semibold text-sm break-all">{v}</dd>
    </>
  );
}
