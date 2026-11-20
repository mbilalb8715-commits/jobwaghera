import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Category, City } from '../types';

export function PostJobPage() {
  const { lang, t } = useLanguage();
  const { user, company } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [title, setTitle] = useState('');
  const [titleUr, setTitleUr] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [categorySlug, setCategorySlug] = useState('it-technology');
  const [subcategory, setSubcategory] = useState('');
  const [city, setCity] = useState('Lahore');
  const [address, setAddress] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryDisplay, setSalaryDisplay] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [genderEligibility, setGenderEligibility] = useState('Not Specified');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [skills, setSkills] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedResult, setSubmittedResult] = useState<{ verification_status: string; message: string } | null>(
    null
  );

  useEffect(() => {
    Promise.all([
      apiFetch<{ categories: Category[] }>('/api/categories'),
      apiFetch<{ cities: City[] }>('/api/cities'),
    ])
      .then(([catRes, cityRes]) => {
        setCategories(catRes.categories);
        setCities(cityRes.cities);
        if (catRes.categories[0]) {
          setCategorySlug(catRes.categories[0].slug);
          setSubcategory(catRes.categories[0].subcategories_en[0] || 'General');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (company) {
      setCompanyName((prev) => prev || company.name);
      setAddress((prev) => prev || company.address);
      setCity((prev) => prev || company.city);
    }
  }, [company]);

  const currentCategory = categories.find((c) => c.slug === categorySlug);

  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    const matched = categories.find((c) => c.slug === slug);
    setSubcategory(matched?.subcategories_en[0] || 'General');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await apiFetch<{ verification_status: string; message: string }>('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title,
          title_ur: titleUr || title,
          companyName,
          category_slug: categorySlug,
          subcategory,
          city,
          address,
          salary_min: Number(salaryMin) || 0,
          salary_max: Number(salaryMax) || 0,
          salary_display: salaryDisplay,
          education,
          experience,
          employment_type: employmentType,
          gender_eligibility: genderEligibility,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          application_url: applicationUrl,
          deadline,
          skills: skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          requirements: requirements
            .split('\n')
            .map((r) => r.trim())
            .filter(Boolean),
          responsibilities: responsibilities
            .split('\n')
            .map((r) => r.trim())
            .filter(Boolean),
        }),
      });
      setSubmittedResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit vacancy');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#0D1F18]">{t.postJob.title}</h1>
          <p className="mt-2 text-base text-[#4A5D52]">{t.postJob.subtitle}</p>
        </div>

        {!user || (user.role !== 'employer' && user.role !== 'admin') ? (
          <div className="bg-white border border-[#DCE3DD] rounded-2xl p-8 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-[#B45309] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h2 className="text-lg font-display font-bold text-[#0D1F18]">{t.postJob.authRequiredTitle}</h2>
                <p className="text-sm text-[#4A5D52]">{t.postJob.authRequiredDesc}</p>
              </div>
            </div>
            <div>
              <Link
                to="/auth?mode=register&role=employer"
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#046A38] hover:bg-[#03542D] text-white text-sm font-semibold transition-colors"
              >
                {t.postJob.goToAuth}
              </Link>
            </div>
          </div>
        ) : submittedResult ? (
          <div className="bg-white border border-[#DCE3DD] rounded-2xl p-8 space-y-5">
            <div className="flex items-start gap-3 text-[#046A38]">
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h2 className="text-xl font-display font-bold text-[#0D1F18]">{t.postJob.successTitle}</h2>
                <p className="text-sm text-[#4A5D52] leading-relaxed">{submittedResult.message || t.postJob.successDesc}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/employer'}
                className="px-5 py-2.5 rounded-xl bg-[#046A38] text-white text-sm font-semibold"
              >
                {t.nav.dashboard}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmittedResult(null);
                  setTitle('');
                  setTitleUr('');
                  setRequirements('');
                  setResponsibilities('');
                }}
                className="px-5 py-2.5 rounded-xl border border-[#DCE3DD] text-sm font-medium text-[#0D1F18] cursor-pointer"
              >
                {lang === 'en' ? 'Submit Another Vacancy' : 'مزید آسامی پوسٹ کریں'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-[#DCE3DD] rounded-2xl p-6 sm:p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.jobTitle} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.jobTitleUr}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={titleUr}
                  onChange={(e) => setTitleUr(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.companyName} *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.city} *
                </label>
                <select
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm bg-white"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.name_en}>
                      {lang === 'ur' ? c.name_ur : c.name_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.category} *
                </label>
                <select
                  required
                  value={categorySlug}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {lang === 'ur' ? c.name_ur : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.subcategory} *
                </label>
                <select
                  required
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm bg-white"
                >
                  {(currentCategory?.subcategories_en || ['General']).map((sub, i) => (
                    <option key={i} value={sub}>
                      {lang === 'ur' ? currentCategory?.subcategories_ur[i] || sub : sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                {t.postJob.fields.address} *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Building, Road, Sector / Area, City, Pakistan"
                className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.salaryMin}
                </label>
                <input
                  type="number"
                  min={0}
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.salaryMax}
                </label>
                <input
                  type="number"
                  min={0}
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.deadline} *
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                {t.postJob.fields.salaryDisplay}
              </label>
              <input
                type="text"
                value={salaryDisplay}
                onChange={(e) => setSalaryDisplay(e.target.value)}
                placeholder="e.g. PKR 90,000 - 120,000 / month"
                className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.education} *
                </label>
                <input
                  type="text"
                  required
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. Bachelor's (BS)"
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.experience} *
                </label>
                <input
                  type="text"
                  required
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 2-4 years"
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.employmentType}
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm bg-white"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.gender}
                </label>
                <select
                  value={genderEligibility}
                  onChange={(e) => setGenderEligibility(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm bg-white"
                >
                  <option value="Not Specified">Not Specified</option>
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.contactPhone} *
                </label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+92 XXX XXXXXXX"
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.contactEmail}
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.applicationUrl}
                </label>
                <input
                  type="url"
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                {t.postJob.fields.skills}
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="TypeScript, Communication, AutoCAD..."
                className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.requirements}
                </label>
                <textarea
                  rows={4}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                  {t.postJob.fields.responsibilities}
                </label>
                <textarea
                  rows={4}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-[#046A38] hover:bg-[#03542D] text-white text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (lang === 'en' ? 'Submitting...' : 'جمع ہو رہا ہے...') : t.postJob.submitBtn}
              </button>
            </div>
          </form>
        )}
      </section>
    </Layout>
  );
}
