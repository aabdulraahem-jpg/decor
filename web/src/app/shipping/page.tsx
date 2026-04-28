import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata = {
  title: 'سياسة التسليم وتأكيد الدفع — صفوف رايقة',
  description: 'تفاصيل تسليم التصاميم الرقمية على منصّة صفوف رايقة، إشعارات تأكيد الدفع، ومنطقة التغطية الجغرافية.',
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
            صفوف رايقة <strong>خدمة رقمية بالكامل</strong> — لا يوجد شحن مادي. نوضّح هنا تفاصيل التسليم
            الإلكتروني الفوري، تأكيد الدفع، وحالات الفشل التقني.
          </p>
          <p className="text-xs text-gray-500 mt-2">آخر تحديث: 28 أبريل 2026</p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <article className="card space-y-6 text-gray-800 leading-loose">

            <Section title="1. طبيعة الخدمة (رقمية)">
              <p>
                ما يقدّمه الموقع هو <strong>تصاميم رقمية</strong> يُولّدها الذكاء الاصطناعي على الطلب، إضافة
                إلى <strong>رصيد نقاط</strong> يُستخدَم لتوليد التصاميم. لا توجد منتجات مادية تُشحن:
              </p>
              <ul className="list-disc pr-5 space-y-2">
                <li><strong>مصاريف الشحن:</strong> لا يوجد — التسليم رقمي مجاني.</li>
                <li><strong>وقت تسليم رصيد النقاط:</strong> فوريّ في حسابك بمجرّد إتمام الدفع بنجاح.</li>
                <li><strong>وقت توليد التصميم:</strong> <strong>10 إلى 30 ثانية</strong> في الظروف العادية.
                  قد يصل إلى 90 ثانية وقت ذروة الاستخدام لدى مزوّد النموذج.</li>
                <li><strong>قنوات التسليم:</strong> صفحة <a href="/history" className="text-clay-dark font-bold">تصاميمي</a>،
                  ورابط تحميل بدقة 4K يبقى متاحاً ما دام الحساب نشطاً.</li>
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
                <li>سجل العمليات في صفحة الفواتير الخاصّة بالحساب — متاح للتحميل بصيغة PDF.</li>
              </ul>
              <p>
                إن لم تستلم البريد الإلكتروني خلال 5 دقائق، تحقّق من مجلد الـSpam، أو راسلنا على
                <a href="mailto:support@sufuf.pro" className="text-clay-dark font-bold mx-1" dir="ltr">support@sufuf.pro</a>.
              </p>
            </Section>

            <Section title="3. تسليم التصاميم بعد كل عملية توليد">
              <ul className="list-disc pr-5 space-y-2">
                <li>يتم خصم 5 نقاط من رصيدك مقابل كلّ تصميم.</li>
                <li>يُحفظ التصميم تلقائياً في صفحة <a href="/history" className="text-clay-dark font-bold">تصاميمي</a>.</li>
                <li>يمكنك تحميل الصورة بدقة 4K في أيّ وقت، أو حذفها من حسابك.</li>
                <li>التصاميم تبقى متاحة على خوادمنا ما دام الحساب نشطاً، أو حتى تحذفها أنت.</li>
              </ul>
            </Section>

            <Section title="4. حالات فشل التسليم وكيفية معالجتها">
              <ul className="list-disc pr-5 space-y-2">
                <li><strong>فشل في توليد التصميم بعد خصم النقاط:</strong> تُعاد النقاط تلقائياً خلال
                  دقائق، أو يمكنك طلب استرداد المبلغ المالي كاملاً (<a href="/refund" className="text-clay-dark font-bold">سياسة الاسترداد</a>).</li>
                <li><strong>فشل في معالجة الدفع:</strong> لن تُخصم نقاط ولا مبلغ. أعد المحاولة، أو راسلنا.</li>
                <li><strong>صورة مرفوعة لم يقبلها مزوّد النموذج</strong> (لأسباب سياسات المحتوى): لن تُخصم
                  نقاط، وستظهر لك رسالة توضيحية.</li>
                <li><strong>انقطاع مؤقت للخدمة:</strong> نُبلَغ المستخدمين عبر صفحة الحالة، ونعوّض النقاط
                  المتأثّرة.</li>
              </ul>
            </Section>

            <Section title="5. منطقة التغطية الجغرافية">
              <p>
                الخدمة متاحة عالمياً عبر الإنترنت لأيّ مستخدم بحساب صالح، باستثناء الدول المذكورة أدناه.
                <strong> العنوان البريدي للمشغّل</strong> (مؤسسة صفوف رايقة): جدّة، حيّ البوادي، مبنى
                <span dir="ltr" className="font-mono mx-1">2475</span>، الرمز البريدي
                <span dir="ltr" className="font-mono mx-1">23531</span>، المملكة العربية السعودية.
              </p>
            </Section>

            <Section title="6. الدول المُستثناة (الامتثال للعقوبات)">
              <p>
                <a href="https://sufuf.pro" className="text-clay-dark font-bold underline" dir="ltr">sufuf.pro</a>
                {' '}لن يتعامل أو يقدم أيّ خدمات أو منتجات إلى الدول التي قام مكتب مراقبة الأصول الأجنبية
                بفرض عقوبات عليها وفقاً <strong>لقوانين المملكة العربية السعودية</strong> والاتفاقيات الدولية ذات الصلة.
              </p>
              <p>
                إن حاولت الوصول من إحدى هذه المناطق، سيتمّ رفض إنشاء الحساب أو إتمام الدفع تلقائياً.
              </p>
            </Section>

            <Section title="7. تنبيه بشأن الازدواجية">
              <p>
                <strong>إن إتمام العملية أكثر من مرّة قد يؤدّي إلى ظهور العملية أكثر من مرّة في كشف حساب
                صاحب البطاقة.</strong> راجع كشف حسابك قبل تكرار المحاولة، وتواصل معنا فوراً إن شككت بازدواجية
                الخصم لإجراء التحقّق والاسترداد عند الحاجة.
              </p>
            </Section>

            <Section title="8. التواصل بشأن التسليم">
              <p>
                لأيّ استفسار يخصّ تسليم تصميم أو تأكيد دفع:
                <a href="mailto:support@sufuf.pro" className="text-clay-dark font-bold mx-1" dir="ltr">support@sufuf.pro</a>
                — نردّ عادةً خلال يوم عمل.
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
