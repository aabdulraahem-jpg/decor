import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata = {
  title: 'سياسة التسليم وتأكيد الدفع — صفوف رايقة',
  description: 'صفوف رايقة منصّة رقمية — تُسلَّم التصاميم على الفور إلى حساب المستخدم. تفاصيل التسليم وتأكيد الدفع.',
};

export default function ShippingPage() {
  return (
    <>
      <Navbar />
      <section className="hero-bg">
        <div className="max-w-4xl mx-auto px-4 py-14 md:py-20">
          <span className="badge bg-clay/15 text-clay-dark mb-4">قانوني</span>
          <h1 className="display text-3xl md:text-5xl font-black text-navy mb-3 leading-tight">
            سياسة التسليم وتأكيد الدفع
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            صفوف رايقة <strong>خدمة رقمية بالكامل</strong> — لا يوجد شحن مادي. فيما يلي تفاصيل التسليم
            الإلكتروني وتأكيد الدفع.
          </p>
          <p className="text-xs text-gray-500 mt-2">آخر تحديث: 28 أبريل 2026</p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <article className="card space-y-6 text-gray-800 leading-loose">

            <Section title="1. طبيعة الخدمة (رقمية)">
              <p>
                ما يقدّمه الموقع هو <strong>تصاميم رقمية</strong> يُولّدها الذكاء الاصطناعي على الطلب. لا
                توجد منتجات مادية تُشحن، لذلك:
              </p>
              <ul className="list-disc pr-5 space-y-2">
                <li><strong>مصاريف الشحن:</strong> لا يوجد — التسليم رقمي مجاني.</li>
                <li><strong>وقت التسليم:</strong> فوريّ خلال <strong>10 إلى 30 ثانية</strong> من إتمام عملية التوليد.</li>
                <li><strong>منطقة التغطية:</strong> داخل المملكة العربية السعودية ودولياً (حيثما يصل المستخدم للإنترنت)، باستثناء الدول الواردة أدناه.</li>
              </ul>
            </Section>

            <Section title="2. تأكيد عملية الدفع">
              <p>
                عند إتمام شراء أيّ باقة نقاط، يستقبل العميل تأكيد العملية عبر القنوات التالية:
              </p>
              <ul className="list-disc pr-5 space-y-2">
                <li><strong>صفحة تأكيد فورية</strong> داخل حساب المستخدم بعد عودته من بوّابة الدفع.</li>
                <li><strong>رسالة بريد إلكتروني</strong> تحتوي على رقم العملية ورصيد النقاط الجديد، تصل خلال
                  <strong> دقيقتين كحدّ أقصى</strong> من إتمام الدفع.</li>
                <li>إشعار داخلي في صفحة <a href="/account" className="text-clay-dark font-bold">حسابي</a> برصيد النقاط المحدَّث فوراً.</li>
              </ul>
              <p>
                إن لم تستلم البريد الإلكتروني خلال 5 دقائق، تحقّق من مجلد الـSpam، أو راسلنا على
                <a href="mailto:hello@sufuf.pro" className="text-clay-dark font-bold mx-1" dir="ltr">hello@sufuf.pro</a>.
              </p>
            </Section>

            <Section title="3. تسليم التصاميم">
              <p>
                بعد كل عملية توليد ناجحة:
              </p>
              <ul className="list-disc pr-5 space-y-2">
                <li>يتم خصم 5 نقاط من رصيدك مقابل التصميم.</li>
                <li>يُحفظ التصميم تلقائياً في صفحة <a href="/history" className="text-clay-dark font-bold">تصاميمي</a>.</li>
                <li>يمكنك تحميل الصورة بدقة 4K في أيّ وقت.</li>
              </ul>
            </Section>

            <Section title="4. الدول المُستثناة (الامتثال للعقوبات)">
              <p>
                <a href="https://sufuf.pro" className="text-clay-dark font-bold underline" dir="ltr">sufuf.pro</a>
                {' '}لن يتعامل أو يقدم أيّ خدمات أو منتجات إلى الدول التي قام مكتب مراقبة الأصول الأجنبية
                بفرض عقوبات عليها وفقاً <strong>لقوانين المملكة العربية السعودية</strong> والاتفاقيات الدولية ذات الصلة.
              </p>
            </Section>

            <Section title="5. تنبيه بشأن الازدواجية">
              <p>
                <strong>إن إتمام العملية أكثر من مرّة قد يؤدّي إلى ظهور العملية أكثر من مرّة في كشف حساب
                صاحب البطاقة.</strong> راجع كشف حسابك قبل تكرار المحاولة، وتواصل معنا فوراً إن شككت بازدواجية
                الخصم لإجراء التحقّق والاسترداد عند الحاجة.
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
