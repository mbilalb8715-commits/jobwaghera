import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, Info, MapPin, Search } from 'lucide-react';
import { Layout } from '../components/Layout';
import { JobCard } from '../components/JobCard';
import { CategoryIcon } from '../components/CategoryIcon';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../lib/api';
import type { Category, City, Company, Job, PlatformStats } from '../types';

export function HomePage() {
  const { lang, isRtl, t } = useLanguage();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [imgError, setImgError] = useState(false);

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<PlatformStats>('/api/stats'),
      apiFetch<{ categories: Category[] }>('/api/categories'),
      apiFetch<{ jobs: Job[] }>('/api/jobs'),
      apiFetch<{ companies: Company[] }>('/api/companies'),
      apiFetch<{ cities: City[] }>('/api/cities'),
    ])
      .then(([s, catRes, jobRes, compRes, cityRes]) => {
        if (!active) return;
        setStats(s);
        setCategories(catRes.categories);
        setJobs(jobRes.jobs);
        setCompanies(compRes.companies);
        setCities(cityRes.cities);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (selectedCity) params.set('city', selectedCity);
    navigate(`/jobs?${params.toString()}`);
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <Layout>
      {/* Hero Split Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 py-4">
            <p className="text-sm font-semibold text-[#046A38] tracking-wide">{t.home.heroKicker}</p>
            <h1
              className="text-3xl sm:text-5xl font-display font-bold text-[#0D1F18] leading-[1.14] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              {t.home.heroTitle}
            </h1>
            <p className="text-base sm:text-lg text-[#4A5D52] leading-relaxed max-w-2xl">
              {t.home.heroSubtitle}
            </p>

            {/* Job Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white border border-[#DCE3DD] rounded-xl p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-sm"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2">
                <Search className="w-4 h-4 text-[#4A5D52] shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.home.searchPlaceholder}
                  className="w-full bg-transparent text-sm text-[#0D1F18] placeholder:text-[#7A8C82] focus:outline-none"
                />
              </div>

              <div className="h-px sm:h-7 sm:w-px bg-[#E2E7E3]" />

              <div className="sm:w-52 flex items-center gap-2 px-3 py-2">
                <MapPin className="w-4 h-4 text-[#4A5D52] shrink-0" aria-hidden="true" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  aria-label={t.jobs.city}
                  className="w-full bg-transparent text-sm text-[#0D1F18] focus:outline-none cursor-pointer"
                >
                  <option value="">{t.home.cityPlaceholder}</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.name_en}>
                      {lang === 'ur' ? c.name_ur : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-[#046A38] hover:bg-[#03542D] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.home.searchBtn}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full min-h-[280px] rounded-2xl overflow-hidden border border-[#DCE3DD] bg-[#E8EFEA]">
              {!imgError ? (
                <img
                  src="/src/assets/images/hero_home_workplace_1794730251303.jpg"
                  alt="Pakistani professionals collaborating in a bright modern workplace"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 text-center text-[#4A5D52]">
                  JOB وَغیرہ — Pakistan Recruitment Network
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Platform Statistics Strip */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#DCE3DD] rounded-xl p-5">
            <div className="text-2xl sm:text-3xl font-display font-bold text-[#0D1F18] tabular-nums">
              {stats ? stats.activeJobs : '—'}
            </div>
            <div className="mt-1 text-xs sm:text-sm text-[#4A5D52]">{t.home.stats.vacancies}</div>
          </div>
          <div className="bg-white border border-[#DCE3DD] rounded-xl p-5">
            <div className="text-2xl sm:text-3xl font-display font-bold text-[#0D1F18] tabular-nums">
              {stats ? stats.companiesCount : '—'}
            </div>
            <div className="mt-1 text-xs sm:text-sm text-[#4A5D52]">{t.home.stats.companies}</div>
          </div>
          <div className="bg-white border border-[#DCE3DD] rounded-xl p-5">
            <div className="text-2xl sm:text-3xl font-display font-bold text-[#0D1F18] tabular-nums">
              {stats ? stats.categoriesCount : '—'}
            </div>
            <div className="mt-1 text-xs sm:text-sm text-[#4A5D52]">{t.home.stats.categories}</div>
          </div>
          <div className="bg-white border border-[#DCE3DD] rounded-xl p-5">
            <div className="text-2xl sm:text-3xl font-display font-bold text-[#0D1F18] tabular-nums">
              {stats ? stats.citiesCount : '—'}
            </div>
            <div className="mt-1 text-xs sm:text-sm text-[#4A5D52]">{t.home.stats.cities}</div>
          </div>
        </div>

        {/* Data Transparency Notice */}
        <div className="mt-6 bg-[#F2F6F3] border border-[#DCE3DD] rounded-xl p-5 flex items-start gap-3.5">
          <Info className="w-5 h-5 text-[#046A38] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-sm">
            <div className="font-semibold text-[#0D1F18]">{t.home.transparencyTitle}</div>
            <p className="text-[#4A5D52] leading-relaxed">{t.home.transparencyBody}</p>
          </div>
        </div>
      </section>

      {/* Popular Job Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E6ECE7]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0D1F18]">
              {t.home.popularCategories}
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-[#4A5D52]">{t.home.popularCategoriesSub}</p>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#046A38] hover:text-[#03542D] whitespace-nowrap shrink-0"
          >
            <span>{t.home.viewAllCategories}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              to={`/jobs?category=${encodeURIComponent(cat.slug)}`}
              className="bg-white border border-[#DCE3DD] hover:border-[#046A38]/50 rounded-xl p-5 transition-colors flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F1F5F2] text-[#046A38] flex items-center justify-center shrink-0">
                  <CategoryIcon name={cat.icon_name} className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono-tabular text-[#4A5D52]">
                  {cat.vacancy_count} {t.categories.vacanciesLabel}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-[#0D1F18] text-base">
                  {lang === 'ur' ? cat.name_ur : cat.name_en}
                </h3>
                <p className="mt-1 text-xs text-[#4A5D52] line-clamp-2">
                  {lang === 'ur' ? cat.description_ur : cat.description_en}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Verified & Reference Vacancies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E6ECE7]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0D1F18]">{t.home.latestJobs}</h2>
            <p className="mt-1.5 text-sm sm:text-base text-[#4A5D52]">{t.home.latestJobsSub}</p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#046A38] hover:text-[#03542D] whitespace-nowrap shrink-0"
          >
            <span>{t.home.browseAllJobs}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-48 rounded-xl bg-white border border-[#DCE3DD] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Companies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E6ECE7]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0D1F18]">
              {t.home.featuredCompanies}
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-[#4A5D52]">{t.home.featuredCompaniesSub}</p>
          </div>
          <Link
            to="/companies"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#046A38] hover:text-[#03542D] whitespace-nowrap shrink-0"
          >
            <span>{t.home.viewAllCompanies}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.slice(0, 6).map((comp) => (
            <Link
              key={comp.id}
              to={`/companies/${comp.id}`}
              className="bg-white border border-[#DCE3DD] hover:border-[#046A38]/50 rounded-xl p-5 transition-colors flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-lg bg-[#0D1F18] text-white font-display font-semibold text-sm flex items-center justify-center shrink-0">
                {comp.logo_initials}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[#0D1F18] text-base truncate">
                  {lang === 'ur' ? comp.name_ur : comp.name}
                </h3>
                <div className="mt-1 text-xs text-[#4A5D52] flex items-center gap-2">
                  <span>{lang === 'ur' ? comp.industry_ur : comp.industry}</span>
                  <span aria-hidden="true">·</span>
                  <span>{comp.city}</span>
                </div>
                <div className="mt-3 text-xs font-medium text-[#046A38] tabular-nums">
                  {comp.vacancy_count || 0} {t.companies.openRoles}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Pakistani Cities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E6ECE7]">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0D1F18]">{t.home.popularCities}</h2>
          <p className="mt-1.5 text-sm sm:text-base text-[#4A5D52]">{t.home.popularCitiesSub}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {cities.slice(0, 16).map((city) => (
            <Link
              key={city.id}
              to={`/jobs?city=${encodeURIComponent(city.name_en)}`}
              className="bg-white border border-[#DCE3DD] hover:border-[#046A38] rounded-xl p-3.5 transition-colors text-center"
            >
              <div className="font-semibold text-sm text-[#0D1F18]">
                {lang === 'ur' ? city.name_ur : city.name_en}
              </div>
              <div className="mt-1 text-xs text-[#4A5D52] tabular-nums">
                {city.vacancy_count} {t.categories.vacanciesLabel}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works & Dual CTAs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E6ECE7]">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0D1F18] mb-8">{t.home.howItWorks}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.home.steps.map((step) => (
            <div key={step.num} className="bg-white border border-[#DCE3DD] rounded-xl p-6 space-y-3">
              <div className="text-xs font-mono-tabular font-semibold text-[#046A38]">{step.num}.</div>
              <h3 className="text-lg font-semibold text-[#0D1F18]">{step.title}</h3>
              <p className="text-sm text-[#4A5D52] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0D1F18] text-white rounded-2xl p-8 flex flex-col justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold">{t.home.ctaSeekersTitle}</h3>
              <p className="text-sm text-[#B8CBBF] leading-relaxed">{t.home.ctaSeekersDesc}</p>
            </div>
            <div>
              <Link
                to="/auth?mode=register&role=seeker"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#046A38] hover:bg-[#058245] text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <span>{t.home.ctaSeekersBtn}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-[#DCE3DD] rounded-2xl p-8 flex flex-col justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#046A38]">
                <Building2 className="w-4 h-4" />
                <span>{lang === 'en' ? 'For Pakistani Employers' : 'پاکستانی آجروں کے لیے'}</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-[#0D1F18]">{t.home.ctaEmployersTitle}</h3>
              <p className="text-sm text-[#4A5D52] leading-relaxed">{t.home.ctaEmployersDesc}</p>
            </div>
            <div>
              <Link
                to="/post-job"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0D1F18] hover:bg-[#193529] text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <span>{t.home.ctaEmployersBtn}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
