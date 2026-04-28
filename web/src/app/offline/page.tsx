export const metadata = {
  title: 'لا يوجد اتصال',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center hero-bg p-6">
      <div className="card max-w-md text-center">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="display text-2xl font-black text-navy mb-2">لا يوجد اتصال بالإنترنت</h1>
        <p className="text-gray-600 mb-5">
          تأكّد من اتصالك ثم أعد المحاولة. تصاميمك المحفوظة ستكون بانتظارك حين تعود.
        </p>
        <a href="/" className="btn-primary">إعادة المحاولة</a>
      </div>
    </main>
  );
}
