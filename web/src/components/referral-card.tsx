'use client';

import { useState } from 'react';

interface Props {
  referralCode: string | null | undefined;
  referredCount: number | undefined;
}

export default function ReferralCard({ referralCode, referredCount }: Props) {
  const [copied, setCopied] = useState(false);
  if (!referralCode) return null;

  const link = typeof window !== 'undefined'
    ? `${window.location.origin}/register?ref=${referralCode}`
    : `https://sufuf.pro/register?ref=${referralCode}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  async function share() {
    const data = {
      title: 'صفوف رايقة',
      text: 'صمّم ديكور بيتك بالذكاء الاصطناعي. سجّل عبر رابطي وخذ 5 نقاط مجانية إضافية!',
      url: link,
    };
    if (navigator.share) { try { await navigator.share(data); return; } catch { /* user cancelled */ } }
    await copyLink();
  }

  return (
    <section className="card bg-gradient-to-l from-clay/5 to-sand border-clay/30">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-clay text-white flex items-center justify-center text-2xl shrink-0">🎁</div>
        <div className="flex-1">
          <h2 className="font-black text-navy text-lg">دعوة أصدقاء = نقاط مجانية</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            شارك رابطك الخاص. كلّ صديق يسجّل من خلاله: <strong className="text-clay-dark">يحصل على 5 نقاط</strong> إضافية، وأنت تحصل على
            <strong className="text-clay-dark"> 5 نقاط</strong> أيضاً.
          </p>
        </div>
        {typeof referredCount === 'number' && referredCount > 0 && (
          <div className="text-center bg-sage/15 text-sage-dark rounded-xl px-3 py-2 shrink-0">
            <div className="text-2xl font-black">{referredCount}</div>
            <div className="text-[10px] font-bold">دعوة ناجحة</div>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-2 mt-4">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500 mb-1">رمزك الفريد</div>
          <div className="font-mono font-black text-navy text-xl tracking-widest" dir="ltr">{referralCode}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500 mb-1">رابط الدعوة</div>
          <div className="font-mono text-[12px] text-navy break-all" dir="ltr">{link}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <button onClick={copyLink} className="btn-secondary text-sm">
          {copied ? '✅ تم النسخ' : '📋 نسخ الرابط'}
        </button>
        <button onClick={share} className="btn-primary text-sm">
          📤 مشاركة
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`صمّم ديكور بيتك بالذكاء الاصطناعي على صفوف رايقة، سجّل من خلال رابطي وخذ 5 نقاط مجانية إضافية: ${link}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-2xl px-5 py-2.5 text-sm transition-colors"
        >
          واتساب
        </a>
      </div>
    </section>
  );
}
