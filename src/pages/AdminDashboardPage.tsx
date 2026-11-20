import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, LogOut, Plus, ShieldCheck, Trash2, XCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Category, City, Job } from '../types';

export function AdminDashboardPage() {
  const { lang, t } = useLanguage();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // New Category form
  const [catNameEn, setCatNameEn] = useState('');
  const [catNameUr, setCatNameUr] = useState('');
  const [catDescEn, setCatDescEn] = useState('');
  const [catDescUr, setCatDescUr] = useState('');
  const [catSubsEn, setCatSubsEn] = useState('');
  const [catSubsUr, setCatSubsUr] = useState('');

  // New Subcategory form
  const [targetSlug, setTargetSlug] = useState('');
  const [subEn, setSubEn] = useState('');
  const [subUr, setSubUr] = useState('');

  // New City form
  const [cityEn, setCityEn] = useState('');
  const [cityUr, setCityUr] = useState('');
  const [provEn, setProvEn] = useState('Punjab');
  const [provUr, setProvUr] = useState('پنجاب');

  const [notice, setNotice] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/auth');
    }
  }, [loading, user, navigate]);

  const loadAll = () => {
    apiFetch<{ jobs: Job[] }>('/api/admin/pending-jobs')
      .then((r) => setJobs(r.jobs))
      .catch(() => {});
    apiFetch<{ categories: Category[] }>('/api/categories')
      .then((r) => {
        setCategories(r.categories);
        if (!targetSlug && r.categories[0]) setTargetSlug(r.categories[0].slug);
      })
      .catch(() => {});
    apiFetch<{ cities: City[] }>('/api/cities')
      .then((r) => setCities(r.cities))
      .catch(() => {});
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAll();
    }
  }, [user]);

  const verifyJob = async (jobId: string, verification_status: 'verified' | 'rejected') => {
    await apiFetch(`/api/admin/jobs/${jobId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verification_status }),
    });
    setNotice(`Job ${jobId} updated to ${verification_status}.`);
    loadAll();
  };

  const deleteJob = async (jobId: string) => {
    setDeletingId(jobId);
    try {
      await apiFetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' });
      setConfirmDeleteId(null);
      setNotice(lang === 'en' ? `Job ${jobId} permanently deleted.` : `آسامی ${jobId} مستقل طور پر حذف کر دی گئی ہے۔`);
      loadAll();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to delete job');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify({
        name_en: catNameEn,
        name_ur: catNameUr,
        description_en: catDescEn,
        description_ur: catDescUr,
        subcategories_en: catSubsEn.split(',').map((s) => s.trim()).filter(Boolean),
        subcategories_ur: catSubsUr.split(',').map((s) => s.trim()).filter(Boolean),
      }),
    });
    setCatNameEn('');
    setCatNameUr('');
    setCatDescEn('');
    setCatDescUr('');
    setCatSubsEn('');
    setCatSubsUr('');
    setNotice('New category added to live taxonomy.');
    loadAll();
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSlug) return;
    await apiFetch(`/api/categories/${targetSlug}/subcategories`, {
      method: 'POST',
      body: JSON.stringify({ sub_en: subEn, sub_ur: subUr }),
    });
    setSubEn('');
    setSubUr('');
    setNotice('Subcategory added.');
    loadAll();
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/cities', {
      method: 'POST',
      body: JSON.stringify({
        name_en: cityEn,
        name_ur: cityUr,
        province_en: provEn,
        province_ur: provUr,
      }),
    });
    setCityEn('');
    setCityUr('');
    setNotice('New Pakistani city added.');
    loadAll();
  };

  if (loading || !user || user.role !== 'admin') {
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="bg-white border border-[#DCE3DD] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0D1F18] text-white flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-[#0D1F18]">
                {lang === 'en' ? 'Administrator Verification & Taxonomy Console' : 'ایڈمنسٹریٹر تصدیق اور شعبہ جات کنسول'}
              </h1>
              <p className="text-sm text-[#4A5D52]">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/post-job"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#046A38] text-white text-xs font-semibold"
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#DCE3DD] text-xs font-semibold text-[#4A5D52] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Sign Out' : 'لاگ آؤٹ'}</span>
            </button>
          </div>
        </div>

        {notice && (
          <div className="bg-[#046A38]/10 border border-[#046A38]/25 text-[#0D1F18] rounded-xl px-4 py-3 text-sm font-medium">
            {notice}
          </div>
        )}

        {/* Vacancy Moderation Table */}
        <div className="bg-white border border-[#DCE3DD] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DCE3DD] flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-[#0D1F18]">
              {lang === 'en' ? 'Vacancy Moderation Queue' : 'آسامیوں کی تصدیق کا جائزہ'}
            </h2>
            <span className="text-xs font-mono-tabular text-[#4A5D52]">{jobs.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F8F6] border-b border-[#DCE3DD] text-xs text-[#4A5D52]">
                <tr>
                  <th className="py-3 px-4 text-start font-semibold">Title</th>
                  <th className="py-3 px-4 text-start font-semibold">Organization</th>
                  <th className="py-3 px-4 text-start font-semibold">City</th>
                  <th className="py-3 px-4 text-start font-semibold">Status</th>
                  <th className="py-3 px-4 text-end font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1EE]">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="py-3 px-4 font-semibold text-[#0D1F18]">
                      <Link to={`/jobs/${job.id}`} className="hover:text-[#046A38]">
                        {job.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-[#4A5D52]">{job.company_name}</td>
                    <td className="py-3 px-4 text-[#4A5D52]">{job.city}</td>
                    <td className="py-3 px-4 font-mono-tabular text-xs">{job.verification_status}</td>
                    <td className="py-3 px-4 text-end whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => verifyJob(job.id, 'verified')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#046A38] text-white text-xs font-semibold cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => verifyJob(job.id, 'rejected')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-red-300 text-red-700 text-xs font-semibold cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        {confirmDeleteId === job.id ? (
                          <span className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={deletingId === job.id}
                              onClick={() => deleteJob(job.id)}
                              className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                            >
                              {deletingId === job.id ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-md border border-[#DCE3DD] text-xs text-[#4A5D52] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(job.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unlimited Categories, Subcategories & Pakistani Cities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleAddCategory} className="bg-white border border-[#DCE3DD] rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-bold text-base text-[#0D1F18]">
              Add New Job Category ({categories.length})
            </h2>
            <input
              type="text"
              required
              placeholder="Category Name (English)"
              value={catNameEn}
              onChange={(e) => setCatNameEn(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              dir="rtl"
              placeholder="شعبے کا نام (اردو)"
              value={catNameUr}
              onChange={(e) => setCatNameUr(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              placeholder="Short Description (English)"
              value={catDescEn}
              onChange={(e) => setCatDescEn(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              dir="rtl"
              placeholder="مختصر تفصیل (اردو)"
              value={catDescUr}
              onChange={(e) => setCatDescUr(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Subcategories EN (comma-separated)"
              value={catSubsEn}
              onChange={(e) => setCatSubsEn(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              dir="rtl"
              placeholder="ذیلی شعبے اردو (کوما سے الگ)"
              value={catSubsUr}
              onChange={(e) => setCatSubsUr(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#046A38] text-white text-sm font-semibold cursor-pointer"
            >
              Add Category
            </button>
          </form>

          <form onSubmit={handleAddSubcategory} className="bg-white border border-[#DCE3DD] rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-bold text-base text-[#0D1F18]">Add Subcategory to Existing Sector</h2>
            <select
              value={targetSlug}
              onChange={(e) => setTargetSlug(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm bg-white"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name_en}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="Subcategory Name (English)"
              value={subEn}
              onChange={(e) => setSubEn(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              dir="rtl"
              placeholder="ذیلی شعبے کا نام (اردو)"
              value={subUr}
              onChange={(e) => setSubUr(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#0D1F18] text-white text-sm font-semibold cursor-pointer"
            >
              Add Subcategory
            </button>
          </form>

          <form onSubmit={handleAddCity} className="bg-white border border-[#DCE3DD] rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-bold text-base text-[#0D1F18]">
              Add Pakistani City / Location ({cities.length})
            </h2>
            <input
              type="text"
              required
              placeholder="City Name (English, e.g. Mirpur)"
              value={cityEn}
              onChange={(e) => setCityEn(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              dir="rtl"
              placeholder="شہر کا نام (اردو)"
              value={cityUr}
              onChange={(e) => setCityUr(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              placeholder="Province (English)"
              value={provEn}
              onChange={(e) => setProvEn(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              dir="rtl"
              placeholder="صوبہ (اردو)"
              value={provUr}
              onChange={(e) => setProvUr(e.target.value)}
              className="w-full border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#046A38] text-white text-sm font-semibold cursor-pointer"
            >
              Add City
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
