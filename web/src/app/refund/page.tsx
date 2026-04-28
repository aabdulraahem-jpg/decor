import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata = {
  title: 'سياسة الاسترداد والإلغاء — صفوف رايقة',
  description: 'سياسة شاملة للاسترداد والإلغاء على منصّة صفوف رايقة — حالات الاسترداد، النقاط، المبالغ المالية، النزاعات، والمدد الزمنية.',
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
            بشفافية كاملة: متى يحقّ لك استرداد المال أو النقاط، كيف تطلب ذلك، والمدد الزمنية المتوقَّعة.
            مكتوبة خصّيصاً لطبيعة خدمتنا الرقمية (توليد تصاميم بالذكاء الاصطناعي).
          </p>
          <p className="text-xs text-gray-500 mt-2">آخر تحديث: 28 أبريل 2026</p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <article className="card space-y-6 text-gray-800 leading-loose">

            <Section title="1. سياسة الاسترداد العامّة">
              <p>
                <strong>سيتم استرداد المبلغ بنفس طريقة الدفع التي تم استخدامها عند الشراء، وسيتم معالجتها
                خلال 10 إلى 45 يوم، بحسب البنك المُصدِر للبطاقة الائتمانية.</strong>
              </p>
              <p>
                يقع على عاتق التاجر تفصيل سياسة الاسترجاع واسترداد المال وإلغاء طلبات الشراء بوضوح على الموقع
                الإلكتروني، لتعريف صاحب البطاقة بحقوقه ومسؤولياته.
              </p>
            </Section>

            <Section title="2. الحالات المؤهَّلة للاسترداد">
              <ul className="list-disc pr-5 space-y-2">
                <li><strong>فشل تقني من جانبنا:</strong> فشل التوليد رغم خصم النقاط — تُعاد النقاط فوراً
                  تلقائياً، أو يُسترد المبلغ المالي كاملاً إذا طلبت ذلك.</li>
                <li><strong>خصم مزدوج:</strong> ظهور العملية أكثر من مرّة في كشف حسابك بسبب خطأ بوّابة الدفع.</li>
                <li><strong>عملية غير مصرَّح بها:</strong> شراء تمّ من قِبل طرف ثالث دون إذنك (يُشترط التواصل
                  معنا خلال <strong>7 أيام</strong> من تاريخ العملية + إثبات).</li>
                <li><strong>عيب جوهري في الخدمة:</strong> أثبتنا بأنفسنا أن الخدمة لم تعمل كما هو معلَن خلال
                  فترة الاشتراك.</li>
                <li><strong>عدم تسليم رصيد النقاط:</strong> دفعت لكن النقاط لم تُضَف لحسابك خلال ساعة من إتمام الدفع.</li>
              </ul>
            </Section>

            <Section title="3. الحالات غير المؤهَّلة للاسترداد">
              <ul className="list-disc pr-5 space-y-2">
                <li><strong>التصاميم التي تم توليدها واستلامها بنجاح</strong> — المنتج رقمي وتمّ استهلاك الموارد
                  الحوسبية (DALL-E / GPT-image) فعلياً عند التوليد.</li>
                <li><strong>عدم رضا فنّي:</strong> عدم إعجابك بالنتيجة لاختلاف الذوق أو إعدادات اخترتها بنفسك
                  (نمط، ألوان، مساحة) — لا يُعتبر سبباً للاسترداد بما أن المخرَجات بطبيعتها فنّية وغير قابلة
                  للحصر بنتيجة واحدة محدَّدة.</li>
                <li><strong>النقاط المجانية الترويجية</strong> (5 نقاط الترحيب أو نقاط الحملات): غير قابلة
                  للاسترداد النقدي.</li>
                <li><strong>إعادة بيع/مشاركة الحساب:</strong> الاستخدام مخالف للشروط ولا يُتيح حقّ الاسترداد.</li>
                <li><strong>طلبات بعد مرور أكثر من 90 يوماً</strong> من تاريخ العملية، إلا في حالات الاحتيال المُثبَت.</li>
              </ul>
            </Section>

            <Section title="4. سياسة الإلغاء">
              <ul className="list-disc pr-5 space-y-2">
                <li><strong>إلغاء الباقة قبل أيّ استخدام:</strong> إن لم تستهلك أيّ نقطة من الباقة المشتراة،
                  يمكنك طلب الإلغاء خلال <strong>7 أيام</strong> من تاريخ الشراء وسيتم استرداد المبلغ كاملاً.</li>
                <li><strong>إلغاء جزئي:</strong> إن استهلكت جزءاً من الباقة، يتم استرداد قيمة النقاط
                  المتبقّية بنسبة استخدامها (محسوبة بسعر الوحدة من الباقة المُشتراة، بعد خصم رسوم المعالجة 5٪).</li>
                <li><strong>إلغاء الحساب:</strong> يمكنك طلب حذف الحساب في أيّ وقت من <a href="/contact" className="text-clay-dark font-bold">صفحة تواصل معنا</a>.
                  النقاط غير المُستخدَمة من باقات مدفوعة قابلة للاسترداد وفق ما سبق.</li>
              </ul>
            </Section>

            <Section title="5. أمثلة عمليّة">
              <div className="space-y-3">
                <Example
                  q="دفعت 50 ريال مقابل باقة 30 نقطة، استخدمت 10 نقاط ثم قرّرت الإلغاء."
                  a="20 نقطة متبقّية × سعر الوحدة (50÷30 ≈ 1.67 ريال) = 33.33 ريال. بعد خصم 5٪ رسوم معالجة، يتمّ ردّ ≈ 31.66 ريال خلال 10–45 يوم."
                />
                <Example
                  q="ولّدت تصميماً ولم يعجبني فنّياً."
                  a="لا يحقّ الاسترداد — المنتج تمّ تسليمه. لكن يمكنك إعادة المحاولة بإعدادات مختلفة (تكلفة 5 نقاط لكلّ توليد جديد)."
                />
                <Example
                  q="خُصمت 5 نقاط لكن التصميم لم يُولَّد (خطأ تقني)."
                  a="تُعاد النقاط تلقائياً خلال دقائق. إن لم تُعَد، راسلنا فوراً وستُعَوَّض."
                />
                <Example
                  q="لاحظت خصمَين متشابهَين في كشف بطاقتي."
                  a="راسلنا فوراً مع لقطة من الكشف. سنطلب التحقّق من Amazon Payment Services واسترداد المبلغ المُكرَّر."
                />
              </div>
            </Section>

            <Section title="6. كيفية تقديم طلب الاسترداد">
              <ol className="list-decimal pr-5 space-y-2">
                <li>أرسل بريداً إلى <a href="mailto:support@sufuf.pro" className="text-clay-dark font-bold mx-1" dir="ltr">support@sufuf.pro</a> بعنوان "طلب استرداد".</li>
                <li>اذكر: الاسم، البريد الإلكتروني المسجَّل، رقم العملية (من بريد التأكيد)، تاريخ الشراء، وسبب الطلب.</li>
                <li>سنراجع الطلب ونردّ عليك خلال <strong>يومَي عمل</strong>.</li>
                <li>عند الموافقة، نُرسل طلب الاسترداد لبوّابة الدفع، ويصلك المبلغ خلال <strong>10 إلى 45 يوم</strong> بحسب البنك المُصدِر.</li>
                <li>تصلك رسالة تأكيد إلكترونية عند الموافقة وعند إرسال الاسترداد.</li>
              </ol>
            </Section>

            <Section title="7. النزاعات وعمليات Chargeback">
              <p>
                نشجّعك دائماً على التواصل معنا أولاً قبل فتح نزاع مع البنك (chargeback)، لأنّنا غالباً نحلّ
                المشكلة بشكل أسرع. في حال فتح نزاع:
              </p>
              <ul className="list-disc pr-5 space-y-1.5">
                <li>سنزوّد بنكك/Amazon Payment Services بسجلات استخدام الحساب وعمليات التوليد.</li>
                <li>إن ثبت أن النزاع كان بدون أساس، يحقّ لنا تعليق الحساب واسترداد قيمة المعاملات المعكوسة.</li>
                <li>الاحتيال المتعمَّد عبر chargeback قد يُحال إلى الجهات النظامية المختصّة في المملكة.</li>
              </ul>
            </Section>

            <Section title="8. تنبيه عند غياب سياسة الإلغاء">
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

function Example({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl bg-cream/60 border border-clay/15 p-3">
      <div className="text-sm font-bold text-navy mb-1">س: {q}</div>
      <div className="text-sm text-gray-700">ج: {a}</div>
    </div>
  );
}
