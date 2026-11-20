import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, CheckCircle2, FileText, LogOut, User as UserIcon } from 'lucide-react';
import { Layout } from '../components/Layout';
import { JobCard } from '../components/JobCard';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Application, Job } from '../types';

export function SeekerDashboardPage() {
  const { lang, t } = useLanguage();
  const { user, seekerProfile, loading, refreshAuth, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [headline, setHeadline] = useState('');
  const [education, setEducation] = useState('');
  const [experienceYears, setExperienceYears] = useState('0-1 years');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [cvFilename, setCvFilename] = useState('');
  const [cvDataUrl, setCvDataUrl] = useState('');

  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'applied' | 'saved'>('profile');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setCity(user.city || '');
    }
    if (seekerProfile) {
      setHeadline(seekerProfile.headline || '');
      setEducation(seekerProfile.education || '');
      setExperienceYears(seekerProfile.experience_years || '0-1 years');
      setExperienceSummary(seekerProfile.experience_summary || '');
      setSkillsText((seekerProfile.skills || []).join(', '));
      setCvFilename(seekerProfile.cv_filename || '');
      setCvDataUrl(seekerProfile.cv_data_url || '');
    }
  }, [user, seekerProfile]);

  useEffect(() => {
    if (!user) return;
    apiFetch<{ jobs: Job[] }>('/api/seeker/saved-jobs')
      .then((r) => setSavedJobs(r.jobs))
      .catch(() => {});
    apiFetch<{ applications: Application[] }>('/api/seeker/applications')
      .then((r) => setApplications(r.applications))
      .catch(() => {});
  }, [user]);

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setSaveMsg('CV file must be 2MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCvFilename(file.name);
      setCvDataUrl(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      await apiFetch('/api/auth/account', {
        method: 'PUT',
        body: JSON.stringify({ fullName, phone, city }),
      });
      await apiFetch('/api/seeker/profile', {
        method: 'PUT',
        body: JSON.stringify({
          headline,
          education,
          experience_years: experienceYears,
          experience_summary: experienceSummary,
          skills: skillsText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          cv_filename: cvFilename,
          cv_data_url: cvDataUrl,
        }),
      });
      await refreshAuth();
      setSaveMsg(lang === 'en' ? 'Profile and CV updated successfully.' : 'پروفائل اور سی وی محفوظ ہو گئی ہے۔');
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Unable to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="h-64 bg-white border border-[#DCE3DD] rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="bg-white border border-[#DCE3DD] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#046A38] text-white flex items-center justify-center shrink-0">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-[#0D1F18]">{user.full_name}</h1>
              <div className="text-sm text-[#4A5D52]">
                {user.email} · {user.city || 'Pakistan'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/jobs"
              className="px-4 py-2 rounded-lg bg-[#046A38] text-white text-xs font-semibold whitespace-nowrap"
            >
              {t.nav.findJobs}
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#DCE3DD] text-xs font-semibold text-[#4A5D52] hover:text-red-700 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Sign Out' : 'لاگ آؤٹ'}</span>
            </button>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#DCE3DD] rounded-xl p-5">
            <div className="text-2xl font-display font-bold text-[#0D1F18] tabular-nums">{applications.length}</div>
            <div className="text-xs text-[#4A5D52] mt-1">
              {lang === 'en' ? 'Submitted Applications' : 'جمع شدہ درخواستیں'}
            </div>
          </div>
          <div className="bg-white border border-[#DCE3DD] rounded-xl p-5">
            <div className="text-2xl font-display font-bold text-[#0D1F18] tabular-nums">{savedJobs.length}</div>
            <div className="text-xs text-[#4A5D52] mt-1">
              {lang === 'en' ? 'Saved Vacancies' : 'محفوظ شدہ ملازمتیں'}
            </div>
          </div>
          <div className="bg-white border border-[#DCE3DD] rounded-xl p-5">
            <div className="text-sm font-semibold text-[#0D1F18] truncate">
              {cvFilename || (lang === 'en' ? 'No CV Uploaded' : 'سی وی اپ لوڈ نہیں')}
            </div>
            <div className="text-xs text-[#4A5D52] mt-1">{lang === 'en' ? 'Resume Status' : 'سی وی اسٹیٹس'}</div>
          </div>
        </div>

        {/* Workspace Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E2E7E3] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
              activeTab === 'profile' ? 'bg-[#0D1F18] text-white' : 'text-[#4A5D52] hover:text-[#0D1F18]'
            }`}
          >
            {lang === 'en' ? 'Profile & CV' : 'پروفائل اور سی وی'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('applied')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
              activeTab === 'applied' ? 'bg-[#0D1F18] text-white' : 'text-[#4A5D52] hover:text-[#0D1F18]'
            }`}
          >
            {lang === 'en' ? `Applied Jobs (${applications.length})` : `درخواستیں (${applications.length})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
              activeTab === 'saved' ? 'bg-[#0D1F18] text-white' : 'text-[#4A5D52] hover:text-[#0D1F18]'
            }`}
          >
            {lang === 'en' ? `Saved Jobs (${savedJobs.length})` : `محفوظ ملازمتیں (${savedJobs.length})`}
          </button>
        </div>

        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white border border-[#DCE3DD] rounded-2xl p-6 sm:p-8 space-y-6">
            {saveMsg && (
              <div className="bg-[#046A38]/10 border border-[#046A38]/25 text-[#0D1F18] rounded-xl p-3.5 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#046A38]" />
                <span>{saveMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1">{t.auth.fullName}</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1">{t.auth.phone}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1">{t.auth.city}</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                  {lang === 'en' ? 'Professional Headline' : 'پیشہ ورانہ تعارف'}
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                  {lang === 'en' ? 'Highest Education' : 'اعلیٰ ترین تعلیم'}
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                  {lang === 'en' ? 'Experience Level' : 'تجربہ'}
                </label>
                <input
                  type="text"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                  {lang === 'en' ? 'Skills (comma-separated)' : 'مہارتیں'}
                </label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                {lang === 'en' ? 'Experience Summary' : 'تجربے کا خلاصہ'}
              </label>
              <textarea
                rows={3}
                value={experienceSummary}
                onChange={(e) => setExperienceSummary(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="pt-4 border-t border-[#EDF1EE] space-y-2">
              <label className="block text-xs font-semibold text-[#1F352A]">
                {lang === 'en' ? 'Upload CV / Resume (PDF, DOC, DOCX — max 2MB)' : 'سی وی اپ لوڈ کریں'}
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleCvUpload}
                className="w-full text-xs text-[#4A5D52] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-[#DCE3DD] file:text-xs file:font-semibold file:bg-[#F2F6F3]"
              />
              {cvFilename && (
                <div className="flex items-center gap-3 text-xs text-[#046A38] font-medium">
                  <FileText className="w-4 h-4" />
                  <span>{cvFilename}</span>
                  {cvDataUrl && (
                    <a href={cvDataUrl} download={cvFilename} className="underline">
                      {lang === 'en' ? 'Download' : 'ڈاؤن لوڈ'}
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#046A38] hover:bg-[#03542D] text-white text-sm font-semibold cursor-pointer"
              >
                {saving ? (lang === 'en' ? 'Saving...' : 'محفوظ ہو رہا ہے...') : lang === 'en' ? 'Save Profile & CV' : 'پروفائل محفوظ کریں'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'applied' && (
          <div className="bg-white border border-[#DCE3DD] rounded-2xl overflow-hidden">
            {applications.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <p className="text-sm text-[#4A5D52]">
                  {lang === 'en' ? 'You have not submitted any applications yet.' : 'آپ نے ابھی تک کوئی درخواست جمع نہیں کروائی۔'}
                </p>
                <Link to="/jobs" className="inline-block px-4 py-2 rounded-lg bg-[#046A38] text-white text-xs font-semibold">
                  {t.nav.findJobs}
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-start">
                  <thead className="bg-[#F5F8F6] border-b border-[#DCE3DD] text-xs text-[#4A5D52]">
                    <tr>
                      <th className="py-3 px-4 text-start font-semibold">{lang === 'en' ? 'Vacancy' : 'آسامی'}</th>
                      <th className="py-3 px-4 text-start font-semibold">{lang === 'en' ? 'Organization' : 'ادارہ'}</th>
                      <th className="py-3 px-4 text-start font-semibold">{lang === 'en' ? 'City' : 'شہر'}</th>
                      <th className="py-3 px-4 text-start font-semibold">{lang === 'en' ? 'Status' : 'صورتحال'}</th>
                      <th className="py-3 px-4 text-end font-semibold">{lang === 'en' ? 'Date' : 'تاریخ'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF1EE]">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#FAFBF9]">
                        <td className="py-3.5 px-4 font-semibold text-[#0D1F18]">
                          <Link to={`/jobs/${app.job_id}`} className="hover:text-[#046A38]">
                            {lang === 'ur' && app.job_title_ur ? app.job_title_ur : app.job_title}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-[#4A5D52]">
                          {lang === 'ur' && app.company_name_ur ? app.company_name_ur : app.company_name}
                        </td>
                        <td className="py-3.5 px-4 text-[#4A5D52]">{app.job_city}</td>
                        <td className="py-3.5 px-4 font-medium text-[#046A38] capitalize">
                          {app.status.replace('_', ' ')}
                        </td>
                        <td className="py-3.5 px-4 text-end font-mono-tabular text-xs text-[#5E7266]">
                          {app.created_at.slice(0, 10)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            {savedJobs.length === 0 ? (
              <div className="bg-white border border-[#DCE3DD] rounded-2xl p-10 text-center space-y-3">
                <Bookmark className="w-6 h-6 text-[#4A5D52] mx-auto" />
                <p className="text-sm text-[#4A5D52]">
                  {lang === 'en' ? 'No saved vacancies yet.' : 'ابھی تک کوئی ملازمت محفوظ نہیں کی گئی۔'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {savedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
}
