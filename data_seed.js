const INITIAL_SEED_DATA = {
  "organizations": [
    {
      "id": "org-enterprise-01",
      "name": "Apex Nigeria Limited",
      "code": "APEX-NG",
      "status": "active",
      "currency": "NGN",
      "created_at": "2026-10-08 21:53:06"
    }
  ],
  "locations": [
    {
      "id": "loc-01",
      "organization_id": "org-enterprise-01",
      "name": "Lagos HQ (Victoria Island)",
      "city": "Lagos",
      "country": "Nigeria",
      "timezone": "WAT",
      "status": "active"
    },
    {
      "id": "loc-02",
      "organization_id": "org-enterprise-01",
      "name": "Abuja Corporate Office (Maitama)",
      "city": "Abuja",
      "country": "Nigeria",
      "timezone": "WAT",
      "status": "active"
    },
    {
      "id": "loc-03",
      "organization_id": "org-enterprise-01",
      "name": "Port Harcourt Operations (GRA)",
      "city": "Port Harcourt",
      "country": "Nigeria",
      "timezone": "WAT",
      "status": "active"
    },
    {
      "id": "loc-04",
      "organization_id": "org-enterprise-01",
      "name": "Ibadan Technology Hub",
      "city": "Ibadan",
      "country": "Nigeria",
      "timezone": "WAT",
      "status": "active"
    }
  ],
  "departments": [
    {
      "id": "dept-eng",
      "organization_id": "org-enterprise-01",
      "code": "ENG",
      "name": "Engineering & Systems Architecture",
      "status": "active"
    },
    {
      "id": "dept-hr",
      "organization_id": "org-enterprise-01",
      "code": "HR",
      "name": "People Operations & Human Capital",
      "status": "active"
    },
    {
      "id": "dept-fin",
      "organization_id": "org-enterprise-01",
      "code": "FIN",
      "name": "Finance & Corporate Accounts",
      "status": "active"
    },
    {
      "id": "dept-sales",
      "organization_id": "org-enterprise-01",
      "code": "SLS",
      "name": "Commercial Revenue & Business Development",
      "status": "active"
    },
    {
      "id": "dept-prod",
      "organization_id": "org-enterprise-01",
      "code": "PRD",
      "name": "Product & User Experience",
      "status": "active"
    }
  ],
  "positions": [
    {
      "id": "pos-ceo",
      "organization_id": "org-enterprise-01",
      "department_id": "dept-eng",
      "title": "Managing Director / CEO",
      "grade": "Executive",
      "status": "active"
    },
    {
      "id": "pos-vp-eng",
      "organization_id": "org-enterprise-01",
      "department_id": "dept-eng",
      "title": "Chief Technology Officer (CTO)",
      "grade": "L7",
      "status": "active"
    },
    {
      "id": "pos-sr-eng",
      "organization_id": "org-enterprise-01",
      "department_id": "dept-eng",
      "title": "Lead Software Architect",
      "grade": "L5",
      "status": "active"
    },
    {
      "id": "pos-hr-dir",
      "organization_id": "org-enterprise-01",
      "department_id": "dept-hr",
      "title": "Head of Human Resources",
      "grade": "L6",
      "status": "active"
    },
    {
      "id": "pos-recruiter",
      "organization_id": "org-enterprise-01",
      "department_id": "dept-hr",
      "title": "Talent Acquisition Lead",
      "grade": "L4",
      "status": "active"
    },
    {
      "id": "pos-cfo",
      "organization_id": "org-enterprise-01",
      "department_id": "dept-fin",
      "title": "Chief Financial Officer (CFO)",
      "grade": "Executive",
      "status": "active"
    },
    {
      "id": "pos-payroll-mgr",
      "organization_id": "org-enterprise-01",
      "department_id": "dept-fin",
      "title": "Payroll & Statutory Compliance Manager",
      "grade": "L5",
      "status": "active"
    }
  ],
  "employees": [
    {
      "id": "emp-001",
      "organization_id": "org-enterprise-01",
      "employee_number": "EMP-1001",
      "first_name": "Babatunde",
      "last_name": "Adeyemi",
      "email": "babatunde.adeyemi@apex.ng",
      "phone": "+234 803 123 4567",
      "department_id": "dept-eng",
      "position_id": "pos-ceo",
      "manager_id": null,
      "location_id": "loc-01",
      "hire_date": "2020-01-15",
      "employment_type": "Full-time",
      "status": "active",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "emp-002",
      "organization_id": "org-enterprise-01",
      "employee_number": "EMP-1002",
      "first_name": "Ngozi",
      "last_name": "Okonkwo",
      "email": "ngozi.okonkwo@apex.ng",
      "phone": "+234 802 234 5678",
      "department_id": "dept-hr",
      "position_id": "pos-hr-dir",
      "manager_id": "emp-001",
      "location_id": "loc-01",
      "hire_date": "2020-04-01",
      "employment_type": "Full-time",
      "status": "active",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "emp-003",
      "organization_id": "org-enterprise-01",
      "employee_number": "EMP-1003",
      "first_name": "Chidiebere",
      "last_name": "Eze",
      "email": "chidiebere.eze@apex.ng",
      "phone": "+234 805 345 6789",
      "department_id": "dept-eng",
      "position_id": "pos-vp-eng",
      "manager_id": "emp-001",
      "location_id": "loc-01",
      "hire_date": "2021-02-10",
      "employment_type": "Full-time",
      "status": "active",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "emp-004",
      "organization_id": "org-enterprise-01",
      "employee_number": "EMP-1004",
      "first_name": "Oluwaseun",
      "last_name": "Balogun",
      "email": "oluwaseun.balogun@apex.ng",
      "phone": "+234 807 456 7890",
      "department_id": "dept-eng",
      "position_id": "pos-sr-eng",
      "manager_id": "emp-003",
      "location_id": "loc-02",
      "hire_date": "2021-08-15",
      "employment_type": "Full-time",
      "status": "active",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "emp-005",
      "organization_id": "org-enterprise-01",
      "employee_number": "EMP-1005",
      "first_name": "Amina",
      "last_name": "Abubakar",
      "email": "amina.abubakar@apex.ng",
      "phone": "+234 809 567 8901",
      "department_id": "dept-hr",
      "position_id": "pos-recruiter",
      "manager_id": "emp-002",
      "location_id": "loc-01",
      "hire_date": "2022-03-01",
      "employment_type": "Full-time",
      "status": "active",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "emp-006",
      "organization_id": "org-enterprise-01",
      "employee_number": "EMP-1006",
      "first_name": "Emeka",
      "last_name": "Nnamani",
      "email": "emeka.nnamani@apex.ng",
      "phone": "+234 813 678 9012",
      "department_id": "dept-fin",
      "position_id": "pos-payroll-mgr",
      "manager_id": "emp-001",
      "location_id": "loc-02",
      "hire_date": "2022-07-20",
      "employment_type": "Full-time",
      "status": "active",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "emp-007",
      "organization_id": "org-enterprise-01",
      "employee_number": "EMP-1007",
      "first_name": "Folashade",
      "last_name": "Adebayo",
      "email": "folashade.adebayo@apex.ng",
      "phone": "+234 814 789 0123",
      "department_id": "dept-prod",
      "position_id": "pos-sr-eng",
      "manager_id": "emp-003",
      "location_id": "loc-04",
      "hire_date": "2023-01-10",
      "employment_type": "Full-time",
      "status": "active",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "emp-008",
      "organization_id": "org-enterprise-01",
      "employee_number": "EMP-1008",
      "first_name": "Ibrahim",
      "last_name": "Musa",
      "email": "ibrahim.musa@apex.ng",
      "phone": "+234 816 890 1234",
      "department_id": "dept-sales",
      "position_id": "pos-sr-eng",
      "manager_id": "emp-001",
      "location_id": "loc-03",
      "hire_date": "2023-05-18",
      "employment_type": "Full-time",
      "status": "active",
      "created_at": "2026-10-08 21:53:06"
    }
  ],
  "users": [
    {
      "id": "usr-admin",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-001",
      "username": "admin",
      "password_hash": "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
      "role": "Admin",
      "status": "active",
      "last_login_at": "2026-10-09 11:33:10"
    },
    {
      "id": "usr-hr",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-002",
      "username": "hr_manager",
      "password_hash": "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
      "role": "HR Manager",
      "status": "active",
      "last_login_at": "2026-10-09 11:31:29"
    },
    {
      "id": "usr-manager",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-003",
      "username": "manager",
      "password_hash": "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
      "role": "Manager",
      "status": "active",
      "last_login_at": "2026-10-08 09:30:00"
    },
    {
      "id": "usr-employee",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-004",
      "username": "employee",
      "password_hash": "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
      "role": "Employee",
      "status": "active",
      "last_login_at": "2026-10-09 11:32:01"
    },
    {
      "id": "usr-payroll",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-006",
      "username": "payroll",
      "password_hash": "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
      "role": "Payroll/Finance",
      "status": "active",
      "last_login_at": "2026-10-09 11:31:43"
    }
  ],
  "leave_types": [
    {
      "id": "lt-annual",
      "organization_id": "org-enterprise-01",
      "name": "Annual Vacation Leave",
      "default_days": 24,
      "paid": 1
    },
    {
      "id": "lt-sick",
      "organization_id": "org-enterprise-01",
      "name": "Medical / Sick Leave",
      "default_days": 14,
      "paid": 1
    },
    {
      "id": "lt-parental",
      "organization_id": "org-enterprise-01",
      "name": "Maternity / Paternity Leave",
      "default_days": 90,
      "paid": 1
    },
    {
      "id": "lt-casual",
      "organization_id": "org-enterprise-01",
      "name": "Casual / Emergency Leave",
      "default_days": 7,
      "paid": 1
    },
    {
      "id": "lt-unpaid",
      "organization_id": "org-enterprise-01",
      "name": "Unpaid Sabbatical",
      "default_days": 30,
      "paid": 0
    }
  ],
  "leave_balances": [
    {
      "id": "6ba8f9cb-cad2-4da8-8479-bb6f112fc703",
      "employee_id": "emp-001",
      "leave_type_id": "lt-annual",
      "period_year": 2026,
      "total_days": 24,
      "used_days": 4.0,
      "available_days": 20.0
    },
    {
      "id": "866d11a9-113b-4521-978c-a7b188c2ddde",
      "employee_id": "emp-001",
      "leave_type_id": "lt-sick",
      "period_year": 2026,
      "total_days": 14,
      "used_days": 2.0,
      "available_days": 12.0
    },
    {
      "id": "2e9827ae-d5aa-410a-b391-faa91d14247a",
      "employee_id": "emp-002",
      "leave_type_id": "lt-annual",
      "period_year": 2026,
      "total_days": 24,
      "used_days": 4.0,
      "available_days": 20.0
    },
    {
      "id": "3dbec652-27e2-4103-b0f5-84218d5a994f",
      "employee_id": "emp-002",
      "leave_type_id": "lt-sick",
      "period_year": 2026,
      "total_days": 14,
      "used_days": 2.0,
      "available_days": 12.0
    },
    {
      "id": "ebf2b2b1-7ec9-469c-9e6e-37764f45b334",
      "employee_id": "emp-003",
      "leave_type_id": "lt-annual",
      "period_year": 2026,
      "total_days": 24,
      "used_days": 4.0,
      "available_days": 20.0
    },
    {
      "id": "c895442c-705f-4f69-9f62-17caf4b994e4",
      "employee_id": "emp-003",
      "leave_type_id": "lt-sick",
      "period_year": 2026,
      "total_days": 14,
      "used_days": 2.0,
      "available_days": 12.0
    },
    {
      "id": "c01900ad-1b03-43d9-9791-b2ad5d5f2a56",
      "employee_id": "emp-004",
      "leave_type_id": "lt-annual",
      "period_year": 2026,
      "total_days": 24,
      "used_days": 4.0,
      "available_days": 20.0
    },
    {
      "id": "fb197eb1-632c-42b2-bbe2-d29ca1e41055",
      "employee_id": "emp-004",
      "leave_type_id": "lt-sick",
      "period_year": 2026,
      "total_days": 14,
      "used_days": 2.0,
      "available_days": 12.0
    },
    {
      "id": "8e5bd46c-7839-4e01-ac17-50a5e57f6460",
      "employee_id": "emp-005",
      "leave_type_id": "lt-annual",
      "period_year": 2026,
      "total_days": 24,
      "used_days": 4.0,
      "available_days": 20.0
    },
    {
      "id": "daa610d8-2d22-4c0d-8b81-4e157a696f44",
      "employee_id": "emp-005",
      "leave_type_id": "lt-sick",
      "period_year": 2026,
      "total_days": 14,
      "used_days": 2.0,
      "available_days": 12.0
    },
    {
      "id": "642276ae-0d9f-4c2d-ba56-790a55da78a1",
      "employee_id": "emp-006",
      "leave_type_id": "lt-annual",
      "period_year": 2026,
      "total_days": 24,
      "used_days": 4.0,
      "available_days": 20.0
    },
    {
      "id": "391a89ee-541f-45e5-9cbf-5b7ce9b2f27a",
      "employee_id": "emp-006",
      "leave_type_id": "lt-sick",
      "period_year": 2026,
      "total_days": 14,
      "used_days": 2.0,
      "available_days": 12.0
    },
    {
      "id": "a852cab5-3f2b-47a9-8439-207e5e2b7ad7",
      "employee_id": "emp-007",
      "leave_type_id": "lt-annual",
      "period_year": 2026,
      "total_days": 24,
      "used_days": 4.0,
      "available_days": 20.0
    },
    {
      "id": "a3a54c53-73f9-459a-ba66-e1cb181ad2be",
      "employee_id": "emp-007",
      "leave_type_id": "lt-sick",
      "period_year": 2026,
      "total_days": 14,
      "used_days": 2.0,
      "available_days": 12.0
    },
    {
      "id": "85b82347-1393-4c77-a95c-0dc79f537038",
      "employee_id": "emp-008",
      "leave_type_id": "lt-annual",
      "period_year": 2026,
      "total_days": 24,
      "used_days": 4.0,
      "available_days": 20.0
    },
    {
      "id": "17e3d9b1-a197-4a2b-8587-0424205e8a36",
      "employee_id": "emp-008",
      "leave_type_id": "lt-sick",
      "period_year": 2026,
      "total_days": 14,
      "used_days": 2.0,
      "available_days": 12.0
    }
  ],
  "leave_requests": [
    {
      "id": "lr-001",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-004",
      "leave_type_id": "lt-annual",
      "start_date": "2026-10-15",
      "end_date": "2026-10-22",
      "days": 6.0,
      "reason": "Annual family vacation in Calabar",
      "status": "pending",
      "approved_by": null,
      "action_note": null,
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "lr-002",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-005",
      "leave_type_id": "lt-sick",
      "start_date": "2026-09-10",
      "end_date": "2026-09-12",
      "days": 2.0,
      "reason": "Medical checkup at Reddington Hospital",
      "status": "approved",
      "approved_by": "emp-002",
      "action_note": "Approved by Head of HR",
      "created_at": "2026-10-08 21:53:06"
    }
  ],
  "attendance_events": [
    {
      "id": "att-001",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-004",
      "event_type": "CLOCK_IN",
      "event_time": "2026-10-08 07:55:12",
      "date": "2026-10-08",
      "source": "Lagos Office Portal"
    },
    {
      "id": "att-002",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-002",
      "event_type": "CLOCK_IN",
      "event_time": "2026-10-08 08:10:45",
      "date": "2026-10-08",
      "source": "Abuja Portal"
    },
    {
      "id": "att-003",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-003",
      "event_type": "CLOCK_IN",
      "event_time": "2026-10-08 08:02:18",
      "date": "2026-10-08",
      "source": "Lagos Office Portal"
    },
    {
      "id": "att-004",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-007",
      "event_type": "CLOCK_IN",
      "event_time": "2026-10-08 08:15:30",
      "date": "2026-10-08",
      "source": "Ibadan Hub Portal"
    },
    {
      "id": "9a782aa4-936a-4afa-9e54-2197b70d2d38",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-001",
      "event_type": "CLOCK_IN",
      "event_time": "2026-10-08 22:58:34",
      "date": "2026-10-08",
      "source": "Web"
    }
  ],
  "requisitions": [
    {
      "id": "req-001",
      "organization_id": "org-enterprise-01",
      "title": "Principal Cloud DevOps Engineer",
      "department_id": "dept-eng",
      "openings": 2,
      "status": "open",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "req-002",
      "organization_id": "org-enterprise-01",
      "title": "Senior People & Culture Specialist",
      "department_id": "dept-hr",
      "openings": 1,
      "status": "open",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "req-003",
      "organization_id": "org-enterprise-01",
      "title": "Commercial Enterprise Account Lead",
      "department_id": "dept-sales",
      "openings": 2,
      "status": "open",
      "created_at": "2026-10-08 21:53:06"
    }
  ],
  "candidates": [
    {
      "id": "cand-001",
      "organization_id": "org-enterprise-01",
      "requisition_id": "req-001",
      "full_name": "Chidera Okafor",
      "email": "chidera.okafor@techhub.ng",
      "phone": "+234 802 998 1122",
      "stage": "Technical Interview",
      "rating": 4.9,
      "notes": "10 years backend and Kubernetes infrastructure mastery in Lagos fintechs",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "cand-002",
      "organization_id": "org-enterprise-01",
      "requisition_id": "req-001",
      "full_name": "Olawale Danladi",
      "email": "olawale.danladi@clouddev.ng",
      "phone": "+234 803 887 2233",
      "stage": "Offer Extended",
      "rating": 4.8,
      "notes": "Offer letter issued for Senior DevOps Lead position",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "cand-003",
      "organization_id": "org-enterprise-01",
      "requisition_id": "req-002",
      "full_name": "Zainab Sanusi",
      "email": "zainab.sanusi@hrpartners.ng",
      "phone": "+234 809 776 3344",
      "stage": "Technical Interview",
      "rating": 4.5,
      "notes": "Ex-Lead Recruiter at Interswitch",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "cand-004",
      "organization_id": "org-enterprise-01",
      "requisition_id": "req-003",
      "full_name": "Kelechi Nwosu",
      "email": "kelechi.nwosu@salesgrowth.ng",
      "phone": "+234 814 665 4455",
      "stage": "Screening",
      "rating": 4.3,
      "notes": "Proven B2B Enterprise banking client network",
      "created_at": "2026-10-08 21:53:06"
    }
  ],
  "onboarding_tasks": [
    {
      "id": "task-001",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-004",
      "title": "Submit NIN & Tax Identification Number (TIN)",
      "assigned_to_role": "Employee",
      "due_date": "2026-10-20",
      "status": "completed"
    },
    {
      "id": "task-002",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-004",
      "title": "Pension Reform Act (PFA) RSA Registration",
      "assigned_to_role": "Employee",
      "due_date": "2026-10-22",
      "status": "pending"
    },
    {
      "id": "task-003",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-004",
      "title": "Receive Corporate Laptop & YubiKey Token",
      "assigned_to_role": "IT Admin",
      "due_date": "2026-10-18",
      "status": "completed"
    },
    {
      "id": "task-004",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-007",
      "title": "NHIS HMO Healthcare Scheme Enrollment",
      "assigned_to_role": "HR Officer",
      "due_date": "2026-10-25",
      "status": "pending"
    }
  ],
  "goals": [
    {
      "id": "goal-001",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-004",
      "cycle_id": "cycle-2026-q3",
      "title": "Deploy CBN Compliance Open Banking API",
      "target_metric": "100% CBN Guidelines Met",
      "progress_pct": 85,
      "status": "in_progress"
    },
    {
      "id": "goal-002",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-004",
      "cycle_id": "cycle-2026-q3",
      "title": "Organize Mentorship for Junior Developers",
      "target_metric": "4 Developers Mentored",
      "progress_pct": 100,
      "status": "completed"
    },
    {
      "id": "goal-003",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-002",
      "cycle_id": "cycle-2026-q3",
      "title": "Implement Digital HRIS Self-Service",
      "target_metric": "95% Portal Adoption",
      "progress_pct": 90,
      "status": "in_progress"
    },
    {
      "id": "goal-004",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-007",
      "cycle_id": "cycle-2026-q3",
      "title": "Deliver Mobile Banking Micro-Frontend",
      "target_metric": "Released to App Store",
      "progress_pct": 75,
      "status": "in_progress"
    }
  ],
  "compensations": [
    {
      "id": "comp-001",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-001",
      "base_salary": 65000000.0,
      "currency": "NGN",
      "pay_frequency": "Monthly",
      "effective_from": "2024-01-01",
      "status": "active"
    },
    {
      "id": "comp-002",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-002",
      "base_salary": 36000000.0,
      "currency": "NGN",
      "pay_frequency": "Monthly",
      "effective_from": "2024-01-01",
      "status": "active"
    },
    {
      "id": "comp-003",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-003",
      "base_salary": 48000000.0,
      "currency": "NGN",
      "pay_frequency": "Monthly",
      "effective_from": "2024-01-01",
      "status": "active"
    },
    {
      "id": "comp-004",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-004",
      "base_salary": 30000000.0,
      "currency": "NGN",
      "pay_frequency": "Monthly",
      "effective_from": "2024-01-01",
      "status": "active"
    },
    {
      "id": "comp-005",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-005",
      "base_salary": 22000000.0,
      "currency": "NGN",
      "pay_frequency": "Monthly",
      "effective_from": "2024-01-01",
      "status": "active"
    },
    {
      "id": "comp-006",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-006",
      "base_salary": 26000000.0,
      "currency": "NGN",
      "pay_frequency": "Monthly",
      "effective_from": "2024-01-01",
      "status": "active"
    },
    {
      "id": "comp-007",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-007",
      "base_salary": 28000000.0,
      "currency": "NGN",
      "pay_frequency": "Monthly",
      "effective_from": "2024-01-01",
      "status": "active"
    },
    {
      "id": "comp-008",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-008",
      "base_salary": 25000000.0,
      "currency": "NGN",
      "pay_frequency": "Monthly",
      "effective_from": "2024-01-01",
      "status": "active"
    }
  ],
  "payroll_runs": [
    {
      "id": "pay-2026-09",
      "organization_id": "org-enterprise-01",
      "month": "September 2026",
      "total_payout": 23333333.333333332,
      "employee_count": 8,
      "status": "completed",
      "approved_by": "Emeka Nnamani",
      "processed_at": "2026-10-08 21:53:06"
    }
  ],
  "hr_cases": [
    {
      "id": "case-001",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-004",
      "category": "Equipment Upgrade",
      "subject": "Ergonomic Monitor & Inverter Support",
      "details": "Requesting additional backup UPS inverter and dual monitor for remote work in Lekki.",
      "priority": "Low",
      "status": "in_progress",
      "assigned_to": "emp-002",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "case-002",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-005",
      "category": "Benefits Inquiry",
      "subject": "HMO Dependent Coverage Inclusion",
      "details": "Need to add newborn infant into Hygeia HMO hospital tier coverage.",
      "priority": "Medium",
      "status": "resolved",
      "assigned_to": "emp-002",
      "created_at": "2026-10-08 21:53:06"
    }
  ],
  "documents": [
    {
      "id": "doc-001",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-004",
      "title": "Standard Employment Contract_Nigeria.pdf",
      "category": "Contracts",
      "file_path": "docs/employment_contract_oluwaseun.pdf",
      "size_kb": 450,
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "doc-002",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-004",
      "title": "Signed Code of Conduct & NDPR Data Compliance.pdf",
      "category": "Compliance",
      "file_path": "docs/ndpr_consent_004.pdf",
      "size_kb": 210,
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "doc-003",
      "organization_id": "org-enterprise-01",
      "employee_id": null,
      "title": "Apex Nigeria 2026 Employee Handbook.pdf",
      "category": "Company Policy",
      "file_path": "docs/handbook_nigeria_2026.pdf",
      "size_kb": 1420,
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "doc-004",
      "organization_id": "org-enterprise-01",
      "employee_id": "emp-002",
      "title": "PAYE & Tax Exemption Certificate.pdf",
      "category": "Tax & Identity",
      "file_path": "docs/firs_tax_clearance.pdf",
      "size_kb": 320,
      "created_at": "2026-10-08 21:53:06"
    }
  ],
  "audit_events": [
    {
      "id": "aud-001",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "INITIALIZATION",
      "resource_type": "ORGANIZATION",
      "resource_id": "org-enterprise-01",
      "details": "Initialized Apex Nigeria enterprise database with NGN currency, WAT timezone, and localized Nigerian structures.",
      "created_at": "2026-10-08 21:53:06"
    },
    {
      "id": "12a4df57-ddbe-4f40-89f0-48544f102950",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "LOGIN",
      "resource_type": "USER",
      "resource_id": "usr-admin",
      "details": "User logged into system",
      "created_at": "2026-10-08 21:58:21"
    },
    {
      "id": "06115a57-a11e-423f-8377-b7aa16c43e4f",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "ATTENDANCE_EVENT",
      "resource_type": "ATTENDANCE",
      "resource_id": "9a782aa4-936a-4afa-9e54-2197b70d2d38",
      "details": "CLOCK_IN registered for employee emp-001",
      "created_at": "2026-10-08 21:58:34"
    },
    {
      "id": "35c55cfa-b0ea-4c06-98e1-5da6f6c09288",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "STAGE_UPDATE",
      "resource_type": "CANDIDATE",
      "resource_id": "cand-004",
      "details": "Candidate moved to stage: Screening",
      "created_at": "2026-10-08 21:59:11"
    },
    {
      "id": "0d122201-70ae-4ba2-8e23-df7d31ff28e9",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "STAGE_UPDATE",
      "resource_type": "CANDIDATE",
      "resource_id": "cand-003",
      "details": "Candidate moved to stage: Technical Interview",
      "created_at": "2026-10-08 21:59:22"
    },
    {
      "id": "cd6c90b7-f77c-4f85-839c-7fa05c9fd8dc",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "LOGIN",
      "resource_type": "USER",
      "resource_id": "usr-admin",
      "details": "User logged into system",
      "created_at": "2026-10-08 22:01:49"
    },
    {
      "id": "dbd1f2e8-5a03-4ded-8d06-ca39b9e61099",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "LOGIN",
      "resource_type": "USER",
      "resource_id": "usr-admin",
      "details": "User logged into system",
      "created_at": "2026-10-09 11:19:55"
    },
    {
      "id": "47a4edf1-5955-41fc-a504-68ca39e125d2",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "LOGIN",
      "resource_type": "SESSION",
      "resource_id": "09dfc1ef-1575-4ca3-a81e-3795cc047a0c",
      "details": "Staff signed in: Babatunde Adeyemi (admin) [Role: Admin]",
      "created_at": "2026-10-09 11:30:01"
    },
    {
      "id": "67791073-6019-422a-8565-59e3f325c22d",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "LOGIN",
      "resource_type": "SESSION",
      "resource_id": "f90485d7-3fa5-4f62-b3ae-e9f4820dd7fb",
      "details": "Staff signed in: Babatunde Adeyemi (admin) [Role: Admin]",
      "created_at": "2026-10-09 11:30:31"
    },
    {
      "id": "b8fe7822-bc57-42e3-bc65-e2e99c814022",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "LOGOUT",
      "resource_type": "SESSION",
      "resource_id": "0cb035b8-8fdb-4cd7-9c7c-994284c908d4",
      "details": "User admin logged out and terminated session.",
      "created_at": "2026-10-09 11:30:55"
    },
    {
      "id": "1ffd9440-dbf2-41d0-b4c0-ad7f88e53fdb",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "LOGIN",
      "resource_type": "SESSION",
      "resource_id": "22ab8d50-6e1c-4db3-9966-1553db734a82",
      "details": "Staff signed in: Babatunde Adeyemi (admin) [Role: Admin]",
      "created_at": "2026-10-09 11:31:14"
    },
    {
      "id": "f72eb4af-a87f-4291-b39a-1d82bc02ec75",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "LOGOUT",
      "resource_type": "SESSION",
      "resource_id": "22ab8d50-6e1c-4db3-9966-1553db734a82",
      "details": "User admin logged out and terminated session.",
      "created_at": "2026-10-09 11:31:19"
    },
    {
      "id": "b35a1e28-3169-498d-b18c-1bbcd12adcc2",
      "organization_id": "org-enterprise-01",
      "actor_username": "hr_manager",
      "event_type": "LOGIN",
      "resource_type": "SESSION",
      "resource_id": "1a0fae91-aa2a-41e4-9047-c6ba03008360",
      "details": "Staff signed in: Ngozi Okonkwo (hr_manager) [Role: HR Manager]",
      "created_at": "2026-10-09 11:31:29"
    },
    {
      "id": "3ac06217-0a46-4675-8143-1f59700f1b3a",
      "organization_id": "org-enterprise-01",
      "actor_username": "hr_manager",
      "event_type": "LOGOUT",
      "resource_type": "SESSION",
      "resource_id": "1a0fae91-aa2a-41e4-9047-c6ba03008360",
      "details": "User hr_manager logged out and terminated session.",
      "created_at": "2026-10-09 11:31:36"
    },
    {
      "id": "b528bb32-633d-4166-9002-639f9a943a53",
      "organization_id": "org-enterprise-01",
      "actor_username": "payroll",
      "event_type": "LOGIN",
      "resource_type": "SESSION",
      "resource_id": "c1e613b8-3a3b-46d4-a8ed-3a5db8b278da",
      "details": "Staff signed in: Emeka Nnamani (payroll) [Role: Payroll/Finance]",
      "created_at": "2026-10-09 11:31:43"
    },
    {
      "id": "e746b344-ede7-4edd-a7e7-a000f728df1f",
      "organization_id": "org-enterprise-01",
      "actor_username": "payroll",
      "event_type": "LOGOUT",
      "resource_type": "SESSION",
      "resource_id": "c1e613b8-3a3b-46d4-a8ed-3a5db8b278da",
      "details": "User payroll logged out and terminated session.",
      "created_at": "2026-10-09 11:31:52"
    },
    {
      "id": "e4ffdcd3-bd52-4d83-a5ab-e23f04716b11",
      "organization_id": "org-enterprise-01",
      "actor_username": "employee",
      "event_type": "LOGIN",
      "resource_type": "SESSION",
      "resource_id": "d4213ccb-b6d1-4d88-abc0-5031ef9b37a3",
      "details": "Staff signed in: Oluwaseun Balogun (employee) [Role: Employee]",
      "created_at": "2026-10-09 11:32:01"
    },
    {
      "id": "a9bb903a-91c0-4e12-b8b5-7b1e0bc40672",
      "organization_id": "org-enterprise-01",
      "actor_username": "employee",
      "event_type": "LOGOUT",
      "resource_type": "SESSION",
      "resource_id": "d4213ccb-b6d1-4d88-abc0-5031ef9b37a3",
      "details": "User employee logged out and terminated session.",
      "created_at": "2026-10-09 11:32:59"
    },
    {
      "id": "684baa06-2a5a-4ade-9907-2d3e3117fae7",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "LOGIN",
      "resource_type": "SESSION",
      "resource_id": "206ff65f-a310-4899-af05-5dcdc484baee",
      "details": "Staff signed in: Babatunde Adeyemi (admin) [Role: Admin]",
      "created_at": "2026-10-09 11:33:10"
    },
    {
      "id": "1a95386e-84f0-49f0-98d7-acee9719c4ba",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "UPDATE_PROGRESS",
      "resource_type": "GOAL",
      "resource_id": "goal-002",
      "details": "Updated OKR milestone to 100%",
      "created_at": "2026-10-09 11:34:28"
    },
    {
      "id": "02dfc097-ae1f-41fe-b4df-6e20352a8a28",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "UPDATE_PROGRESS",
      "resource_type": "GOAL",
      "resource_id": "goal-003",
      "details": "Updated OKR milestone to 90%",
      "created_at": "2026-10-09 11:34:33"
    },
    {
      "id": "34946f68-0524-4939-890b-890e1c5cb24d",
      "organization_id": "org-enterprise-01",
      "actor_username": "admin",
      "event_type": "UPDATE_PROGRESS",
      "resource_type": "GOAL",
      "resource_id": "goal-003",
      "details": "Updated OKR milestone to 90%",
      "created_at": "2026-10-09 11:34:37"
    }
  ]
};
