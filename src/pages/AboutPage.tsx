import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Compass, ShieldCheck, Users } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';

export function AboutPage() {
  const { lang } = useLanguage();
  const [imgError, setImgError] = useState(false);

  return (
    <Layout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <p className="text-sm font-semibold text-[#046A38]">
              {lang === 'en' ? 'About JOB وَغیرہ' : 'JOB وَغیرہ کے بارے میں'}
            </p>
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-[#0D1F18] leading-tight">
              {lang === 'en'
                ? 'Built to make Pakistani recruitment transparent, bilingual, and verifiable.'
                : 'پاکستان میں روزگار کی تلاش کو شفاف، دو لسانی اور قابلِ تصدیق بنانے کا عزم۔'}
            </h1>
            <p className="text-base text-[#4A5D52] leading-relaxed">
              {lang === 'en'
                ? 'JOB وَغیرہ was created for Pakistani job seekers and employers who deserve clarity instead of recycled fake listings. From civil service aspirants and healthcare workers to software engineers and skilled technicians, every user can search seamlessly in English or Urdu.'
                : 'JOB وَغیرہ پاکستانی امیدواروں اور آجروں کے لیے بنایا گیا ہے تاکہ فرضی اشتہارات کے بجائے واضح اور قابلِ تصدیق مواقع میسر آ سکیں۔ سرکاری ملازمتوں، طب، تعلیم، آئی ٹی اور ہنرمند پیشوں تک ہر فرد انگریزی اور اردو میں یکساں سہولت کے ساتھ تلاش کر سکتا ہے۔'}
            </p>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-[#DCE3DD] bg-[#E8EFEA] min-h-[280px]">
            {!imgError ? (
              <img
                src="/src/assets/images/about_mission_team_1794730251559.jpg"
                alt="Pakistani professionals across technology, engineering, and healthcare collaborating"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
        </div>

        {/* Mission, Vision, Commitment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#DCE3DD] rounded-2xl p-7 space-y-3">
            <Compass className="w-6 h-6 text-[#046A38]" />
            <h2 className="text-xl font-display font-bold text-[#0D1F18]">
              {lang === 'en' ? 'Our Mission' : 'ہمارا مشن'}
            </h2>
            <p className="text-sm text-[#4A5D52] leading-relaxed">
              {lang === 'en'
                ? 'Connect talent across every Pakistani province with verified employers, transparent salary expectations, closing dates, and exact office locations on Google Maps.'
                : 'پاکستان کے ہر صوبے میں باصلاحیت افراد کو تصدیق شدہ اداروں، واضح شرائط، آخری تاریخوں اور گوگل میپس کے اصل پتوں سے جوڑنا۔'}
            </p>
          </div>

          <div className="bg-white border border-[#DCE3DD] rounded-2xl p-7 space-y-3">
            <Users className="w-6 h-6 text-[#046A38]" />
            <h2 className="text-xl font-display font-bold text-[#0D1F18]">
              {lang === 'en' ? 'Helping Seekers & Employers' : 'امیدواروں اور آجروں کی معاونت'}
            </h2>
            <p className="text-sm text-[#4A5D52] leading-relaxed">
              {lang === 'en'
                ? 'Job seekers store their CV once, track every application status, and explore 20 structured sectors. Employers manage applicants cleanly after verification review.'
                : 'امیدوار اپنی سی وی محفوظ کر کے درخواستوں کی صورتحال دیکھ سکتے ہیں جبکہ آجر تصدیق کے بعد امیدواروں کی درخواستوں کا منظم جائزہ لے سکتے ہیں۔'}
            </p>
          </div>

          <div className="bg-white border border-[#DCE3DD] rounded-2xl p-7 space-y-3">
            <ShieldCheck className="w-6 h-6 text-[#046A38]" />
            <h2 className="text-xl font-display font-bold text-[#0D1F18]">
              {lang === 'en' ? 'Zero-Fabrication Standard' : 'مستند معلومات کا معیار'}
            </h2>
            <p className="text-sm text-[#4A5D52] leading-relaxed">
              {lang === 'en'
                ? 'We never fabricate salaries, phone numbers, or corporate addresses. Demonstration references are explicitly labelled and linked directly to official institutional portals.'
                : 'ہم کبھی فرضی تنخواہیں، فون نمبرز یا پتے شامل نہیں کرتے۔ ڈیمونسٹریشن حوالہ جات واضح طور پر نشان زد ہیں اور سرکاری پورٹلز سے منسلک ہیں۔'}
            </p>
          </div>
        </div>

        {/* Highlights & CTA */}
        <div className="bg-[#0D1F18] text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#8CD9B0]">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'en' ? 'Nationwide Bilingual Access' : 'ملک گیر دو لسانی رسائی'}</span>
            </div>
            <h2 className="text-2xl font-display font-bold">
              {lang === 'en'
                ? 'Explore verified vacancies or register your organization today.'
                : 'آج ہی تصدیق شدہ آسامیاں دیکھیں یا اپنا ادارہ رجسٹر کریں۔'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link to="/jobs" className="px-5 py-3 rounded-xl bg-[#046A38] text-white text-sm font-semibold">
              {lang === 'en' ? 'Browse Jobs' : 'ملازمتیں دیکھیں'}
            </Link>
            <Link
              to="/post-job"
              className="px-5 py-3 rounded-xl border border-white/25 text-white text-sm font-semibold"
            >
              {lang === 'en' ? 'Post a Vacancy' : 'نوکری پوسٹ کریں'}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
