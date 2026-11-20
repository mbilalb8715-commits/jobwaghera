import React, { useState } from 'react';
import { CheckCircle2, Mail, Phone, Share2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../lib/api';

export function ContactPage() {
  const { lang } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSent('');
    try {
      const res = await apiFetch<{ message: string }>('/api/support', {
        method: 'POST',
        body: JSON.stringify({ name, email, subject, category: 'contact', message }),
      });
      setSent(res.message);
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message');
    }
  };

  return (
    <Layout>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#0D1F18]">
            {lang === 'en' ? 'Contact JOB وَغیرہ' : 'JOB وَغیرہ سے رابطہ کریں'}
          </h1>
          <p className="mt-2 text-base text-[#4A5D52]">
            {lang === 'en'
              ? 'Reach our moderation and support team via the form below. Placeholder contact labels are shown where external phone/email lines are not yet configured.'
              : 'نیچے دیے گئے فارم کے ذریعے ہماری ٹیم سے رابطہ کریں۔'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white border border-[#DCE3DD] rounded-2xl p-6 sm:p-8 space-y-4"
          >
            {sent && (
              <div className="bg-[#046A38]/10 border border-[#046A38]/25 rounded-xl p-4 text-sm text-[#0D1F18] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#046A38]" />
                <span>{sent}</span>
              </div>
            )}
            {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm">{error}</div>}

            <div>
              <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                {lang === 'en' ? 'Full Name' : 'مکمل نام'} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                {lang === 'en' ? 'Email Address' : 'ای میل ایڈریس'} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                {lang === 'en' ? 'Subject' : 'موضوع'} *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                {lang === 'en' ? 'Message' : 'پیغام'} *
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#046A38] hover:bg-[#03542D] text-white text-sm font-semibold cursor-pointer"
            >
              {lang === 'en' ? 'Send Message' : 'پیغام ارسال کریں'}
            </button>
          </form>

          <aside className="lg:col-span-5 bg-white border border-[#DCE3DD] rounded-2xl p-6 space-y-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#046A38]">
                <Mail className="w-4 h-4" />
                <span>{lang === 'en' ? 'Support Email (Placeholder)' : 'سپورٹ ای میل (پلیس ہولڈر)'}</span>
              </div>
              <p className="text-sm font-medium text-[#0D1F18]">support@jobwaghaira.example</p>
              <p className="text-xs text-[#5E7266]">
                {lang === 'en'
                  ? 'Placeholder address — please submit inquiries via the live form on this page.'
                  : 'پلیس ہولڈر پتہ — براہِ راست رابطے کے لیے فارم استعمال کریں۔'}
              </p>
            </div>

            <div className="pt-4 border-t border-[#EDF1EE] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#046A38]">
                <Phone className="w-4 h-4" />
                <span>{lang === 'en' ? 'Phone Contact (Placeholder)' : 'فون رابطہ (پلیس ہولڈر)'}</span>
              </div>
              <p className="text-sm font-mono-tabular font-medium text-[#0D1F18]">+92 (000) 000-0000</p>
              <p className="text-xs text-[#5E7266]">
                {lang === 'en'
                  ? 'Placeholder number — official helpline numbers are never fabricated.'
                  : 'پلیس ہولڈر نمبر — فرضی فون نمبرز شامل نہیں کیے جاتے۔'}
              </p>
            </div>

            <div className="pt-4 border-t border-[#EDF1EE] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#046A38]">
                <Share2 className="w-4 h-4" />
                <span>{lang === 'en' ? 'Social Channels (Placeholders)' : 'سوشل میڈیا لنکس'}</span>
              </div>
              <ul className="text-sm text-[#4A5D52] space-y-1">
                <li>LinkedIn · @jobwaghaira-pk (Placeholder)</li>
                <li>X / Twitter · @jobwaghaira_pk (Placeholder)</li>
                <li>Facebook · /jobwaghairapk (Placeholder)</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
