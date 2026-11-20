import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  MapPin,
  Phone,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch, buildGoogleMapsUrl } from '../lib/api';
import type { Job } from '../types';

export function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, isRtl, t } = useLanguage();
  const { user, seekerProfile, savedJobIds, toggleSaveJob } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply / Send Your CV Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [cvFilename, setCvFilename] = useState('');
  const [cvDataUrl, setCvDataUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch<{ job: Job }>(`/api/jobs/${id}`)
      .then((res) => setJob(res.job))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load vacancy'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      setApplicantName((prev) => prev || user.full_name || '');
      setApplicantEmail((prev) => prev || user.email || '');
      setApplicantPhone((prev) => prev || user.phone || '');
    }
    if (seekerProfile?.cv_filename) {
      setCvFilename((prev) => prev || seekerProfile.cv_filename);
      setCvDataUrl((prev) => prev || seekerProfile.cv_data_url);
    }
  }, [user, seekerProfile]);

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setApplyError('CV file size must be 2MB or smaller.');
      return;
    }
    setApplyError('');
    const reader = new FileReader();
    reader.onload = () => {
      setCvFilename(file.name);
      setCvDataUrl(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setApplyError('');
    setSubmitting(true);
    try {
      await apiFetch(`/api/jobs/${job.id}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          applicant_name: applicantName,
          applicant_email: applicantEmail,
          applicant_phone: applicantPhone,
          cover_note: coverNote,
          cv_filename: cvFilename,
          cv_data_url: cvDataUrl,
        }),
      });
      setApplySuccess(true);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (job) await toggleSaveJob(job.id);
  };

  const canDelete = Boolean(
    user && job && (user.role === 'admin' || (user.role === 'employer' && job.employer_user_id === user.id))
  );

  const handleDeleteJob = async () => {
    if (!job) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await apiFetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
      navigate(user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/employer');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unable to delete vacancy');
      setDeleting(false);
    }
  };

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-64 bg-white border border-[#DCE3DD] rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
          <h1 className="text-2xl font-display font-bold text-[#0D1F18]">
            {error || 'Vacancy not found'}
          </h1>
          <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-[#046A38]">
            <BackArrow className="w-4 h-4" />
            <span>{t.jobDetail.backToJobs}</span>
          </Link>
        </div>
      </Layout>
    );
  }

  const title = lang === 'ur' && job.title_ur ? job.title_ur : job.title;
  const companyName = lang === 'ur' && job.company_name_ur ? job.company_name_ur : job.company_name;
  const requirements = lang === 'ur' && job.requirements_ur?.length ? job.requirements_ur : job.requirements;
  const responsibilities =
    lang === 'ur' && job.responsibilities_ur?.length ? job.responsibilities_ur : job.responsibilities;
  const isSaved = savedJobIds.has(job.id);

  const verificationLabel =
    job.verification_status === 'verified'
      ? t.jobs.statusVerified
      : job.verification_status === 'verified_demo'
        ? t.jobs.statusDemo
        : job.verification_status === 'pending_review'
          ? t.jobs.statusPending
          : t.jobs.statusRejected;

  return (
    <Layout>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D52] hover:text-[#046A38] mb-6"
        >
          <BackArrow className="w-4 h-4" />
          <span>{t.jobDetail.backToJobs}</span>
        </Link>

        {job.status === 'closed' && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3 text-sm font-medium">
            {t.jobDetail.closedBanner}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Primary Vacancy Detail Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#DCE3DD] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#4A5D52]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#046A38]">
                  <CheckCircle2 className="w-4 h-4" />
                  {verificationLabel}
                </span>
                <span className="font-mono-tabular">
                  {t.jobDetail.deadline}: {job.deadline}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#0D1F18] text-white font-display font-bold text-lg flex items-center justify-center shrink-0">
                  {job.logo_initials || 'JW'}
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0D1F18] leading-snug">
                    {title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-[#4A5D52]">
                    <Link
                      to={`/companies/${job.company_id}`}
                      className="font-semibold text-[#046A38] hover:underline"
                    >
                      {companyName}
                    </Link>
                    <span aria-hidden="true">·</span>
                    <span>{job.city}</span>
                    <span aria-hidden="true">·</span>
                    <span>{job.subcategory}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {job.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => {
                      setApplySuccess(false);
                      setModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#046A38] hover:bg-[#03542D] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t.jobDetail.applyNow}</span>
                  </button>
                )}

                {job.application_url && (
                  <a
                    href={job.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#0D1F18] text-[#0D1F18] hover:bg-[#0D1F18] hover:text-white text-sm font-semibold transition-colors whitespace-nowrap"
                  >
                    <span>{t.jobDetail.officialPortal}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <a
                  href={buildGoogleMapsUrl(job.address, job.city)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#DCE3DD] hover:border-[#046A38] text-[#1F352A] text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <MapPin className="w-4 h-4 text-[#046A38]" />
                  <span>{t.jobDetail.viewLocation}</span>
                </a>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#DCE3DD] hover:border-[#046A38] text-[#1F352A] text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4 text-[#046A38]" /> : <Bookmark className="w-4 h-4" />}
                  <span>{isSaved ? t.jobs.saved : t.jobs.save}</span>
                </button>

                {canDelete && (
                  confirmDelete ? (
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={handleDeleteJob}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>
                          {deleting
                            ? lang === 'en'
                              ? 'Deleting...'
                              : 'حذف ہو رہی ہے...'
                            : lang === 'en'
                              ? 'Confirm Delete'
                              : 'حذف کی تصدیق کریں'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-4 py-3 rounded-xl border border-[#DCE3DD] text-sm font-medium text-[#4A5D52] cursor-pointer whitespace-nowrap"
                      >
                        {lang === 'en' ? 'Cancel' : 'منسوخ'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{lang === 'en' ? 'Delete Vacancy' : 'آسامی حذف کریں'}</span>
                    </button>
                  )
                )}
              </div>
              {deleteError && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs">
                  {deleteError}
                </div>
              )}
            </div>

            {/* Responsibilities & Requirements */}
            <div className="bg-white border border-[#DCE3DD] rounded-2xl p-6 sm:p-8 space-y-8">
              <div>
                <h2 className="text-lg font-display font-bold text-[#0D1F18] mb-3">
                  {t.jobDetail.responsibilities}
                </h2>
                <ul className="space-y-2.5 text-sm text-[#32463A] list-disc ps-5">
                  {responsibilities.map((item, i) => (
                    <li key={i} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-[#EDF1EE]">
                <h2 className="text-lg font-display font-bold text-[#0D1F18] mb-3">
                  {t.jobDetail.requirements}
                </h2>
                <ul className="space-y-2.5 text-sm text-[#32463A] list-disc ps-5">
                  {requirements.map((item, i) => (
                    <li key={i} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {job.skills?.length > 0 && (
                <div className="pt-6 border-t border-[#EDF1EE]">
                  <h2 className="text-lg font-display font-bold text-[#0D1F18] mb-3">{t.jobDetail.skills}</h2>
                  <p className="text-sm text-[#32463A] leading-relaxed">{job.skills.join(' · ')}</p>
                </div>
              )}

              {job.source_note && (
                <div className="pt-6 border-t border-[#EDF1EE]">
                  <h2 className="text-sm font-semibold text-[#0D1F18] mb-1">{t.jobDetail.sourceNotice}</h2>
                  <p className="text-sm text-[#4A5D52] leading-relaxed">{job.source_note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-[#DCE3DD] rounded-2xl p-6 space-y-5">
              <h2 className="text-base font-display font-bold text-[#0D1F18] pb-3 border-b border-[#EDF1EE]">
                {lang === 'en' ? 'Vacancy Overview' : 'ملازمت کا خلاصہ'}
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs text-[#5E7266] mb-0.5">{t.jobDetail.salary}</div>
                  <div className="font-semibold text-[#0D1F18] tabular-nums">{job.salary_display}</div>
                </div>

                <div>
                  <div className="text-xs text-[#5E7266] mb-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t.jobDetail.location}</span>
                  </div>
                  <div className="font-medium text-[#0D1F18]">{job.address}</div>
                </div>

                <div>
                  <div className="text-xs text-[#5E7266] mb-0.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{t.jobDetail.education}</span>
                  </div>
                  <div className="font-medium text-[#0D1F18]">{job.education}</div>
                </div>

                <div>
                  <div className="text-xs text-[#5E7266] mb-0.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{t.jobDetail.experience}</span>
                  </div>
                  <div className="font-medium text-[#0D1F18]">{job.experience}</div>
                </div>

                <div>
                  <div className="text-xs text-[#5E7266] mb-0.5">{t.jobDetail.employmentType}</div>
                  <div className="font-medium text-[#0D1F18]">{job.employment_type}</div>
                </div>

                {job.gender_eligibility && job.gender_eligibility !== 'Not Specified' && (
                  <div>
                    <div className="text-xs text-[#5E7266] mb-0.5">{t.jobDetail.gender}</div>
                    <div className="font-medium text-[#0D1F18]">{job.gender_eligibility}</div>
                  </div>
                )}

                <div>
                  <div className="text-xs text-[#5E7266] mb-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t.jobDetail.deadline}</span>
                  </div>
                  <div className="font-mono-tabular font-semibold text-[#0D1F18]">{job.deadline}</div>
                </div>

                <div>
                  <div className="text-xs text-[#5E7266] mb-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t.jobDetail.contact}</span>
                  </div>
                  <div className="font-medium text-[#0D1F18]">{job.contact_phone}</div>
                  {job.contact_email && <div className="text-xs text-[#4A5D52] mt-0.5">{job.contact_email}</div>}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Send Your CV / Apply Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#DCE3DD] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EDF1EE]">
              <h2 className="text-lg font-display font-bold text-[#0D1F18]">{t.jobDetail.applyModalTitle}</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#4A5D52] hover:bg-[#F1F5F2] cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applySuccess ? (
              <div className="py-6 space-y-4">
                <div className="flex items-start gap-3 bg-[#046A38]/10 border border-[#046A38]/20 rounded-xl p-4 text-sm text-[#0D1F18]">
                  <CheckCircle2 className="w-5 h-5 text-[#046A38] shrink-0 mt-0.5" />
                  <span>{t.jobDetail.appSuccess}</span>
                </div>
                <div className="flex justify-end gap-3">
                  {user?.role === 'seeker' && (
                    <Link
                      to="/dashboard/seeker"
                      className="px-4 py-2 rounded-lg bg-[#046A38] text-white text-sm font-semibold"
                    >
                      {t.nav.dashboard}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#DCE3DD] text-sm font-medium cursor-pointer"
                  >
                    {lang === 'en' ? 'Close' : 'بند کریں'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="mt-5 space-y-4">
                {applyError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs">
                    {applyError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                    {t.jobDetail.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm text-[#0D1F18]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                      {t.jobDetail.email} *
                    </label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm text-[#0D1F18]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                      {t.jobDetail.phone} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="+92 3XX XXXXXXX"
                      className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm text-[#0D1F18]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                    {t.jobDetail.attachCv}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleCvFileChange}
                    className="w-full text-xs text-[#4A5D52] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-[#DCE3DD] file:text-xs file:font-semibold file:bg-[#F2F6F3] file:text-[#0D1F18]"
                  />
                  {cvFilename && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#046A38] font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      <span>
                        {t.jobDetail.useSavedCv} {cvFilename}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                    {t.jobDetail.coverNote}
                  </label>
                  <textarea
                    rows={3}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm text-[#0D1F18]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-[#DCE3DD] text-sm font-medium text-[#4A5D52] cursor-pointer"
                  >
                    {lang === 'en' ? 'Cancel' : 'منسوخ'}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-lg bg-[#046A38] hover:bg-[#03542D] text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? t.jobDetail.submitting : t.jobDetail.submitApp}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
