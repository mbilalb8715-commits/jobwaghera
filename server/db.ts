import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'jobwaghaira.db');
export const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('seeker', 'employer', 'admin')),
      full_name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      city TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seeker_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      headline TEXT DEFAULT '',
      education TEXT DEFAULT '',
      experience_years TEXT DEFAULT '0-1 years',
      experience_summary TEXT DEFAULT '',
      skills TEXT DEFAULT '[]',
      cv_filename TEXT DEFAULT '',
      cv_data_url TEXT DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      name_ur TEXT NOT NULL,
      industry TEXT NOT NULL,
      industry_ur TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      description TEXT NOT NULL,
      description_ur TEXT NOT NULL,
      website TEXT DEFAULT '',
      official_careers_url TEXT DEFAULT '',
      logo_initials TEXT NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 0,
      is_demonstration INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name_en TEXT NOT NULL,
      name_ur TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_ur TEXT NOT NULL,
      icon_name TEXT NOT NULL DEFAULT 'Briefcase',
      subcategories_en TEXT NOT NULL DEFAULT '[]',
      subcategories_ur TEXT NOT NULL DEFAULT '[]',
      is_custom INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cities (
      id TEXT PRIMARY KEY,
      name_en TEXT UNIQUE NOT NULL,
      name_ur TEXT NOT NULL,
      province_en TEXT NOT NULL,
      province_ur TEXT NOT NULL,
      is_major INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      employer_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      category_slug TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      title TEXT NOT NULL,
      title_ur TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      salary_min INTEGER NOT NULL DEFAULT 0,
      salary_max INTEGER NOT NULL DEFAULT 0,
      salary_display TEXT NOT NULL,
      education TEXT NOT NULL,
      experience TEXT NOT NULL,
      gender_eligibility TEXT NOT NULL DEFAULT 'Not Specified',
      employment_type TEXT NOT NULL DEFAULT 'Full-time',
      skills TEXT NOT NULL DEFAULT '[]',
      requirements TEXT NOT NULL DEFAULT '[]',
      requirements_ur TEXT NOT NULL DEFAULT '[]',
      responsibilities TEXT NOT NULL DEFAULT '[]',
      responsibilities_ur TEXT NOT NULL DEFAULT '[]',
      contact_phone TEXT NOT NULL,
      contact_email TEXT DEFAULT '',
      application_url TEXT DEFAULT '',
      deadline TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (verification_status IN ('verified_demo', 'verified', 'pending_review', 'rejected')),
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
      is_demonstration INTEGER NOT NULL DEFAULT 0,
      source_note TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      seeker_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      applicant_name TEXT NOT NULL,
      applicant_email TEXT NOT NULL,
      applicant_phone TEXT NOT NULL,
      cover_note TEXT DEFAULT '',
      cv_filename TEXT DEFAULT '',
      cv_data_url TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'interview', 'rejected', 'hired')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saved_jobs (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, job_id)
    );

    CREATE TABLE IF NOT EXISTS support_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      used INTEGER NOT NULL DEFAULT 0
    );
  `);
}

const TOKEN_SECRET = process.env.SESSION_SECRET || 'job-waghaira-local-dev-secret-key-2026';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(hash, 'hex');
  if (candidate.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(candidate, storedBuf);
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'seeker' | 'employer' | 'admin';
  exp: number;
}

export function signToken(payload: Omit<AuthPayload, 'exp'>): string {
  const fullPayload: AuthPayload = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string | undefined | null): AuthPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  if (sig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as AuthPayload;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}
