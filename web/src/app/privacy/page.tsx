import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata = {
  title: 'سياسة الخصوصية — صفوف رايقة',
  description: 'سياسة خصوصية مفصّلة لمنصّة صفوف رايقة لتوليد تصاميم الديكور بالذكاء الاصطناعي — معالجة الصور، مشغّلات فرعية، وحقوقك وفق نظام حماية البيانات الشخصية السعودي.',
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
            مكتوبة خصّيصاً لخدمتنا: <strong>توليد تصاميم ديكور بالذكاء الاصطناعي</strong>. نشرح هنا
            بالتفصيل ما الذي نجمعه من بياناتك (خاصةً الصور التي ترفعها)، وكيف نعالجها، ومع من نشاركها،
            ومدى احتفاظنا بها.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            آخر تحديث: 28 أبريل 2026 · نسري على المُشغِّل (المتحكِّم في البيانات): <strong>مؤسسة صفوف رايقة</strong>،
            جدّة، حيّ البوادي، مبنى 2475، الرمز البريدي 23531، المملكة العربية السعودية. الرقم الوطني الموحّد للمنشأة:
            <span dir="ltr" className="font-mono mx-1">7054166389</span>.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <article className="card space-y-6 text-gray-800 leading-loose">

            <Section title="1. نطاق هذه السياسة">
              <p>
                تنطبق على موقع <span dir="ltr" className="font-mono">sufuf.pro</span> وأيّ تطبيق أو واجهة
                نُتيحها (App, API). تخضع لـ<strong>نظام حماية البيانات الشخصية في المملكة العربية السعودية</strong>
                {' '}(PDPL) ولوائحه التنفيذية الصادرة عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).
              </p>
            </Section>

            <Section title="2. البيانات التي نجمعها">
              <h3 className="font-bold text-navy mt-2 mb-1">أ) بيانات تُقدّمها أنت مباشرةً</h3>
              <ul className="list-disc pr-5 space-y-1.5">
                <li><strong>بيانات التعريف:</strong> الاسم، البريد الإلكتروني، كلمة المرور (مُجزَّأة بـbcrypt — لا نراها بصيغتها الأصلية أبداً).</li>
                <li><strong>الصور التي ترفعها:</strong> صور الغرف الواقعية و/أو الاسكيتشات/المخططات اليدوية.</li>
                <li><strong>تفضيلات التصميم:</strong> النمط المختار، الألوان، العيّنات، أسماء المساحات في المخططات.</li>
                <li><strong>محتوى التواصل:</strong> رسائل الدعم التي ترسلها لنا.</li>
              </ul>

              <h3 className="font-bold text-navy mt-4 mb-1">ب) بيانات تُجمَع تلقائياً</h3>
              <ul className="list-disc pr-5 space-y-1.5">
                <li><strong>البيانات التقنية:</strong> عنوان IP، نوع المتصفّح، نظام التشغيل، اللغة، المعرّف الزمني للجلسة.</li>
                <li><strong>سجلات الاستخدام:</strong> الصفحات التي تزورها، التصاميم التي تولّدها، النقاط المُستهلَكة، أوقات تسجيل الدخول.</li>
                <li><strong>بصمة الجهاز:</strong> نستخدم FingerprintJS لمنع الاحتيال على النقاط المجانية (لا تتضمّن بيانات شخصية).</li>
                <li><strong>Cloudflare Turnstile:</strong> للتأكّد من أنك إنسان عند التسجيل وليس bot.</li>
              </ul>

              <h3 className="font-bold text-navy mt-4 mb-1">ج) بيانات الدفع</h3>
              <p>
                <strong>لا نستلم بطاقتك أبداً.</strong> عند الدفع، تُحوَّل مباشرةً إلى صفحة Amazon Payment Services
                المؤمَّنة. ما نستلمه منهم لاحقاً هو فقط: <em>رقم العملية، آخر 4 أرقام من البطاقة، حالة العملية، المبلغ، تاريخ الدفع</em>.
              </p>
            </Section>

            <Section title="3. كيف نعالج الصور التي ترفعها (مهمّ)">
              <p>
                هذا القسم يخصّ نشاطنا الأساسي — معالجة صور غرف العملاء بالذكاء الاصطناعي:
              </p>
              <ol className="list-decimal pr-5 space-y-2">
                <li>عند رفعك للصورة، تُحوَّل تلقائياً إلى صيغة WebP محسّنة وتُخزَّن على خوادمنا داخل المملكة العربية السعودية.</li>
                <li>تُرسَل نسخة من الصورة إلى مزوّد نموذج التوليد (OpenAI DALL-E / GPT-image) عبر API مشفّرة (TLS 1.3) لاستخدامها كمرجع بصري للتصميم.</li>
                <li><strong>لا تُستخدَم صورك لتدريب نماذج الذكاء الاصطناعي.</strong> اتفاقية API الخاصّة بنا مع OpenAI تنصّ صراحةً على عدم استخدام مدخلات API للتدريب
                  (<a href="https://openai.com/policies/api-data-usage-policies/" target="_blank" rel="noopener noreferrer" className="text-clay-dark font-bold underline">سياسة OpenAI لبيانات الـAPI</a>).</li>
                <li>تُحفَظ الصور المُولَّدة في حسابك ضمن صفحة "تصاميمي" حتى تحذفها أنت.</li>
                <li>نحذف الصور الأصلية المرفوعة من خوادم المعالجة بعد <strong>30 يوماً</strong> من آخر استخدام لها، إلا إذا اخترت أنت ربطها بمشروع دائم.</li>
              </ol>
              <p className="bg-clay/10 border-r-4 border-clay rounded-lg p-3 text-sm">
                <strong>قبل الرفع:</strong> تأكّد أن الصورة لا تتضمّن وجوهاً واضحة لأشخاص أو وثائق هويّة أو
                لوحات سيارات. هذه الخدمة مخصّصة لتصميم الفراغات لا لمعالجة وجوه أو هويّات.
              </p>
            </Section>

            <Section title="4. أغراض المعالجة والأساس النظامي">
              <ul className="list-disc pr-5 space-y-1.5">
                <li><strong>تنفيذ الخدمة:</strong> توليد التصاميم وإدارة رصيد النقاط — <em>أساس: تنفيذ العقد معك</em>.</li>
                <li><strong>الحساب وأمنه:</strong> تسجيل الدخول، رمز التحقق، اكتشاف تسجيلات الدخول الغريبة — <em>أساس: مصلحة مشروعة + تنفيذ العقد</em>.</li>
                <li><strong>الفوترة والمحاسبة:</strong> الاحتفاظ بسجلات الفواتير وفق المتطلبات النظاميّة المعمول بها في المملكة — <em>أساس: التزام نظامي محاسبي</em>.</li>
                <li><strong>منع الاحتيال:</strong> بصمة الجهاز و Turnstile — <em>أساس: مصلحة مشروعة</em>.</li>
                <li><strong>التحسين:</strong> تحليلات إجمالية لأداء النماذج (لا ترتبط بحسابك) — <em>أساس: مصلحة مشروعة</em>.</li>
              </ul>
            </Section>

            <Section title="5. المُشغِّلون الفرعيّون (مَن نشارك معهم البيانات)">
              <p>
                نشارك حدّاً أدنى من البيانات مع مزوّدين موثّقين، كلٌّ بدور محدّد:
              </p>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-sm border-collapse min-w-[520px] mx-4 sm:mx-0">
                  <thead>
                    <tr className="bg-cream text-navy text-right">
                      <th className="p-2 border border-gray-200 font-bold">المشغِّل</th>
                      <th className="p-2 border border-gray-200 font-bold">الدور</th>
                      <th className="p-2 border border-gray-200 font-bold">البيانات المُشارَكة</th>
                      <th className="p-2 border border-gray-200 font-bold">الموقع</th>
                    </tr>
                  </thead>
                  <tbody>
                    <SubRow name="OpenAI" role="نموذج توليد الصور (DALL-E / GPT-image)" data="الصورة المرجعية + النصّ التوجيهي" loc="الولايات المتحدة" />
                    <SubRow name="Amazon Payment Services" role="معالجة المدفوعات" data="بيانات الدفع (لا تمرّ بنا)" loc="الإمارات العربية المتحدة / السعودية" />
                    <SubRow name="Hostinger / Cloudflare" role="استضافة + شبكة توصيل المحتوى" data="عنوان IP، طلبات HTTPS" loc="عالمية" />
                    <SubRow name="مزوّد البريد (SMTP)" role="إرسال إيميلات الحساب" data="البريد الإلكتروني، نصّ الرسالة" loc="السعودية / أوروبا" />
                  </tbody>
                </table>
              </div>
              <p>
                لا نبيع بياناتك لأيّ طرف ثالث، ولا نشاركها لأغراض إعلانية. أيّ نقل خارج المملكة يتمّ بضمانات
                تعاقدية معتمدة وفقاً لنظام PDPL.
              </p>
            </Section>

            <Section title="6. مدد الاحتفاظ بالبيانات">
              <ul className="list-disc pr-5 space-y-1.5">
                <li><strong>صور الغرف الأصلية المرفوعة:</strong> 30 يوماً من آخر استخدام، ثم حذف نهائي.</li>
                <li><strong>التصاميم المُولَّدة:</strong> ما دام الحساب نشطاً، أو حتى تحذفها أنت يدوياً.</li>
                <li><strong>بيانات الحساب:</strong> طوال فترة وجود الحساب + 90 يوم بعد الحذف لإدارة النزاعات.</li>
                <li><strong>سجلات الدفع والفواتير:</strong> 10 سنوات (التزام ضريبي/محاسبي سعودي).</li>
                <li><strong>سجلات الأمان (IP، تسجيلات الدخول):</strong> 12 شهراً.</li>
              </ul>
            </Section>

            <Section title="7. أمان البيانات">
              <ul className="list-disc pr-5 space-y-1.5">
                <li>تشفير TLS 1.3 لكل اتصال بين متصفّحك وخوادمنا.</li>
                <li>تجزئة كلمات المرور بـbcrypt (cost ≥ 12).</li>
                <li>JWT قصير العمر مع آلية refresh token لجلسات آمنة.</li>
                <li>قفل تلقائي للحساب بعد عدد من محاولات الدخول الفاشلة.</li>
                <li>نسخ احتياطية يومية مشفّرة، بفصل صلاحيات وصول صارم.</li>
                <li>مراجعات أمنية دورية للكود ولبنية الخوادم.</li>
              </ul>
              <p className="text-sm text-gray-500">
                مع كلّ ذلك، لا يستطيع أيّ مزوّد خدمة على الإنترنت ضمان الأمان بنسبة 100٪. ننصحك بكلمات مرور
                قويّة وعدم مشاركتها، والإبلاغ الفوري عن أيّ نشاط مريب.
              </p>
            </Section>

            <Section title="8. حقوقك (وفق نظام حماية البيانات الشخصية السعودي)">
              <ul className="list-disc pr-5 space-y-1.5">
                <li><strong>حقّ العلم:</strong> أن تعرف ما البيانات التي نعالجها وأغراضها (هذه الصفحة).</li>
                <li><strong>حقّ الوصول:</strong> طلب نسخة من بياناتك.</li>
                <li><strong>حقّ التصحيح:</strong> تعديل أيّ بيانات غير دقيقة.</li>
                <li><strong>حقّ الحذف:</strong> طلب حذف حسابك وبياناتك (مع استثناء سجلات الفواتير).</li>
                <li><strong>حقّ الاعتراض:</strong> الاعتراض على معالجة قائمة على المصلحة المشروعة.</li>
                <li><strong>حقّ النقل:</strong> استلام بياناتك بصيغة قابلة للقراءة آلياً.</li>
                <li><strong>حقّ الشكوى:</strong> رفع شكوى لـ<strong>الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)</strong> إن رأيت أنّنا أخللنا.</li>
              </ul>
              <p>
                لممارسة أيّ حقّ، راسلنا على
                <a href="mailto:support@sufuf.pro" className="text-clay-dark font-bold mx-1" dir="ltr">support@sufuf.pro</a>
                وسنردّ خلال 30 يوماً كحدّ أقصى.
              </p>
            </Section>

            <Section title="9. خصوصية الأطفال">
              <p>
                خدمتنا مخصّصة لمن أعمارهم 18 سنة فأكثر. لا نجمع عمداً بيانات من قاصرين. إن علمنا بأنّنا
                جمعنا بيانات قاصر دون موافقة وليّ أمر مؤهَّل، نحذفها فوراً.
              </p>
            </Section>

            <Section title="10. ملفّات تعريف الارتباط (Cookies)">
              <p>نستخدم نوعَين فقط:</p>
              <ul className="list-disc pr-5 space-y-1.5">
                <li><strong>Cookies جلسة (ضرورية):</strong> JWT للحفاظ على تسجيل الدخول. لا يمكن تعطيلها دون فقدان وظائف الموقع.</li>
                <li><strong>Cookies تفضيلات (اختيارية):</strong> اللغة، آخر إعدادات استخدمتها في الاستوديو.</li>
              </ul>
              <p>
                <strong>لا نستخدم Cookies إعلانية ولا تتبّع طرف ثالث.</strong>
              </p>
            </Section>

            <Section title="11. الأطراف الخارجية والروابط">
              <p>
                قد تظهر روابط لمواقع خارجية (مثل وثائق OpenAI أو الجهات الرسمية السعودية). نحن غير
                مسؤولين عن سياسات خصوصية تلك المواقع — راجعها بنفسك قبل تقديم أيّ بيانات لها.
              </p>
            </Section>

            <Section title="12. التحديثات على هذه السياسة">
              <p>
                سننشر التحديث مع تاريخه أعلى الصفحة. التغييرات الجوهرية نُشعر بها حسابك المُسجَّل عبر
                البريد الإلكتروني. مواصلتك للاستخدام بعد النشر تعني الموافقة على النسخة المحدَّثة.
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

function SubRow({ name, role, data, loc }: { name: string; role: string; data: string; loc: string }) {
  return (
    <tr className="text-right">
      <td className="p-2 border border-gray-200 font-bold text-navy">{name}</td>
      <td className="p-2 border border-gray-200">{role}</td>
      <td className="p-2 border border-gray-200">{data}</td>
      <td className="p-2 border border-gray-200">{loc}</td>
    </tr>
  );
}
