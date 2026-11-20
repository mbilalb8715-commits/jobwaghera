import React, { useState } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../lib/api';

const HELP_ARTICLES = [
  {
    id: 'create-account',
    topic_en: 'Creating an Account',
    topic_ur: 'اکاؤنٹ بنانا',
    title_en: 'How to register as a Job Seeker or Employer',
    title_ur: 'امیدوار یا آجر کے طور پر رجسٹریشن کا طریقہ',
    body_en:
      'Open the Sign In / Create Account page and choose either Job Seeker or Employer. Job Seekers can upload a CV and save vacancies. Employers provide an organization name and verifiable physical address for Google Maps.',
    body_ur:
      'لاگ ان / اکاؤنٹ بنائیں صفحے پر جا کر امیدوار یا آجر کا انتخاب کریں۔ امیدوار اپنی سی وی اپ لوڈ کر سکتے ہیں، جبکہ آجر ادارے کا نام اور گوگل میپس کے لیے درست پتہ درج کرتے ہیں۔',
  },
  {
    id: 'finding-jobs',
    topic_en: 'Finding Jobs',
    topic_ur: 'ملازمتیں تلاش کرنا',
    title_en: 'Filtering vacancies by city, sector, and salary',
    title_ur: 'شہر، شعبے اور تنخواہ کے مطابق تلاش',
    body_en:
      'Use the Find Jobs page to filter across 20 Pakistani sectors, 16+ major cities, education, experience, employment type, and closing dates. You can switch between English and Urdu anytime.',
    body_ur:
      'ملازمتیں تلاش کریں صفحے پر 20 شعبوں، 16 سے زائد شہروں، تعلیم، تجربہ اور ملازمت کی نوعیت کے مطابق آسامیاں فلٹر کریں۔',
  },
  {
    id: 'applying-cv',
    topic_en: 'Applying & Sending a CV',
    topic_ur: 'اپلائی کرنا اور سی وی بھیجنا',
    title_en: 'How to apply and attach your CV',
    title_ur: 'درخواست اور سی وی منسلک کرنے کا طریقہ',
    body_en:
      'Open any vacancy to view full requirements and closing date. Click "Apply Now / Send Your CV" to submit your contact details and attach a PDF/DOC/DOCX resume, or follow the verified Official Careers Portal button.',
    body_ur:
      'کسی بھی آسامی کی تفصیلات کھولیں اور "اپلائی کریں / سی وی بھیجیں" بٹن پر کلک کر کے اپنی سی وی منسلک کریں یا سرکاری پورٹل کے لنک پر جائیں۔',
  },
  {
    id: 'posting-vacancies',
    topic_en: 'Posting Vacancies',
    topic_ur: 'آسامیاں پوسٹ کرنا',
    title_en: 'Employer verification before publication',
    title_ur: 'شائع ہونے سے قبل ایڈمن کی تصدیق',
    body_en:
      'Every vacancy submitted by an employer enters "Pending Verification" status. Platform administrators review the organization address, closing date, and contact details before publishing publicly.',
    body_ur:
      'آجر کی جانب سے جمع کرائی گئی ہر آسامی پہلے تصدیق کے مرحلے میں جاتی ہے اور ایڈمن کی جانچ کے بعد شائع ہوتی ہے۔',
  },
  {
    id: 'report-fake',
    topic_en: 'Reporting Fake Jobs',
    topic_ur: 'جعلی نوکری کی اطلاع',
    title_en: 'How to report suspicious listings or payment requests',
    title_ur: 'مشکوک اشتہار یا فیس کے مطالبے کی شکایت',
    body_en:
      'Genuine employers on JOB وَغیرہ never charge candidates application or interview fees. If you encounter suspicious claims, report the listing ID immediately using the support form below.',
    body_ur:
      'مستند آجر کبھی درخواست یا انٹرویو کی فیس نہیں مانگتے۔ کسی بھی مشکوک اشتہار کی فوری اطلاع نیچے دیے گئے سپورٹ فارم کے ذریعے دیں۔',
  },
  {
    id: 'account-tech',
    topic_en: 'Account & Technical Support',
    topic_ur: 'اکاؤنٹ اور تکنیکی مدد',
    title_en: 'Password recovery and profile updates',
    title_ur: 'پاس ورڈ بحال کرنا اور پروفائل میں تبدیلی',
    body_en:
      'Use the Password Recovery tab on the Sign In page to issue a reset code for your email, or edit your profile and CV inside your Seeker or Employer Dashboard.',
    body_ur:
      'لاگ ان صفحے پر "پاس ورڈ بحال کریں" ٹیب استعمال کریں یا اپنے ڈیش بورڈ میں جا کر پروفائل اور سی وی اپ ڈیٹ کریں۔',
  },
];

