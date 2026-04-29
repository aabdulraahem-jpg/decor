'use client';

import { useEffect, useMemo, useState } from 'react';
import { dataUrlToFile, listPublicCustomElements, uploadReferenceImage } from '@/lib/api';
import { registerCustomElements } from '@/lib/elements';
import SketchEditor, { SketchMarker } from '@/components/sketch-editor';
import SketchStudio from '@/components/sketch-studio';

/**
 * Blank-canvas studio: design a sketch from scratch using all SketchEditor
 * tools. When the user clicks "استخدمه كاسكتش" the canvas exports to PNG,
 * uploads it as a reference image, and routes into the existing
 * SketchStudio flow (analyze → review → customize → sequential).
 *
 * Design choices:
 *  - The editor's underlying image is a generated grid-paper SVG so all
 *    placement coords still use percent-based math.
 *  - Aspect ratio is selectable (square / wide / tall) — the SVG dims
 *    drive the exported PNG dimensions which downstream AI vision sees.
 */

type Aspect = 'square' | 'wide' | 'tall';
const ASPECTS: Record<Aspect, { w: number; h: number; label: string }> = {
  square: { w: 1200, h: 1200, label: '⏹ مربعة 1:1' },
  wide:   { w: 1600, h: 1000, label: '🖼️ أفقية 16:10' },
  tall:   { w: 1000, h: 1600, label: '📜 عمودية 10:16' },
};

function gridSvgDataUrl(w: number, h: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#a8896d" stroke-opacity="0.18" stroke-width="0.6" />
      </pattern>
      <pattern id="grid-major" width="200" height="200" patternUnits="userSpaceOnUse">
        <rect width="200" height="200" fill="url(#grid)" />
        <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#a8896d" stroke-opacity="0.35" stroke-width="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="#fbf8f3" />
    <rect width="100%" height="100%" fill="url(#grid-major)" />
    <text x="${w / 2}" y="${h / 2}" font-family="Cairo, sans-serif" font-size="${Math.round(Math.min(w, h) / 18)}" fill="#a8896d" fill-opacity="0.25" text-anchor="middle" font-weight="900">صفحة فارغة</text>
    <text x="${w / 2}" y="${h / 2 + Math.round(Math.min(w, h) / 14)}" font-family="Cairo, sans-serif" font-size="${Math.round(Math.min(w, h) / 36)}" fill="#a8896d" fill-opacity="0.4" text-anchor="middle">صمّم بيتك من الصفر — جدران، عناصر، أبعاد</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function CanvasStudio() {
  const [aspect, setAspect] = useState<Aspect>('wide');
  const [markers, setMarkers] = useState<SketchMarker[]>([]);
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const bgUrl = useMemo(() => {
    const a = ASPECTS[aspect];
    return gridSvgDataUrl(a.w, a.h);
  }, [aspect]);

  useEffect(() => {
    void listPublicCustomElements()
      .then((items) => registerCustomElements(items))
      .catch(() => { /* fall back to built-ins */ });
  }, []);

  async function handleUseAsSketch(dataUrl: string) {
    setError('');
    setSubmitting(true);
    try {
      const file = await dataUrlToFile(dataUrl, `canvas-sketch-${Date.now()}.png`);
      const { url } = await uploadReferenceImage(file);
      setSubmittedUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تجهيز الاسكتش');
    } finally {
      setSubmitting(false);
    }
  }

  // Once the canvas was uploaded as a sketch, hand control to SketchStudio.
  // We seed it with sketchUrl so the user skips the upload step.
  if (submittedUrl) {
    return <SketchStudio initialSketchUrl={submittedUrl} />;
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div>
            <h3 className="text-lg font-black text-navy">📐 صفحة بيضاء — صمّم اسكتشك من الصفر</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              ارسم الجدران والممرات وأضف العناصر، ثم استخدم الزرّ في زاوية المحرّر لتحويل اللوحة إلى اسكتش
              يُحلّله الذكاء ويُولّد لك تصاميم لكل مساحة.
            </p>
          </div>
          <div className="flex gap-1 bg-cream rounded-full p-0.5">
            {(Object.keys(ASPECTS) as Aspect[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAspect(a)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
                  aspect === a ? 'bg-navy text-white' : 'text-navy hover:bg-white'
                }`}
              >
                {ASPECTS[a].label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-clay/5 border border-clay/20 p-3 text-[12px] text-gray-700 leading-relaxed mb-3">
          <strong className="text-navy">✨ نصائح:</strong>{' '}
          استخدم «🧱 جدار حر» لإضافة الجدران بطول/سمك/زاوية، الأركان تلتصق تلقائياً عند الاقتراب من جدار آخر.
          أضف «🔤 نص» لاسم كل غرفة (مجلس، صالة، حمام…) ليتعرّف عليها الذكاء عند التحليل.
          استخدم «🖼️ ألصق صورة» لإدراج صورة قطعة أثاث أو ديكور تريد إدراجها كمرجع بصري.
        </div>

        <SketchEditor
          sketchUrl={bgUrl}
          markers={markers}
          onChange={setMarkers}
          onUseAsSketch={handleUseAsSketch}
          blankCanvasMode
        />

        {submitting && (
          <div className="text-center text-sm text-navy py-3 animate-pulse">⏳ جارٍ تحويل اللوحة إلى اسكتش...</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mt-3">{error}</div>
        )}
      </div>
    </div>
  );
}
