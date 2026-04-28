import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata = {
  title: 'الشروط والأحكام — صفوف رايقة',
  description: 'الشروط والأحكام الخاصّة باستخدام منصّة صفوف رايقة. مؤسسة سعودية مسجّلة برقم وطني موحّد 7054166389.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <section className="hero-bg">
        <div className="max-w-4xl mx-auto px-4 py-14 md:py-20">
          <span className="badge bg-clay/15 text-clay-dark mb-4">قانوني</span>
          <h1 className="display text-3xl md:text-5xl font-black text-navy mb-3 leading-tight">الشروط والأحكام</h1>
          <p className="text-gray-600 text-base md:text-lg">
            باستخدامك لمنصّة <strong>صفوف رايقة</strong> (sufuf.pro) فإنك توافق على الشروط التالية. يرجى قراءتها بعناية.
          </p>
          <p className="text-xs text-gray-500 mt-2">آخر تحديث: 28 أبريل 2026</p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <article className="card prose-legal space-y-6 text-gray-800 leading-loose">

            <Section title="1. المُشغّل والولاية القضائية">
              <p>
                هذا الموقع وتطبيقاته يديره ويملكه <strong>مؤسسة صفوف رايقة</strong> — منشأة فردية مسجّلة رسمياً
                في <strong>المملكة العربية السعودية</strong>، الرقم الوطني الموحّد للمنشأة <span dir="ltr" className="font-mono">7054166389</span>.
              </p>
              <p>
                أيّ نزاع أو دعوى تنشأ بسبب استخدام الموقع الإلكتروني أو له علاقة بالموقع الإلكتروني، فسيتم
                الفصل فيه وفقاً <strong>لقوانين المملكة العربية السعودية</strong>، والقانون المعمول به هو القانون
                الوطني للمملكة العربية السعودية.
              </p>
            </Section>

            <Section title="2. أهليّة الاستخدام">
              <p>
                مستخدمو الموقع الإلكتروني القُصّر / الأصغر من <strong>18 عاماً</strong> لا يُسمح لهم بإنشاء
                حساب كمستخدم ولا إجراء أيّ معاملات ولا استخدام الموقع الإلكتروني. بإنشائك للحساب فإنك تُقرّ
                بأن عمرك 18 سنة فأكثر، وأنك مخوّل قانونياً بإبرام هذه الاتفاقية.
              </p>
            </Section>

            <Section title="3. الخدمة المُقدَّمة">
              <p>
                <strong>صفوف رايقة</strong> منصّة رقمية لتوليد تصاميم ديكور داخلي بالذكاء الاصطناعي.
                يحصل المستخدم على رصيد بنظام النقاط، ويُخصم 5 نقاط مقابل كل تصميم يولّده.
                المخرَجات صور رقمية بدقة 4K تُسلَّم إلى حساب المستخدم على الفور بعد إتمام عملية التوليد.
              </p>
              <p>
                التصاميم المُولَّدة هي اقتراحات بصرية بمعونة الذكاء الاصطناعي، ولا تُعتبر مخططات هندسية
                معتمدة ولا بديلاً عن استشارة مهندس أو مصمّم محترف عند التنفيذ الفعلي.
              </p>
            </Section>

            <Section title="4. الدفع والعملات">
              <p>
                نحن نقبل المدفوعات عبر الإنترنت باستخدام البطاقات الائتمانية الصادرة من
                <strong> فيزا</strong> و<strong>ماستركارد</strong> و<strong>مدى</strong> و<strong>Apple Pay</strong>،
                بعملة <strong>الريال السعودي (SAR)</strong>.
              </p>
              <p>
                تُعالَج المدفوعات بشكل آمن عبر بوّابة <strong>Amazon Payment Services</strong>، ولا نحتفظ بأي
                بيانات حسّاسة للبطاقة على خوادمنا.
              </p>
              <p>
                يجب أن يحتفظ صاحب البطاقة بنسخة من سجلات العمليات وسياسات التاجر وقواعده.
              </p>
              <p>
                إن إتمام العملية أكثر من مرّة قد يؤدّي إلى ظهور العملية أكثر من مرة في كشف حساب صاحب
                البطاقة. يرجى مراجعة كشف حسابك قبل تكرار المحاولة، والتواصل معنا في حال شككت بازدواجية الخصم.
              </p>
            </Section>

            <Section title="5. حساب المستخدم وأمنه">
              <p>
                المستخدم هو المسؤول عن الحفاظ على <strong>سرّية</strong> حسابه، بما في ذلك كلمة المرور
                ورمز التحقق المرسل إليه. أيّ نشاط يحدث من خلال حسابه يُعتبر صادراً عنه.
              </p>
              <p>
                يحقّ للمنصّة تعليق أيّ حساب يُظهر سلوكاً مخالفاً للشروط أو محاولات احتيال أو إساءة استخدام
                للنقاط المجانية.
              </p>
            </Section>

            <Section title="6. الملكية الفكرية">
              <p>
                جميع محتويات الموقع (الشعار، النصوص، التصاميم، الأكواد) ملك حصري لمؤسسة صفوف رايقة. التصاميم
                التي يولّدها المستخدم تخصّه شخصياً للاستخدام الخاص. أيّ استخدام تجاري على نطاق واسع يستلزم
                التواصل معنا للاتفاق.
              </p>
            </Section>

            <Section title="7. تحديث الشروط">
              <p>
                قد يتم تغيير السياسات والشروط والأحكام الخاصة بهذا الموقع الإلكتروني أو تحديثها من حين لآخر،
                وذلك امتثالاً للمتطلبات والمعايير. بالتالي فإنه من مسؤولية العميل زيارة هذه الأقسام باستمرار،
                وذلك ليكون على اطلاع بالتغييرات التي تطرأ على الموقع الإلكتروني. سيدخل أيّ تعديل حيّز التنفيذ
                في نفس تاريخ نشره.
              </p>
            </Section>

            <Section title="8. التواصل">
              <p>
                لأيّ استفسار قانوني، راسلنا على <a href="mailto:support@sufuf.pro" className="text-clay-dark font-bold" dir="ltr">support@sufuf.pro</a>
                {' '}أو عبر <a href="/contact" className="text-clay-dark font-bold">صفحة تواصل معنا</a>.
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
