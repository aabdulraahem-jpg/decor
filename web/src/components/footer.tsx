export default function Footer() {
  return (
    <footer className="bg-navy text-gray-300 mt-16">
      {/* Innovative business-credential strip */}
      <div className="bg-gradient-to-l from-navy via-navy-lighter to-navy border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-7">
          <div className="grid md:grid-cols-[auto_1fr_auto] items-center gap-5">
            {/* Animated seal */}
            <div className="relative w-20 h-20 mx-auto md:mx-0 shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-clay to-clay-dark flex items-center justify-center text-white font-black text-[10px] leading-tight text-center shadow-lg">
                <div>
                  <div className="text-[8px] tracking-widest opacity-90">منشأة</div>
                  <div className="text-sm">موثّقة</div>
                  <div className="text-[8px] tracking-widest opacity-90">SAUDI</div>
                </div>
              </div>
              <div className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-sage flex items-center justify-center text-white text-sm shadow-md ring-4 ring-navy">✓</div>
              <span className="absolute inset-0 rounded-full border border-dashed border-clay/40 animate-[spin_28s_linear_infinite]" aria-hidden="true" />
            </div>

            {/* Number with marquee feel */}
            <div className="text-center md:text-right">
              <div className="text-[11px] uppercase tracking-[0.2em] text-clay-light/80 mb-1">
                الرقم الوطني الموحّد للمنشأة
              </div>
              <div
                dir="ltr"
                className="display text-3xl md:text-4xl font-black text-white tabular-nums tracking-[0.18em]"
                aria-label="الرقم الوطني الموحد 7054166389"
              >
                {'7054166389'.split('').map((d, i) => (
                  <span
                    key={i}
                    className="inline-block transition-transform hover:-translate-y-0.5 hover:text-clay-light"
                    style={{ transitionDelay: `${i * 20}ms` }}
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="mt-1.5 flex flex-wrap justify-center md:justify-start gap-1.5">
                <span className="badge bg-sage/20 text-sage inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                  نشط
                </span>
                <span className="badge bg-white/10 text-gray-200">سجل رئيسي</span>
                <span className="badge bg-white/10 text-gray-200">مؤسسة فردية</span>
              </div>
            </div>

            {/* Verify hint */}
            <div className="text-center md:text-left text-xs text-gray-400 leading-relaxed max-w-[14rem] mx-auto md:mx-0">
              يمكن التحقّق من بيانات المنشأة عبر منصّات الأعمال الرسمية في
              <span className="text-clay-light"> المملكة العربية السعودية</span>.
            </div>
          </div>
        </div>
      </div>

      {/* Main footer columns */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-5 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center text-navy font-black">ص</div>
            <span className="text-white font-black text-lg">صفوف رايقة</span>
          </div>
          <p className="text-sm text-gray-400 mb-4">منصّة لتصميم الديكور بالذكاء الاصطناعي.</p>

          {/* Accepted cards */}
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-2">طرق الدفع المقبولة</div>
            <div className="flex items-center gap-2 flex-wrap">
              <PayBadge label="VISA" bg="#1a1f71" />
              <PayBadge label="Mastercard" bg="#eb001b" />
              <PayBadge label="mada" bg="#231f20" />
              <PayBadge label="Apple Pay" bg="#000000" />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="text-sage">🔒</span>
              <span>SSL · مدفوعات آمنة عبر Amazon Payment Services</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-sm">المنتج</h4>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-gold" href="/studio">استوديو التصميم</a></li>
            <li><a className="hover:text-gold" href="/pricing">الباقات</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-sm">المؤسسة</h4>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-gold" href="/about">من نحن</a></li>
            <li><a className="hover:text-gold" href="/contact">تواصل معنا</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-sm">قانوني</h4>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-gold" href="/terms">الشروط والأحكام</a></li>
            <li><a className="hover:text-gold" href="/privacy">سياسة الخصوصية</a></li>
            <li><a className="hover:text-gold" href="/shipping">سياسة التسليم</a></li>
            <li><a className="hover:text-gold" href="/refund">الاسترداد والإلغاء</a></li>
          </ul>
        </div>
      </div>

      {/* Owner attribution */}
      <div className="border-t border-navy-lighter">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} <span className="text-white font-bold">صفوف رايقة</span> — جميع الحقوق محفوظة
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-clay" />
            <span>
              مؤسسة صفوف رايقة <span className="text-gray-500">—</span> <span className="text-white font-semibold">صاحبة الصفحة</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PayBadge({ label, bg }: { label: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center justify-center text-[11px] font-black text-white px-2.5 py-1.5 rounded-md min-w-[52px] tracking-wide shadow-sm border border-white/10"
      style={{ backgroundColor: bg }}
    >
      {label}
    </span>
  );
}
