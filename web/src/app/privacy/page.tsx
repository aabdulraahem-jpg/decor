import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata = {
  title: 'سياسة الخصوصية — صفوف رايقة',
  description: 'كيف نجمع بياناتك ونحميها على منصّة صفوف رايقة. شفافية كاملة بشأن بياناتك ومدفوعاتك.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <section className="hero-bg">
        <div className="max-w-4xl mx-auto px-4 py-14 md:py-20">
          <span className="badge bg-clay/15 text-clay-dark mb-4">قانوني</span>
          <h1 className="display text-3xl md:text-5xl font-black text-navy mb-3 leading-tight">سياسة الخصوصية</h1>
          <p className="text-gray-600 text-base md:text-lg">
            خصوصيتك أولوية. هذه السياسة توضّح ما هي المعلومات التي نجمعها وكيف نستخدمها ونحميها.
          </p>
          <p className="text-xs text-gray-500 mt-2">آخر تحديث: 28 أبريل 2026</p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <article className="card space-y-6 text-gray-800 leading-loose">

            <Section title="1. البيانات التي نجمعها">
              <ul className="list-disc pr-5 space-y-2">
                <li>الاسم والبريد الإلكتروني عند إنشاء الحساب.</li>
                <li>صور الغرف والاسكيتشات التي ترفعها لاستخدامها في توليد التصاميم.</li>
                <li>بيانات الجلسة الفنية (نوع المتصفّح، عنوان IP، وقت الزيارة) لأغراض الأمان وتحسين الأداء.</li>
              </ul>
            </Section>

            <Section title="2. بيانات الدفع">
              <p>
                <strong>لن يتم تخزين أيّ بيانات خاصة بالبطاقة الائتمانية أو بطاقة الخصم المباشر أو معلومات
                التعريف الشخصية أو بيعها أو مشاركتها أو تأجيرها لأي طرف خارجي.</strong>
              </p>
              <p>
                إذا قمت بالدفع مقابل منتجاتنا أو خدماتنا على الموقع الإلكتروني، فإن البيانات التي يتم طلبها
                منك سيتم إرسالها مباشرة إلى مقدّم خدمة الدفع (Amazon Payment Services) عبر اتصال آمن مشفّر
                (TLS/SSL).
              </p>
              <p>
                <strong>لن يقوم التاجر بمشاركة أيّ تفاصيل عن البطاقة الائتمانية أو بطاقة الخصم المباشر مع أيّ طرف خارجي.</strong>
              </p>
            </Section>

            <Section title="3. أمان البيانات">
              <p>
                يتّخذ التاجر جميع الإجراءات اللازمة لضمان خصوصية وأمان البيانات عبر استخدام أجهزة وبرمجيات
                مختلفة. لكن لا يستطيع موقع <span dir="ltr" className="font-mono">sufuf.pro</span> أن يضمن أمان أيّ
                معلومات يتم الإفصاح عنها عبر الإنترنت بنسبة 100٪ — ننصحك دائماً باستخدام كلمات مرور قويّة
                وعدم مشاركتها.
              </p>
            </Section>

            <Section title="4. كيف نستخدم بياناتك">
              <ul className="list-disc pr-5 space-y-2">
                <li>تنفيذ خدمة توليد التصاميم وحفظ تصاميمك في حسابك.</li>
                <li>إرسال إشعارات تتعلق بالحساب (تأكيد الدفع، رمز التحقق، تنبيهات أمنية).</li>
                <li>تحسين أداء النظام واكتشاف محاولات الاحتيال.</li>
                <li>الالتزام بالمتطلبات النظامية والقانونية في المملكة العربية السعودية.</li>
              </ul>
              <p>
                لا نستخدم بياناتك لأغراض تسويقية لطرف ثالث، ولا نبيعها.
              </p>
            </Section>

            <Section title="5. الأطراف الخارجية والمواقع المرتبطة">
              <p>
                التاجر غير مسؤول عن سياسات الخصوصية الخاصة بالمواقع الإلكترونية الأخرى المرتبطة بموقعنا. في
                حال تقديمك لمعلومات شخصية لأيّ من تلك الأطراف الخارجية، فقد يتم تطبيق سياسة مختلفة بخصوص
                جمع واستخدام بياناتك الشخصية. عليك التواصل مباشرة مع تلك الجهة إذا كان لديك أيّ سؤال عن
                طريقة استخدامها للمعلومات التي تقوم بجمعها.
              </p>
            </Section>

            <Section title="6. ملفّات تعريف الارتباط (Cookies)">
              <p>
                نستخدم Cookies تقنية ضرورية لتشغيل الجلسة وأمان تسجيل الدخول. لا نستخدم Cookies إعلانية ولا
                نتتبّع نشاطك خارج موقعنا.
              </p>
            </Section>

            <Section title="7. حقوقك">
              <ul className="list-disc pr-5 space-y-2">
                <li>الوصول إلى بياناتك وطلب نسخة منها.</li>
                <li>طلب تصحيح أيّ بيان غير صحيح.</li>
                <li>طلب حذف حسابك ومسح بياناتك (وفق الالتزامات القانونية للاحتفاظ بسجلات الفواتير).</li>
              </ul>
              <p>
                لممارسة هذه الحقوق، راسلنا على
                <a href="mailto:support@sufuf.pro" className="text-clay-dark font-bold mx-1" dir="ltr">support@sufuf.pro</a>.
              </p>
            </Section>

          </article>
        </div>
      </section>

      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl md:text-2xl font-black text-navy mb-3">{title}</h2>
      <div className="space-y-3 text-base">{children}</div>
    </section>
  );
}
