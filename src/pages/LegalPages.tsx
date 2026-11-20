import { Layout } from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';

export function PrivacyPolicyPage() {
  const { lang } = useLanguage();

  return (
    <Layout>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#0D1F18]">
          {lang === 'en' ? 'Privacy Policy' : 'پرائیویسی پالیسی'}
        </h1>
        <div className="bg-white border border-[#DCE3DD] rounded-2xl p-6 sm:p-8 space-y-6 text-sm sm:text-base text-[#32463A] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-display font-bold text-[#0D1F18]">
              {lang === 'en' ? '1. Information We Collect' : '1. ہم کون سی معلومات اکٹھی کرتے ہیں'}
            </h2>
            <p>
              {lang === 'en'
                ? 'JOB وَغیرہ collects only the account details, profile information, CV documents, and vacancy records that you explicitly submit while registering as a job seeker or employer.'
                : 'JOB وَغیرہ صرف وہی اکاؤنٹ، پروفائل، سی وی اور ملازمت سے متعلق معلومات محفوظ کرتا ہے جو آپ خود رجسٹریشن یا درخواست کے وقت فراہم کرتے ہیں۔'}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-display font-bold text-[#0D1F18]">
              {lang === 'en' ? '2. CV & Application Confidentiality' : '2. سی وی اور درخواستوں کا تحفظ'}
            </h2>
            <p>
              {lang === 'en'
                ? 'Uploaded CVs and contact numbers are shared solely with the specific employer whose vacancy you apply to. Passwords are stored using salted cryptographic hashing.'
                : 'آپ کی اپ لوڈ کردہ سی وی اور رابطہ تفصیلات صرف اسی آجر کو دکھائی جاتی ہیں جس کی آسامی کے لیے آپ درخواست دیتے ہیں۔ پاس ورڈ محفوظ کرپٹوگرافک طریقے سے محفوظ کیے جاتے ہیں۔'}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-display font-bold text-[#0D1F18]">
              {lang === 'en' ? '3. User Safety & Anti-Scam Protection' : '3. صارف کا تحفظ'}
            </h2>
            <p>
              {lang === 'en'
                ? 'We prohibit collecting financial fees from job seekers. Users may request removal of their profile data or report suspicious activity at any time via the Help Center.'
                : 'ملازمت کے خواہشمند افراد سے کسی بھی قسم کی فیس طلب کرنا سختی سے ممنوع ہے۔ صارفین کسی بھی وقت مدد مرکز کے ذریعے شکایت درج کروا سکتے ہیں۔'}
            </p>
          </section>
        </div>
      </article>
    </Layout>
  );
}

export function TermsPage() {
  const { lang } = useLanguage();

  return (
    <Layout>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#0D1F18]">
          {lang === 'en' ? 'Terms of Use & Job-Posting Policies' : 'استعمال کی شرائط اور ملازمت پوسٹ کرنے کی پالیسی'}
        </h1>
        <div className="bg-white border border-[#DCE3DD] rounded-2xl p-6 sm:p-8 space-y-6 text-sm sm:text-base text-[#32463A] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-display font-bold text-[#0D1F18]">
              {lang === 'en' ? '1. Account Responsibilities' : '1. اکاؤنٹ کی ذمہ داریاں'}
            </h2>
            <p>
              {lang === 'en'
                ? 'Job seekers and employers are responsible for providing accurate identity, qualification, and organizational details. Impersonating registered Pakistani institutions is strictly forbidden.'
                : 'امیدوار اور آجر درست تعلیمی، شناختی اور تنظیمی معلومات فراہم کرنے کے پابند ہیں۔ کسی بھی ادارے کی جعلی نمائندگی ممنوع ہے۔'}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-display font-bold text-[#0D1F18]">
              {lang === 'en' ? '2. Job-Posting & Verification Policy' : '2. آسامیوں کی تصدیق کی پالیسی'}
            </h2>
            <p>
              {lang === 'en'
                ? 'Every employer submission must include a genuine physical office address, clear closing date, and valid contact details, and requires administrator approval before publication. Charging recruitment fees to candidates results in immediate removal.'
                : 'ہر آسامی کے ساتھ اصل دفتری پتہ، آخری تاریخ اور درست رابطہ نمبر درج کرنا لازمی ہے۔ تمام آسامیاں ایڈمن کی منظوری کے بعد شائع ہوتی ہیں۔'}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-display font-bold text-[#0D1F18]">
              {lang === 'en' ? '3. Demonstration Listings Notice' : '3. ڈیمونسٹریشن حوالہ جات کی وضاحت'}
            </h2>
            <p>
              {lang === 'en'
                ? 'Listings marked "Demonstration Reference" represent showcase entries pointing to official institutional portals and should always be verified directly at the linked official source.'
                : '"ڈیمونسٹریشن حوالہ" کے طور پر درج آسامیاں سرکاری و معروف اداروں کے پورٹلز کی نشاندہی کرتی ہیں جن کی تصدیق متعلقہ سرکاری ویب سائٹ سے کی جانی چاہیے۔'}
            </p>
          </section>
        </div>
      </article>
    </Layout>
  );
}
