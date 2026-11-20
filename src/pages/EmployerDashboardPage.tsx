import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, FileText, LogOut, Plus, Trash2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Application, Job } from '../types';

export function EmployerDashboardPage() {
  const { lang, t } = useLanguage();
  const { user, company, loading, refreshAuth, logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'vacancies' | 'applicants' | 'company'>('vacancies');

  // Company edit fields
  const [compName, setCompName] = useState('');
  const [compNameUr, setCompNameUr] = useState('');
  const [compIndustry, setCompIndustry] = useState('');
  const [compCity, setCompCity] = useState('');
  const [compAddress, setCompAddress] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compWebsite, setCompWebsite] = useState('');
  const [compCareersUrl, setCompCareersUrl] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [vacancyNotice, setVacancyNotice] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'employer' && user.role !== 'admin'))) {
      navigate('/auth?role=employer');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (company) {
      setCompName(company.name || '');
      setCompNameUr(company.name_ur || '');
      setCompIndustry(company.industry || '');
      setCompCity(company.city || '');
      setCompAddress(company.address || '');
      setCompDesc(company.description || '');
      setCompWebsite(company.website || '');
      setCompCareersUrl(company.official_careers_url || '');
    }
  }, [company]);

  const fetchEmployerData = () => {
    apiFetch<{ jobs: Job[] }>('/api/employer/jobs')
      .then((r) => setJobs(r.jobs))
      .catch(() => {});
    apiFetch<{ applications: Application[] }>('/api/employer/applications')
      .then((r) => setApplications(r.applications))
      .catch(() => {});
  };

  useEffect(() => {
    if (user && (user.role === 'employer' || user.role === 'admin')) {
      fetchEmployerData();
    }
  }, [user]);

  const toggleJobStatus = async (jobId: string, nextStatus: 'open' | 'closed') => {
    await apiFetch(`/api/employer/jobs/${jobId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });
    fetchEmployerData();
  };

  const deleteJob = async (jobId: string) => {
    setDeletingId(jobId);
    setVacancyNotice('');
    try {
      await apiFetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      setConfirmDeleteId(null);
      setVacancyNotice(lang === 'en' ? 'Vacancy permanently deleted.' : 'آسامی مستقل طور پر حذف کر دی گئی ہے۔');
      fetchEmployerData();
    } catch (err) {
      setVacancyNotice(err instanceof Error ? err.message : 'Unable to delete vacancy');
    } finally {
      setDeletingId(null);
    }
  };

  const updateApplicationStatus = async (appId: string, status: Application['status']) => {
    await apiFetch(`/api/employer/applications/${appId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    fetchEmployerData();
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg('');
    await apiFetch('/api/employer/company', {
      method: 'PUT',
      body: JSON.stringify({
        name: compName,
        name_ur: compNameUr,
        industry: compIndustry,
        industry_ur: compIndustry,
        city: compCity,
        address: compAddress,
        description: compDesc,
        description_ur: compDesc,
        website: compWebsite,
        official_careers_url: compCareersUrl,
      }),
    });
    await refreshAuth();
    setSaveMsg(lang === 'en' ? 'Organization profile updated.' : 'ادارے کا پروفائل محفوظ ہو گیا ہے۔');
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
        {/* Header Spotlight */}
        <div className="bg-white border border-[#DCE3DD] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0D1F18] text-white flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-[#0D1F18]">
                  {company ? (lang === 'ur' ? company.name_ur : company.name) : user.full_name}
                </h1>
                <div className="text-sm text-[#4A5D52] mt-0.5">
                  {user.email} · {company?.city || user.city}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/post-job"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#046A38] hover:bg-[#03542D] text-white text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>{t.nav.postJob}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DCE3DD] text-xs font-semibold text-[#4A5D52] hover:text-red-700 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Sign Out' : 'لاگ آؤٹ'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 min-h-[160px] bg-[#E8EFEA]">
            {!imgError ? (
              <img
                src="/src/assets/images/employer_hiring_office_1794730251994.jpg"
                alt="Modern corporate recruitment office in Pakistan"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#DCE3DD] rounded-xl p-5">
            <div className="text-2xl font-display font-bold text-[#0D1F18] tabular-nums">{jobs.length}</div>
            <div className="text-xs text-[#4A5D52] mt-1">{lang === 'en' ? 'Posted Vacancies' : 'پوسٹ کردہ آسامیاں'}</div>
          </div>
          <div className="bg-white border border-[#DCE3DD] rounded-xl p-5">
            <div className="text-2xl font-display font-bold text-[#0D1F18] tabular-nums">{applications.length}</div>
            <div className="text-xs text-[#4A5D52] mt-1">{lang === 'en' ? 'Received Applications' : 'موصولہ درخواستیں'}</div>
          </div>
          <div className="bg-white border border-[#DCE3DD] rounded-xl p-5">
            <div className="text-2xl font-display font-bold text-[#0D1F18] tabular-nums">
              {jobs.filter((j) => j.verification_status === 'verified' || j.verification_status === 'verified_demo').length}
            </div>
            <div className="text-xs text-[#4A5D52] mt-1">{lang === 'en' ? 'Verified Active' : 'تصدیق شدہ فعال'}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E7E3] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('vacancies')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
              activeTab === 'vacancies' ? 'bg-[#0D1F18] text-white' : 'text-[#4A5D52] hover:text-[#0D1F18]'
            }`}
          >
            {lang === 'en' ? `Manage Vacancies (${jobs.length})` : `آسامیاں (${jobs.length})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('applicants')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
              activeTab === 'applicants' ? 'bg-[#0D1F18] text-white' : 'text-[#4A5D52] hover:text-[#0D1F18]'
            }`}
          >
            {lang === 'en' ? `Applicants & CVs (${applications.length})` : `امیدوار اور سی وی (${applications.length})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
              activeTab === 'company' ? 'bg-[#0D1F18] text-white' : 'text-[#4A5D52] hover:text-[#0D1F18]'
            }`}
          >
            {lang === 'en' ? 'Company Profile' : 'ادارے کا پروفائل'}
          </button>
        </div>

        {activeTab === 'vacancies' && (
          <div className="bg-white border border-[#DCE3DD] rounded-2xl overflow-hidden">
            {vacancyNotice && (
              <div className="m-4 mb-0 bg-[#046A38]/10 border border-[#046A38]/25 text-[#0D1F18] rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#046A38] shrink-0" />
                <span>{vacancyNotice}</span>
              </div>
            )}
            {jobs.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <p className="text-sm text-[#4A5D52]">
                  {lang === 'en' ? 'No vacancies posted by your account yet.' : 'آپ کے اکاؤنٹ سے ابھی کوئی آسامی پوسٹ نہیں ہوئی۔'}
                </p>
                <Link to="/post-job" className="inline-block px-4 py-2 rounded-lg bg-[#046A38] text-white text-xs font-semibold">
                  {t.nav.postJob}
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F5F8F6] border-b border-[#DCE3DD] text-xs text-[#4A5D52]">
                    <tr>
                      <th className="py-3 px-4 text-start font-semibold">{lang === 'en' ? 'Job Title' : 'عہدہ'}</th>
                      <th className="py-3 px-4 text-start font-semibold">{lang === 'en' ? 'Verification' : 'تصدیق'}</th>
                      <th className="py-3 px-4 text-start font-semibold">{lang === 'en' ? 'Deadline' : 'آخری تاریخ'}</th>
                      <th className="py-3 px-4 text-start font-semibold">{lang === 'en' ? 'Applicants' : 'درخواستیں'}</th>
                      <th className="py-3 px-4 text-end font-semibold">{lang === 'en' ? 'Actions' : 'اقدامات'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF1EE]">
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td className="py-3.5 px-4 font-semibold text-[#0D1F18]">
                          <Link to={`/jobs/${job.id}`} className="hover:text-[#046A38]">
                            {lang === 'ur' && job.title_ur ? job.title_ur : job.title}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-[#4A5D52]">{job.verification_status}</td>
                        <td className="py-3.5 px-4 font-mono-tabular text-xs">{job.deadline}</td>
                        <td className="py-3.5 px-4 font-mono-tabular">{job.applicant_count || 0}</td>
                        <td className="py-3.5 px-4 text-end">
                          <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => toggleJobStatus(job.id, job.status === 'open' ? 'closed' : 'open')}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                                job.status === 'open'
                                  ? 'border-[#046A38] text-[#046A38] bg-[#046A38]/8'
                                  : 'border-[#DCE3DD] text-[#4A5D52]'
                              }`}
                            >
                              {job.status === 'open'
                                ? lang === 'en'
                                  ? 'Open (Close)'
                                  : 'کھلی ہے'
                                : lang === 'en'
                                  ? 'Closed (Reopen)'
                                  : 'بند ہے'}
                            </button>

                            {confirmDeleteId === job.id ? (
                              <span className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={deletingId === job.id}
                                  onClick={() => deleteJob(job.id)}
                                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer whitespace-nowrap"
                                >
                                  {deletingId === job.id
                                    ? lang === 'en'
                                      ? 'Deleting...'
                                      : 'حذف ہو رہی ہے...'
                                    : lang === 'en'
                                      ? 'Confirm Delete'
                                      : 'تصدیق کریں'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2.5 py-1 rounded-lg border border-[#DCE3DD] text-xs font-medium text-[#4A5D52] cursor-pointer whitespace-nowrap"
                                >
                                  {lang === 'en' ? 'Cancel' : 'منسوخ'}
                                </button>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(job.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold cursor-pointer whitespace-nowrap"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{lang === 'en' ? 'Delete' : 'حذف کریں'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'applicants' && (
          <div className="bg-white border border-[#DCE3DD] rounded-2xl overflow-hidden">
            {applications.length === 0 ? (
              <div className="p-10 text-center text-sm text-[#4A5D52]">
                {lang === 'en' ? 'No candidate applications received yet.' : 'ابھی تک کوئی درخواست موصول نہیں ہوئی۔'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F5F8F6] border-b border-[#DCE3DD] text-xs text-[#4A5D52]">
                    <tr>
                      <th className="py-3 px-4 text-start font-semibold">{lang === 'en' ? 'Candidate' : 'امیدوار'}</th>
                      <th className="py-3 px-4 text-start font-semibold">{lang === 'en' ? 'Vacancy' : 'آسامی'}</th>
                      <th className="py-3 px-4 text-start font-semibold">{lang === 'en' ? 'CV' : 'سی وی'}</th>
                      <th className="py-3 px-4 text-end font-semibold">{lang === 'en' ? 'Decision Status' : 'فیصلہ'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF1EE]">
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#0D1F18]">{app.applicant_name}</div>
                          <div className="text-xs text-[#4A5D52]">
                            {app.applicant_email} · {app.applicant_phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#1F352A]">{app.job_title}</td>
                        <td className="py-3.5 px-4">
                          {app.cv_data_url ? (
                            <a
                              href={app.cv_data_url}
                              download={app.cv_filename || 'candidate-cv'}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#046A38] hover:underline"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{app.cv_filename || 'Download CV'}</span>
                            </a>
                          ) : (
                            <span className="text-xs text-[#7A8C82]">No file</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-end">
                          <select
                            value={app.status}
                            onChange={(e) =>
                              updateApplicationStatus(app.id, e.target.value as Application['status'])
                            }
                            className="border border-[#DCE3DD] rounded-lg px-2.5 py-1.5 text-xs font-medium bg-white"
                          >
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview">Interview</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'company' && company && (
          <form onSubmit={handleSaveCompany} className="bg-white border border-[#DCE3DD] rounded-2xl p-6 sm:p-8 space-y-5">
            {saveMsg && (
              <div className="bg-[#046A38]/10 border border-[#046A38]/25 text-[#0D1F18] rounded-xl p-3 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#046A38]" />
                <span>{saveMsg}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1">Organization Name (EN)</label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1">Organization Name (UR)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={compNameUr}
                  onChange={(e) => setCompNameUr(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1">Industry</label>
                <input
                  type="text"
                  value={compIndustry}
                  onChange={(e) => setCompIndustry(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1">City</label>
                <input
                  type="text"
                  required
                  value={compCity}
                  onChange={(e) => setCompCity(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                Complete Registered Address (Google Maps)
              </label>
              <input
                type="text"
                required
                value={compAddress}
                onChange={(e) => setCompAddress(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1">Official Website</label>
                <input
                  type="url"
                  value={compWebsite}
                  onChange={(e) => setCompWebsite(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1">Official Careers Portal</label>
                <input
                  type="url"
                  value={compCareersUrl}
                  onChange={(e) => setCompCareersUrl(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F352A] mb-1">Description</label>
              <textarea
                rows={3}
                value={compDesc}
                onChange={(e) => setCompDesc(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#046A38] text-white text-sm font-semibold cursor-pointer"
              >
                {lang === 'en' ? 'Save Company Profile' : 'ادارے کی تفصیل محفوظ کریں'}
              </button>
            </div>
          </form>
        )}
      </section>
    </Layout>
  );
}
