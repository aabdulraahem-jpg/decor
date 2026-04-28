export default function Footer() {
  return (
    <footer className="bg-navy text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center text-navy font-black">ص</div>
            <span className="text-white font-black text-lg">صفوف رايقة</span>
          </div>
          <p className="text-sm text-gray-400">منصّة لتصميم الديكور بالذكاء الاصطناعي.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-sm">المنتج</h4>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-gold" href="/studio">استوديو التصميم</a></li>
            <li><a className="hover:text-gold" href="/pricing">الباقات</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-sm">قانوني</h4>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-gold" href="/terms">الشروط</a></li>
            <li><a className="hover:text-gold" href="/privacy">الخصوصية</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-lighter">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} صفوف رايقة — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
