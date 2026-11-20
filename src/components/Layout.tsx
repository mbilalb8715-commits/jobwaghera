import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/home', label: t.nav.home },
    { to: '/jobs', label: t.nav.findJobs },
    { to: '/categories', label: t.nav.categories },
    { to: '/companies', label: t.nav.companies },
    { to: '/post-job', label: t.nav.postJob },
  ];

  const dashboardHref =
    user?.role === 'admin'
      ? '/dashboard/admin'
      : user?.role === 'employer'
        ? '/dashboard/employer'
        : '/dashboard/seeker';

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/home' && location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9] text-[#0D1F18]">
      {/* Top Bar Contract: Brand — Nav Links — Primary Action */}
      <header className="sticky top-0 z-40 bg-[#FAFBF9]/95 backdrop-blur-sm border-b border-[#E2E7E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <Link
            to="/home"
            className="text-xl font-display font-bold tracking-tight text-[#0D1F18] whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>JOB</span>
            <span className="urdu-brand text-[#046A38] text-lg font-semibold leading-none">وَغیرہ</span>
          </Link>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4A5D52]" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive(item.to)
                    ? 'border-[#046A38] text-[#0D1F18] font-semibold'
                    : 'border-transparent hover:text-[#0D1F18]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Zone 3: Language Switch & Primary Account Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center border border-[#DCE3DD] rounded-lg bg-white p-0.5">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  lang === 'en' ? 'bg-[#0D1F18] text-white' : 'text-[#4A5D52] hover:text-[#0D1F18]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('ur')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  lang === 'ur' ? 'bg-[#0D1F18] text-white' : 'text-[#4A5D52] hover:text-[#0D1F18]'
                }`}
              >
                اردو
              </button>
            </div>

            <Link
              to={user ? dashboardHref : '/auth'}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#046A38] rounded-lg hover:bg-[#03542D] transition-colors whitespace-nowrap shrink-0"
            >
              {user ? t.nav.dashboard : t.nav.signIn}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg border border-[#DCE3DD] text-[#0D1F18] bg-white cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#E2E7E3] bg-white px-4 py-4 space-y-3">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(item.to) ? 'bg-[#046A38]/10 text-[#046A38] font-semibold' : 'text-[#0D1F18]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/about"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#4A5D52]"
              >
                {t.nav.about}
              </Link>
              <Link
                to="/help"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#4A5D52]"
              >
                {t.nav.help}
              </Link>
            </nav>

            <div className="pt-3 border-t border-[#E2E7E3] flex items-center justify-between">
              <span className="text-xs font-medium text-[#4A5D52] flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>{lang === 'en' ? 'Language' : 'زبان'}</span>
              </span>
              <div className="flex items-center border border-[#DCE3DD] rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    lang === 'en' ? 'bg-[#0D1F18] text-white' : 'text-[#4A5D52]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ur')}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    lang === 'ur' ? 'bg-[#0D1F18] text-white' : 'text-[#4A5D52]'
                  }`}
                >
                  اردو
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-[#0D1F18] text-[#DCE3DD] border-t border-[#1D352B] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-4">
              <Link to="/" className="inline-flex items-center gap-2 text-xl font-display font-bold text-white">
                <span>JOB</span>
                <span className="urdu-brand text-[#54B884] text-lg font-semibold leading-none">وَغیرہ</span>
              </Link>
              <p className="text-sm text-[#A9BAB0] leading-relaxed">{t.footer.tagline}</p>
              <div className="inline-flex items-center border border-[#274639] rounded-lg p-0.5 bg-[#122920]">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    lang === 'en' ? 'bg-[#046A38] text-white' : 'text-[#A9BAB0] hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ur')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    lang === 'ur' ? 'bg-[#046A38] text-white' : 'text-[#A9BAB0] hover:text-white'
                  }`}
                >
                  اردو
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">{t.footer.explore}</h3>
              <ul className="space-y-2.5 text-sm text-[#A9BAB0]">
                <li>
                  <Link to="/home" className="hover:text-white transition-colors">
                    {t.nav.home}
                  </Link>
                </li>
                <li>
                  <Link to="/jobs" className="hover:text-white transition-colors">
                    {t.nav.findJobs}
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="hover:text-white transition-colors">
                    {t.nav.categories}
                  </Link>
                </li>
                <li>
                  <Link to="/companies" className="hover:text-white transition-colors">
                    {t.nav.companies}
                  </Link>
                </li>
                <li>
                  <Link to="/post-job" className="hover:text-white transition-colors">
                    {t.nav.postJob}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">{t.footer.resources}</h3>
              <ul className="space-y-2.5 text-sm text-[#A9BAB0]">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    {t.nav.about}
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:text-white transition-colors">
                    {t.nav.help}
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-white transition-colors">
                    {t.nav.faq}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    {t.nav.contact}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">
                    {t.nav.privacy}
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors">
                    {t.nav.terms}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">{t.footer.transparency}</h3>
              <p className="text-sm text-[#A9BAB0] leading-relaxed">{t.footer.transparencyNote}</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#1D352B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8BA194]">
            <span>{t.footer.copyright}</span>
            <Link to="/" className="hover:text-white transition-colors">
              {lang === 'en' ? 'Return to Welcome Experience' : 'ابتدائی صفحے پر واپس جائیں'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
