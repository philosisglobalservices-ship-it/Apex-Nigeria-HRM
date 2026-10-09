"""
Enterprise HRMS - Database Schema & Seeder
Configured for Nigerian Enterprise Context (NGN Currency, Nigerian Locations, and Nigerian Personnel)
"""
import sqlite3
import uuid
import datetime
import json
import hashlib
import os

DB_FILE = "hrm_enterprise.db"

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()

    # 1. Organizations & Hierarchy
    c.execute('''
    CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'active',
        currency TEXT DEFAULT 'NGN',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS legal_entities (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        registration_no TEXT,
        country TEXT,
        currency TEXT,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        city TEXT,
        country TEXT,
        timezone TEXT DEFAULT 'WAT',
        status TEXT DEFAULT 'active'
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'active'
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS positions (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        department_id TEXT NOT NULL,
        title TEXT NOT NULL,
        grade TEXT,
        status TEXT DEFAULT 'active'
    )
    ''')

    # 2. Employees & Master Records
    c.execute('''
    CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        employee_number TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        department_id TEXT,
        position_id TEXT,
        manager_id TEXT,
        location_id TEXT,
        hire_date TEXT,
        employment_type TEXT DEFAULT 'Full-time',
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 3. Users, Roles & Security
    c.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        employee_id TEXT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        last_login_at TEXT
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        organization_id TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        expires_at TEXT NOT NULL
    )
    ''')

    # 4. Leave & Time Management
    c.execute('''
    CREATE TABLE IF NOT EXISTS leave_types (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        default_days INTEGER NOT NULL,
        paid INTEGER DEFAULT 1
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS leave_balances (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL,
        leave_type_id TEXT NOT NULL,
        period_year INTEGER NOT NULL,
        total_days INTEGER NOT NULL,
        used_days REAL DEFAULT 0,
        available_days REAL NOT NULL
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS leave_requests (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        leave_type_id TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        days REAL NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        approved_by TEXT,
        action_note TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 5. Attendance & Timesheets
    c.execute('''
    CREATE TABLE IF NOT EXISTS attendance_events (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_time TEXT NOT NULL,
        date TEXT NOT NULL,
        source TEXT DEFAULT 'Web'
    )
    ''')

    # 6. Recruitment / ATS
    c.execute('''
    CREATE TABLE IF NOT EXISTS requisitions (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        title TEXT NOT NULL,
        department_id TEXT NOT NULL,
        openings INTEGER DEFAULT 1,
        status TEXT DEFAULT 'open',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        requisition_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        stage TEXT DEFAULT 'Applied',
        rating REAL DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 7. Onboarding & Offboarding
    c.execute('''
    CREATE TABLE IF NOT EXISTS onboarding_tasks (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        title TEXT NOT NULL,
        assigned_to_role TEXT DEFAULT 'Employee',
        due_date TEXT,
        status TEXT DEFAULT 'pending'
    )
    ''')

    # 8. Performance Management
    c.execute('''
    CREATE TABLE IF NOT EXISTS performance_cycles (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        year INTEGER NOT NULL,
        status TEXT DEFAULT 'active'
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        cycle_id TEXT,
        title TEXT NOT NULL,
        target_metric TEXT,
        progress_pct INTEGER DEFAULT 0,
        status TEXT DEFAULT 'in_progress'
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        reviewer_id TEXT NOT NULL,
        cycle_id TEXT,
        rating REAL,
        feedback TEXT,
        status TEXT DEFAULT 'completed',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 9. Compensation & Payroll
    c.execute('''
    CREATE TABLE IF NOT EXISTS compensations (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        base_salary REAL NOT NULL,
        currency TEXT DEFAULT 'NGN',
        pay_frequency TEXT DEFAULT 'Monthly',
        effective_from TEXT NOT NULL,
        status TEXT DEFAULT 'active'
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS payroll_runs (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        month TEXT NOT NULL,
        total_payout REAL NOT NULL,
        employee_count INTEGER NOT NULL,
        status TEXT DEFAULT 'completed',
        approved_by TEXT,
        processed_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 10. HR Cases & Grievances
    c.execute('''
    CREATE TABLE IF NOT EXISTS hr_cases (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        category TEXT NOT NULL,
        subject TEXT NOT NULL,
        details TEXT,
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'open',
        assigned_to TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 11. Documents
    c.execute('''
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        employee_id TEXT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        file_path TEXT,
        size_kb INTEGER DEFAULT 120,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 12. Audit Events
    c.execute('''
    CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        actor_username TEXT NOT NULL,
        event_type TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    conn.commit()
    conn.close()
    print("Database tables initialized successfully.")

def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def seed_db():
    conn = get_connection()
    c = conn.cursor()

    # Clear existing tables for fresh Nigerian enterprise dataset
    tables = [
        "organizations", "legal_entities", "locations", "departments", "positions",
        "employees", "users", "sessions", "leave_types", "leave_balances",
        "leave_requests", "attendance_events", "requisitions", "candidates",
        "onboarding_tasks", "performance_cycles", "goals", "reviews",
        "compensations", "payroll_runs", "hr_cases", "documents", "audit_events"
    ]
    for table in tables:
        c.execute(f"DELETE FROM {table}")

    org_id = "org-enterprise-01"
    c.execute("INSERT INTO organizations VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
              (org_id, "Apex Nigeria Limited", "APEX-NG", "active", "NGN"))

    c.execute("INSERT INTO legal_entities VALUES (?, ?, ?, ?, ?, ?, ?)",
              ("le-01", org_id, "Apex Technologies Nigeria Ltd", "RC-1492341", "Nigeria", "NGN", "active"))

    # Nigerian Regional Locations
    locs = [
        ("loc-01", org_id, "Lagos HQ (Victoria Island)", "Lagos", "Nigeria", "WAT", "active"),
        ("loc-02", org_id, "Abuja Corporate Office (Maitama)", "Abuja", "Nigeria", "WAT", "active"),
        ("loc-03", org_id, "Port Harcourt Operations (GRA)", "Port Harcourt", "Nigeria", "WAT", "active"),
        ("loc-04", org_id, "Ibadan Technology Hub", "Ibadan", "Nigeria", "WAT", "active")
    ]
    c.executemany("INSERT INTO locations VALUES (?, ?, ?, ?, ?, ?, ?)", locs)

    # Departments
    depts = [
        ("dept-eng", org_id, "ENG", "Engineering & Systems Architecture", "active"),
        ("dept-hr", org_id, "HR", "People Operations & Human Capital", "active"),
        ("dept-fin", org_id, "FIN", "Finance & Corporate Accounts", "active"),
        ("dept-sales", org_id, "SLS", "Commercial Revenue & Business Development", "active"),
        ("dept-prod", org_id, "PRD", "Product & User Experience", "active")
    ]
    c.executemany("INSERT INTO departments VALUES (?, ?, ?, ?, ?)", depts)

    # Positions
    positions = [
        ("pos-ceo", org_id, "dept-eng", "Managing Director / CEO", "Executive", "active"),
        ("pos-vp-eng", org_id, "dept-eng", "Chief Technology Officer (CTO)", "L7", "active"),
        ("pos-sr-eng", org_id, "dept-eng", "Lead Software Architect", "L5", "active"),
        ("pos-hr-dir", org_id, "dept-hr", "Head of Human Resources", "L6", "active"),
        ("pos-recruiter", org_id, "dept-hr", "Talent Acquisition Lead", "L4", "active"),
        ("pos-cfo", org_id, "dept-fin", "Chief Financial Officer (CFO)", "Executive", "active"),
        ("pos-payroll-mgr", org_id, "dept-fin", "Payroll & Statutory Compliance Manager", "L5", "active")
    ]
    c.executemany("INSERT INTO positions VALUES (?, ?, ?, ?, ?, ?)", positions)

    # Nigerian Employees
    emps = [
        ("emp-001", org_id, "EMP-1001", "Babatunde", "Adeyemi", "babatunde.adeyemi@apex.ng", "+234 803 123 4567", "dept-eng", "pos-ceo", None, "loc-01", "2020-01-15", "Full-time", "active"),
        ("emp-002", org_id, "EMP-1002", "Ngozi", "Okonkwo", "ngozi.okonkwo@apex.ng", "+234 802 234 5678", "dept-hr", "pos-hr-dir", "emp-001", "loc-01", "2020-04-01", "Full-time", "active"),
        ("emp-003", org_id, "EMP-1003", "Chidiebere", "Eze", "chidiebere.eze@apex.ng", "+234 805 345 6789", "dept-eng", "pos-vp-eng", "emp-001", "loc-01", "2021-02-10", "Full-time", "active"),
        ("emp-004", org_id, "EMP-1004", "Oluwaseun", "Balogun", "oluwaseun.balogun@apex.ng", "+234 807 456 7890", "dept-eng", "pos-sr-eng", "emp-003", "loc-02", "2021-08-15", "Full-time", "active"),
        ("emp-005", org_id, "EMP-1005", "Amina", "Abubakar", "amina.abubakar@apex.ng", "+234 809 567 8901", "dept-hr", "pos-recruiter", "emp-002", "loc-01", "2022-03-01", "Full-time", "active"),
        ("emp-006", org_id, "EMP-1006", "Emeka", "Nnamani", "emeka.nnamani@apex.ng", "+234 813 678 9012", "dept-fin", "pos-payroll-mgr", "emp-001", "loc-02", "2022-07-20", "Full-time", "active"),
        ("emp-007", org_id, "EMP-1007", "Folashade", "Adebayo", "folashade.adebayo@apex.ng", "+234 814 789 0123", "dept-prod", "pos-sr-eng", "emp-003", "loc-04", "2023-01-10", "Full-time", "active"),
        ("emp-008", org_id, "EMP-1008", "Ibrahim", "Musa", "ibrahim.musa@apex.ng", "+234 816 890 1234", "dept-sales", "pos-sr-eng", "emp-001", "loc-03", "2023-05-18", "Full-time", "active")
    ]
    for emp in emps:
        c.execute("""
        INSERT INTO employees (id, organization_id, employee_number, first_name, last_name, email, phone, department_id, position_id, manager_id, location_id, hire_date, employment_type, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, emp)

    # Users with standard password 'password123'
    pw = hash_pw("password123")
    users = [
        ("usr-admin", org_id, "emp-001", "admin", pw, "Admin", "active", "2026-10-08 09:00:00"),
        ("usr-hr", org_id, "emp-002", "hr_manager", pw, "HR Manager", "active", "2026-10-08 09:15:00"),
        ("usr-manager", org_id, "emp-003", "manager", pw, "Manager", "active", "2026-10-08 09:30:00"),
        ("usr-employee", org_id, "emp-004", "employee", pw, "Employee", "active", "2026-10-08 09:45:00"),
        ("usr-payroll", org_id, "emp-006", "payroll", pw, "Payroll/Finance", "active", "2026-10-08 08:30:00")
    ]
    c.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)", users)

    # Leave Types
    ltypes = [
        ("lt-annual", org_id, "Annual Vacation Leave", 24, 1),
        ("lt-sick", org_id, "Medical / Sick Leave", 14, 1),
        ("lt-parental", org_id, "Maternity / Paternity Leave", 90, 1),
        ("lt-casual", org_id, "Casual / Emergency Leave", 7, 1),
        ("lt-unpaid", org_id, "Unpaid Sabbatical", 30, 0)
    ]
    c.executemany("INSERT INTO leave_types VALUES (?, ?, ?, ?, ?)", ltypes)

    # Leave Balances
    for emp in emps:
        emp_id = emp[0]
        c.execute("INSERT INTO leave_balances VALUES (?, ?, ?, 2026, 24, 4, 20)", (str(uuid.uuid4()), emp_id, "lt-annual"))
        c.execute("INSERT INTO leave_balances VALUES (?, ?, ?, 2026, 14, 2, 12)", (str(uuid.uuid4()), emp_id, "lt-sick"))

    # Sample Leave Requests
    c.execute("""
    INSERT INTO leave_requests VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, ("lr-001", org_id, "emp-004", "lt-annual", "2026-10-15", "2026-10-22", 6, "Annual family vacation in Calabar", "pending", None, None))
    c.execute("""
    INSERT INTO leave_requests VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, ("lr-002", org_id, "emp-005", "lt-sick", "2026-09-10", "2026-09-12", 2, "Medical checkup at Reddington Hospital", "approved", "emp-002", "Approved by Head of HR"))

    # Attendance Events (Today)
    today = datetime.date.today().isoformat()
    c.execute("INSERT INTO attendance_events VALUES (?, ?, ?, ?, ?, ?, ?)",
              ("att-001", org_id, "emp-004", "CLOCK_IN", f"{today} 07:55:12", today, "Lagos Office Portal"))
    c.execute("INSERT INTO attendance_events VALUES (?, ?, ?, ?, ?, ?, ?)",
              ("att-002", org_id, "emp-002", "CLOCK_IN", f"{today} 08:10:45", today, "Abuja Portal"))
    c.execute("INSERT INTO attendance_events VALUES (?, ?, ?, ?, ?, ?, ?)",
              ("att-003", org_id, "emp-003", "CLOCK_IN", f"{today} 08:02:18", today, "Lagos Office Portal"))
    c.execute("INSERT INTO attendance_events VALUES (?, ?, ?, ?, ?, ?, ?)",
              ("att-004", org_id, "emp-007", "CLOCK_IN", f"{today} 08:15:30", today, "Ibadan Hub Portal"))

    # Requisitions & Candidates (Nigerian Candidates)
    c.execute("INSERT INTO requisitions VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
              ("req-001", org_id, "Principal Cloud DevOps Engineer", "dept-eng", 2, "open"))
    c.execute("INSERT INTO requisitions VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
              ("req-002", org_id, "Senior People & Culture Specialist", "dept-hr", 1, "open"))
    c.execute("INSERT INTO requisitions VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
              ("req-003", org_id, "Commercial Enterprise Account Lead", "dept-sales", 2, "open"))

    candidates = [
        ("cand-001", org_id, "req-001", "Chidera Okafor", "chidera.okafor@techhub.ng", "+234 802 998 1122", "Technical Interview", 4.9, "10 years backend and Kubernetes infrastructure mastery in Lagos fintechs"),
        ("cand-002", org_id, "req-001", "Olawale Danladi", "olawale.danladi@clouddev.ng", "+234 803 887 2233", "Offer Extended", 4.8, "Offer letter issued for Senior DevOps Lead position"),
        ("cand-003", org_id, "req-002", "Zainab Sanusi", "zainab.sanusi@hrpartners.ng", "+234 809 776 3344", "Screening", 4.5, "Ex-Lead Recruiter at Interswitch"),
        ("cand-004", org_id, "req-003", "Kelechi Nwosu", "kelechi.nwosu@salesgrowth.ng", "+234 814 665 4455", "Applied", 4.3, "Proven B2B Enterprise banking client network")
    ]
    c.executemany("INSERT INTO candidates VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", candidates)

    # Onboarding Tasks
    tasks = [
        ("task-001", org_id, "emp-004", "Submit NIN & Tax Identification Number (TIN)", "Employee", "2026-10-20", "completed"),
        ("task-002", org_id, "emp-004", "Pension Reform Act (PFA) RSA Registration", "Employee", "2026-10-22", "pending"),
        ("task-003", org_id, "emp-004", "Receive Corporate Laptop & YubiKey Token", "IT Admin", "2026-10-18", "completed"),
        ("task-004", org_id, "emp-007", "NHIS HMO Healthcare Scheme Enrollment", "HR Officer", "2026-10-25", "pending")
    ]
    c.executemany("INSERT INTO onboarding_tasks VALUES (?, ?, ?, ?, ?, ?, ?)", tasks)

    # Performance Goals
    c.execute("INSERT INTO performance_cycles VALUES (?, ?, ?, ?, ?)",
              ("cycle-2026-q3", org_id, "FY2026 Q3 Nigerian Performance Review", 2026, "active"))
    goals = [
        ("goal-001", org_id, "emp-004", "cycle-2026-q3", "Deploy CBN Compliance Open Banking API", "100% CBN Guidelines Met", 85, "in_progress"),
        ("goal-002", org_id, "emp-004", "cycle-2026-q3", "Organize Mentorship for Junior Developers", "4 Developers Mentored", 100, "completed"),
        ("goal-003", org_id, "emp-002", "cycle-2026-q3", "Implement Digital HRIS Self-Service", "95% Portal Adoption", 90, "in_progress"),
        ("goal-004", org_id, "emp-007", "cycle-2026-q3", "Deliver Mobile Banking Micro-Frontend", "Released to App Store", 75, "in_progress")
    ]
    c.executemany("INSERT INTO goals VALUES (?, ?, ?, ?, ?, ?, ?, ?)", goals)

    # Nigerian Compensations (NGN Base Salaries)
    salaries = [
        ("comp-001", org_id, "emp-001", 65000000.0, "NGN", "Monthly", "2024-01-01", "active"),
        ("comp-002", org_id, "emp-002", 36000000.0, "NGN", "Monthly", "2024-01-01", "active"),
        ("comp-003", org_id, "emp-003", 48000000.0, "NGN", "Monthly", "2024-01-01", "active"),
        ("comp-004", org_id, "emp-004", 30000000.0, "NGN", "Monthly", "2024-01-01", "active"),
        ("comp-005", org_id, "emp-005", 22000000.0, "NGN", "Monthly", "2024-01-01", "active"),
        ("comp-006", org_id, "emp-006", 26000000.0, "NGN", "Monthly", "2024-01-01", "active"),
        ("comp-007", org_id, "emp-007", 28000000.0, "NGN", "Monthly", "2024-01-01", "active"),
        ("comp-008", org_id, "emp-008", 25000000.0, "NGN", "Monthly", "2024-01-01", "active")
    ]
    c.executemany("INSERT INTO compensations VALUES (?, ?, ?, ?, ?, ?, ?, ?)", salaries)

    # Monthly Payroll Run (NGN)
    total_annual = sum(s[3] for s in salaries)
    monthly_run = total_annual / 12.0
    c.execute("INSERT INTO payroll_runs VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
              ("pay-2026-09", org_id, "September 2026", monthly_run, len(salaries), "completed", "Emeka Nnamani"))

    # HR Cases
    cases = [
        ("case-001", org_id, "emp-004", "Equipment Upgrade", "Ergonomic Monitor & Inverter Support", "Requesting additional backup UPS inverter and dual monitor for remote work in Lekki.", "Low", "in_progress", "emp-002"),
        ("case-002", org_id, "emp-005", "Benefits Inquiry", "HMO Dependent Coverage Inclusion", "Need to add newborn infant into Hygeia HMO hospital tier coverage.", "Medium", "resolved", "emp-002")
    ]
    c.executemany("INSERT INTO hr_cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", cases)

    # Documents
    docs = [
        ("doc-001", org_id, "emp-004", "Standard Employment Contract_Nigeria.pdf", "Contracts", "docs/employment_contract_oluwaseun.pdf", 450),
        ("doc-002", org_id, "emp-004", "Signed Code of Conduct & NDPR Data Compliance.pdf", "Compliance", "docs/ndpr_consent_004.pdf", 210),
        ("doc-003", org_id, None, "Apex Nigeria 2026 Employee Handbook.pdf", "Company Policy", "docs/handbook_nigeria_2026.pdf", 1420),
        ("doc-004", org_id, "emp-002", "PAYE & Tax Exemption Certificate.pdf", "Tax & Identity", "docs/firs_tax_clearance.pdf", 320)
    ]
    c.executemany("INSERT INTO documents VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", docs)

    # Initial Audit Events
    c.execute("INSERT INTO audit_events VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
              ("aud-001", org_id, "admin", "INITIALIZATION", "ORGANIZATION", org_id, "Initialized Apex Nigeria enterprise database with NGN currency, WAT timezone, and localized Nigerian structures."))

    conn.commit()
    conn.close()
    print("Database reseeded with Nigerian enterprise data successfully.")

if __name__ == "__main__":
    init_db()
    seed_db()
