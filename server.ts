import express, { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import {
  db,
  initSchema,
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  AuthPayload,
} from './server/db.ts';
import { seedDatabase } from './server/seed.ts';
import { seedExpandedListings } from './server/seedExpansion.ts';

initSchema();
seedDatabase();
seedExpandedListings();

const app = express();
app.use(express.json({ limit: '6mb' }));

interface AuthenticatedRequest extends Request {
  auth?: AuthPayload;
}

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  req.auth = payload;
  next();
}

function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  const payload = verifyToken(token);
  if (payload) req.auth = payload;
  next();
}

function requireRole(...roles: Array<'seeker' | 'employer' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      res.status(403).json({ error: 'Insufficient permissions for this action' });
      return;
    }
    next();
  };
}

function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function serializeJob(row: Record<string, unknown>) {
  return {
    ...row,
    skills: parseJsonArray(row.skills as string),
    requirements: parseJsonArray(row.requirements as string),
    requirements_ur: parseJsonArray(row.requirements_ur as string),
    responsibilities: parseJsonArray(row.responsibilities as string),
    responsibilities_ur: parseJsonArray(row.responsibilities_ur as string),
    is_demonstration: Boolean(row.is_demonstration),
  };
}

// ---------- HEALTH & STATS ----------
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/api/stats', (_req, res) => {
  const activeJobs = (
    db
      .prepare(
        "SELECT COUNT(*) as c FROM jobs WHERE status = 'open' AND verification_status IN ('verified', 'verified_demo')"
      )
      .get() as { c: number }
  ).c;
  const companiesCount = (db.prepare('SELECT COUNT(*) as c FROM companies').get() as { c: number }).c;
  const categoriesCount = (db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number }).c;
  const citiesCount = (db.prepare('SELECT COUNT(*) as c FROM cities').get() as { c: number }).c;
  const pendingReviewCount = (
    db.prepare("SELECT COUNT(*) as c FROM jobs WHERE verification_status = 'pending_review'").get() as {
      c: number;
    }
  ).c;
  const applicationsCount = (db.prepare('SELECT COUNT(*) as c FROM applications').get() as { c: number }).c;

  res.json({
    activeJobs,
    companiesCount,
    categoriesCount,
    citiesCount,
    pendingReviewCount,
    applicationsCount,
  });
});

