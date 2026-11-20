import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Globe, MapPin } from 'lucide-react';
import { Layout } from '../components/Layout';
import { JobCard } from '../components/JobCard';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch, buildGoogleMapsUrl } from '../lib/api';
import type { Company, Job } from '../types';

export function CompanyProfilePage() {
  const { id } = useParams();
  const { lang, isRtl, t } = useLanguage();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch<{ company: Company; jobs: Job[] }>(`/api/companies/${id}`)
      .then((res) => {
        setCompany(res.company);
        setJobs(res.jobs);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Organization not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-56 bg-white border border-[#DCE3DD] rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (error || !company) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-display font-bold text-[#0D1F18]">{error || 'Not found'}</h1>
          <Link to="/companies" className="text-sm font-semibold text-[#046A38]">
            {t.companies.backToCompanies}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D52] hover:text-[#046A38]"
        >
          <BackArrow className="w-4 h-4" />
          <span>{t.companies.backToCompanies}</span>
        </Link>

        <div className="bg-white border border-[#DCE3DD] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0D1F18] text-white font-display font-bold text-xl flex items-center justify-center shrink-0">
                {company.logo_initials}
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#046A38]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{company.is_demonstration ? t.companies.demoLabel : t.companies.verifiedLabel}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0D1F18]">
                  {lang === 'ur' ? company.name_ur : company.name}
                </h1>
                <div className="text-sm text-[#4A5D52]">
                  {lang === 'ur' ? company.industry_ur : company.industry} · {company.city}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <a
                href={buildGoogleMapsUrl(company.address, company.city)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#046A38] hover:bg-[#03542D] text-white text-xs font-semibold transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>{t.jobDetail.viewLocation}</span>
              </a>
              {company.official_careers_url && (
                <a
                  href={company.official_careers_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCE3DD] hover:border-[#0D1F18] text-[#0D1F18] text-xs font-semibold"
                >
                  <span>{t.companies.officialCareers}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#32463A] leading-relaxed max-w-3xl">
            {lang === 'ur' ? company.description_ur : company.description}
          </p>

          <div className="pt-5 border-t border-[#EDF1EE] grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-[#5E7266] mb-1">{t.companies.headOffice}</div>
              <div className="font-medium text-[#0D1F18]">{company.address}</div>
            </div>
            {company.website && (
              <div>
                <div className="text-xs text-[#5E7266] mb-1">{t.companies.officialWebsite}</div>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-[#046A38] hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  <span>{company.website}</span>
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-[#0D1F18]">
            {t.companies.openVacancies} ({jobs.length})
          </h2>
          {jobs.length === 0 ? (
            <div className="bg-white border border-[#DCE3DD] rounded-xl p-8 text-center text-sm text-[#4A5D52]">
              {lang === 'en'
                ? 'No active vacancies currently listed for this organization.'
                : 'اس ادارے کے لیے فی الحال کوئی فعال آسامی درج نہیں ہے۔'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
