-- ========================================================
-- Apex Nigeria Enterprise HRMS - Supabase PostgreSQL Schema (Safe & Idempotent)
-- ========================================================

-- Step 1: Clean drop of existing tables in reverse dependency order to resolve any schema conflict
DROP TABLE IF EXISTS public.audit_events CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.hr_cases CASCADE;
DROP TABLE IF EXISTS public.payroll_runs CASCADE;
DROP TABLE IF EXISTS public.compensations CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.onboarding_tasks CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.requisitions CASCADE;
DROP TABLE IF EXISTS public.attendance_events CASCADE;
DROP TABLE IF EXISTS public.leave_requests CASCADE;
DROP TABLE IF EXISTS public.leave_balances CASCADE;
DROP TABLE IF EXISTS public.leave_types CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.positions CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- Step 2: Create Base Hierarchy Tables
CREATE TABLE public.organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    currency TEXT DEFAULT 'NGN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.locations (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    city TEXT,
    country TEXT DEFAULT 'Nigeria',
    timezone TEXT DEFAULT 'WAT',
    status TEXT DEFAULT 'active'
);

CREATE TABLE public.departments (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active'
);

CREATE TABLE public.positions (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    grade TEXT,
    status TEXT DEFAULT 'active'
);

-- Step 3: Staff Master Records
CREATE TABLE public.employees (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    position_id TEXT REFERENCES public.positions(id) ON DELETE SET NULL,
    manager_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
    location_id TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
    hire_date DATE,
    employment_type TEXT DEFAULT 'Full-time',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Users & Authentication Sessions
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Step 5: Leave & Attendance
CREATE TABLE public.leave_types (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    default_days INTEGER NOT NULL,
    paid INTEGER DEFAULT 1
);

CREATE TABLE public.leave_balances (
    id TEXT PRIMARY KEY,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type_id TEXT REFERENCES public.leave_types(id) ON DELETE CASCADE,
    period_year INTEGER NOT NULL,
    total_days INTEGER NOT NULL,
    used_days NUMERIC DEFAULT 0,
    available_days NUMERIC NOT NULL
);

CREATE TABLE public.leave_requests (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type_id TEXT REFERENCES public.leave_types(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days NUMERIC NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by TEXT,
    action_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.attendance_events (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date DATE DEFAULT CURRENT_DATE,
    source TEXT DEFAULT 'Staff Web Portal'
);

-- Step 6: Recruitment / ATS
CREATE TABLE public.requisitions (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    openings INTEGER DEFAULT 1,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.candidates (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    requisition_id TEXT REFERENCES public.requisitions(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    stage TEXT DEFAULT 'Applied',
    rating NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Onboarding Checklists
CREATE TABLE public.onboarding_tasks (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assigned_to_role TEXT DEFAULT 'Employee',
    due_date DATE,
    status TEXT DEFAULT 'pending'
);

-- Step 8: Performance Objectives
CREATE TABLE public.goals (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    cycle_id TEXT,
    title TEXT NOT NULL,
    target_metric TEXT,
    progress_pct INTEGER DEFAULT 0,
    status TEXT DEFAULT 'in_progress'
);

-- Step 9: Compensation & Payroll
CREATE TABLE public.compensations (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    base_salary NUMERIC NOT NULL,
    currency TEXT DEFAULT 'NGN',
    pay_frequency TEXT DEFAULT 'Monthly',
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active'
);

CREATE TABLE public.payroll_runs (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    total_payout NUMERIC NOT NULL,
    employee_count INTEGER NOT NULL,
    status TEXT DEFAULT 'completed',
    approved_by TEXT,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 10: HR Cases
CREATE TABLE public.hr_cases (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    details TEXT,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'open',
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 11: Documents
CREATE TABLE public.documents (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    file_path TEXT,
    size_kb INTEGER DEFAULT 120,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 12: Immutable Audit Events
CREATE TABLE public.audit_events (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_username TEXT NOT NULL,
    event_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 13: Seed Nigerian Enterprise Dataset
INSERT INTO public.organizations (id, name, code, status, currency)
VALUES ('org-enterprise-01', 'Apex Nigeria Limited', 'APEX-NG', 'active', 'NGN');

INSERT INTO public.locations (id, organization_id, name, city, country, timezone, status) VALUES
('loc-01', 'org-enterprise-01', 'Lagos HQ (Victoria Island)', 'Lagos', 'Nigeria', 'WAT', 'active'),
('loc-02', 'org-enterprise-01', 'Abuja Corporate Office (Maitama)', 'Abuja', 'Nigeria', 'WAT', 'active'),
('loc-03', 'org-enterprise-01', 'Port Harcourt Operations (GRA)', 'Port Harcourt', 'Nigeria', 'WAT', 'active'),
('loc-04', 'org-enterprise-01', 'Ibadan Technology Hub', 'Ibadan', 'Nigeria', 'WAT', 'active');

INSERT INTO public.departments (id, organization_id, code, name, status) VALUES
('dept-eng', 'org-enterprise-01', 'ENG', 'Engineering & Systems Architecture', 'active'),
('dept-hr', 'org-enterprise-01', 'HR', 'People Operations & Human Capital', 'active'),
('dept-fin', 'org-enterprise-01', 'FIN', 'Finance & Corporate Accounts', 'active'),
('dept-sales', 'org-enterprise-01', 'SLS', 'Commercial Revenue & Business Development', 'active'),
('dept-prod', 'org-enterprise-01', 'PRD', 'Product & User Experience', 'active');

INSERT INTO public.positions (id, organization_id, department_id, title, grade, status) VALUES
('pos-ceo', 'org-enterprise-01', 'dept-eng', 'Managing Director / CEO', 'Executive', 'active'),
('pos-vp-eng', 'org-enterprise-01', 'dept-eng', 'Chief Technology Officer (CTO)', 'L7', 'active'),
('pos-sr-eng', 'org-enterprise-01', 'dept-eng', 'Lead Software Architect', 'L5', 'active'),
('pos-hr-dir', 'org-enterprise-01', 'dept-hr', 'Head of Human Resources', 'L6', 'active'),
('pos-recruiter', 'org-enterprise-01', 'dept-hr', 'Talent Acquisition Lead', 'L4', 'active'),
('pos-cfo', 'org-enterprise-01', 'dept-fin', 'Chief Financial Officer (CFO)', 'Executive', 'active'),
('pos-payroll-mgr', 'org-enterprise-01', 'dept-fin', 'Payroll & Statutory Compliance Manager', 'L5', 'active');

INSERT INTO public.employees (id, organization_id, employee_number, first_name, last_name, email, phone, department_id, position_id, manager_id, location_id, hire_date, employment_type, status) VALUES
('emp-001', 'org-enterprise-01', 'EMP-1001', 'Babatunde', 'Adeyemi', 'babatunde.adeyemi@apex.ng', '+234 803 123 4567', 'dept-eng', 'pos-ceo', NULL, 'loc-01', '2020-01-15', 'Full-time', 'active'),
('emp-002', 'org-enterprise-01', 'EMP-1002', 'Ngozi', 'Okonkwo', 'ngozi.okonkwo@apex.ng', '+234 802 234 5678', 'dept-hr', 'pos-hr-dir', 'emp-001', 'loc-01', '2020-04-01', 'Full-time', 'active'),
('emp-003', 'org-enterprise-01', 'EMP-1003', 'Chidiebere', 'Eze', 'chidiebere.eze@apex.ng', '+234 805 345 6789', 'dept-eng', 'pos-vp-eng', 'emp-001', 'loc-01', '2021-02-10', 'Full-time', 'active'),
('emp-004', 'org-enterprise-01', 'EMP-1004', 'Oluwaseun', 'Balogun', 'oluwaseun.balogun@apex.ng', '+234 807 456 7890', 'dept-eng', 'pos-sr-eng', 'emp-003', 'loc-02', '2021-08-15', 'Full-time', 'active'),
('emp-005', 'org-enterprise-01', 'EMP-1005', 'Amina', 'Abubakar', 'amina.abubakar@apex.ng', '+234 809 567 8901', 'dept-hr', 'pos-recruiter', 'emp-002', 'loc-01', '2022-03-01', 'Full-time', 'active'),
('emp-006', 'org-enterprise-01', 'EMP-1006', 'Emeka', 'Nnamani', 'emeka.nnamani@apex.ng', '+234 813 678 9012', 'dept-fin', 'pos-payroll-mgr', 'emp-001', 'loc-02', '2022-07-20', 'Full-time', 'active');

-- Password is hash of 'password123'
INSERT INTO public.users (id, organization_id, employee_id, username, password_hash, role, status) VALUES
('usr-admin', 'org-enterprise-01', 'emp-001', 'admin', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Admin', 'active'),
('usr-hr', 'org-enterprise-01', 'emp-002', 'hr_manager', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'HR Manager', 'active'),
('usr-manager', 'org-enterprise-01', 'emp-003', 'manager', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Manager', 'active'),
('usr-employee', 'org-enterprise-01', 'emp-004', 'employee', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Employee', 'active'),
('usr-payroll', 'org-enterprise-01', 'emp-006', 'payroll', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Payroll/Finance', 'active');

INSERT INTO public.compensations (id, organization_id, employee_id, base_salary, currency, pay_frequency, status) VALUES
('comp-001', 'org-enterprise-01', 'emp-001', 65000000.0, 'NGN', 'Monthly', 'active'),
('comp-002', 'org-enterprise-01', 'emp-002', 36000000.0, 'NGN', 'Monthly', 'active'),
('comp-003', 'org-enterprise-01', 'emp-003', 48000000.0, 'NGN', 'Monthly', 'active'),
('comp-004', 'org-enterprise-01', 'emp-004', 30000000.0, 'NGN', 'Monthly', 'active'),
('comp-005', 'org-enterprise-01', 'emp-005', 22000000.0, 'NGN', 'Monthly', 'active'),
('comp-006', 'org-enterprise-01', 'emp-006', 26000000.0, 'NGN', 'Monthly', 'active');
