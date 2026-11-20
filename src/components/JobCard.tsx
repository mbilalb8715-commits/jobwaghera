import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Calendar, CheckCircle2, Clock, ExternalLink, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { buildGoogleMapsUrl } from '../lib/api';
import type { Job } from '../types';

export function JobCard({ job }: { job: Job }) {
  const { lang, t } = useLanguage();
  const { user, savedJobIds, toggleSaveJob } = useAuth();
  const navigate = useNavigate();

  const title = lang === 'ur' && job.title_ur ? job.title_ur : job.title;
  const companyName = lang === 'ur' && job.company_name_ur ? job.company_name_ur : job.company_name;
  const isSaved = savedJobIds.has(job.id);

  const statusText =
    job.verification_status === 'verified'
      ? t.jobs.statusVerified
      : job.verification_status === 'verified_demo'
        ? t.jobs.statusDemo
        : job.verification_status === 'pending_review'
          ? t.jobs.statusPending
          : t.jobs.statusRejected;

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      await toggleSaveJob(job.id);
    } catch {
      // handled gracefully
    }
  };

  return (
    <article className="bg-white border border-[#DCE3DD] rounded-xl p-6 transition-colors hover:border-[#046A38]/50 flex flex-col justify-between gap-5">
      <div className="space-y-3">
        {/* Top quiet 1-line kicker with verification & closing date */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4A5D52]">
          <div className="flex items-center gap-2 font-medium">
            {job.verification_status === 'verified' || job.verification_status === 'verified_demo' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#046A38] shrink-0" aria-hidden="true" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-[#B45309] shrink-0" aria-hidden="true" />
            )}
            <span className={job.verification_status === 'verified' ? 'text-[#046A38]' : 'text-[#4A5D52]'}>
              {statusText}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono-tabular text-[#4A5D52]">
            <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>
              {t.jobs.deadline}: {job.deadline}
            </span>
          </div>
        </div>

        {/* Company & Title */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#0D1F18] text-white font-display font-semibold text-sm flex items-center justify-center shrink-0">
            {job.logo_initials || 'JW'}
          </div>
          <div className="min-w-0 flex-1">
            <Link
              to={`/jobs/${job.id}`}
              className="block text-lg font-semibold text-[#0D1F18] hover:text-[#046A38] transition-colors leading-snug"
            >
              {title}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#4A5D52]">
              <Link to={`/companies/${job.company_id}`} className="font-medium text-[#1F352A] hover:underline">
                {companyName}
              </Link>
              <span aria-hidden="true">·</span>
              <span>{job.city}</span>
              <span aria-hidden="true">·</span>
              <span>{job.employment_type}</span>
            </div>
          </div>
        </div>

        {/* Salary & Education inline */}
        <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#1F352A]">
          <span className="font-medium tabular-nums">{job.salary_display}</span>
          <span aria-hidden="true" className="text-[#9AA9A0]">
            /
          </span>
          <span className="text-[#4A5D52]">{job.education}</span>
          {job.gender_eligibility && job.gender_eligibility !== 'Not Specified' && (
            <>
              <span aria-hidden="true" className="text-[#9AA9A0]">
                /
              </span>
              <span className="text-[#4A5D52]">{job.gender_eligibility}</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-[#EDF1EE] flex flex-wrap items-center justify-between gap-3">
        <a
          href={buildGoogleMapsUrl(job.address, job.city)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4A5D52] hover:text-[#046A38] transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate max-w-[220px]">{job.city}</span>
          <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
        </a>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            aria-label={isSaved ? t.jobs.saved : t.jobs.save}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isSaved
                ? 'border-[#046A38] bg-[#046A38]/8 text-[#046A38]'
                : 'border-[#DCE3DD] text-[#4A5D52] hover:border-[#046A38] hover:text-[#046A38]'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isSaved ? t.jobs.saved : t.jobs.save}</span>
          </button>

          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium bg-[#046A38] text-white hover:bg-[#03542D] transition-colors whitespace-nowrap shrink-0"
          >
            {t.jobs.viewDetails}
          </Link>
        </div>
      </div>
    </article>
  );
}
