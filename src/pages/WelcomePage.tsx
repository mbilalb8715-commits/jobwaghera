import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function WelcomePage() {
  const { lang, isRtl, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#07150F] text-white">
      {/* Full-screen architectural Pakistani skyline backdrop with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        {!imgError ? (
          <img
            src="/src/assets/images/hero_welcome_career_1794730252016.jpg"
            alt="Modern Pakistani corporate business district skyline at golden hour"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#07150F] via-[#0D281D] to-[#044726]" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(125deg, rgba(7,21,15,0.92) 0%, rgba(10,30,21,0.82) 52%, rgba(7,21,15,0.72) 100%)',
          }}
        />
      </div>

      {/* Top Welcome Bar: Brand + Language Switcher */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-7 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2 text-2xl sm:text-3xl font-display font-bold tracking-tight whitespace-nowrap shrink-0">
          <span>JOB</span>
          <span className="urdu-brand text-[#54B884] text-2xl sm:text-[26px] font-semibold leading-none">
            وَغیرہ
          </span>
        </div>

        <div className="flex items-center gap-2 border border-white/20 bg-black/30 backdrop-blur-md rounded-lg p-1 shrink-0">
          <Globe className="w-4 h-4 text-[#8CD9B0] mx-1.5" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              lang === 'en' ? 'bg-[#046A38] text-white' : 'text-white/80 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang('ur')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              lang === 'ur' ? 'bg-[#046A38] text-white' : 'text-white/80 hover:text-white'
            }`}
          >
            اردو
          </button>
        </div>
      </motion.header>

      {/* Center Welcome Statement & Primary Entrance CTA */}
      <main className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-12">
          <div className="max-w-3xl space-y-8">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm font-medium text-[#8CD9B0] tracking-wide"
            >
              {lang === 'en'
                ? 'Pakistan’s Bilingual Career & Recruitment Platform'
                : 'پاکستان کا دو لسانی قومی روزگار اور کیریئر پلیٹ فارم'}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl lg:text-[64px] font-display font-bold tracking-tight text-white leading-[1.1]"
              style={{ textWrap: 'balance' }}
            >
              {t.welcome.headline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg sm:text-xl text-[#D8E5DD] leading-relaxed max-w-2xl"
            >
              {t.welcome.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2 flex flex-wrap items-center gap-5"
            >
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="group inline-flex items-center gap-4 px-8 py-4.5 rounded-xl bg-[#046A38] hover:bg-[#058245] text-white font-display font-semibold text-base sm:text-lg shadow-lg shadow-black/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>{t.welcome.cta}</span>
                {isRtl ? (
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                )}
              </button>

              <Link
                to="/jobs"
                className="px-5 py-3.5 text-sm font-medium text-white/90 hover:text-white border border-white/25 hover:border-white/50 rounded-xl backdrop-blur-sm transition-colors whitespace-nowrap shrink-0"
              >
                {t.welcome.skipJobs}
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Quiet Bottom Coverage & Quick Entry Strip */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm text-[#B8CBBF]"
      >
        <span>{t.welcome.coverage}</span>
        <div className="flex items-center gap-6 shrink-0">
          <Link to="/post-job" className="hover:text-white transition-colors whitespace-nowrap">
            {t.nav.postJob}
          </Link>
          <Link to="/auth" className="hover:text-white transition-colors whitespace-nowrap">
            {t.nav.signIn}
          </Link>
          <Link to="/about" className="hover:text-white transition-colors whitespace-nowrap">
            {t.nav.about}
          </Link>
        </div>
      </motion.footer>
    </div>
  );
}
