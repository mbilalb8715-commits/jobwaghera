export type UserRole = 'seeker' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone: string;
  city: string;
  created_at: string;
}

export interface SeekerProfile {
  user_id: string;
  headline: string;
  education: string;
  experience_years: string;
  experience_summary: string;
  skills: string[];
  cv_filename: string;
  cv_data_url: string;
  updated_at: string;
}

export interface Company {
  id: string;
  owner_user_id: string | null;
  name: string;
  name_ur: string;
  industry: string;
  industry_ur: string;
  city: string;
  address: string;
  description: string;
  description_ur: string;
  website: string;
  official_careers_url: string;
  logo_initials: string;
  is_verified: boolean;
  is_demonstration: boolean;
  vacancy_count?: number;
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ur: string;
  description_en: string;
  description_ur: string;
  icon_name: string;
  subcategories_en: string[];
  subcategories_ur: string[];
  is_custom: boolean;
  vacancy_count: number;
  created_at: string;
}

export interface City {
  id: string;
  name_en: string;
  name_ur: string;
  province_en: string;
  province_ur: string;
  is_major: boolean;
  vacancy_count: number;
}

export interface Job {
  id: string;
  company_id: string;
  employer_user_id: string | null;
  category_slug: string;
  subcategory: string;
  title: string;
  title_ur: string;
  city: string;
  address: string;
  salary_min: number;
  salary_max: number;
  salary_display: string;
  education: string;
  experience: string;
  gender_eligibility: string;
  employment_type: string;
  skills: string[];
  requirements: string[];
  requirements_ur: string[];
  responsibilities: string[];
  responsibilities_ur: string[];
  contact_phone: string;
  contact_email: string;
  application_url: string;
  deadline: string;
  verification_status: 'verified_demo' | 'verified' | 'pending_review' | 'rejected';
  status: 'open' | 'closed';
  is_demonstration: boolean;
  source_note: string;
  created_at: string;
  company_name?: string;
  company_name_ur?: string;
  logo_initials?: string;
  official_careers_url?: string;
  company_website?: string;
  company_description?: string;
  company_description_ur?: string;
  company_verified?: number | boolean;
  applicant_count?: number;
}

export interface Application {
  id: string;
  job_id: string;
  seeker_user_id: string | null;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  cover_note: string;
  cv_filename: string;
  cv_data_url: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'interview' | 'rejected' | 'hired';
  created_at: string;
  updated_at: string;
  job_title?: string;
  job_title_ur?: string;
  job_city?: string;
  company_name?: string;
  company_name_ur?: string;
}

export interface PlatformStats {
  activeJobs: number;
  companiesCount: number;
  categoriesCount: number;
  citiesCount: number;
  pendingReviewCount: number;
  applicationsCount: number;
}