export function HelpCenterPage() {
  const { lang } = useLanguage();
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('report_fake_job');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submittedMsg, setSubmittedMsg] = useState('');
  const [error, setError] = useState('');

  const filteredArticles = HELP_ARTICLES.filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [a.topic_en, a.topic_ur, a.title_en, a.title_ur, a.body_en, a.body_ur].join(' ').toLowerCase().includes(q);
  });

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmittedMsg('');
    try {
      const res = await apiFetch<{ message: string }>('/api/support', {
        method: 'POST',
        body: JSON.stringify({ name, email, category, subject, message }),
      });
      setSubmittedMsg(res.message);
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send support request');
    }
  };

  return (
    <Layout>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#0D1F18]">
            {lang === 'en' ? 'Help Center' : 'مدد مرکز'}
          </h1>
          <p className="text-base text-[#4A5D52]">
            {lang === 'en'
              ? 'Guides for job seekers, employers, safety reporting, and technical support.'
              : 'امیدواروں، آجروں، مشکوک اشتہارات کی اطلاع اور تکنیکی معاونت کے لیے رہنمائی۔'}
          </p>

          <div className="bg-white border border-[#DCE3DD] rounded-xl px-4 py-2.5 flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#4A5D52]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'en' ? 'Search help articles...' : 'مدد کے مضامین تلاش کریں...'}
              className="w-full text-sm text-[#0D1F18] focus:outline-none"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white border border-[#DCE3DD] rounded-xl p-8 text-center text-sm text-[#4A5D52]">
            {lang === 'en' ? 'No help articles match your search.' : 'کوئی متعلقہ مضمون نہیں ملا۔'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredArticles.map((art) => (
              <article key={art.id} className="bg-white border border-[#DCE3DD] rounded-2xl p-6 space-y-2.5">
                <div className="text-xs font-semibold text-[#046A38]">
                  {lang === 'ur' ? art.topic_ur : art.topic_en}
                </div>
                <h2 className="text-lg font-display font-bold text-[#0D1F18]">
                  {lang === 'ur' ? art.title_ur : art.title_en}
                </h2>
                <p className="text-sm text-[#4A5D52] leading-relaxed">
                  {lang === 'ur' ? art.body_ur : art.body_en}
                </p>
              </article>
            ))}
          </div>
        )}

        {/* Contact Support Form */}
        <div className="bg-white border border-[#DCE3DD] rounded-2xl p-6 sm:p-8 max-w-3xl space-y-5">
          <div>
            <h2 className="text-xl font-display font-bold text-[#0D1F18]">
              {lang === 'en' ? 'Contact Support & Report Fake Jobs' : 'سپورٹ سے رابطہ کریں / جعلی نوکری کی اطلاع دیں'}
            </h2>
            <p className="text-sm text-[#4A5D52] mt-1">
              {lang === 'en'
                ? 'Submit account questions, technical issues, or suspicious job IDs directly to the moderation desk.'
                : 'اکاؤنٹ، تکنیکی مسائل یا مشکوک آسامیوں کی اطلاع براہِ راست ایڈمن ٹیم کو بھیجیں۔'}
            </p>
          </div>

          {submittedMsg && (
            <div className="bg-[#046A38]/10 border border-[#046A38]/25 rounded-xl p-4 text-sm text-[#0D1F18] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#046A38]" />
              <span>{submittedMsg}</span>
            </div>
          )}
          {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm">{error}</div>}

          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder={lang === 'en' ? 'Your Full Name' : 'آپ کا نام'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
              />
              <input
                type="email"
                required
                placeholder={lang === 'en' ? 'Your Email Address' : 'ای میل ایڈریس'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm bg-white"
              >
                <option value="report_fake_job">
                  {lang === 'en' ? 'Report Fake / Suspicious Job' : 'مشکوک / جعلی نوکری کی اطلاع'}
                </option>
                <option value="account_support">{lang === 'en' ? 'Account Support' : 'اکاؤنٹ مدد'}</option>
                <option value="technical_support">{lang === 'en' ? 'Technical Support' : 'تکنیکی مدد'}</option>
                <option value="employer_verification">
                  {lang === 'en' ? 'Employer Verification' : 'آجر کی تصدیق'}
                </option>
              </select>
              <input
                type="text"
                required
                placeholder={lang === 'en' ? 'Subject' : 'موضوع'}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
              />
            </div>
            <textarea
              rows={4}
              required
              placeholder={lang === 'en' ? 'Describe your issue or include the Job ID...' : 'تفصیل لکھیں...'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#046A38] hover:bg-[#03542D] text-white text-sm font-semibold cursor-pointer"
            >
              {lang === 'en' ? 'Send Support Request' : 'پیغام بھیجیں'}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
