import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';

const FAQ_ITEMS = [
  {
    audience: 'seeker',
    q_en: 'Is JOB وَغیرہ free for Pakistani job seekers?',
    q_ur: 'کیا JOB وَغیرہ امیدواروں کے لیے مفت ہے؟',
    a_en: 'Yes. Searching vacancies, saving jobs, uploading your CV, and submitting applications are completely free for job seekers across Pakistan.',
    a_ur: 'جی ہاں، ملازمتیں تلاش کرنا، محفوظ کرنا، سی وی اپ لوڈ کرنا اور درخواست دینا مکمل طور پر مفت ہے۔',
  },
  {
    audience: 'seeker',
    q_en: 'What does "Demonstration Reference" mean on some listings?',
    q_ur: 'کچھ آسامیوں پر "ڈیمونسٹریشن حوالہ" کا کیا مطلب ہے؟',
    a_en: 'Because automated external feeds are not connected, we provide clearly labelled demonstration records referencing well-known Pakistani institutions and link directly to their official portals without inventing salaries or fake contact numbers.',
    a_ur: 'چونکہ بیرونی جاب بورڈز کی لائیو فیڈ منسلک نہیں ہے، اس لیے معروف پاکستانی اداروں کے واضح طور پر نشان زد حوالہ جات دیے گئے ہیں جو ان کے سرکاری پورٹلز سے منسلک ہیں۔',
  },
  {
    audience: 'seeker',
    q_en: 'How can I check where an employer office is located?',
    q_ur: 'میں آجر کے دفتر کا پتہ کیسے دیکھ سکتا ہوں؟',
    a_en: 'Every job detail page and company profile provides a "View Location on Google Maps" button that opens Google Maps directly using the employer’s registered address.',
    a_ur: 'ہر ملازمت اور ادارے کے صفحے پر "گوگل میپس پر مقام دیکھیں" کا بٹن موجود ہے جو ادارے کے اصل پتے پر گوگل میپس کھولتا ہے۔',
  },
  {
    audience: 'employer',
    q_en: 'Why do submitted employer jobs show "Pending Verification"?',
    q_ur: 'آجر کی پوسٹ کردہ نوکری فوری شائع کیوں نہیں ہوتی؟',
    a_en: 'To protect Pakistani candidates from fake or misleading ads, all newly submitted employer listings undergo administrator review before public publication.',
    a_ur: 'امیدواروں کو جعلی اشتہارات سے بچانے کے لیے ہر نئی آسامی عوامی فہرست میں آنے سے پہلے ایڈمن کی تصدیق سے گزرتی ہے۔',
  },
  {
    audience: 'employer',
    q_en: 'Can employers review CVs and update applicant status?',
    q_ur: 'کیا آجر امیدواروں کی سی وی دیکھ کر اسٹیٹس تبدیل کر سکتے ہیں؟',
    a_en: 'Yes. Inside the Employer Dashboard, hiring teams can download submitted CVs and update candidate progress from Submitted to Shortlisted, Interview, or Hired.',
    a_ur: 'جی ہاں، آجر ڈیش بورڈ میں موصولہ سی وی ڈاؤن لوڈ کی جا سکتی ہیں اور امیدوار کا اسٹیٹس اپ ڈیٹ کیا جا سکتا ہے۔',
  },
];

export function FaqPage() {
  const { lang } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'seeker' | 'employer'>('all');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const items = FAQ_ITEMS.filter((i) => filter === 'all' || i.audience === filter);

  return (
    <Layout>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#0D1F18]">
            {lang === 'en' ? 'Frequently Asked Questions' : 'عمومی سوالات'}
          </h1>
          <p className="mt-2 text-base text-[#4A5D52]">
            {lang === 'en'
              ? 'Answers for job seekers and Pakistani employers using JOB وَغیرہ.'
              : 'ملازمت کے متلاشی افراد اور آجروں کے لیے عام سوالات کے جوابات۔'}
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-[#F1F5F2] rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
              filter === 'all' ? 'bg-white text-[#0D1F18] shadow-xs' : 'text-[#4A5D52]'
            }`}
          >
            {lang === 'en' ? 'All Questions' : 'تمام سوالات'}
          </button>
          <button
            type="button"
            onClick={() => setFilter('seeker')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
              filter === 'seeker' ? 'bg-white text-[#0D1F18] shadow-xs' : 'text-[#4A5D52]'
            }`}
          >
            {lang === 'en' ? 'Job Seekers' : 'امیدوار'}
          </button>
          <button
            type="button"
            onClick={() => setFilter('employer')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
              filter === 'employer' ? 'bg-white text-[#0D1F18] shadow-xs' : 'text-[#4A5D52]'
            }`}
          >
            {lang === 'en' ? 'Employers' : 'آجر'}
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="bg-white border border-[#DCE3DD] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-start flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-semibold text-sm sm:text-base text-[#0D1F18]">
                    {lang === 'ur' ? item.q_ur : item.q_en}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#4A5D52] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-[#4A5D52] leading-relaxed border-t border-[#EDF1EE]">
                    {lang === 'ur' ? item.a_ur : item.a_en}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
