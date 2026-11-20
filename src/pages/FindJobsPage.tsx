import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Info, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { Layout } from '../components/Layout';
import { JobCard } from '../components/JobCard';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../lib/api';
import type { Category, City, Job } from '../types';

export function FindJobsPage() {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [salaryMin, setSalaryMin] = useState(searchParams.get('salaryMin') || '');
  const [education, setEducation] = useState(searchParams.get('education') || '');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [employmentType, setEmploymentType] = useState(searchParams.get('employmentType') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');

  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const pageSize = 20;

  useEffect(() => {
    Promise.all([
      apiFetch<{ categories: Category[] }>('/api/categories'),
      apiFetch<{ cities: City[] }>('/api/cities'),
    ])
      .then(([catRes, cityRes]) => {
        setCategories(catRes.categories);
        setCities(cityRes.cities);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (salaryMin) params.set('salaryMin', salaryMin);
    if (education) params.set('education', education);
    if (experience) params.set('experience', experience);
    if (gender) params.set('gender', gender);
    if (employmentType) params.set('employmentType', employmentType);
    if (sort) params.set('sort', sort);
    setSearchParams(params, { replace: true });
    setPage(1);

    setLoading(true);
    setError('');
    apiFetch<{ jobs: Job[] }>(`/api/jobs?${params.toString()}`)
      .then((res) => setJobs(res.jobs))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load vacancies'))
      .finally(() => setLoading(false));
  }, [q, category, city, salaryMin, education, experience, gender, employmentType, sort, setSearchParams]);

  const resetFilters = () => {
    setQ('');
    setCategory('');
    setCity('');
    setSalaryMin('');
    setEducation('');
    setExperience('');
    setGender('');
    setEmploymentType('');
    setSort('latest');
    setPage(1);
  };

  const quickProfessions = [
    { labelEn: 'All Jobs', labelUr: 'تمام ملازمتیں', q: '', cat: '' },
    { labelEn: 'Teachers & Education', labelUr: 'اساتذہ اور تعلیم', q: '', cat: 'education' },
    { labelEn: 'Doctors & Healthcare', labelUr: 'ڈاکٹرز اور صحت', q: '', cat: 'medical-healthcare' },
    { labelEn: 'IT & Engineering', labelUr: 'آئی ٹی اور انجینئرنگ', q: '', cat: 'it-technology' },
    { labelEn: 'Govt, Police & Rescue', labelUr: 'سرکاری و پولیس', q: '', cat: 'govt-public' },
    { labelEn: 'Banking & Accounts', labelUr: 'بینکنگ اور اکاؤنٹس', q: '', cat: 'business-finance' },
    { labelEn: 'Drivers & Delivery', labelUr: 'ڈرائیورز و ڈیلیوری', q: '', cat: 'transport-logistics' },
    { labelEn: 'Skilled Trades', labelUr: 'ہنرمند کاریگر', q: '', cat: 'skilled-professions' },
    { labelEn: 'Remote & Freelance', labelUr: 'ریموٹ اور فری لانس', q: '', cat: 'freelancing-remote' },
  ];

  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
  const paginatedJobs = jobs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Layout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#0D1F18]">{t.jobs.title}</h1>
          <p className="mt-2 text-base text-[#4A5D52]">{t.jobs.subtitle}</p>
        </div>

        {/* Popular Profession Quick Tabs */}
        <div className="mb-5 flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F1F5F2] rounded-xl">
          {quickProfessions.map((item) => {
            const active = q === item.q && category === item.cat;
            return (
              <button
                key={item.labelEn}
                type="button"
                onClick={() => {
                  setQ(item.q);
                  setCategory(item.cat);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active ? 'bg-white text-[#0D1F18] shadow-xs' : 'text-[#4A5D52] hover:text-[#0D1F18]'
                }`}
              >
                {lang === 'ur' ? item.labelUr : item.labelEn}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Toolbar */}
        <div className="bg-white border border-[#DCE3DD] rounded-xl p-3 mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5">
            <Search className="w-4 h-4 text-[#4A5D52] shrink-0" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.home.searchPlaceholder}
              className="w-full text-sm text-[#0D1F18] placeholder:text-[#7A8C82] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#DCE3DD] text-sm font-medium text-[#0D1F18] cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t.jobs.filters}</span>
            </button>

            <label className="flex items-center gap-2 text-sm text-[#4A5D52] px-2">
              <span className="hidden sm:inline whitespace-nowrap">{t.jobs.sortBy}:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm text-[#0D1F18] bg-white focus:outline-none focus:border-[#046A38]"
              >
                <option value="latest">{t.jobs.sortLatest}</option>
                <option value="recommended">{t.jobs.sortRecommended}</option>
                <option value="deadline">{t.jobs.sortDeadline}</option>
                <option value="salary_desc">{t.jobs.sortSalary}</option>
              </select>
            </label>
          </div>
        </div>

        {/* Transparency Reminder */}
        <div className="mb-6 bg-[#F2F6F3] border border-[#DCE3DD] rounded-xl px-4 py-3 flex items-center gap-3 text-xs sm:text-sm text-[#4A5D52]">
          <Info className="w-4 h-4 text-[#046A38] shrink-0" />
          <span>{t.home.transparencyBody}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Advanced Filter Sidebar */}
          <aside
            className={`lg:col-span-3 bg-white border border-[#DCE3DD] rounded-xl p-5 space-y-5 ${
              mobileFiltersOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF1EE]">
              <h2 className="font-semibold text-sm text-[#0D1F18]">{t.jobs.filters}</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#046A38] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.jobs.clearFilters}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1F352A]">{t.jobs.category}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1F18]"
              >
                <option value="">{t.jobs.allCategories}</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {lang === 'ur' ? cat.name_ur : cat.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1F352A]">{t.jobs.city}</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1F18]"
              >
                <option value="">{t.jobs.allCities}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.name_en}>
                    {lang === 'ur' ? c.name_ur : c.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1F352A]">{t.jobs.employmentType}</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1F18]"
              >
                <option value="">{lang === 'en' ? 'Any Type' : 'تمام اقسام'}</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1F352A]">{t.jobs.education}</label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1F18]"
              >
                <option value="">{lang === 'en' ? 'Any Qualification' : 'کوئی بھی تعلیم'}</option>
                <option value="Matric">Matric</option>
                <option value="Intermediate">Intermediate (FA / FSc / ICS)</option>
                <option value="DAE">DAE / TEVTA / Diploma</option>
                <option value="Bachelor">Bachelor's / BS / BSc / B.Com</option>
                <option value="Master">Master's / MS / MPhil / MBA</option>
                <option value="PhD">PhD</option>
                <option value="Professional">Professional (MBBS / BDS / Pharm-D / LLB / CA / ACCA)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1F352A]">{t.jobs.experience}</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1F18]"
              >
                <option value="">{lang === 'en' ? 'Any Experience' : 'کوئی بھی تجربہ'}</option>
                <option value="fresh">Fresh / 0-2 years</option>
                <option value="1-">1-3 years</option>
                <option value="2-">2-5 years</option>
                <option value="3-">3-5 years</option>
                <option value="5+">Senior (5+ years)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1F352A]">{t.jobs.salaryMin}</label>
              <input
                type="number"
                min={0}
                step={10000}
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm text-[#0D1F18] tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1F352A]">{t.jobs.gender}</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1F18]"
              >
                <option value="">{lang === 'en' ? 'All / Not Restricted' : 'سب / غیر مخصوص'}</option>
                <option value="Any">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </aside>

          {/* Job Results */}
          <div className="lg:col-span-9 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#4A5D52]">
              <span className="font-mono-tabular font-medium">
                {jobs.length} {t.jobs.resultsCount}
              </span>
              {jobs.length > pageSize && (
                <span className="font-mono-tabular text-xs">
                  {lang === 'en'
                    ? `Page ${page} of ${totalPages}`
                    : `صفحہ ${page} از ${totalPages}`}
                </span>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">{error}</div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-44 bg-white border border-[#DCE3DD] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white border border-[#DCE3DD] rounded-xl p-10 text-center space-y-3">
                <h3 className="text-lg font-semibold text-[#0D1F18]">{t.jobs.noResultsTitle}</h3>
                <p className="text-sm text-[#4A5D52] max-w-md mx-auto">{t.jobs.noResultsDesc}</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-lg bg-[#046A38] text-white text-sm font-semibold cursor-pointer"
                >
                  {t.jobs.clearFilters}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {paginatedJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pt-4 flex items-center justify-between border-t border-[#E2E7E3]">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-lg border border-[#DCE3DD] bg-white text-sm font-medium text-[#0D1F18] disabled:opacity-40 cursor-pointer"
                    >
                      {lang === 'en' ? 'Previous' : 'پچھلا صفحہ'}
                    </button>
                    <span className="text-xs font-mono-tabular text-[#4A5D52]">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => {
                        setPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-lg border border-[#DCE3DD] bg-white text-sm font-medium text-[#0D1F18] disabled:opacity-40 cursor-pointer"
                    >
                      {lang === 'en' ? 'Next' : 'اگلا صفحہ'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