// ---------- AUTHENTICATION ----------
app.post('/api/auth/register', (req, res) => {
  const {
    email,
    password,
    role,
    fullName,
    phone = '',
    city = 'Islamabad',
    companyName = '',
    companyIndustry = 'Other Professions',
    companyAddress = '',
    companyDescription = '',
  } = req.body ?? {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email address is required' });
    return;
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    res.status(400).json({ error: 'Full name is required' });
    return;
  }
  if (role !== 'seeker' && role !== 'employer') {
    res.status(400).json({ error: 'Role must be seeker or employer' });
    return;
  }
  if (role === 'employer' && (!companyName.trim() || !companyAddress.trim())) {
    res.status(400).json({ error: 'Company name and verifiable office address are required for employers' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const userId = `usr-${crypto.randomUUID().slice(0, 12)}`;
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO users (id, email, password_hash, role, full_name, phone, city, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(userId, normalizedEmail, hashPassword(password), role, fullName.trim(), phone.trim(), city.trim(), now);

  if (role === 'seeker') {
    db.prepare(
      'INSERT INTO seeker_profiles (user_id, headline, education, experience_years, experience_summary, skills, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(userId, '', '', '0-1 years', '', '[]', now);
  } else if (role === 'employer') {
    const compId = `cmp-${crypto.randomUUID().slice(0, 10)}`;
    const initials = companyName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w: string) => w[0]?.toUpperCase() || '')
      .join('');
    db.prepare(
      `INSERT INTO companies (id, owner_user_id, name, name_ur, industry, industry_ur, city, address, description, description_ur, website, official_careers_url, logo_initials, is_verified, is_demonstration, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', ?, 0, 0, ?)`
    ).run(
      compId,
      userId,
      companyName.trim(),
      companyName.trim(),
      companyIndustry.trim(),
      companyIndustry.trim(),
      city.trim(),
      companyAddress.trim(),
      companyDescription.trim() || `${companyName.trim()} — Registered Pakistani Employer`,
      companyDescription.trim() || `${companyName.trim()} — رجسٹرڈ پاکستانی آجر`,
      initials || 'CO',
      now
    );
  }

  const token = signToken({ userId, email: normalizedEmail, role });
  const user = db.prepare('SELECT id, email, role, full_name, phone, city, created_at FROM users WHERE id = ?').get(userId);
  res.status(201).json({ token, user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const row = db
    .prepare('SELECT id, email, password_hash, role, full_name, phone, city, created_at FROM users WHERE email = ?')
    .get(normalizedEmail) as Record<string, string> | undefined;

  if (!row || !verifyPassword(String(password), row.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken({
    userId: row.id,
    email: row.email,
    role: row.role as 'seeker' | 'employer' | 'admin',
  });

  const { password_hash: _ph, ...safeUser } = row;
  res.json({ token, user: safeUser });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = db
    .prepare('SELECT id, email, role, full_name, phone, city, created_at FROM users WHERE id = ?')
    .get(req.auth!.userId);
  if (!user) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }
  let company = null;
  let seekerProfile = null;
  if (req.auth!.role === 'employer') {
    company = db.prepare('SELECT * FROM companies WHERE owner_user_id = ?').get(req.auth!.userId) || null;
  } else if (req.auth!.role === 'seeker') {
    const profile = db.prepare('SELECT * FROM seeker_profiles WHERE user_id = ?').get(req.auth!.userId) as
      | Record<string, unknown>
      | undefined;
    if (profile) {
      seekerProfile = {
        ...profile,
        skills: parseJsonArray(profile.skills as string),
      };
    }
  }
  res.json({ user, company, seekerProfile });
});

app.put('/api/auth/account', requireAuth, (req: AuthenticatedRequest, res) => {
  const { fullName, phone, city } = req.body ?? {};
  if (!fullName || String(fullName).trim().length < 2) {
    res.status(400).json({ error: 'Full name is required' });
    return;
  }
  db.prepare('UPDATE users SET full_name = ?, phone = ?, city = ? WHERE id = ?').run(
    String(fullName).trim(),
    String(phone || '').trim(),
    String(city || '').trim(),
    req.auth!.userId
  );
  const updated = db
    .prepare('SELECT id, email, role, full_name, phone, city, created_at FROM users WHERE id = ?')
    .get(req.auth!.userId);
  res.json({ user: updated });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body ?? {};
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  const normalized = String(email).trim().toLowerCase();
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(normalized) as { id: string } | undefined;
  if (!user) {
    // Do not leak email enumeration, but return consistent message
    res.json({
      message: 'If an account matches that email, a password recovery token has been issued.',
      demoResetCode: null,
    });
    return;
  }
  const token = crypto.randomBytes(4).toString('hex').toUpperCase();
  const expiresAt = Date.now() + 1000 * 60 * 30;
  db.prepare('INSERT INTO password_resets (token, user_id, expires_at, used) VALUES (?, ?, ?, 0)').run(
    token,
    user.id,
    expiresAt
  );
  res.json({
    message: 'Password recovery code generated. Enter this code below to set a new password.',
    demoResetCode: token,
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, token, newPassword } = req.body ?? {};
  if (!email || !token || !newPassword || String(newPassword).length < 6) {
    res.status(400).json({ error: 'Email, recovery code, and a 6+ character password are required' });
    return;
  }
  const normalized = String(email).trim().toLowerCase();
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(normalized) as { id: string } | undefined;
  if (!user) {
    res.status(400).json({ error: 'Invalid recovery code or email' });
    return;
  }
  const resetRow = db
    .prepare('SELECT token, user_id, expires_at, used FROM password_resets WHERE token = ? AND user_id = ?')
    .get(String(token).trim().toUpperCase(), user.id) as
    | { token: string; user_id: string; expires_at: number; used: number }
    | undefined;

  if (!resetRow || resetRow.used === 1 || resetRow.expires_at < Date.now()) {
    res.status(400).json({ error: 'Recovery code is invalid or expired' });
    return;
  }

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(String(newPassword)), user.id);
  db.prepare('UPDATE password_resets SET used = 1 WHERE token = ?').run(resetRow.token);
  res.json({ message: 'Password updated successfully. You can now sign in.' });
});

// ---------- CATEGORIES & CITIES ----------
app.get('/api/categories', (_req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY is_custom ASC, rowid ASC').all() as Array<
    Record<string, unknown>
  >;
  const countsRows = db
    .prepare(
      "SELECT category_slug, COUNT(*) as count FROM jobs WHERE status = 'open' AND verification_status IN ('verified', 'verified_demo') GROUP BY category_slug"
    )
    .all() as Array<{ category_slug: string; count: number }>;
  const countMap = new Map(countsRows.map((r) => [r.category_slug, r.count]));

  const categories = rows.map((row) => ({
    ...row,
    subcategories_en: parseJsonArray(row.subcategories_en as string),
    subcategories_ur: parseJsonArray(row.subcategories_ur as string),
    is_custom: Boolean(row.is_custom),
    vacancy_count: countMap.get(row.slug as string) || 0,
  }));
  res.json({ categories });
});

app.post('/api/categories', requireAuth, requireRole('admin'), (req, res) => {
  const {
    name_en,
    name_ur,
    description_en,
    description_ur,
    icon_name = 'Briefcase',
    subcategories_en = [],
    subcategories_ur = [],
  } = req.body ?? {};

  if (!name_en || !name_ur || !description_en || !description_ur) {
    res.status(400).json({ error: 'English and Urdu names and descriptions are required' });
    return;
  }

  const baseSlug = String(name_en)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 4)}`;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO categories (id, slug, name_en, name_ur, description_en, description_ur, icon_name, subcategories_en, subcategories_ur, is_custom, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
  ).run(
    id,
    slug,
    String(name_en).trim(),
    String(name_ur).trim(),
    String(description_en).trim(),
    String(description_ur).trim(),
    String(icon_name).trim(),
    JSON.stringify(Array.isArray(subcategories_en) ? subcategories_en : []),
    JSON.stringify(Array.isArray(subcategories_ur) ? subcategories_ur : []),
    now
  );

  res.status(201).json({
    category: {
      id,
      slug,
      name_en,
      name_ur,
      description_en,
      description_ur,
      icon_name,
      subcategories_en,
      subcategories_ur,
      is_custom: true,
      vacancy_count: 0,
      created_at: now,
    },
  });
});

app.post('/api/categories/:slug/subcategories', requireAuth, requireRole('admin'), (req, res) => {
  const { slug } = req.params;
  const { sub_en, sub_ur } = req.body ?? {};
  if (!sub_en || !sub_ur) {
    res.status(400).json({ error: 'English and Urdu subcategory names are required' });
    return;
  }
  const cat = db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug) as
    | Record<string, unknown>
    | undefined;
  if (!cat) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  const listEn = parseJsonArray(cat.subcategories_en as string);
  const listUr = parseJsonArray(cat.subcategories_ur as string);
  listEn.push(String(sub_en).trim());
  listUr.push(String(sub_ur).trim());

  db.prepare('UPDATE categories SET subcategories_en = ?, subcategories_ur = ? WHERE slug = ?').run(
    JSON.stringify(listEn),
    JSON.stringify(listUr),
    slug
  );
  res.json({ subcategories_en: listEn, subcategories_ur: listUr });
});

app.get('/api/cities', (_req, res) => {
  const cities = db.prepare('SELECT * FROM cities ORDER BY is_major DESC, name_en ASC').all() as Array<
    Record<string, unknown>
  >;
  const countsRows = db
    .prepare(
      "SELECT city, COUNT(*) as count FROM jobs WHERE status = 'open' AND verification_status IN ('verified', 'verified_demo') GROUP BY city"
    )
    .all() as Array<{ city: string; count: number }>;
  const countMap = new Map(countsRows.map((r) => [r.city.toLowerCase(), r.count]));
  res.json({
    cities: cities.map((c) => ({
      ...c,
      is_major: Boolean(c.is_major),
      vacancy_count: countMap.get(String(c.name_en).toLowerCase()) || 0,
    })),
  });
});

app.post('/api/cities', requireAuth, requireRole('admin'), (req, res) => {
  const { name_en, name_ur, province_en, province_ur } = req.body ?? {};
  if (!name_en || !name_ur || !province_en || !province_ur) {
    res.status(400).json({ error: 'English and Urdu city and province names are required' });
    return;
  }
  const exists = db.prepare('SELECT id FROM cities WHERE LOWER(name_en) = LOWER(?)').get(String(name_en).trim());
  if (exists) {
    res.status(409).json({ error: 'City already exists' });
    return;
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO cities (id, name_en, name_ur, province_en, province_ur, is_major, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)'
  ).run(id, String(name_en).trim(), String(name_ur).trim(), String(province_en).trim(), String(province_ur).trim(), now);
  res.status(201).json({
    city: { id, name_en, name_ur, province_en, province_ur, is_major: false, vacancy_count: 0, created_at: now },
  });
});

// ---------- COMPANIES ----------
app.get('/api/companies', (req, res) => {
  const { q = '', city = '', industry = '' } = req.query;
  const rows = db.prepare('SELECT * FROM companies ORDER BY is_verified DESC, name ASC').all() as Array<
    Record<string, unknown>
  >;
  const jobCounts = db
    .prepare(
      "SELECT company_id, COUNT(*) as count FROM jobs WHERE status = 'open' AND verification_status IN ('verified', 'verified_demo') GROUP BY company_id"
    )
    .all() as Array<{ company_id: string; count: number }>;
  const countMap = new Map(jobCounts.map((r) => [r.company_id, r.count]));

  const queryLower = String(q).trim().toLowerCase();
  const cityLower = String(city).trim().toLowerCase();
  const indLower = String(industry).trim().toLowerCase();

  const filtered = rows
    .filter((c) => {
      if (
        queryLower &&
        !String(c.name).toLowerCase().includes(queryLower) &&
        !String(c.name_ur).toLowerCase().includes(queryLower) &&
        !String(c.description).toLowerCase().includes(queryLower)
      ) {
        return false;
      }
      if (cityLower && String(c.city).toLowerCase() !== cityLower) return false;
      if (indLower && String(c.industry).toLowerCase() !== indLower) return false;
      return true;
    })
    .map((c) => ({
      ...c,
      is_verified: Boolean(c.is_verified),
      is_demonstration: Boolean(c.is_demonstration),
      vacancy_count: countMap.get(String(c.id)) || 0,
    }));

  res.json({ companies: filtered });
});

app.get('/api/companies/:id', (req, res) => {
  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.params.id) as
    | Record<string, unknown>
    | undefined;
  if (!company) {
    res.status(404).json({ error: 'Company not found' });
    return;
  }
  const jobs = db
    .prepare(
      `SELECT j.*, c.name as company_name, c.name_ur as company_name_ur, c.logo_initials, c.official_careers_url, c.is_verified as company_verified
       FROM jobs j JOIN companies c ON j.company_id = c.id
       WHERE j.company_id = ? AND j.verification_status IN ('verified', 'verified_demo')
       ORDER BY j.created_at DESC`
    )
    .all(company.id as string) as Array<Record<string, unknown>>;

  res.json({
    company: {
      ...company,
      is_verified: Boolean(company.is_verified),
      is_demonstration: Boolean(company.is_demonstration),
    },
    jobs: jobs.map(serializeJob),
  });
});

app.put('/api/employer/company', requireAuth, requireRole('employer'), (req: AuthenticatedRequest, res) => {
  const { name, name_ur, industry, industry_ur, city, address, description, description_ur, website, official_careers_url } =
    req.body ?? {};
  const existing = db.prepare('SELECT * FROM companies WHERE owner_user_id = ?').get(req.auth!.userId) as
    | Record<string, unknown>
    | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Company profile not found' });
    return;
  }
  if (!name || !address || !city) {
    res.status(400).json({ error: 'Company name, city, and address are required' });
    return;
  }
  db.prepare(
    `UPDATE companies
     SET name = ?, name_ur = ?, industry = ?, industry_ur = ?, city = ?, address = ?, description = ?, description_ur = ?, website = ?, official_careers_url = ?
     WHERE id = ?`
  ).run(
    String(name).trim(),
    String(name_ur || name).trim(),
    String(industry || existing.industry).trim(),
    String(industry_ur || existing.industry_ur).trim(),
    String(city).trim(),
    String(address).trim(),
    String(description || existing.description).trim(),
    String(description_ur || existing.description_ur).trim(),
    String(website || '').trim(),
    String(official_careers_url || '').trim(),
    existing.id as string
  );
  const updated = db.prepare('SELECT * FROM companies WHERE id = ?').get(existing.id as string);
  res.json({ company: updated });
});

// ---------- JOBS ----------
app.get('/api/jobs', optionalAuth, (req: AuthenticatedRequest, res) => {
  const {
    q = '',
    category = '',
    city = '',
    salaryMin = '',
    education = '',
    experience = '',
    gender = '',
    employmentType = '',
    sort = 'latest',
    includeAll = '',
  } = req.query;

  const isAdmin = req.auth?.role === 'admin';
  const showAll = includeAll === 'true' && isAdmin;

  const whereClauses: string[] = [];
  if (!showAll) {
    whereClauses.push("j.verification_status IN ('verified', 'verified_demo')");
  }

  const sql = `
    SELECT j.*, c.name as company_name, c.name_ur as company_name_ur, c.logo_initials, c.official_careers_url, c.is_verified as company_verified
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    ${whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : ''}
    ORDER BY j.created_at DESC
  `;

  const rows = db.prepare(sql).all() as Array<Record<string, unknown>>;

  const qLower = String(q).trim().toLowerCase();
  const catLower = String(category).trim().toLowerCase();
  const cityLower = String(city).trim().toLowerCase();
  const eduLower = String(education).trim().toLowerCase();
  const expLower = String(experience).trim().toLowerCase();
  const genderLower = String(gender).trim().toLowerCase();
  const typeLower = String(employmentType).trim().toLowerCase();
  const minSalNum = Number(salaryMin) || 0;

  let filtered = rows.filter((j) => {
    if (qLower) {
      const hay = [
        j.title,
        j.title_ur,
        j.company_name,
        j.company_name_ur,
        j.city,
        j.subcategory,
        j.skills,
        j.education,
        j.employment_type,
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(qLower)) return false;
    }
    if (catLower && String(j.category_slug).toLowerCase() !== catLower) return false;
    if (cityLower && String(j.city).toLowerCase() !== cityLower) return false;
    if (eduLower) {
      const jobEdu = String(j.education).toLowerCase();
      if (eduLower === 'professional') {
        const isProf = ['mbbs', 'bds', 'pharm-d', 'llb', 'ca', 'acca', 'dpt', 'nebosh', 'cia', 'cfa', 'fcps'].some(
          (k) => jobEdu.includes(k)
        );
        if (!isProf) return false;
      } else if (!jobEdu.includes(eduLower)) {
        return false;
      }
    }
    if (expLower) {
      const jobExp = String(j.experience).toLowerCase();
      if (expLower === 'fresh') {
        if (!jobExp.includes('0-') && !jobExp.includes('fresh')) return false;
      } else if (expLower === '5+') {
        const isSenior = ['5+', '7+', '10+', '4-7', '3-6', '3-5'].some((k) => jobExp.includes(k));
        if (!isSenior) return false;
      } else if (!jobExp.includes(expLower)) {
        return false;
      }
    }
    if (genderLower && genderLower !== 'all') {
      const jobGender = String(j.gender_eligibility).toLowerCase();
      if (jobGender !== genderLower && jobGender !== 'not specified' && jobGender !== 'any') return false;
    }
    if (typeLower && String(j.employment_type).toLowerCase() !== typeLower) return false;
    if (minSalNum > 0 && Number(j.salary_max || j.salary_min) < minSalNum) return false;
    return true;
  });

  if (sort === 'deadline') {
    filtered = filtered.sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)));
  } else if (sort === 'salary_desc') {
    filtered = filtered.sort((a, b) => Number(b.salary_max || 0) - Number(a.salary_max || 0));
  } else if (sort === 'recommended') {
    filtered = filtered.sort((a, b) => Number(b.company_verified) - Number(a.company_verified));
  }

  res.json({ jobs: filtered.map(serializeJob) });
});

app.get('/api/jobs/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const row = db
    .prepare(
      `SELECT j.*, c.name as company_name, c.name_ur as company_name_ur, c.logo_initials, c.official_careers_url, c.website as company_website, c.description as company_description, c.description_ur as company_description_ur, c.is_verified as company_verified
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.id = ?`
    )
    .get(req.params.id) as Record<string, unknown> | undefined;

  if (!row) {
    res.status(404).json({ error: 'Job listing not found' });
    return;
  }

  // Only expose pending/rejected jobs to their owner or admin
  const isOwner = req.auth && req.auth.userId === row.employer_user_id;
  const isAdmin = req.auth?.role === 'admin';
  if (row.verification_status !== 'verified' && row.verification_status !== 'verified_demo' && !isOwner && !isAdmin) {
    res.status(403).json({ error: 'This vacancy is awaiting administrator verification' });
    return;
  }

  res.json({ job: serializeJob(row) });
});

app.post('/api/jobs', requireAuth, requireRole('employer', 'admin'), (req: AuthenticatedRequest, res) => {
  const {
    title,
    title_ur,
    companyName,
    category_slug,
    subcategory,
    city,
    address,
    salary_min = 0,
    salary_max = 0,
    salary_display,
    education,
    experience,
    gender_eligibility = 'Not Specified',
    employment_type = 'Full-time',
    skills = [],
    requirements = [],
    responsibilities = [],
    contact_phone,
    contact_email = '',
    application_url = '',
    deadline,
  } = req.body ?? {};

  if (!title || !category_slug || !city || !address || !education || !experience || !contact_phone || !deadline) {
    res.status(400).json({
      error: 'Job title, category, city, physical address, education, experience, contact number, and closing deadline are required',
    });
    return;
  }

  const now = new Date().toISOString();
  let companyId: string;

  if (req.auth!.role === 'employer') {
    const employerComp = db.prepare('SELECT id FROM companies WHERE owner_user_id = ?').get(req.auth!.userId) as
      | { id: string }
      | undefined;
    if (employerComp) {
      companyId = employerComp.id;
    } else {
      companyId = `cmp-${crypto.randomUUID().slice(0, 10)}`;
      const cName = String(companyName || 'Employer Organization').trim();
      db.prepare(
        `INSERT INTO companies (id, owner_user_id, name, name_ur, industry, industry_ur, city, address, description, description_ur, logo_initials, is_verified, is_demonstration, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`
      ).run(
        companyId,
        req.auth!.userId,
        cName,
        cName,
        category_slug,
        category_slug,
        city,
        address,
        `${cName} — Submitted employer record`,
        `${cName} — آجر کی تفصیل`,
        cName.slice(0, 2).toUpperCase(),
        now
      );
    }
  } else {
    // Admin creating a verified job directly
    const cName = String(companyName || 'Verified Pakistani Employer').trim();
    const existingComp = db.prepare('SELECT id FROM companies WHERE LOWER(name) = LOWER(?)').get(cName) as
      | { id: string }
      | undefined;
    if (existingComp) {
      companyId = existingComp.id;
    } else {
      companyId = `cmp-${crypto.randomUUID().slice(0, 10)}`;
      db.prepare(
        `INSERT INTO companies (id, owner_user_id, name, name_ur, industry, industry_ur, city, address, description, description_ur, logo_initials, is_verified, is_demonstration, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?)`
      ).run(
        companyId,
        req.auth!.userId,
        cName,
        cName,
        category_slug,
        category_slug,
        city,
        address,
        `${cName} — Administrator-verified employer`,
        `${cName} — تصدیق شدہ آجر`,
        cName.slice(0, 2).toUpperCase(),
        now
      );
    }
  }

  const jobId = `job-${crypto.randomUUID().slice(0, 10)}`;
  const verificationStatus = req.auth!.role === 'admin' ? 'verified' : 'pending_review';
  const computedSalaryDisplay =
    salary_display && String(salary_display).trim()
      ? String(salary_display).trim()
      : Number(salary_min) > 0 || Number(salary_max) > 0
        ? `PKR ${Number(salary_min).toLocaleString()} - ${Number(salary_max || salary_min).toLocaleString()} / month`
        : 'Specified upon shortlisting';

  const toList = (val: unknown) =>
    Array.isArray(val)
      ? val.map((x) => String(x).trim()).filter(Boolean)
      : String(val || '')
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean);

  const reqList = toList(requirements);
  const respList = toList(responsibilities);
  const skillList = toList(skills);

  db.prepare(
    `INSERT INTO jobs (
      id, company_id, employer_user_id, category_slug, subcategory, title, title_ur,
      city, address, salary_min, salary_max, salary_display, education, experience,
      gender_eligibility, employment_type, skills, requirements, requirements_ur,
      responsibilities, responsibilities_ur, contact_phone, contact_email,
      application_url, deadline, verification_status, status, is_demonstration, source_note, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', 0, ?, ?)`
  ).run(
    jobId,
    companyId,
    req.auth!.userId,
    String(category_slug).trim(),
    String(subcategory || 'General').trim(),
    String(title).trim(),
    String(title_ur || title).trim(),
    String(city).trim(),
    String(address).trim(),
    Number(salary_min) || 0,
    Number(salary_max) || Number(salary_min) || 0,
    computedSalaryDisplay,
    String(education).trim(),
    String(experience).trim(),
    String(gender_eligibility).trim(),
    String(employment_type).trim(),
    JSON.stringify(skillList),
    JSON.stringify(reqList),
    JSON.stringify(reqList),
    JSON.stringify(respList),
    JSON.stringify(respList),
    String(contact_phone).trim(),
    String(contact_email || '').trim(),
    String(application_url || '').trim(),
    String(deadline).trim(),
    verificationStatus,
    req.auth!.role === 'admin'
      ? 'Administrator-verified vacancy listing.'
      : 'Submitted by registered employer; pending administrator verification before public listing.',
    now
  );

  res.status(201).json({
    id: jobId,
    verification_status: verificationStatus,
    message:
      verificationStatus === 'verified'
        ? 'Vacancy published and verified.'
        : 'Vacancy submitted for administrator verification before public listing.',
  });
});

// ---------- EMPLOYER DASHBOARD ----------
app.get('/api/employer/jobs', requireAuth, requireRole('employer', 'admin'), (req: AuthenticatedRequest, res) => {
  const rows = db
    .prepare(
      `SELECT j.*, c.name as company_name, c.name_ur as company_name_ur, c.logo_initials,
       (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applicant_count
       FROM jobs j JOIN companies c ON j.company_id = c.id
       WHERE j.employer_user_id = ?
       ORDER BY j.created_at DESC`
    )
    .all(req.auth!.userId) as Array<Record<string, unknown>>;
  res.json({ jobs: rows.map(serializeJob) });
});

app.patch('/api/employer/jobs/:id/status', requireAuth, requireRole('employer', 'admin'), (req: AuthenticatedRequest, res) => {
  const { status } = req.body ?? {};
  if (status !== 'open' && status !== 'closed') {
    res.status(400).json({ error: 'Status must be open or closed' });
    return;
  }
  const job = db.prepare('SELECT employer_user_id FROM jobs WHERE id = ?').get(req.params.id) as
    | { employer_user_id: string }
    | undefined;
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  if (job.employer_user_id !== req.auth!.userId && req.auth!.role !== 'admin') {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }
  db.prepare('UPDATE jobs SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true, status });
});

function handleDeleteJob(req: AuthenticatedRequest, res: Response) {
  const job = db.prepare('SELECT id, employer_user_id FROM jobs WHERE id = ?').get(req.params.id) as
    | { id: string; employer_user_id: string | null }
    | undefined;
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  if (job.employer_user_id !== req.auth!.userId && req.auth!.role !== 'admin') {
    res.status(403).json({ error: 'Not authorized to delete this vacancy' });
    return;
  }
  db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);
  res.json({ ok: true, deletedId: req.params.id });
}

app.delete('/api/jobs/:id', requireAuth, requireRole('employer', 'admin'), handleDeleteJob);
app.delete('/api/employer/jobs/:id', requireAuth, requireRole('employer', 'admin'), handleDeleteJob);
app.delete('/api/admin/jobs/:id', requireAuth, requireRole('admin'), handleDeleteJob);

app.get('/api/employer/applications', requireAuth, requireRole('employer', 'admin'), (req: AuthenticatedRequest, res) => {
  const rows = db
    .prepare(
      `SELECT a.*, j.title as job_title, j.title_ur as job_title_ur, j.city as job_city
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.employer_user_id = ?
       ORDER BY a.created_at DESC`
    )
    .all(req.auth!.userId);
  res.json({ applications: rows });
});

app.patch(
  '/api/employer/applications/:id/status',
  requireAuth,
  requireRole('employer', 'admin'),
  (req: AuthenticatedRequest, res) => {
    const { status } = req.body ?? {};
    const valid = ['submitted', 'under_review', 'shortlisted', 'interview', 'rejected', 'hired'];
    if (!valid.includes(status)) {
      res.status(400).json({ error: 'Invalid application status' });
      return;
    }
    const appRow = db
      .prepare(
        `SELECT a.id, j.employer_user_id FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.id = ?`
      )
      .get(req.params.id) as { id: string; employer_user_id: string } | undefined;
    if (!appRow) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    if (appRow.employer_user_id !== req.auth!.userId && req.auth!.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    db.prepare('UPDATE applications SET status = ?, updated_at = ? WHERE id = ?').run(
      status,
      new Date().toISOString(),
      req.params.id
    );
    res.json({ ok: true, status });
  }
);

// ---------- ADMIN MODERATION ----------
app.get('/api/admin/pending-jobs', requireAuth, requireRole('admin'), (_req, res) => {
  const rows = db
    .prepare(
      `SELECT j.*, c.name as company_name, c.name_ur as company_name_ur, c.logo_initials
       FROM jobs j JOIN companies c ON j.company_id = c.id
       ORDER BY CASE WHEN j.verification_status = 'pending_review' THEN 0 ELSE 1 END, j.created_at DESC`
    )
    .all() as Array<Record<string, unknown>>;
  res.json({ jobs: rows.map(serializeJob) });
});

app.patch('/api/admin/jobs/:id/verify', requireAuth, requireRole('admin'), (req, res) => {
  const { verification_status } = req.body ?? {};
  if (!['verified', 'rejected', 'pending_review'].includes(verification_status)) {
    res.status(400).json({ error: 'Invalid verification status' });
    return;
  }
  const job = db.prepare('SELECT company_id FROM jobs WHERE id = ?').get(req.params.id) as
    | { company_id: string }
    | undefined;
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  db.prepare('UPDATE jobs SET verification_status = ? WHERE id = ?').run(verification_status, req.params.id);
  if (verification_status === 'verified') {
    db.prepare('UPDATE companies SET is_verified = 1 WHERE id = ?').run(job.company_id);
  }
  res.json({ ok: true, verification_status });
});

// ---------- SEEKER PROFILE, SAVED JOBS, & APPLICATIONS ----------
app.put('/api/seeker/profile', requireAuth, requireRole('seeker'), (req: AuthenticatedRequest, res) => {
  const { headline = '', education = '', experience_years = '0-1 years', experience_summary = '', skills = [], cv_filename, cv_data_url } =
    req.body ?? {};
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT * FROM seeker_profiles WHERE user_id = ?').get(req.auth!.userId) as
    | Record<string, unknown>
    | undefined;

  const skillArr = Array.isArray(skills)
    ? skills.map((s) => String(s).trim()).filter(Boolean)
    : String(skills)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  if (existing) {
    db.prepare(
      `UPDATE seeker_profiles
       SET headline = ?, education = ?, experience_years = ?, experience_summary = ?, skills = ?, cv_filename = ?, cv_data_url = ?, updated_at = ?
       WHERE user_id = ?`
    ).run(
      String(headline).trim(),
      String(education).trim(),
      String(experience_years).trim(),
      String(experience_summary).trim(),
      JSON.stringify(skillArr),
      cv_filename !== undefined ? String(cv_filename) : String(existing.cv_filename || ''),
      cv_data_url !== undefined ? String(cv_data_url) : String(existing.cv_data_url || ''),
      now,
      req.auth!.userId
    );
  } else {
    db.prepare(
      `INSERT INTO seeker_profiles (user_id, headline, education, experience_years, experience_summary, skills, cv_filename, cv_data_url, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      req.auth!.userId,
      String(headline).trim(),
      String(education).trim(),
      String(experience_years).trim(),
      String(experience_summary).trim(),
      JSON.stringify(skillArr),
      String(cv_filename || ''),
      String(cv_data_url || ''),
      now
    );
  }
  const updated = db.prepare('SELECT * FROM seeker_profiles WHERE user_id = ?').get(req.auth!.userId) as Record<
    string,
    unknown
  >;
  res.json({
    seekerProfile: {
      ...updated,
      skills: parseJsonArray(updated.skills as string),
    },
  });
});

app.get('/api/seeker/saved-jobs', requireAuth, (req: AuthenticatedRequest, res) => {
  const rows = db
    .prepare(
      `SELECT j.*, c.name as company_name, c.name_ur as company_name_ur, c.logo_initials, c.official_careers_url, c.is_verified as company_verified
       FROM saved_jobs s
       JOIN jobs j ON s.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`
    )
    .all(req.auth!.userId) as Array<Record<string, unknown>>;
  res.json({ jobs: rows.map(serializeJob) });
});

app.post('/api/seeker/saved-jobs/:jobId', requireAuth, (req: AuthenticatedRequest, res) => {
  const { jobId } = req.params;
  const exists = db
    .prepare('SELECT 1 FROM saved_jobs WHERE user_id = ? AND job_id = ?')
    .get(req.auth!.userId, jobId);
  if (exists) {
    db.prepare('DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?').run(req.auth!.userId, jobId);
    res.json({ saved: false });
  } else {
    db.prepare('INSERT INTO saved_jobs (user_id, job_id, created_at) VALUES (?, ?, ?)').run(
      req.auth!.userId,
      jobId,
      new Date().toISOString()
    );
    res.json({ saved: true });
  }
});

app.get('/api/seeker/applications', requireAuth, (req: AuthenticatedRequest, res) => {
  const rows = db
    .prepare(
      `SELECT a.*, j.title as job_title, j.title_ur as job_title_ur, j.city as job_city, c.name as company_name, c.name_ur as company_name_ur
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.seeker_user_id = ?
       ORDER BY a.created_at DESC`
    )
    .all(req.auth!.userId);
  res.json({ applications: rows });
});

app.post('/api/jobs/:jobId/apply', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { jobId } = req.params;
  const { applicant_name, applicant_email, applicant_phone, cover_note = '', cv_filename = '', cv_data_url = '' } =
    req.body ?? {};

  const job = db.prepare('SELECT id, status FROM jobs WHERE id = ?').get(jobId) as
    | { id: string; status: string }
    | undefined;
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  if (job.status !== 'open') {
    res.status(400).json({ error: 'Applications for this vacancy are closed' });
    return;
  }
  if (!applicant_name || !applicant_email || !applicant_phone) {
    res.status(400).json({ error: 'Applicant name, email, and phone number are required' });
    return;
  }

  const now = new Date().toISOString();
  const id = `app-${crypto.randomUUID().slice(0, 10)}`;
  db.prepare(
    `INSERT INTO applications (id, job_id, seeker_user_id, applicant_name, applicant_email, applicant_phone, cover_note, cv_filename, cv_data_url, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`
  ).run(
    id,
    jobId,
    req.auth?.userId || null,
    String(applicant_name).trim(),
    String(applicant_email).trim(),
    String(applicant_phone).trim(),
    String(cover_note).trim(),
    String(cv_filename).trim(),
    String(cv_data_url),
    now,
    now
  );

  res.status(201).json({
    application: {
      id,
      job_id: jobId,
      status: 'submitted',
      created_at: now,
    },
  });
});

// ---------- SUPPORT / CONTACT ----------
app.post('/api/support', (req, res) => {
  const { name, email, subject, category = 'general', message } = req.body ?? {};
  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: 'Name, email, subject, and message are required' });
    return;
  }
  const id = `msg-${crypto.randomUUID().slice(0, 10)}`;
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO support_messages (id, name, email, subject, category, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, String(name).trim(), String(email).trim(), String(subject).trim(), String(category).trim(), String(message).trim(), now);
  res.status(201).json({ id, message: 'Support inquiry recorded. Our moderation desk will review it shortly.' });
});

// ---------- VITE / STATIC SERVING ----------
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'));
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JOB وَغیرہ server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
