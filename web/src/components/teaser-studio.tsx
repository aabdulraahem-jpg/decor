'use client';

import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Phase = 'idle' | 'uploading' | 'generating' | 'preview';

const STEPS = [
  'تحليل الصورة...',
  'استخراج الإضاءة والعمق...',
  'مزج النمط مع غرفتك...',
  'تجهيز اللوحة...',
  'اللمسات النهائية...',
];

export default function TeaserStudio() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [stepIdx, setStepIdx] = useState(0);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      runFakeGeneration();
    };
    reader.readAsDataURL(f);
  }

  function runFakeGeneration() {
    setPhase('generating');
    setStepIdx(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= STEPS.length) {
        clearInterval(interval);
        setPhase('preview');
      } else {
        setStepIdx(i);
      }
    }, 1200);
  }

  function handleSignup() {
    // Persist the uploaded image into sessionStorage so /studio can pick it up
    if (imageDataUrl) {
      try { sessionStorage.setItem('teaser_image', imageDataUrl); } catch {}
    }
    router.push('/register?next=/studio&teaser=1');
  }

  function reset() {
    setPhase('idle');
    setImageDataUrl('');
    setStepIdx(0);
  }

  return (
    <div className="card p-0 overflow-hidden bg-gradient-to-br from-navy to-navy-lighter text-white">
      <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <span className="badge bg-gold/15 text-gold-dark mb-1 inline-block">⚡ تجربة فورية</span>
          <div className="text-xl font-black">جرّب على غرفتك الآن — بدون تسجيل</div>
          <div className="text-sm text-gray-300 mt-0.5">ارفع صورة → شاهد المعاينة → سجّل لاستلام التصميم كاملاً.</div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {phase === 'idle' && (
          <label className="relative block border-2 border-dashed border-gold/40 rounded-2xl p-10 text-center cursor-pointer hover:border-gold/80 hover:bg-white/5 transition">
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <div className="text-6xl mb-3">📷</div>
            <div className="text-lg font-bold text-white">اضغط لرفع صورة غرفتك</div>
            <div className="text-xs text-gray-400 mt-1">JPG / PNG — يبقى الملف على جهازك حتى التسجيل</div>
          </label>
        )}

        {phase === 'generating' && (
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black">
            {imageDataUrl && (
              <img src={imageDataUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.6) contrast(1.1)' }} />
            )}
            <div className="absolute inset-0 shimmer mix-blend-overlay" />
            <div className="scan-line" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <div className="text-3xl mb-2 pulse-soft">🪄</div>
              <div className="text-base font-bold">{STEPS[stepIdx]}</div>
              <div className="text-xs text-gray-300 mt-1">الذكاء الاصطناعي يعمل على غرفتك...</div>
              <div className="mt-4 w-48 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-1.5 bg-gold transition-all"
                  style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {phase === 'preview' && (
          <div className="space-y-3">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black">
              {imageDataUrl && (
                <img
                  src={imageDataUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: 'blur(14px) brightness(0.85) saturate(1.15)' }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/30 to-navy/80" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <div className="text-5xl mb-2">🎨</div>
                <div className="text-2xl font-black mb-1">المعاينة جاهزة</div>
                <div className="text-sm text-gray-200 mb-4">سجّل (مجاناً) لرؤية التصميم بدقّة كاملة وتحميله</div>
                <button onClick={handleSignup} className="btn-primary text-base">
                  🔓 سجّل الآن — احصل على 5 تصاميم مجانية
                </button>
                <button onClick={reset} className="text-xs text-gray-300 hover:text-white mt-3">جرّب صورة أخرى</button>
              </div>
            </div>
            <div className="text-[11px] text-gray-400 text-center">
              لا نخزّن صورتك في خوادمنا قبل التسجيل · بياناتك محميّة بـ Cloudflare Turnstile
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
