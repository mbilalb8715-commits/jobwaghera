import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ExternalLink, MapPin, Search } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch, buildGoogleMapsUrl } from '../lib/api';
import type { City, Company } from '../types';

export function CompaniesPage() {
  const { lang, t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ cities: City[] }>('/api/cities')
      .then((r) => setCities(r.cities))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (city) params.set('city', city);
    setLoading(true);
    apiFetch<{ companies: Company[] }>(`/api/companies?${params.toString()}`)
      .then((res) => setCompanies(res.companies))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, city]);

  return (
    <Layout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#0D1F18]">{t.companies.title}</h1>
          <p className="mt-2 text-base text-[#4A5D52]">{t.companies.subtitle}</p>
        </div>

        <div className="bg-white border border-[#DCE3DD] rounded-xl p-3 mb-8 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5">
            <Search className="w-4 h-4 text-[#4A5D52] shrink-0" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.companies.searchPlaceholder}
              className="w-full text-sm text-[#0D1F18] focus:outline-none"
            />
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border border-[#DCE3DD] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1F18]"
          >
            <option value="">{t.jobs.allCities}</option>
            {cities.map((c) => (
              <option key={c.id} value={c.name_en}>
                {lang === 'ur' ? c.name_ur : c.name_en}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 bg-white border border-[#DCE3DD] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.map((comp) => (
              <article
                key={comp.id}
                className="bg-white border border-[#DCE3DD] rounded-2xl p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#4A5D52]">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#046A38]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {comp.is_demonstration ? t.companies.demoLabel : t.companies.verifiedLabel}
                    </span>
                    <span className="font-mono-tabular">
                      {comp.vacancy_count || 0} {t.companies.openRoles}
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#0D1F18] text-white font-display font-bold flex items-center justify-center shrink-0">
                      {comp.logo_initials}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/companies/${comp.id}`}
                        className="font-display font-bold text-lg text-[#0D1F18] hover:text-[#046A38] transition-colors block"
                      >
                        {lang === 'ur' ? comp.name_ur : comp.name}
                      </Link>
                      <div className="text-xs text-[#4A5D52] mt-0.5">
                        {lang === 'ur' ? comp.industry_ur : comp.industry} · {comp.city}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[#4A5D52] leading-relaxed line-clamp-3">
                    {lang === 'ur' ? comp.description_ur : comp.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EDF1EE] flex items-center justify-between gap-3">
                  <a
                    href={buildGoogleMapsUrl(comp.address, comp.city)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4A5D52] hover:text-[#046A38]"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t.jobs.openMap}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <Link
                    to={`/companies/${comp.id}`}
                    className="text-xs font-semibold text-[#046A38] hover:underline whitespace-nowrap"
                  >
                    {t.companies.viewProfile}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
