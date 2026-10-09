"""
Enterprise HR Management System - Backend Server
Full RESTful API server with mandatory zero-trust authentication
"""
import http.server
import socketserver
import json
import urllib.parse
import uuid
import datetime
import sqlite3
import hashlib
import os

from db import get_connection, hash_pw, DB_FILE

PORT = 8080

# Supabase Credentials
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://npjmcwjpfuxhcyvczitx.supabase.co")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_iGa1xQ95bT2Lj4meMsmtPg_xRLYHBmX")

def dict_from_row(row):
    if not row:
        return None
    return {k: row[k] for k in row.keys()}

def json_response(handler, status_code, data):
    handler.send_response(status_code)
    handler.send_header('Content-Type', 'application/json')
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    handler.end_headers()
    handler.wfile.write(json.dumps(data, default=str).encode('utf-8'))

def error_response(handler, status_code, message):
    json_response(handler, status_code, {"error": True, "message": message})

def audit_log(conn, org_id, actor, event_type, resource_type, resource_id, details):
    c = conn.cursor()
    c.execute("""
    INSERT INTO audit_events (id, organization_id, actor_username, event_type, resource_type, resource_id, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, (str(uuid.uuid4()), org_id, actor, event_type, resource_type, resource_id, details))

def get_auth_user(handler, conn):
    auth_header = handler.headers.get('Authorization')
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    c = conn.cursor()
    c.execute("""
    SELECT s.user_id, s.organization_id, s.role, u.username, u.employee_id,
           e.first_name, e.last_name, e.email
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP
    """, (token,))
    row = c.fetchone()
    if row:
        return dict_from_row(row)
    return None

class HRRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Serve Frontend Assets
        if path == '/' or path == '/index.html':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            with open('index.html', 'rb') as f:
                self.wfile.write(f.read())
            return
        elif path == '/app.js':
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript')
            self.end_headers()
            with open('app.js', 'rb') as f:
                self.wfile.write(f.read())
            return

        # API Routes
        if not path.startswith('/api/'):
            super().do_GET()
            return

        conn = get_connection()
        user = get_auth_user(self, conn)

        # /api/me
        if path == '/api/me':
            if not user:
                error_response(self, 401, "Authentication required. Please sign in.")
            else:
                json_response(self, 200, user)
            conn.close()
            return

        # Mandatory Authentication for all other API routes
        if not user:
            error_response(self, 401, "Unauthorized: You must log in to access this resource.")
            conn.close()
            return

        # /api/dashboard/stats
        if path == '/api/dashboard/stats':
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM employees WHERE status = 'active'")
            total_emps = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'")
            pending_leaves = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM requisitions WHERE status = 'open'")
            open_jobs = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM hr_cases WHERE status = 'open' OR status = 'in_progress'")
            open_cases = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM candidates")
            total_candidates = c.fetchone()[0]

            today = datetime.date.today().isoformat()
            c.execute("SELECT COUNT(DISTINCT employee_id) FROM attendance_events WHERE date = ?", (today,))
            clocked_in_today = c.fetchone()[0]

            json_response(self, 200, {
                "total_employees": total_emps,
                "pending_leaves": pending_leaves,
                "open_jobs": open_jobs,
                "open_cases": open_cases,
                "total_candidates": total_candidates,
                "clocked_in_today": clocked_in_today
            })
            conn.close()
            return

        # /api/employees/{id}
        if path.startswith('/api/employees/') and len(path.split('/')) == 4:
            emp_id = path.split('/')[3]
            c = conn.cursor()
            c.execute("""
            SELECT e.*, d.name as department_name, p.title as position_title, l.name as location_name,
                   m.first_name as manager_first_name, m.last_name as manager_last_name,
                   comp.base_salary, comp.currency as salary_currency
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN positions p ON e.position_id = p.id
            LEFT JOIN locations l ON e.location_id = l.id
            LEFT JOIN employees m ON e.manager_id = m.id
            LEFT JOIN compensations comp ON e.id = comp.employee_id AND comp.status = 'active'
            WHERE e.id = ?
            """, (emp_id,))
            row = c.fetchone()
            if not row:
                error_response(self, 404, "Employee not found")
            else:
                emp_data = dict_from_row(row)
                c.execute("SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC LIMIT 5", (emp_id,))
                emp_data['leaves'] = [dict_from_row(r) for r in c.fetchall()]
                c.execute("SELECT * FROM goals WHERE employee_id = ?", (emp_id,))
                emp_data['goals'] = [dict_from_row(r) for r in c.fetchall()]
                c.execute("SELECT * FROM onboarding_tasks WHERE employee_id = ? ORDER BY due_date ASC", (emp_id,))
                emp_data['tasks'] = [dict_from_row(r) for r in c.fetchall()]
                json_response(self, 200, emp_data)
            conn.close()
            return

        # /api/employees
        if path == '/api/employees':
            c = conn.cursor()
            c.execute("""
            SELECT e.*, d.name as department_name, p.title as position_title, l.name as location_name
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN positions p ON e.position_id = p.id
            LEFT JOIN locations l ON e.location_id = l.id
            ORDER BY e.employee_number ASC
            """)
            employees = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, employees)
            conn.close()
            return

        # /api/departments
        if path == '/api/departments':
            c = conn.cursor()
            c.execute("SELECT * FROM departments")
            depts = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, depts)
            conn.close()
            return

        # /api/positions
        if path == '/api/positions':
            c = conn.cursor()
            c.execute("SELECT * FROM positions")
            positions = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, positions)
            conn.close()
            return

        # /api/leave/requests
        if path == '/api/leave/requests':
            c = conn.cursor()
            c.execute("""
            SELECT lr.*, lt.name as leave_type_name, e.first_name, e.last_name, e.employee_number
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            JOIN employees e ON lr.employee_id = e.id
            ORDER BY lr.created_at DESC
            """)
            requests = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, requests)
            conn.close()
            return

        # /api/leave/types
        if path == '/api/leave/types':
            c = conn.cursor()
            c.execute("SELECT * FROM leave_types")
            ltypes = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, ltypes)
            conn.close()
            return

        # /api/attendance
        if path == '/api/attendance':
            c = conn.cursor()
            c.execute("""
            SELECT a.*, e.first_name, e.last_name, e.employee_number
            FROM attendance_events a
            JOIN employees e ON a.employee_id = e.id
            ORDER BY a.event_time DESC
            LIMIT 50
            """)
            events = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, events)
            conn.close()
            return

        # /api/recruitment/requisitions
        if path == '/api/recruitment/requisitions':
            c = conn.cursor()
            c.execute("""
            SELECT r.*, d.name as department_name, (SELECT COUNT(*) FROM candidates c WHERE c.requisition_id = r.id) as candidate_count
            FROM requisitions r
            JOIN departments d ON r.department_id = d.id
            ORDER BY r.created_at DESC
            """)
            reqs = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, reqs)
            conn.close()
            return

        # /api/recruitment/candidates
        if path == '/api/recruitment/candidates':
            c = conn.cursor()
            c.execute("""
            SELECT c.*, r.title as requisition_title
            FROM candidates c
            JOIN requisitions r ON c.requisition_id = r.id
            ORDER BY c.created_at DESC
            """)
            cands = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, cands)
            conn.close()
            return

        # /api/onboarding/tasks
        if path == '/api/onboarding/tasks':
            c = conn.cursor()
            c.execute("""
            SELECT t.*, e.first_name, e.last_name
            FROM onboarding_tasks t
            JOIN employees e ON t.employee_id = e.id
            ORDER BY t.status DESC, t.due_date ASC
            """)
            tasks = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, tasks)
            conn.close()
            return

        # /api/performance/goals
        if path == '/api/performance/goals':
            c = conn.cursor()
            c.execute("""
            SELECT g.*, e.first_name, e.last_name
            FROM goals g
            JOIN employees e ON g.employee_id = e.id
            ORDER BY g.progress_pct DESC
            """)
            goals = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, goals)
            conn.close()
            return

        # /api/payroll/runs
        if path == '/api/payroll/runs':
            c = conn.cursor()
            c.execute("SELECT * FROM payroll_runs ORDER BY processed_at DESC")
            runs = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, runs)
            conn.close()
            return

        # /api/payroll/compensations
        if path == '/api/payroll/compensations':
            c = conn.cursor()
            c.execute("""
            SELECT comp.*, e.first_name, e.last_name, e.employee_number, d.name as department_name, p.title as position_title
            FROM compensations comp
            JOIN employees e ON comp.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN positions p ON e.position_id = p.id
            ORDER BY comp.base_salary DESC
            """)
            comps = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, comps)
            conn.close()
            return

        # /api/cases
        if path == '/api/cases':
            c = conn.cursor()
            c.execute("""
            SELECT cs.*, e.first_name, e.last_name, e.employee_number
            FROM hr_cases cs
            JOIN employees e ON cs.employee_id = e.id
            ORDER BY cs.created_at DESC
            """)
            cases = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, cases)
            conn.close()
            return

        # /api/documents
        if path == '/api/documents':
            c = conn.cursor()
            c.execute("""
            SELECT doc.*, e.first_name, e.last_name
            FROM documents doc
            LEFT JOIN employees e ON doc.employee_id = e.id
            ORDER BY doc.created_at DESC
            """)
            docs = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, docs)
            conn.close()
            return

        # /api/audit/events
        if path == '/api/audit/events':
            c = conn.cursor()
            c.execute("SELECT * FROM audit_events ORDER BY created_at DESC LIMIT 100")
            events = [dict_from_row(r) for r in c.fetchall()]
            json_response(self, 200, events)
            conn.close()
            return

        error_response(self, 404, "Endpoint Not Found")
        conn.close()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get('Content-Length', 0))
        body_bytes = self.rfile.read(content_length)
        body = {}
        if body_bytes:
            try:
                body = json.loads(body_bytes.decode('utf-8'))
            except Exception:
                pass

        conn = get_connection()

        # Auth Login Route
        if path == '/api/auth/login':
            username = body.get('username', '').strip()
            password = body.get('password', '').strip()
            c = conn.cursor()
            pw_hash = hash_pw(password or '')
            c.execute("""
            SELECT u.*, e.first_name, e.last_name, e.employee_number
            FROM users u
            LEFT JOIN employees e ON u.employee_id = e.id
            WHERE u.username = ? AND u.password_hash = ? AND u.status = 'active'
            """, (username, pw_hash))
            user_row = c.fetchone()
            if not user_row:
                error_response(self, 401, "Invalid username or password. Access Denied.")
                conn.close()
                return

            user = dict_from_row(user_row)
            token = str(uuid.uuid4())
            exp = (datetime.datetime.now() + datetime.timedelta(days=7)).isoformat()
            c.execute("INSERT INTO sessions VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)",
                      (token, user['id'], user['organization_id'], user['role'], exp))
            c.execute("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?", (user['id'],))
            conn.commit()

            # Immutable audit logging of login event with actor tracking
            actor_name = f"{user.get('first_name') or ''} {user.get('last_name') or ''} ({user['username']})".strip()
            audit_log(conn, user['organization_id'], user['username'], "LOGIN", "SESSION", token, f"Staff signed in: {actor_name} [Role: {user['role']}]")
            conn.commit()

            json_response(self, 200, {
                "token": token,
                "user": {
                    "id": user['id'],
                    "username": user['username'],
                    "role": user['role'],
                    "employee_id": user['employee_id'],
                    "first_name": user.get('first_name'),
                    "last_name": user.get('last_name')
                }
            })
            conn.close()
            return

        # Auth Logout Route
        if path == '/api/auth/logout':
            auth_header = self.headers.get('Authorization')
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                user = get_auth_user(self, conn)
                c = conn.cursor()
                if user:
                    audit_log(conn, user['organization_id'], user['username'], "LOGOUT", "SESSION", token, f"User {user['username']} logged out and terminated session.")
                c.execute("DELETE FROM sessions WHERE token = ?", (token,))
                conn.commit()
            json_response(self, 200, {"success": True, "message": "Successfully logged out."})
            conn.close()
            return

        # Mandatory Authentication for all POST endpoints
        user = get_auth_user(self, conn)
        if not user:
            error_response(self, 401, "Unauthorized: Authentication required.")
            conn.close()
            return

        actor = user['username']
        org_id = user['organization_id']

        # /api/employees
        if path == '/api/employees':
            emp_id = str(uuid.uuid4())
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM employees")
            count = c.fetchone()[0] + 1001
            emp_num = f"EMP-{count}"

            c.execute("""
            INSERT INTO employees (id, organization_id, employee_number, first_name, last_name, email, phone, department_id, position_id, hire_date, employment_type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
            """, (emp_id, org_id, emp_num, body.get('first_name'), body.get('last_name'),
                  body.get('email'), body.get('phone'), body.get('department_id'),
                  body.get('position_id'), body.get('hire_date') or datetime.date.today().isoformat(),
                  body.get('employment_type') or 'Full-time'))

            salary = float(body.get('salary', 15000000))
            c.execute("""
            INSERT INTO compensations (id, organization_id, employee_id, base_salary, currency, pay_frequency, effective_from, status)
            VALUES (?, ?, ?, ?, 'NGN', 'Monthly', CURRENT_TIMESTAMP, 'active')
            """, (str(uuid.uuid4()), org_id, emp_id, salary))

            audit_log(conn, org_id, actor, "CREATE", "EMPLOYEE", emp_id, f"Created staff {emp_num} - {body.get('first_name')} {body.get('last_name')}")
            conn.commit()
            json_response(self, 201, {"success": True, "id": emp_id, "employee_number": emp_num})
            conn.close()
            return

        # /api/leave/requests
        if path == '/api/leave/requests':
            req_id = str(uuid.uuid4())
            c = conn.cursor()
            emp_id = body.get('employee_id') or (user['employee_id'] or 'emp-004')
            days = float(body.get('days', 1))
            c.execute("""
            INSERT INTO leave_requests (id, organization_id, employee_id, leave_type_id, start_date, end_date, days, reason, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            """, (req_id, org_id, emp_id, body.get('leave_type_id'), body.get('start_date'), body.get('end_date'), days, body.get('reason')))

            audit_log(conn, org_id, actor, "CREATE", "LEAVE_REQUEST", req_id, f"Submitted leave application for {days} days")
            conn.commit()
            json_response(self, 201, {"success": True, "id": req_id})
            conn.close()
            return

        # /api/leave/requests/{id}/action
        if path.startswith('/api/leave/requests/') and path.endswith('/action'):
            parts = path.split('/')
            req_id = parts[4]
            status = body.get('status', 'approved')
            note = body.get('note', '')
            c = conn.cursor()
            c.execute("UPDATE leave_requests SET status = ?, approved_by = ?, action_note = ? WHERE id = ?",
                      (status, actor, note, req_id))
            audit_log(conn, org_id, actor, "STATUS_UPDATE", "LEAVE_REQUEST", req_id, f"Marked leave request as {status}. Reason/Note: {note}")
            conn.commit()
            json_response(self, 200, {"success": True, "status": status})
            conn.close()
            return

        # /api/attendance/events
        if path == '/api/attendance/events':
            att_id = str(uuid.uuid4())
            c = conn.cursor()
            emp_id = body.get('employee_id') or (user['employee_id'] or 'emp-004')
            event_type = body.get('event_type', 'CLOCK_IN')
            now_iso = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            today_str = datetime.date.today().isoformat()
            c.execute("""
            INSERT INTO attendance_events (id, organization_id, employee_id, event_type, event_time, date, source)
            VALUES (?, ?, ?, ?, ?, ?, 'Staff Web Portal')
            """, (att_id, org_id, emp_id, event_type, now_iso, today_str))

            audit_log(conn, org_id, actor, "ATTENDANCE_EVENT", "ATTENDANCE", att_id, f"{event_type} registered by {actor}")
            conn.commit()
            json_response(self, 201, {"success": True, "event_time": now_iso, "event_type": event_type})
            conn.close()
            return

        # /api/recruitment/requisitions
        if path == '/api/recruitment/requisitions':
            req_id = str(uuid.uuid4())
            c = conn.cursor()
            c.execute("""
            INSERT INTO requisitions (id, organization_id, title, department_id, openings, status)
            VALUES (?, ?, ?, ?, ?, 'open')
            """, (req_id, org_id, body.get('title'), body.get('department_id'), int(body.get('openings', 1))))
            audit_log(conn, org_id, actor, "CREATE", "REQUISITION", req_id, f"Created Nigerian job vacancy: {body.get('title')}")
            conn.commit()
            json_response(self, 201, {"success": True, "id": req_id})
            conn.close()
            return

        # /api/recruitment/candidates
        if path == '/api/recruitment/candidates':
            cand_id = str(uuid.uuid4())
            c = conn.cursor()
            c.execute("""
            INSERT INTO candidates (id, organization_id, requisition_id, full_name, email, phone, stage, rating, notes)
            VALUES (?, ?, ?, ?, ?, ?, 'Applied', 0, ?)
            """, (cand_id, org_id, body.get('requisition_id'), body.get('full_name'), body.get('email'), body.get('phone'), body.get('notes', '')))
            audit_log(conn, org_id, actor, "CREATE", "CANDIDATE", cand_id, f"Applicant {body.get('full_name')} registered in talent pipeline")
            conn.commit()
            json_response(self, 201, {"success": True, "id": cand_id})
            conn.close()
            return

        # /api/recruitment/candidates/stage
        if path == '/api/recruitment/candidates/stage':
            cand_id = body.get('candidate_id')
            stage = body.get('stage')
            c = conn.cursor()
            c.execute("UPDATE candidates SET stage = ? WHERE id = ?", (stage, cand_id))
            audit_log(conn, org_id, actor, "STAGE_UPDATE", "CANDIDATE", cand_id, f"Candidate advanced to interview stage: {stage}")
            conn.commit()
            json_response(self, 200, {"success": True, "stage": stage})
            conn.close()
            return

        # /api/onboarding/tasks/toggle
        if path == '/api/onboarding/tasks/toggle':
            task_id = body.get('task_id')
            status = body.get('status', 'completed')
            c = conn.cursor()
            c.execute("UPDATE onboarding_tasks SET status = ? WHERE id = ?", (status, task_id))
            audit_log(conn, org_id, actor, "UPDATE", "ONBOARDING_TASK", task_id, f"Onboarding checklist task marked as {status}")
            conn.commit()
            json_response(self, 200, {"success": True, "status": status})
            conn.close()
            return

        # /api/onboarding/tasks
        if path == '/api/onboarding/tasks':
            task_id = str(uuid.uuid4())
            c = conn.cursor()
            c.execute("""
            INSERT INTO onboarding_tasks (id, organization_id, employee_id, title, assigned_to_role, due_date, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
            """, (task_id, org_id, body.get('employee_id'), body.get('title'), body.get('assigned_to_role', 'Employee'), body.get('due_date')))
            audit_log(conn, org_id, actor, "CREATE", "ONBOARDING_TASK", task_id, f"Added compliance onboarding task: {body.get('title')}")
            conn.commit()
            json_response(self, 201, {"success": True, "id": task_id})
            conn.close()
            return

        # /api/payroll/run
        if path == '/api/payroll/run':
            run_id = str(uuid.uuid4())
            c = conn.cursor()
            c.execute("SELECT SUM(base_salary) / 12, COUNT(*) FROM compensations WHERE status = 'active'")
            res = c.fetchone()
            total_payout = res[0] or 0.0
            emp_count = res[1] or 0
            month_label = body.get('month', datetime.datetime.now().strftime("%B %Y"))

            c.execute("""
            INSERT INTO payroll_runs (id, organization_id, month, total_payout, employee_count, status, approved_by, processed_at)
            VALUES (?, ?, ?, ?, ?, 'completed', ?, CURRENT_TIMESTAMP)
            """, (run_id, org_id, month_label, total_payout, emp_count, actor))
            audit_log(conn, org_id, actor, "PAYROLL_RUN", "PAYROLL", run_id, f"Processed monthly salary disbursement for {month_label} totaling NGN {total_payout:,.2f}")
            conn.commit()
            json_response(self, 201, {"success": True, "id": run_id, "total_payout": total_payout, "count": emp_count})
            conn.close()
            return

        # /api/cases
        if path == '/api/cases':
            case_id = str(uuid.uuid4())
            c = conn.cursor()
            emp_id = body.get('employee_id') or (user['employee_id'] or 'emp-004')
            c.execute("""
            INSERT INTO hr_cases (id, organization_id, employee_id, category, subject, details, priority, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'open')
            """, (case_id, org_id, emp_id, body.get('category'), body.get('subject'), body.get('details'), body.get('priority', 'Medium')))
            audit_log(conn, org_id, actor, "CREATE", "HR_CASE", case_id, f"Filed workplace ticket: {body.get('subject')}")
            conn.commit()
            json_response(self, 201, {"success": True, "id": case_id})
            conn.close()
            return

        # /api/cases/status
        if path == '/api/cases/status':
            case_id = body.get('case_id')
            status = body.get('status', 'resolved')
            c = conn.cursor()
            c.execute("UPDATE hr_cases SET status = ? WHERE id = ?", (status, case_id))
            audit_log(conn, org_id, actor, "STATUS_UPDATE", "HR_CASE", case_id, f"Workplace case marked as {status}")
            conn.commit()
            json_response(self, 200, {"success": True, "status": status})
            conn.close()
            return

        # /api/performance/goals
        if path == '/api/performance/goals':
            goal_id = str(uuid.uuid4())
            c = conn.cursor()
            emp_id = body.get('employee_id') or (user['employee_id'] or 'emp-004')
            c.execute("""
            INSERT INTO goals (id, organization_id, employee_id, cycle_id, title, target_metric, progress_pct, status)
            VALUES (?, ?, ?, 'cycle-2026-q3', ?, ?, 0, 'in_progress')
            """, (goal_id, org_id, emp_id, body.get('title'), body.get('target_metric')))
            audit_log(conn, org_id, actor, "CREATE", "GOAL", goal_id, f"Created performance objective: {body.get('title')}")
            conn.commit()
            json_response(self, 201, {"success": True, "id": goal_id})
            conn.close()
            return

        # /api/performance/goals/progress
        if path == '/api/performance/goals/progress':
            goal_id = body.get('goal_id')
            pct = int(body.get('progress_pct', 0))
            status = 'completed' if pct >= 100 else 'in_progress'
            c = conn.cursor()
            c.execute("UPDATE goals SET progress_pct = ?, status = ? WHERE id = ?", (pct, status, goal_id))
            audit_log(conn, org_id, actor, "UPDATE_PROGRESS", "GOAL", goal_id, f"Updated OKR milestone to {pct}%")
            conn.commit()
            json_response(self, 200, {"success": True, "progress_pct": pct})
            conn.close()
            return

        # /api/documents
        if path == '/api/documents':
            doc_id = str(uuid.uuid4())
            c = conn.cursor()
            emp_id = body.get('employee_id')
            c.execute("""
            INSERT INTO documents (id, organization_id, employee_id, title, category, file_path, size_kb)
            VALUES (?, ?, ?, ?, ?, 'vault/' || ?, 350)
            """, (doc_id, org_id, emp_id, body.get('title'), body.get('category', 'Company Policy'), body.get('title')))
            audit_log(conn, org_id, actor, "UPLOAD", "DOCUMENT", doc_id, f"Uploaded compliance document: {body.get('title')}")
            conn.commit()
            json_response(self, 201, {"success": True, "id": doc_id})
            conn.close()
            return

        error_response(self, 404, "Endpoint Not Found")
        conn.close()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), HRRequestHandler) as httpd:
        print(f"Apex Nigeria HRMS Server running at http://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    run_server()
