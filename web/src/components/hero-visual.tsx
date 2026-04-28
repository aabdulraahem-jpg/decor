'use client';

/**
 * Animated hero illustration: an architectural blueprint that "transforms"
 * into a finished interior render. Pure SVG + CSS — no images required.
 */
export default function HeroVisual({ imageUrl }: { imageUrl?: string | null }) {
  return (
    <div className="relative">
      {/* Outer frame */}
      <div className="relative aspect-[5/4] rounded-3xl overflow-hidden bg-gradient-to-br from-sand to-white border border-clay/10">
        {/* If an explicit image is set in CMS, show it */}
        {imageUrl ? (
          <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            {/* Background blueprint grid */}
            <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 320" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#a8896d" strokeWidth="0.4" />
                </pattern>
                <linearGradient id="warm" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ede4d3" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
              <rect width="400" height="320" fill="url(#warm)" />
              <rect width="400" height="320" fill="url(#grid)" />
            </svg>

            {/* Drawn room — animated stroke that progressively reveals */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid meet">
              {/* Floor perspective lines */}
              <g stroke="#7d6450" strokeWidth="1.2" fill="none" className="hv-draw">
                {/* Back wall */}
                <polyline points="80,90 320,90 320,230 80,230 80,90" />
                {/* Floor lines */}
                <polyline points="20,300 80,230 320,230 380,300" />
                <polyline points="80,230 80,300" />
                <polyline points="320,230 320,300" />
                {/* Window */}
                <rect x="120" y="120" width="80" height="70" />
                <line x1="160" y1="120" x2="160" y2="190" />
                <line x1="120" y1="155" x2="200" y2="155" />
                {/* Sofa */}
                <path d="M 220 200 Q 220 180 240 180 L 300 180 Q 320 180 320 200 L 320 230 L 220 230 Z" />
                {/* Sofa cushions */}
                <line x1="240" y1="180" x2="240" y2="210" />
                <line x1="270" y1="180" x2="270" y2="210" />
                <line x1="300" y1="180" x2="300" y2="210" />
                {/* Side table */}
                <rect x="180" y="200" width="30" height="30" />
                {/* Lamp on table */}
                <line x1="195" y1="200" x2="195" y2="170" />
                <path d="M 180 170 Q 195 160 210 170 L 200 175 L 190 175 Z" />
                {/* Floor rug */}
                <ellipse cx="220" cy="245" rx="120" ry="18" />
                {/* Ceiling pendant */}
                <line x1="160" y1="90" x2="160" y2="115" />
                <circle cx="160" cy="120" r="5" />
                {/* Wall art */}
                <rect x="240" y="110" width="55" height="40" />
                <line x1="240" y1="135" x2="295" y2="115" />
                <line x1="240" y1="115" x2="295" y2="135" />
                {/* Plant pot */}
                <path d="M 90 215 L 95 230 L 110 230 L 115 215 Z" />
                <path d="M 95 215 Q 90 195 100 200 Q 105 185 108 200 Q 115 195 110 215" />
              </g>

              {/* Color sweep — paints the rendered version on top */}
              <g className="hv-paint">
                {/* Wall warm tone */}
                <rect x="80" y="90" width="240" height="140" fill="#ede4d3" opacity="0.55" />
                {/* Sofa color */}
                <path d="M 220 200 Q 220 180 240 180 L 300 180 Q 320 180 320 200 L 320 230 L 220 230 Z" fill="#a8896d" opacity="0.75" />
                {/* Window light */}
                <rect x="120" y="120" width="80" height="70" fill="#fffdf6" opacity="0.85" />
                {/* Rug */}
                <ellipse cx="220" cy="245" rx="120" ry="18" fill="#7d6450" opacity="0.35" />
                {/* Lamp glow */}
                <circle cx="195" cy="172" r="14" fill="#fff4c2" opacity="0.55" />
              </g>

              {/* Sparkle dots — AI signal */}
              <g className="hv-sparkle">
                <circle cx="270" cy="115" r="2" fill="#a8896d" />
                <circle cx="290" cy="135" r="1.5" fill="#a8896d" />
                <circle cx="250" cy="145" r="1.2" fill="#a8896d" />
                <circle cx="305" cy="195" r="1.8" fill="#a8896d" />
              </g>
            </svg>

            {/* Top scan line — sweeps top to bottom every 4s */}
            <div className="absolute inset-0 pointer-events-none hv-scan" />
          </>
        )}

        {/* Floating chip: AI badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-2xl px-3 py-2 border border-gray-100 flex items-center gap-2 hv-float-a">
          <div className="w-2 h-2 rounded-full bg-sage animate-pulse" />
          <div className="text-[11px] font-bold text-navy">يُولّد بالذكاء الاصطناعي</div>
        </div>

        {/* Floating chip: 4K */}
        <div className="absolute top-4 right-4 bg-clay text-white rounded-2xl px-3 py-1.5 text-[11px] font-bold tracking-wider hv-float-b">
          4K · فوتوريالستيك
        </div>
      </div>

      {/* Floating stat badges (outside the frame, like before but softer) */}
      <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-md p-4 border border-gray-100 max-w-[180px] hv-float-c">
        <div className="font-black text-navy text-lg">+250</div>
        <div className="text-xs text-gray-500">عيّنة وعنصر تصميم جاهز</div>
      </div>
      <div className="absolute -top-5 -left-5 bg-white rounded-2xl shadow-md p-3 border border-gray-100 flex items-center gap-2 hv-float-d">
        <span className="text-2xl">⚡</span>
        <div>
          <div className="text-xs font-bold text-navy">30 ثانية</div>
          <div className="text-[10px] text-gray-500">حتى التصميم الأول</div>
        </div>
      </div>

      <style jsx>{`
        /* Stroke draw animation */
        :global(.hv-draw) {
          stroke-dasharray: 1400;
          stroke-dashoffset: 1400;
          animation: hv-draw 3.2s ease-out 0.2s forwards, hv-redraw 16s ease-in-out 8s infinite;
        }
        @keyframes hv-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes hv-redraw {
          0%, 70% { stroke-dashoffset: 0; }
          80%     { stroke-dashoffset: 1400; }
          90%     { stroke-dashoffset: 0; }
          100%    { stroke-dashoffset: 0; }
        }

        /* Color paint reveal */
        :global(.hv-paint) {
          opacity: 0;
          animation: hv-paint 2.5s ease-out 2.5s forwards, hv-paint-loop 16s ease-in-out 8s infinite;
        }
        @keyframes hv-paint {
          to { opacity: 1; }
        }
        @keyframes hv-paint-loop {
          0%, 60%  { opacity: 1; }
          75%      { opacity: 0; }
          90%      { opacity: 1; }
          100%     { opacity: 1; }
        }

        :global(.hv-sparkle) {
          opacity: 0;
          animation: hv-sparkle 2s ease-in-out 4s infinite;
        }
        @keyframes hv-sparkle {
          0%, 100% { opacity: 0; }
          50%      { opacity: 1; }
        }

        .hv-scan {
          background: linear-gradient(180deg, transparent 0%, rgba(168,137,109,0.30) 50%, transparent 100%);
          height: 60%;
          animation: hv-scan 4s ease-in-out infinite;
          filter: blur(6px);
        }
        @keyframes hv-scan {
          0%, 100% { transform: translateY(-50%); opacity: 0; }
          15%      { opacity: 1; }
          50%      { transform: translateY(120%); opacity: 1; }
          65%      { opacity: 0; }
        }

        .hv-float-a, .hv-float-b, .hv-float-c, .hv-float-d {
          animation: hv-float 6s ease-in-out infinite;
        }
        .hv-float-b { animation-delay: 1.5s; }
        .hv-float-c { animation-delay: 3s; }
        .hv-float-d { animation-delay: 4.5s; }
        @keyframes hv-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
