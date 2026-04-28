'use client';

import { useState } from 'react';
import { toggleDesignShare, Design } from '@/lib/api';

interface Props {
  design: Design;
}

export default function DesignCard({ design }: Props) {
  const [isPublic, setIsPublic] = useState(!!design.isPublic);
  const [slug, setSlug] = useState<string | null>(design.publicSlug ?? null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = isPublic && slug ? `${typeof window !== 'undefined' ? window.location.origin : 'https://sufuf.pro'}/share/${slug}` : null;

  async function handleToggle() {
    if (busy) return;
    setBusy(true);
    try {
      const next = !isPublic;
      const res = await toggleDesignShare(design.id, next);
      setIsPublic(res.isPublic);
      setSlug(res.publicSlug);
    } finally {
      setBusy(false);
    }
  }

  async function copyShare() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadPdf() {
    window.open(`/api/proxy/pdf/design/${design.id}`, '_blank');
  }

  return (
    <div className="rounded-xl overflow-hidden bg-white border border-gray-100 group relative">
      <a href={design.generatedImageUrl} target="_blank" rel="noopener noreferrer">
        <img src={design.generatedImageUrl} alt="" className="w-full aspect-square object-cover group-hover:opacity-95 transition" />
      </a>
      <div className="p-2 text-[11px] text-gray-500 flex items-center justify-between">
        <span>{design.imageSize} · {design.pointsConsumed} نقاط</span>
        {isPublic && <span className="badge bg-sage/15 text-sage-dark text-[9px]">منشور</span>}
      </div>
      <div className="px-2 pb-2 flex flex-wrap gap-1 text-[11px]">
        <button
          onClick={handleToggle}
          disabled={busy}
          className={`flex-1 rounded-lg px-2 py-1.5 font-bold transition-colors ${isPublic ? 'bg-sage/15 text-sage-dark hover:bg-sage/20' : 'bg-gray-100 text-gray-600 hover:bg-clay/10 hover:text-clay-dark'}`}
        >
          {busy ? '...' : isPublic ? '🌐 منشور' : '🔗 مشاركة'}
        </button>
        <button
          onClick={downloadPdf}
          className="flex-1 rounded-lg px-2 py-1.5 font-bold bg-gray-100 text-gray-600 hover:bg-clay/10 hover:text-clay-dark"
          title="تحميل PDF"
        >
          📄 PDF
        </button>
      </div>
      {isPublic && shareUrl && (
        <div className="px-2 pb-2">
          <button
            onClick={copyShare}
            className="w-full text-[10px] text-clay-dark bg-cream/60 rounded-lg px-2 py-1 truncate hover:bg-cream"
            dir="ltr"
            title={shareUrl}
          >
            {copied ? '✅ تم النسخ' : shareUrl}
          </button>
        </div>
      )}
    </div>
  );
}
