import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Layout } from '../components/Layout';
import { CategoryIcon } from '../components/CategoryIcon';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../lib/api';
import type { Category } from '../types';

export function CategoriesPage() {
  const { lang, isRtl, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ categories: Category[] }>('/api/categories')
      .then((res) => setCategories(res.categories))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <Layout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mb-10">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#0D1F18]">{t.categories.title}</h1>
          <p className="mt-2.5 text-base text-[#4A5D52] leading-relaxed">{t.categories.subtitle}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 bg-white border border-[#DCE3DD] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => {
              const name = lang === 'ur' ? cat.name_ur : cat.name_en;
              const desc = lang === 'ur' ? cat.description_ur : cat.description_en;
              const subs = lang === 'ur' ? cat.subcategories_ur : cat.subcategories_en;

              return (
                <article
                  key={cat.id}
                  className="bg-white border border-[#DCE3DD] rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#F1F5F2] text-[#046A38] flex items-center justify-center shrink-0">
                          <CategoryIcon name={cat.icon_name} className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-display font-bold text-[#0D1F18]">{name}</h2>
                          <div className="text-xs font-mono-tabular text-[#046A38] font-medium">
                            {cat.vacancy_count} {t.categories.vacanciesLabel}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-[#4A5D52] leading-relaxed">{desc}</p>

                    <div className="pt-2 border-t border-[#EDF1EE]">
                      <div className="text-xs font-semibold text-[#1F352A] mb-2">
                        {t.categories.subcategoriesLabel}
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-[#4A5D52]">
                        {subs.map((sub, idx) => (
                          <li key={idx}>
                            <Link
                              to={`/jobs?category=${encodeURIComponent(cat.slug)}&q=${encodeURIComponent(
                                cat.subcategories_en[idx]?.split(',')[0] || sub
                              )}`}
                              className="hover:text-[#046A38] hover:underline transition-colors"
                            >
                              · {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EDF1EE]">
                    <Link
                      to={`/jobs?category=${encodeURIComponent(cat.slug)}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#046A38] hover:text-[#03542D]"
                    >
                      <span>{t.categories.exploreBtn}</span>
                      <ArrowIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
}
