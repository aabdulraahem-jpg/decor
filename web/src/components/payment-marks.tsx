/**
 * Payment-method brand marks rendered as inline SVG so they look sharp at any
 * DPR and need no external assets. Each mark exposes a `size` prop ('sm' | 'lg')
 * — `sm` matches the 48×30 footer pill, `lg` is a larger card-sized version
 * used on the pricing page.
 */

type Size = 'sm' | 'lg';

interface MarkProps {
  size?: Size;
  className?: string;
}

function dims(size: Size) {
  return size === 'lg'
    ? { w: 88, h: 56, svgW: 78, svgH: 26 }
    : { w: 48, h: 30, svgW: 38, svgH: 14 };
}

export function VisaMark({ size = 'sm', className }: MarkProps) {
  const d = dims(size);
  return (
    <span
      className={`inline-flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-200 ${className ?? ''}`}
      style={{ width: d.w, height: d.h }}
      aria-label="VISA"
    >
      <svg viewBox="0 0 80 26" width={d.svgW} height={d.svgH} aria-hidden="true">
        <text
          x="40" y="22" textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="900"
          fontSize="22"
          fontStyle="italic"
          fill="#1a1f71"
          letterSpacing="-1"
        >VISA</text>
        <rect x="8" y="24" width="64" height="2" fill="#f9a51a" />
      </svg>
    </span>
  );
}

export function MastercardMark({ size = 'sm', className }: MarkProps) {
  const d = dims(size);
  const inner = size === 'lg' ? { w: 60, h: 40 } : { w: 36, h: 22 };
  return (
    <span
      className={`inline-flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-200 ${className ?? ''}`}
      style={{ width: d.w, height: d.h }}
      aria-label="Mastercard"
    >
      <svg viewBox="0 0 40 26" width={inner.w} height={inner.h} aria-hidden="true">
        <circle cx="14.5" cy="13" r="9" fill="#eb001b" />
        <circle cx="25.5" cy="13" r="9" fill="#f79e1b" />
        <path
          d="M 20 6.5 A 9 9 0 0 1 20 19.5 A 9 9 0 0 1 20 6.5"
          fill="#ff5f00"
        />
      </svg>
    </span>
  );
}

export function MadaMark({ size = 'sm', className }: MarkProps) {
  const d = dims(size);
  const inner = size === 'lg' ? { w: 70, h: 30 } : { w: 42, h: 18 };
  return (
    <span
      className={`inline-flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-200 ${className ?? ''}`}
      style={{ width: d.w, height: d.h }}
      aria-label="mada"
    >
      <svg viewBox="0 0 60 26" width={inner.w} height={inner.h} aria-hidden="true">
        <text
          x="30" y="20" textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="900"
          fontSize="16"
          fill="#231f20"
          letterSpacing="-0.5"
        >mada</text>
        <circle cx="22" cy="6" r="2" fill="#84B135" />
        <circle cx="38" cy="6" r="2" fill="#36A6CC" />
      </svg>
    </span>
  );
}

export function ApplePayMark({ size = 'sm', className }: MarkProps) {
  const d = dims(size);
  const inner = size === 'lg' ? { w: 76, h: 32 } : { w: 44, h: 18 };
  return (
    <span
      className={`inline-flex items-center justify-center bg-black rounded-md shadow-sm ${className ?? ''}`}
      style={{ width: d.w, height: d.h }}
      aria-label="Apple Pay"
    >
      <svg viewBox="0 0 60 26" width={inner.w} height={inner.h} aria-hidden="true">
        <path
          d="M 12.5 6.6 c -0.4 0.5 -1.1 0.9 -1.7 0.8 c -0.1 -0.7 0.2 -1.4 0.6 -1.9 c 0.4 -0.5 1.1 -0.9 1.7 -0.9 c 0.1 0.7 -0.2 1.4 -0.6 2 z m 0.6 1 c -0.9 -0.05 -1.7 0.5 -2.1 0.5 c -0.4 0 -1.1 -0.5 -1.8 -0.5 c -0.9 0.01 -1.8 0.5 -2.3 1.4 c -1 1.7 -0.3 4.2 0.7 5.6 c 0.5 0.7 1 1.4 1.8 1.4 c 0.7 -0.03 1 -0.5 1.8 -0.5 c 0.8 0 1.1 0.5 1.8 0.5 c 0.8 -0.01 1.3 -0.7 1.7 -1.4 c 0.4 -0.6 0.7 -1.4 0.7 -1.4 c 0 0 -1.4 -0.5 -1.4 -2.1 c 0 -1.3 1.1 -1.9 1.1 -1.9 c -0.6 -0.9 -1.6 -1.05 -2 -1.1 z"
          fill="white"
        />
        <text
          x="42" y="18" textAnchor="middle"
          fontFamily="-apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="11"
          fill="white"
        >Pay</text>
      </svg>
    </span>
  );
}

/** Google Pay — "G" in brand colors + "Pay" wordmark on white. */
export function GooglePayMark({ size = 'sm', className }: MarkProps) {
  const d = dims(size);
  const inner = size === 'lg' ? { w: 78, h: 32 } : { w: 46, h: 18 };
  return (
    <span
      className={`inline-flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-200 ${className ?? ''}`}
      style={{ width: d.w, height: d.h }}
      aria-label="Google Pay"
    >
      <svg viewBox="0 0 60 26" width={inner.w} height={inner.h} aria-hidden="true">
        {/* Google "G" — multi-color circle approximation */}
        <g transform="translate(8 5)">
          <path d="M 8 0 a 8 8 0 0 1 5.5 2.2 l -2.2 2.2 a 5 5 0 1 0 1.6 5.1 H 8 V 6.5 h 7.6 a 8 8 0 1 1 -7.6 -6.5 z" fill="#4285F4" />
          <path d="M 0 8 a 8 8 0 0 0 13.5 5.5 l -2.2 -2.2 a 5 5 0 0 1 -8.4 -2 z" fill="#34A853" opacity="0.95" />
        </g>
        <text
          x="42" y="18" textAnchor="middle"
          fontFamily="-apple-system, Roboto, Arial, sans-serif"
          fontWeight="700"
          fontSize="11"
          fill="#3c4043"
        >Pay</text>
      </svg>
    </span>
  );
}
