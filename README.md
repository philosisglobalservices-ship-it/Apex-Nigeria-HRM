# Enterprise HR Management System (HRMS)

This application has been built from the **Enterprise HR Master PRD & Technical Specification v2.0** (`ENTERPRISE_HR_MASTER_PRD_TECHNICAL_SPECIFICATION.docx`).

---

## 🚀 Live Access

The application server is actively running at:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 🛠️ System Modules Built & Available

1. **Executive Dashboard**: Real-time KPI counters (active headcount, clocked-in employees, pending leaves, open ATS positions, unresolved HR inquiries).
2. **Employee Directory (Master Records)**: Effective-dated employee profiles, department mapping, position grades, and employee numbers (`EMP-XXXX`).
3. **Leave & Absence Management**: Vacation, medical, and parental leave balances, submission forms, and multi-step approval/rejection workflows.
4. **Time & Attendance**: Real-time clock-in/out timestamps, automatic source tracing, and live attendance audit logs.
5. **Recruitment / ATS**: Multi-stage hiring pipeline Kanban board (Applied &rarr; Screening &rarr; Technical Interview &rarr; Offer Extended), job requisitions, and candidate application flow.
6. **Onboarding Checklists**: Tasks, assigned owners, and due-date tracking for new hires.
7. **Performance & Goals**: Objective tracking with real-time percentage completion progress bars.
8. **Compensation & Payroll Engine**: Base salary structures, automated payroll batch executions with approval sign-offs, and historical payout records.
9. **HR Relations & Case Ticketing**: Confidential grievance reporting, category classifications, and priority assignment.
10. **Document Vault**: Encrypted personnel contracts, company policies, and access control.
11. **Immutable Audit Trail**: Append-only security log tracking actor, event action, resource type, and timestamps.

---

## 🧑‍💻 Default Accounts & Credentials

| Role | Username | Password |
|---|---|---|
| **System Administrator** | `admin` | `password123` |
| **HR Director** | `hr_manager` | `password123` |
| **Engineering Manager** | `manager` | `password123` |
| **Senior Engineer (Employee)** | `employee` | `password123` |
| **Payroll Lead** | `payroll` | `password123` |

---

## 📂 Source Code Structure

- [db.py](file:///c:/Users/User/Desktop/HRM%20Management/db.py): SQLite schema, multi-tenant tables, and enterprise seed data.
- [server.py](file:///c:/Users/User/Desktop/HRM%20Management/server.py): Zero-dependency REST API server with session tokens, audit logging, and CRUD endpoints.
- [index.html](file:///c:/Users/User/Desktop/HRM%20Management/index.html): Responsive single-page interface with enterprise design system.
- [app.js](file:///c:/Users/User/Desktop/HRM%20Management/app.js): Dynamic client-side routing, modals, Kanban board interactions, and API integration.
