import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata = {
  title: 'سياسة الاسترداد والإلغاء — صفوف رايقة',
  description: 'حقوقك ومسؤولياتك بشأن استرداد المبالغ، إلغاء الباقات، وأمثلة الحالات المسموح فيها بالاسترداد.',
};

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <section className="hero-bg">
        <div className="max-w-4xl mx-auto px-4 py-14 md:py-20">
          <span className="badge bg-clay/15 text-clay-dark mb-4">قانوني</span>
          <h1 className="display text-3xl md:text-5xl font-black text-navy mb-3 leading-tight">
            سياسة الاسترداد والإلغاء
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            نوضّح هنا بشفافية كاملة كيف يتم استرداد المبالغ والإلغاء، حتى يكون صاحب البطاقة على دراية بحقوقه ومسؤولياته.
          </p>
          <p className="text-xs text-gray-500 mt-2">آخر تحديث: 28 أبريل 2026</p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <article className="card space-y-6 text-gray-800 leading-loose">

            <Section title="1. سياسة الاسترداد">
              <p>
                <strong>سيتم استرداد المبلغ بنفس طريقة الدفع التي تم استخدامها عند الشراء، وسيتم معالجتها
                خلال 10 إلى 45 يوم، بحسب البنك المُصدِر للبطاقة الائتمانية.</strong>
              </p>
              <p>
                يقع على عاتق التاجر تفصيل سياسة الاسترجاع واسترداد المال وإلغاء طلبات الشراء بوضوح على الموقع
                الإلكتروني، لتعريف صاحب البطاقة بحقوقه ومسؤولياته.
              </p>
            </Section>

            <Section title="2. الحالات المسموح فيها بالاسترداد">
              <ul className="list-disc pr-5 space-y-2">
                <li>فشل تقني من جانبنا منع توليد التصميم رغم خصم النقاط — يتم استرداد النقاط فوراً، أو
                  استرداد المبلغ المالي كاملاً إذا طلبت ذلك.</li>
                <li>خصم مزدوج للمبلغ من بطاقتك بسبب خطأ في بوّابة الدفع.</li>
                <li>عملية شراء غير مصرَّح بها قام بها طرف ثالث (يُشترط التواصل خلال 7 أيام من تاريخ العملية).</li>
                <li>عيب جوهري في الخدمة أثبتنا بأنفسنا وقوعه.</li>
              </ul>
            </Section>

            <Section title="3. الحالات غير المؤهَّلة للاسترداد">
              <ul className="list-disc pr-5 space-y-2">
                <li><strong>التصاميم التي تم توليدها واستلامها بنجاح</strong> — لأن المنتج رقمي وتمّ
                  استهلاك الموارد الحوسبية (DALL-E / GPT-image) فعلياً عند التوليد.</li>
                <li>عدم رضا المستخدم عن النتيجة الفنّية، إذ النتائج تختلف حسب جودة المدخلات وإعدادات
                  التصميم التي يختارها المستخدم بنفسه.</li>
                <li>النقاط المجانية الترويجية (5 نقاط الترحيب) — غير قابلة للاسترداد النقدي.</li>
              </ul>
            </Section>

            <Section title="4. سياسة الإلغاء">
              <p>
                يجب ذكر الفترة الزمنية المتوقَّعة للإبلاغ عن منتج أو خدمة تم شراؤه ومطلوب إلغاؤه/استبداله
                والشروط المتعلّقة بذلك. لدينا:
              </p>
              <ul className="list-disc pr-5 space-y-2">
                <li><strong>إلغاء الباقة قبل أيّ استخدام:</strong> إن لم تستهلك أيّ نقطة من الباقة المشتراة،
                  يمكنك طلب الإلغاء خلال <strong>7 أيام</strong> من تاريخ الشراء وسيتم استرداد المبلغ كاملاً.</li>
                <li><strong>إلغاء جزئي:</strong> إن استهلكت جزءاً من الباقة، يتم استرداد قيمة النقاط
                  المتبقّية بنسبة استخدامها (محسوبة بسعر الوحدة من الباقة المُشتراة).</li>
                <li><strong>إلغاء الحساب:</strong> يمكنك طلب حذف الحساب في أيّ وقت من <a href="/contact" className="text-clay-dark font-bold">صفحة تواصل معنا</a>.</li>
              </ul>
            </Section>

            <Section title="5. كيفية تقديم طلب الاسترداد">
              <ol className="list-decimal pr-5 space-y-2">
                <li>أرسل بريداً إلى <a href="mailto:hello@sufuf.pro" className="text-clay-dark font-bold mx-1" dir="ltr">hello@sufuf.pro</a> بعنوان "طلب استرداد".</li>
                <li>اذكر: الاسم، رقم العملية، تاريخ الشراء، وسبب طلب الاسترداد.</li>
                <li>سنراجع الطلب ونردّ عليك خلال يومَي عمل.</li>
                <li>عند الموافقة، يتم إرسال طلب الاسترداد لبوّابة الدفع، ويصلك المبلغ خلال <strong>10 إلى 45 يوم</strong> بحسب البنك المُصدِر.</li>
              </ol>
            </Section>

            <Section title="6. تنبيه عند غياب سياسة الإلغاء">
              <p>
                إذا كان لا يوجد سياسة إلغاء أو سياسة استرداد المال، فيجب توضيح هذا لصاحب البطاقة قبل أن يتخذ
                قرار الشراء لمنع أيّ سوء فهم أو شكاوى. <strong>سياستنا أعلاه تطبَّق على جميع المعاملات</strong>،
                ويُعتبر إتمام الشراء موافقةً صريحة عليها.
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
