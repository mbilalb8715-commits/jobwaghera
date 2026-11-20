/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { WelcomePage } from './pages/WelcomePage';
import { HomePage } from './pages/HomePage';
import { FindJobsPage } from './pages/FindJobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { CompanyProfilePage } from './pages/CompanyProfilePage';
import { PostJobPage } from './pages/PostJobPage';
import { AboutPage } from './pages/AboutPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';
import { SeekerDashboardPage } from './pages/SeekerDashboardPage';
import { EmployerDashboardPage } from './pages/EmployerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { FaqPage } from './pages/FaqPage';
import { PrivacyPolicyPage, TermsPage } from './pages/LegalPages';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/jobs" element={<FindJobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:id" element={<CompanyProfilePage />} />
            <Route path="/post-job" element={<PostJobPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard/seeker" element={<SeekerDashboardPage />} />
            <Route path="/dashboard/employer" element={<EmployerDashboardPage />} />
            <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
