import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, KeyRound, UserCheck } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

type AuthMode = 'login' | 'register' | 'forgot';

export function AuthPage() {
  const { lang, t } = useLanguage();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode = (searchParams.get('mode') as AuthMode) || 'login';
  const initialRole = searchParams.get('role') === 'employer' ? 'employer' : 'seeker';

  const [mode, setMode] = useState<AuthMode>(
    ['login', 'register', 'forgot'].includes(initialMode) ? initialMode : 'login'
  );
  const [role, setRole] = useState<'seeker' | 'employer'>(initialRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Islamabad');

  // Employer specific fields
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('IT & Technology');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  // Password recovery state
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const redirectByRole = (userRole: string) => {
    if (userRole === 'admin') navigate('/dashboard/admin');
    else if (userRole === 'employer') navigate('/dashboard/employer');
    else navigate('/dashboard/seeker');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await apiFetch<{ token: string; user: { role: string } }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await loginWithToken(res.token);
      redirectByRole(res.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await apiFetch<{ token: string; user: { role: string } }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          role,
          fullName,
          phone,
          city,
          companyName,
          companyIndustry,
          companyAddress,
          companyDescription,
        }),
      });
      await loginWithToken(res.token);
      redirectByRole(res.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setSubmitting(true);
    try {
      const res = await apiFetch<{ message: string; demoResetCode: string | null }>(
        '/api/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );
      setInfoMsg(res.message);
      if (res.demoResetCode) {
        setIssuedCode(res.demoResetCode);
        setRecoveryCode(res.demoResetCode);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to issue recovery code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setSubmitting(true);
    try {
      const res = await apiFetch<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token: recoveryCode, newPassword }),
      });
      setInfoMsg(res.message);
      setIssuedCode(null);
      setMode('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const quickDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setError('');
    setSubmitting(true);
    try {
      const res = await apiFetch<{ token: string; user: { role: string } }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      });
      await loginWithToken(res.token);
      redirectByRole(res.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#0D1F18]">{t.auth.title}</h1>
          <p className="mt-2 text-base text-[#4A5D52]">{t.auth.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Primary Auth Panel */}
          <div className="lg:col-span-7 bg-white border border-[#DCE3DD] rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Mode Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#F1F5F2] rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  mode === 'login' ? 'bg-white text-[#0D1F18] shadow-xs' : 'text-[#4A5D52] hover:text-[#0D1F18]'
                }`}
              >
                {t.auth.loginTab}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  mode === 'register' ? 'bg-white text-[#0D1F18] shadow-xs' : 'text-[#4A5D52] hover:text-[#0D1F18]'
                }`}
              >
                {t.auth.registerTab}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  mode === 'forgot' ? 'bg-white text-[#0D1F18] shadow-xs' : 'text-[#4A5D52] hover:text-[#0D1F18]'
                }`}
              >
                {t.auth.forgotTab}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3.5 text-sm">{error}</div>
            )}
            {infoMsg && (
              <div className="bg-[#046A38]/10 border border-[#046A38]/25 text-[#0D1F18] rounded-xl p-3.5 text-sm">
                {infoMsg}
                {issuedCode && (
                  <div className="mt-2 font-mono-tabular font-semibold text-[#046A38]">
                    {t.auth.recoveryCode}: {issuedCode}
                  </div>
                )}
              </div>
            )}

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">{t.auth.email}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">{t.auth.password}</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#046A38] hover:bg-[#03542D] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t.auth.signInBtn}
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-5">
                {/* Separate Role Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('seeker')}
                    className={`p-3.5 rounded-xl border text-start transition-colors cursor-pointer flex items-center gap-2.5 ${
                      role === 'seeker'
                        ? 'border-[#046A38] bg-[#046A38]/8 text-[#0D1F18]'
                        : 'border-[#DCE3DD] text-[#4A5D52]'
                    }`}
                  >
                    <UserCheck className="w-5 h-5 text-[#046A38] shrink-0" />
                    <span className="text-sm font-semibold">{t.auth.roleSeeker}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`p-3.5 rounded-xl border text-start transition-colors cursor-pointer flex items-center gap-2.5 ${
                      role === 'employer'
                        ? 'border-[#046A38] bg-[#046A38]/8 text-[#0D1F18]'
                        : 'border-[#DCE3DD] text-[#4A5D52]'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-[#046A38] shrink-0" />
                    <span className="text-sm font-semibold">{t.auth.roleEmployer}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F352A] mb-1">{t.auth.fullName} *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1F352A] mb-1">{t.auth.phone}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 3XX XXXXXXX"
                      className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F352A] mb-1">{t.auth.email} *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1F352A] mb-1">{t.auth.city}</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F352A] mb-1">{t.auth.password} *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2 text-sm"
                  />
                </div>

                {role === 'employer' && (
                  <div className="pt-4 border-t border-[#EDF1EE] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                          {t.auth.companyName} *
                        </label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                          {t.auth.companyIndustry}
                        </label>
                        <input
                          type="text"
                          value={companyIndustry}
                          onChange={(e) => setCompanyIndustry(e.target.value)}
                          className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                        {t.auth.companyAddress} *
                      </label>
                      <input
                        type="text"
                        required
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1F352A] mb-1">
                        {t.auth.companyDescription}
                      </label>
                      <textarea
                        rows={2}
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#046A38] hover:bg-[#03542D] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t.auth.registerBtn}
                </button>
              </form>
            )}

            {mode === 'forgot' && (
              <div className="space-y-6">
                <form onSubmit={handleIssueRecovery} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">{t.auth.email}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-[#0D1F18] text-white text-sm font-semibold cursor-pointer"
                  >
                    {t.auth.sendCodeBtn}
                  </button>
                </form>

                <form onSubmit={handleResetPassword} className="pt-5 border-t border-[#EDF1EE] space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                      {t.auth.recoveryCode}
                    </label>
                    <input
                      type="text"
                      required
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1F352A] mb-1.5">
                      {t.auth.newPassword}
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-[#DCE3DD] rounded-lg px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-[#046A38] text-white text-sm font-semibold cursor-pointer"
                  >
                    {t.auth.resetBtn}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Demo Access Sidebar */}
          <aside className="lg:col-span-5 bg-[#F2F6F3] border border-[#DCE3DD] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#046A38]">
              <KeyRound className="w-5 h-5" />
              <h2 className="font-display font-bold text-base text-[#0D1F18]">{t.auth.demoBoxTitle}</h2>
            </div>
            <p className="text-sm text-[#4A5D52] leading-relaxed">{t.auth.demoBoxDesc}</p>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                disabled={submitting}
                onClick={() => quickDemoLogin('seeker-demo@jobwaghaira.pk', 'Seeker@2026')}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DCE3DD] hover:border-[#046A38] text-sm font-semibold text-[#0D1F18] text-start transition-colors cursor-pointer"
              >
                {t.auth.demoSeeker}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => quickDemoLogin('hr-demo@jobwaghaira.pk', 'Employer@2026')}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DCE3DD] hover:border-[#046A38] text-sm font-semibold text-[#0D1F18] text-start transition-colors cursor-pointer"
              >
                {t.auth.demoEmployer}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => quickDemoLogin('admin@jobwaghaira.pk', 'Admin@2026')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0D1F18] hover:bg-[#193529] text-white text-sm font-semibold text-start transition-colors cursor-pointer"
              >
                {t.auth.demoAdmin}
              </button>
            </div>
            <p className="text-xs text-[#5E7266] leading-relaxed">
              {lang === 'en'
                ? 'Demo accounts are clearly labelled for platform evaluation; register your own real account anytime.'
                : 'ڈیمو اکاؤنٹس پلیٹ فارم کا جائزہ لینے کے لیے ہیں؛ آپ کسی بھی وقت اپنا حقیقی اکاؤنٹ بنا سکتے ہیں۔'}
            </p>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
