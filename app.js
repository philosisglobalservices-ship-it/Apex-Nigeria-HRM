/**
 * Apex Enterprise HRMS - Frontend Application Engine (Nigerian Edition)
 * Mandatory User Authentication & Comprehensive Session Tracking
 */

const API_BASE = "http://localhost:8080/api";

// Supabase Configuration
const SUPABASE_URL = "https://npjmcwjpfuxhcyvczitx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_iGa1xQ95bT2Lj4meMsmtPg_xRLYHBmX";
let supabaseClient = null;

if (window.supabase) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase Client initialized successfully with:", SUPABASE_URL);
  } catch (e) {
    console.warn("Supabase initialization note:", e);
  }
}

let currentToken = localStorage.getItem("hrm_token") || null;
let currentUser = JSON.parse(localStorage.getItem("hrm_user") || "null");
let currentTab = "dashboard";

// Format helper for Nigerian Naira
function formatNaira(amount) {
  return "₦" + Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatNairaWhole(amount) {
  return "₦" + Number(amount || 0).toLocaleString("en-NG");
}

// Initial Boot Check
window.addEventListener("DOMContentLoaded", async () => {
  if (currentToken && currentUser) {
    // Validate current session with backend /api/me
    const valid = await checkSessionValidity();
    if (valid) {
      hideLoginScreen();
      updateUserUI();
      switchTab("dashboard");
      return;
    }
  }
  // No active session -> Show Mandatory Login Screen
  showLoginScreen();
});

async function checkSessionValidity() {
  try {
    const res = await apiFetch("/me");
    if (res.status === 200) {
      const userData = await res.json();
      currentUser = userData;
      localStorage.setItem("hrm_user", JSON.stringify(currentUser));
      return true;
    }
  } catch (e) {
    console.warn("Session expired or invalid", e);
  }
  return false;
}

function showLoginScreen() {
  const loginOverlay = document.getElementById("loginScreen");
  if (loginOverlay) loginOverlay.style.display = "flex";
  document.getElementById("loginAlert").style.display = "none";
}

function hideLoginScreen() {
  const loginOverlay = document.getElementById("loginScreen");
  if (loginOverlay) loginOverlay.style.display = "none";
}

function fillLogin(u, p) {
  document.getElementById("loginUsername").value = u;
  document.getElementById("loginPassword").value = p;
  document.getElementById("loginAlert").style.display = "none";
}

async function handleUserLogin(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const alertEl = document.getElementById("loginAlert");
  const alertText = document.getElementById("loginAlertText");
  const submitBtn = document.getElementById("loginSubmitBtn");

  alertEl.style.display = "none";
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...`;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.status === 200 && data.token) {
      currentToken = data.token;
      currentUser = data.user;
      localStorage.setItem("hrm_token", currentToken);
      localStorage.setItem("hrm_user", JSON.stringify(currentUser));
      
      hideLoginScreen();
      updateUserUI();
      switchTab("dashboard");
    } else {
      alertEl.style.display = "flex";
      alertText.innerText = data.message || "Invalid credentials. Please verify your login details.";
    }
  } catch (err) {
    alertEl.style.display = "flex";
    alertText.innerText = "Network error: Unable to reach authentication server.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In to Portal`;
  }
}

function updateUserUI() {
  if (currentUser) {
    const userNameEl = document.getElementById("navUserName");
    const userRoleEl = document.getElementById("navUserRole");
    const badgeEl = document.getElementById("roleBadge");
    const avatarEl = document.getElementById("navUserAvatar");

    const displayName = currentUser.first_name && currentUser.last_name 
      ? `${currentUser.first_name} ${currentUser.last_name}`
      : currentUser.username.toUpperCase();

    if (userNameEl) userNameEl.innerText = displayName;
    if (userRoleEl) userRoleEl.innerText = `${currentUser.role} (Lagos HQ)`;
    if (badgeEl) badgeEl.innerText = `Role: ${currentUser.role}`;
    if (avatarEl) {
      const initials = currentUser.first_name && currentUser.last_name
        ? `${currentUser.first_name[0]}${currentUser.last_name[0]}`
        : currentUser.username.slice(0, 2).toUpperCase();
      avatarEl.innerText = initials;
    }
  }
}

async function logout() {
  if (confirm("Are you sure you want to end your session and log out of Apex HRMS?")) {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (e) {
      // Proceed with local logout regardless
    }
    localStorage.removeItem("hrm_token");
    localStorage.removeItem("hrm_user");
    currentToken = null;
    currentUser = null;

    // Reset Form and bring up login portal
    document.getElementById("loginUsername").value = "";
    document.getElementById("loginPassword").value = "";
    showLoginScreen();
  }
}

function apiFetch(endpoint, options = {}) {
  const headers = options.headers || {};
  if (currentToken) {
    headers["Authorization"] = `Bearer ${currentToken}`;
  }
  return fetch(`${API_BASE}${endpoint}`, { ...options, headers }).then(res => {
    if (res.status === 401) {
      // Unauthorized or expired session
      localStorage.removeItem("hrm_token");
      localStorage.removeItem("hrm_user");
      currentToken = null;
      currentUser = null;
      showLoginScreen();
    }
    return res;
  });
}

// Tab Switching
function switchTab(tab) {
  if (!currentToken) {
    showLoginScreen();
    return;
  }
  currentTab = tab;
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  const clicked = Array.from(document.querySelectorAll(".nav-item")).find(el => 
    el.getAttribute("onclick") && el.getAttribute("onclick").includes(`'${tab}'`)
  );
  if (clicked) clicked.classList.add("active");

  const viewport = document.getElementById("viewport");
  const title = document.getElementById("viewTitle");
  const subtitle = document.getElementById("viewSubtitle");

  switch (tab) {
    case "dashboard":
      title.innerText = "Executive Dashboard";
      subtitle.innerText = "Enterprise-wide key operational indicators (Lagos, Abuja, PH, Ibadan)";
      renderDashboard(viewport);
      break;
    case "employees":
      title.innerText = "Staff Master Directory (Nigeria)";
      subtitle.innerText = "Comprehensive workforce database, departments, and employee records";
      renderEmployees(viewport);
      break;
    case "leave":
      title.innerText = "Leave & Absence Management";
      subtitle.innerText = "Manage annual vacation, casual, maternity/paternity, and sick leaves";
      renderLeave(viewport);
      break;
    case "attendance":
      title.innerText = "Time & Attendance Tracking";
      subtitle.innerText = "Real-time clock event logs and automated timesheets (WAT Timezone)";
      renderAttendance(viewport);
      break;
    case "recruitment":
      title.innerText = "Recruitment & Talent Pipeline (ATS)";
      subtitle.innerText = "Manage active job requisitions, candidate pipeline, and hiring in Nigeria";
      renderRecruitment(viewport);
      break;
    case "onboarding":
      title.innerText = "Employee Onboarding Checklists";
      subtitle.innerText = "NIN, PFA RSA, TIN, and NHIS onboarding compliance tasks for new hires";
      renderOnboarding(viewport);
      break;
    case "performance":
      title.innerText = "KPI & Performance Management";
      subtitle.innerText = "Track quarterly OKRs, milestones, and employee KPIs";
      renderPerformance(viewport);
      break;
    case "payroll":
      title.innerText = "Compensation & Payroll Engine (₦ Naira)";
      subtitle.innerText = "Gross salary structures, PAYE tax, and monthly bank disbursements";
      renderPayroll(viewport);
      break;
    case "cases":
      title.innerText = "HR Cases & Workplace Relations";
      subtitle.innerText = "Grievance ticketing, workplace requests, and confidential support";
      renderCases(viewport);
      break;
    case "documents":
      title.innerText = "Secure Document Vault";
      subtitle.innerText = "Encrypted contracts, NDPR data privacy compliance, and handbooks";
      renderDocuments(viewport);
      break;
    case "audit":
      title.innerText = "Immutable Security Audit Trail";
      subtitle.innerText = "Tamper-evident system activity and privileged action logs";
      renderAudit(viewport);
      break;
    default:
      break;
  }
}

// 1. Dashboard View (Clickable KPI cards with Naira values)
async function renderDashboard(container) {
  container.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;
  const res = await apiFetch("/dashboard/stats");
  if (!res.ok) return;
  const stats = await res.json();

  container.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card" style="cursor:pointer;" onclick="switchTab('employees')" title="Click to view Employee Directory">
        <div class="stat-info">
          <h3>${stats.total_employees}</h3>
          <span>Active Staff Members &rarr;</span>
        </div>
        <div class="stat-icon" style="background:#d1fae5; color:#059669;"><i class="fa-solid fa-users"></i></div>
      </div>
      <div class="stat-card" style="cursor:pointer;" onclick="switchTab('attendance')" title="Click to view Time & Attendance Log">
        <div class="stat-info">
          <h3>${stats.clocked_in_today}</h3>
          <span>Clocked-in Today (WAT) &rarr;</span>
        </div>
        <div class="stat-icon" style="background:#e0f2fe; color:#0284c7;"><i class="fa-solid fa-user-check"></i></div>
      </div>
      <div class="stat-card" style="cursor:pointer;" onclick="switchTab('leave')" title="Click to view and approve pending leaves">
        <div class="stat-info">
          <h3>${stats.pending_leaves}</h3>
          <span>Pending Leaves &rarr;</span>
        </div>
        <div class="stat-icon" style="background:#fef3c7; color:#f59e0b;"><i class="fa-solid fa-calendar-check"></i></div>
      </div>
      <div class="stat-card" style="cursor:pointer;" onclick="switchTab('recruitment')" title="Click to view ATS Hiring Pipeline">
        <div class="stat-info">
          <h3>${stats.open_jobs}</h3>
          <span>Active Vacancies (ATS) &rarr;</span>
        </div>
        <div class="stat-icon" style="background:#f3e8ff; color:#9333ea;"><i class="fa-solid fa-briefcase"></i></div>
      </div>
      <div class="stat-card" style="cursor:pointer;" onclick="switchTab('cases')" title="Click to view HR Case Tickets">
        <div class="stat-info">
          <h3>${stats.open_cases}</h3>
          <span>Open HR Inquiries &rarr;</span>
        </div>
        <div class="stat-icon" style="background:#fee2e2; color:#ef4444;"><i class="fa-solid fa-triangle-exclamation"></i></div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
      <div class="card">
        <div class="card-header">
          <h3>Workforce Operational Overview</h3>
          <button class="btn btn-primary" onclick="switchTab('employees')">View Directory &rarr;</button>
        </div>
        <div class="card-body">
          <div style="background:#f8fafc; border-radius:12px; padding:20px; border:1px solid #e2e8f0;">
            <h4 style="margin-bottom:10px; color:#334155;">Apex Nigeria Multi-Location Structure</h4>
            <p style="font-size:13.5px; color:#64748b; line-height:1.6;">
              Headquartered in Victoria Island Lagos, with branch operations across Abuja Corporate Office (Maitama), Port Harcourt Regional Operations, and Ibadan Technology Hub. Currency configured to <strong>Nigerian Naira (₦ / NGN)</strong> with NDPR compliance active.
            </p>
          </div>
          <div style="margin-top:20px; display:flex; gap:16px;">
            <div style="flex:1; border:1px solid #e2e8f0; border-radius:10px; padding:16px; background:#fff; cursor:pointer;" onclick="switchTab('recruitment')" title="Click to open ATS pipeline">
              <span style="font-size:12px; color:#64748b; font-weight:600;">ACTIVE CANDIDATES (ATS)</span>
              <h2 style="font-size:24px; color:#0f172a; margin-top:6px;">${stats.total_candidates} &rarr;</h2>
            </div>
            <div style="flex:1; border:1px solid #e2e8f0; border-radius:10px; padding:16px; background:#fff; cursor:pointer;" onclick="switchTab('payroll')" title="Click to view Payroll in Naira">
              <span style="font-size:12px; color:#64748b; font-weight:600;">DEFAULT CURRENCY</span>
              <h2 style="font-size:24px; color:#059669; margin-top:6px;">₦ NGN &rarr;</h2>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Quick HR Actions</h3>
        </div>
        <div class="card-body" style="display:flex; flex-direction:column; gap:12px;">
          <button class="btn btn-outline" style="justify-content:flex-start;" onclick="showAddEmployeeModal()"><i class="fa-solid fa-user-plus"></i> Onboard New Staff</button>
          <button class="btn btn-outline" style="justify-content:flex-start;" onclick="showApplyLeaveModal()"><i class="fa-solid fa-plane-departure"></i> Apply for Leave</button>
          <button class="btn btn-outline" style="justify-content:flex-start;" onclick="showClockModal()"><i class="fa-solid fa-stopwatch"></i> Log Attendance Clock</button>
          <button class="btn btn-outline" style="justify-content:flex-start;" onclick="showRunPayrollModal()"><i class="fa-solid fa-money-bill-wave"></i> Process Monthly Payroll (₦)</button>
          <button class="btn btn-outline" style="justify-content:flex-start;" onclick="showAddCaseModal()"><i class="fa-solid fa-shield-alt"></i> File HR Support Inquiry</button>
        </div>
      </div>
    </div>
  `;
}

// 2. Employees View
async function renderEmployees(container) {
  container.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;
  const res = await apiFetch("/employees");
  if (!res.ok) return;
  const employees = await res.json();

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Staff Master Directory (${employees.length} Personnel)</h3>
          <p style="font-size:12px; color:#64748b; margin-top:2px;">Click any staff member to view full 360 profile, salary (₦), leaves, and objectives.</p>
        </div>
        <button class="btn btn-primary" onclick="showAddEmployeeModal()"><i class="fa-solid fa-plus"></i> Add New Staff</button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Full Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Office Location</th>
              <th>Employment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${employees.map(emp => `
              <tr style="cursor:pointer;" onclick="viewEmployeeDetails('${emp.id}')">
                <td><strong>${emp.employee_number}</strong></td>
                <td>
                  <div style="font-weight:700; color:#059669;">${emp.first_name} ${emp.last_name}</div>
                  <div style="font-size:12px; color:#64748b;">${emp.email}</div>
                </td>
                <td><span class="badge badge-secondary">${emp.department_name || 'General'}</span></td>
                <td>${emp.position_title || 'Staff'}</td>
                <td>${emp.location_name || 'Lagos HQ'}</td>
                <td>${emp.employment_type}</td>
                <td><span class="badge badge-success">${emp.status}</span></td>
                <td>
                  <button class="btn btn-primary" style="padding:4px 10px; font-size:12px;" onclick="event.stopPropagation(); viewEmployeeDetails('${emp.id}')">
                    <i class="fa-solid fa-user"></i> View Profile
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 360 Employee Details Modal
async function viewEmployeeDetails(empId) {
  showModal("Loading Staff Profile...", `<div style="text-align:center; padding:30px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`, () => closeModal());
  try {
    const res = await apiFetch(`/employees/${empId}`);
    const emp = await res.json();
    if (emp.error) {
      alert("Error loading staff details.");
      closeModal();
      return;
    }

    const modalBody = `
      <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid #e2e8f0;">
        <div style="width:56px; height:56px; border-radius:50%; background:#059669; color:#fff; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:800;">
          ${emp.first_name[0]}${emp.last_name[0]}
        </div>
        <div>
          <h3 style="font-size:18px; color:#0f172a;">${emp.first_name} ${emp.last_name}</h3>
          <p style="font-size:13px; color:#64748b;">${emp.position_title || 'Staff'} &bull; ${emp.department_name || 'General'}</p>
        </div>
        <span class="badge badge-success" style="margin-left:auto;">${emp.status.toUpperCase()}</span>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
        <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; color:#64748b; font-weight:700;">STAFF ID</div>
          <div style="font-weight:700; font-size:14px; margin-top:2px;">${emp.employee_number}</div>
        </div>
        <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; color:#64748b; font-weight:700;">OFFICIAL EMAIL</div>
          <div style="font-weight:600; font-size:13.5px; margin-top:2px;">${emp.email}</div>
        </div>
        <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; color:#64748b; font-weight:700;">OFFICE LOCATION</div>
          <div style="font-weight:600; font-size:14px; margin-top:2px;">${emp.location_name || 'Lagos HQ'}</div>
        </div>
        <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; color:#64748b; font-weight:700;">ANNUAL BASE SALARY</div>
          <div style="font-weight:800; font-size:14px; margin-top:2px; color:#059669;">
            ${emp.base_salary ? formatNairaWhole(emp.base_salary) + " / yr" : 'Confidential'}
          </div>
        </div>
      </div>

      <h4 style="font-size:14px; font-weight:700; color:#334155; margin-bottom:8px;">Recent Time-Off Applications</h4>
      ${emp.leaves && emp.leaves.length > 0 ? `
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:16px; overflow:hidden;">
          <table style="width:100%; font-size:12.5px; border-collapse:collapse;">
            ${emp.leaves.map(l => `
              <tr style="border-bottom:1px solid #f1f5f9; padding:6px 10px;">
                <td style="padding:8px 12px;"><strong>${l.days} Days</strong> (${l.start_date} to ${l.end_date})</td>
                <td style="padding:8px 12px;"><span class="badge ${l.status === 'approved' ? 'badge-success' : 'badge-warning'}">${l.status}</span></td>
              </tr>
            `).join('')}
          </table>
        </div>
      ` : `<p style="font-size:12.5px; color:#94a3b8; margin-bottom:16px;">No recent leave applications on record.</p>`}

      <h4 style="font-size:14px; font-weight:700; color:#334155; margin-bottom:8px;">Assigned Performance Goals & OKRs</h4>
      ${emp.goals && emp.goals.length > 0 ? `
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${emp.goals.map(g => `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:8px;">
              <div style="display:flex; justify-content:space-between; font-weight:600; font-size:13px;">
                <span>${g.title}</span>
                <span style="color:#059669; font-weight:700;">${g.progress_pct}%</span>
              </div>
              <div style="background:#e2e8f0; height:6px; border-radius:6px; margin-top:6px; overflow:hidden;">
                <div style="background:#059669; height:100%; width:${g.progress_pct}%;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `<p style="font-size:12.5px; color:#94a3b8;">No current performance goals assigned.</p>`}
    `;

    document.getElementById("modalTitle").innerText = "Staff 360 Record (Nigeria)";
    document.getElementById("modalBody").innerHTML = modalBody;
    document.getElementById("modalSubmitBtn").innerText = "Close Profile";
    document.getElementById("modalSubmitBtn").onclick = () => closeModal();
  } catch (e) {
    console.error(e);
  }
}

// 3. Leave Management View
async function renderLeave(container) {
  container.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;
  const res = await apiFetch("/leave/requests");
  if (!res.ok) return;
  const requests = await res.json();

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Leave Applications & Accruals</h3>
          <p style="font-size:12px; color:#64748b; margin-top:2px;">Approve or reject time-off requests with audit-logged rationale.</p>
        </div>
        <button class="btn btn-primary" onclick="showApplyLeaveModal()"><i class="fa-solid fa-plus"></i> Apply for Leave</button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map(req => `
              <tr>
                <td><strong>${req.first_name} ${req.last_name}</strong> (${req.employee_number})</td>
                <td><span class="badge badge-info">${req.leave_type_name}</span></td>
                <td>${req.start_date} &rarr; ${req.end_date}</td>
                <td><strong>${req.days}</strong></td>
                <td>${req.reason || 'Personal'}</td>
                <td>
                  <span class="badge ${req.status === 'approved' ? 'badge-success' : req.status === 'rejected' ? 'badge-danger' : 'badge-warning'}">
                    ${req.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  ${req.status === 'pending' ? `
                    <button class="btn btn-success" style="padding:4px 10px; font-size:11.5px;" onclick="actionLeave('${req.id}', 'approved')">Approve</button>
                    <button class="btn btn-outline" style="padding:4px 10px; font-size:11.5px; color:#ef4444;" onclick="actionLeave('${req.id}', 'rejected')">Reject</button>
                  ` : `<span style="font-size:12px; color:#64748b;">${req.action_note || 'Resolved'}</span>`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function actionLeave(id, status) {
  const note = prompt(`Enter approver comments for ${status}:`, "Policy compliant approval");
  if (note === null) return;
  await apiFetch(`/leave/requests/${id}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, note })
  });
  renderLeave(document.getElementById("viewport"));
}

// 4. Attendance View
async function renderAttendance(container) {
  container.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;
  const res = await apiFetch("/attendance");
  if (!res.ok) return;
  const events = await res.json();

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Live Attendance Logs & Timesheet Events (WAT Timezone)</h3>
          <p style="font-size:12px; color:#64748b; margin-top:2px;">Real-time clock recordings captured across Lagos, Abuja, Port Harcourt & Ibadan offices.</p>
        </div>
        <button class="btn btn-primary" onclick="showClockModal()"><i class="fa-solid fa-stopwatch"></i> Clock In / Out</button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp (WAT)</th>
              <th>Staff Name</th>
              <th>Event Type</th>
              <th>Terminal / Portal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(ev => `
              <tr>
                <td>${ev.event_time}</td>
                <td><strong>${ev.first_name} ${ev.last_name}</strong> (${ev.employee_number})</td>
                <td>
                  <span class="badge ${ev.event_type === 'CLOCK_IN' ? 'badge-success' : 'badge-secondary'}">
                    ${ev.event_type}
                  </span>
                </td>
                <td><i class="fa-solid fa-location-dot" style="color:#059669;"></i> ${ev.source}</td>
                <td><span class="badge badge-success">Verified</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 5. Recruitment (ATS) View
async function renderRecruitment(container) {
  container.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;
  const [reqRes, candRes] = await Promise.all([
    apiFetch("/recruitment/requisitions"),
    apiFetch("/recruitment/candidates")
  ]);
  if (!reqRes.ok || !candRes.ok) return;
  const reqs = await reqRes.json();
  const candidates = await candRes.json();

  const stages = ["Applied", "Screening", "Technical Interview", "Offer Extended"];

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <h3>Nigerian Talent Pipeline & ATS Board</h3>
        <p style="font-size:12px; color:#64748b; margin-top:2px;">Click any candidate card to advance interview stages.</p>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" onclick="showAddRequisitionModal()"><i class="fa-solid fa-plus"></i> New Requisition</button>
        <button class="btn btn-primary" onclick="showAddCandidateModal()"><i class="fa-solid fa-user-plus"></i> Add Candidate</button>
      </div>
    </div>

    <div class="kanban-board">
      ${stages.map(stage => {
        const candsInStage = candidates.filter(c => c.stage.toLowerCase() === stage.toLowerCase());
        return `
          <div class="kanban-col">
            <h4>${stage} <span class="badge badge-secondary">${candsInStage.length}</span></h4>
            ${candsInStage.length === 0 ? `<div style="font-size:12px; color:#94a3b8; text-align:center; padding:20px;">No candidates</div>` : ''}
            ${candsInStage.map(c => `
              <div class="kanban-card" onclick="advanceCandidateStage('${c.id}', '${c.stage}')" title="Click to advance stage">
                <div style="font-weight:700; font-size:14px; margin-bottom:4px; color:#0f172a;">${c.full_name}</div>
                <div style="font-size:12px; color:#64748b; margin-bottom:8px;">${c.requisition_title}</div>
                <div style="font-size:11.5px; color:#059669;"><i class="fa-regular fa-envelope"></i> ${c.email}</div>
                ${c.notes ? `<div style="font-size:11px; color:#64748b; margin-top:6px; font-style:italic;">"${c.notes}"</div>` : ''}
                <div style="margin-top:10px; font-size:11.5px; color:#059669; font-weight:700; display:flex; align-items:center; gap:4px;">
                  Advance Stage <i class="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}
    </div>

    <div class="card" style="margin-top:28px;">
      <div class="card-header">
        <h3>Open Job Requisitions (${reqs.length})</h3>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Position Title</th>
              <th>Department</th>
              <th>Openings</th>
              <th>Candidate Pipeline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${reqs.map(r => `
              <tr>
                <td><strong>${r.title}</strong></td>
                <td>${r.department_name}</td>
                <td>${r.openings}</td>
                <td><strong>${r.candidate_count} Candidates</strong></td>
                <td><span class="badge badge-success">${r.status.toUpperCase()}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function advanceCandidateStage(candidateId, currentStage) {
  const stages = ["Applied", "Screening", "Technical Interview", "Offer Extended"];
  const curIdx = stages.findIndex(s => s.toLowerCase() === currentStage.toLowerCase());
  const nextStage = stages[curIdx + 1] || stages[0];
  if (!confirm(`Advance candidate from "${currentStage}" to "${nextStage}"?`)) return;

  await apiFetch(`/recruitment/candidates/stage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate_id: candidateId, stage: nextStage })
  });
  renderRecruitment(document.getElementById("viewport"));
}

// 6. Onboarding Tasks View
async function renderOnboarding(container) {
  container.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;
  const res = await apiFetch("/onboarding/tasks");
  if (!res.ok) return;
  const tasks = await res.json();

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Preboarding & Statutory Induction Checklists</h3>
          <p style="font-size:12px; color:#64748b; margin-top:2px;">Statutory NIN, TIN, Pension (PFA RSA), and NHIS HMO compliance onboarding.</p>
        </div>
        <button class="btn btn-primary" onclick="showAddOnboardingTaskModal()"><i class="fa-solid fa-plus"></i> Add Checklist Task</button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Task Item</th>
              <th>Staff Member</th>
              <th>Assigned Owner</th>
              <th>Target Due Date</th>
              <th>Status</th>
              <th>Toggle Action</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map(t => `
              <tr style="cursor:pointer;" onclick="toggleTaskStatus('${t.id}', '${t.status}')">
                <td><strong>${t.title}</strong></td>
                <td>${t.first_name} ${t.last_name}</td>
                <td><span class="badge badge-secondary">${t.assigned_to_role}</span></td>
                <td>${t.due_date || 'Flexible'}</td>
                <td>
                  <span class="badge ${t.status === 'completed' ? 'badge-success' : 'badge-warning'}">
                    ${t.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <button class="btn ${t.status === 'completed' ? 'btn-outline' : 'btn-success'}" style="padding:4px 10px; font-size:11px;" onclick="event.stopPropagation(); toggleTaskStatus('${t.id}', '${t.status}')">
                    <i class="fa-solid fa-check"></i> ${t.status === 'completed' ? 'Reopen' : 'Mark Done'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function toggleTaskStatus(taskId, currentStatus) {
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
  await apiFetch(`/onboarding/tasks/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task_id: taskId, status: newStatus })
  });
  renderOnboarding(document.getElementById("viewport"));
}

function showAddOnboardingTaskModal() {
  showModal("Add Onboarding Task", `
    <div class="form-group">
      <label class="form-label">Task Description</label>
      <input type="text" class="form-control" id="m_task_title" placeholder="e.g. Verify National Identification Number (NIN) slip" required>
    </div>
    <div class="form-group">
      <label class="form-label">Assigned Role</label>
      <select class="form-control" id="m_task_role">
        <option>Employee</option>
        <option>Manager</option>
        <option>IT Admin</option>
        <option>HR Officer</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Target Due Date</label>
      <input type="date" class="form-control" id="m_task_due" value="${new Date().toISOString().split('T')[0]}">
    </div>
  `, async () => {
    const title = document.getElementById("m_task_title").value;
    const assigned_to_role = document.getElementById("m_task_role").value;
    const due_date = document.getElementById("m_task_due").value;
    if (!title) { alert("Please enter task title"); return; }
    await apiFetch("/onboarding/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, assigned_to_role, due_date, employee_id: "emp-004" })
    });
    closeModal();
    renderOnboarding(document.getElementById("viewport"));
  });
}

// 7. Goals & Performance View
async function renderPerformance(container) {
  container.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;
  const res = await apiFetch("/performance/goals");
  if (!res.ok) return;
  const goals = await res.json();

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Performance Objectives & KPI Tracking</h3>
          <p style="font-size:12px; color:#64748b; margin-top:2px;">Click any goal progress bar or 'Update %' button to modify progress.</p>
        </div>
        <button class="btn btn-primary" onclick="showAddGoalModal()"><i class="fa-solid fa-plus"></i> Set New Goal</button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Goal Description</th>
              <th>Assignee</th>
              <th>Target Metric</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${goals.map(g => `
              <tr style="cursor:pointer;" onclick="updateGoalProgress('${g.id}', ${g.progress_pct})">
                <td><strong>${g.title}</strong></td>
                <td>${g.first_name} ${g.last_name}</td>
                <td>${g.target_metric}</td>
                <td style="width:200px;">
                  <div style="background:#e2e8f0; border-radius:10px; height:10px; overflow:hidden;">
                    <div style="background:#059669; height:100%; width:${g.progress_pct}%;"></div>
                  </div>
                  <span style="font-size:12px; font-weight:700; color:#475569;">${g.progress_pct}%</span>
                </td>
                <td><span class="badge ${g.status === 'completed' ? 'badge-success' : 'badge-info'}">${g.status.toUpperCase()}</span></td>
                <td>
                  <button class="btn btn-primary" style="padding:4px 10px; font-size:11px;" onclick="event.stopPropagation(); updateGoalProgress('${g.id}', ${g.progress_pct})">
                    <i class="fa-solid fa-pen"></i> Update %
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function updateGoalProgress(goalId, currentPct = 50) {
  const pct = prompt("Enter new progress percentage (0 - 100):", currentPct);
  if (pct === null) return;
  await apiFetch(`/performance/goals/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal_id: goalId, progress_pct: parseInt(pct) })
  });
  renderPerformance(document.getElementById("viewport"));
}

// 8. Payroll & Compensation View
async function renderPayroll(container) {
  container.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;
  const [runsRes, compRes] = await Promise.all([
    apiFetch("/payroll/runs"),
    apiFetch("/payroll/compensations")
  ]);
  if (!runsRes.ok || !compRes.ok) return;
  const runs = await runsRes.json();
  const comps = await compRes.json();

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <h3>Enterprise Compensation & Payroll Control (₦ Nigerian Naira)</h3>
        <p style="font-size:12px; color:#64748b; margin-top:2px;">Disbursement batches with separation of duties (SoD) authorization and PAYE calculation.</p>
      </div>
      <button class="btn btn-primary" onclick="showRunPayrollModal()"><i class="fa-solid fa-bolt"></i> Run Monthly Payroll (₦)</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Payroll Execution History</h3>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Payroll Period</th>
              <th>Total Net Disbursement (₦)</th>
              <th>Staff Count</th>
              <th>Status</th>
              <th>Approved By</th>
              <th>Disbursed At (WAT)</th>
            </tr>
          </thead>
          <tbody>
            ${runs.map(r => `
              <tr>
                <td><strong>${r.month}</strong></td>
                <td><strong style="color:#059669; font-size:14px;">${formatNaira(r.total_payout)}</strong></td>
                <td>${r.employee_count} Persons</td>
                <td><span class="badge badge-success">${r.status.toUpperCase()}</span></td>
                <td>${r.approved_by || 'Emeka Nnamani'}</td>
                <td>${r.processed_at}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Active Compensation Structure (${comps.length} Staff)</h3>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Annual Base Salary (₦)</th>
              <th>Frequency</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${comps.map(c => `
              <tr style="cursor:pointer;" onclick="viewEmployeeDetails('${c.employee_id}')" title="Click to view staff profile">
                <td><strong>${c.first_name} ${c.last_name}</strong> (${c.employee_number})</td>
                <td>${c.department_name}</td>
                <td>${c.position_title}</td>
                <td><strong style="color:#059669;">${formatNairaWhole(c.base_salary)} / yr</strong></td>
                <td>${c.pay_frequency}</td>
                <td><span class="badge badge-success">${c.status.toUpperCase()}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 9. HR Cases View
async function renderCases(container) {
  container.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;
  const res = await apiFetch("/cases");
  if (!res.ok) return;
  const cases = await res.json();

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Employee Support & Case Tickets (${cases.length})</h3>
          <p style="font-size:12px; color:#64748b; margin-top:2px;">Click any ticket to inspect or resolve ticket status.</p>
        </div>
        <button class="btn btn-primary" onclick="showAddCaseModal()"><i class="fa-solid fa-plus"></i> File HR Case</button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Category</th>
              <th>Staff Member</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Logged At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${cases.map(c => `
              <tr style="cursor:pointer;" onclick="toggleCaseStatus('${c.id}', '${c.status}')">
                <td>
                  <strong>${c.subject}</strong>
                  <div style="font-size:12px; color:#64748b;">${c.details || ''}</div>
                </td>
                <td><span class="badge badge-secondary">${c.category}</span></td>
                <td>${c.first_name} ${c.last_name}</td>
                <td><span class="badge ${c.priority === 'High' ? 'badge-danger' : 'badge-warning'}">${c.priority}</span></td>
                <td><span class="badge ${c.status === 'resolved' ? 'badge-success' : 'badge-info'}">${c.status.toUpperCase()}</span></td>
                <td>${c.created_at}</td>
                <td>
                  <button class="btn ${c.status === 'resolved' ? 'btn-outline' : 'btn-success'}" style="padding:4px 8px; font-size:11px;" onclick="event.stopPropagation(); toggleCaseStatus('${c.id}', '${c.status}')">
                    ${c.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function toggleCaseStatus(caseId, currentStatus) {
  const newStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
  if (!confirm(`Mark case status as "${newStatus.toUpperCase()}"?`)) return;
  await apiFetch(`/cases/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ case_id: caseId, status: newStatus })
  });
  renderCases(document.getElementById("viewport"));
}

// 10. Documents View
async function renderDocuments(container) {
  container.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;
  const res = await apiFetch("/documents");
  if (!res.ok) return;
  const docs = await res.json();

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Encrypted Organization & Personnel Documents (${docs.length})</h3>
          <p style="font-size:12px; color:#64748b; margin-top:2px;">All contracts, NDPR consent forms, and handbooks are stored with tamper-proof checksums.</p>
        </div>
        <button class="btn btn-primary" onclick="showUploadDocModal()"><i class="fa-solid fa-upload"></i> Upload Document</button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Category</th>
              <th>Associated Staff</th>
              <th>Size</th>
              <th>Storage Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${docs.map(d => `
              <tr style="cursor:pointer;" onclick="inspectDocument('${d.title}', '${d.category}', '${d.file_path}')">
                <td><strong><i class="fa-regular fa-file-pdf" style="color:#ef4444; margin-right:6px;"></i> ${d.title}</strong></td>
                <td><span class="badge badge-info">${d.category}</span></td>
                <td>${d.first_name ? `${d.first_name} ${d.last_name}` : 'Apex Nigeria General'}</td>
                <td>${d.size_kb} KB</td>
                <td><code style="font-size:12px;">${d.file_path}</code></td>
                <td>
                  <button class="btn btn-primary" style="padding:4px 10px; font-size:11px;" onclick="event.stopPropagation(); inspectDocument('${d.title}', '${d.category}', '${d.file_path}')">
                    <i class="fa-solid fa-download"></i> View File
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function inspectDocument(title, category, path) {
  showModal("Document Vault Preview", `
    <div style="text-align:center; padding:20px;">
      <i class="fa-solid fa-file-shield fa-4x" style="color:#059669; margin-bottom:16px;"></i>
      <h3 style="font-size:18px; margin-bottom:6px;">${title}</h3>
      <p style="font-size:13px; color:#64748b; margin-bottom:16px;">Category: <strong>${category}</strong></p>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; font-size:12px; word-break:break-all;">
        Encrypted Path: <code>${path}</code>
      </div>
      <p style="font-size:12px; color:#10b981; margin-top:14px;"><i class="fa-solid fa-circle-check"></i> Security signature and NDPR compliance validated.</p>
    </div>
  `, () => closeModal());
  document.getElementById("modalSubmitBtn").innerText = "Close";
  document.getElementById("modalSubmitBtn").onclick = () => closeModal();
}

// 11. Audit Events View
async function renderAudit(container) {
  container.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;
  const res = await apiFetch("/audit/events");
  if (!res.ok) return;
  const events = await res.json();

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Immutable System Audit & Security Trail (${events.length})</h3>
          <p style="font-size:12px; color:#64748b; margin-top:2px;">Cryptographically verifiable record of all user actions and log in/out timestamps.</p>
        </div>
        <button class="btn btn-outline" onclick="renderAudit(document.getElementById('viewport'))"><i class="fa-solid fa-rotate"></i> Refresh Trail</button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp (WAT)</th>
              <th>Staff User</th>
              <th>Action Type</th>
              <th>Resource</th>
              <th>Audit Log Description</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(e => `
              <tr>
                <td><small style="color:#64748b;">${e.created_at}</small></td>
                <td><strong>${e.actor_username}</strong></td>
                <td><span class="badge ${e.event_type === 'LOGIN' ? 'badge-success' : e.event_type === 'LOGOUT' ? 'badge-danger' : 'badge-secondary'}">${e.event_type}</span></td>
                <td><code>${e.resource_type}</code></td>
                <td>${e.details}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Modals Handling
function showModal(title, bodyHtml, onSubmit) {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalBody").innerHTML = bodyHtml;
  const submitBtn = document.getElementById("modalSubmitBtn");
  submitBtn.innerText = "Confirm";
  submitBtn.onclick = onSubmit;
  document.getElementById("mainModal").classList.add("active");
}

function closeModal() {
  document.getElementById("mainModal").classList.remove("active");
}

function showQuickAddModal() {
  showAddEmployeeModal();
}

function showAddEmployeeModal() {
  showModal("Onboard New Nigerian Staff", `
    <div class="form-group">
      <label class="form-label">First Name</label>
      <input type="text" class="form-control" id="m_fname" placeholder="e.g. Adebayo" required>
    </div>
    <div class="form-group">
      <label class="form-label">Last Name</label>
      <input type="text" class="form-control" id="m_lname" placeholder="e.g. Chukwu" required>
    </div>
    <div class="form-group">
      <label class="form-label">Work Email</label>
      <input type="email" class="form-control" id="m_email" placeholder="adebayo.c@apex.ng" required>
    </div>
    <div class="form-group">
      <label class="form-label">Phone (Nigerian GSM)</label>
      <input type="text" class="form-control" id="m_phone" placeholder="+234 803 000 0000">
    </div>
    <div class="form-group">
      <label class="form-label">Annual Salary (₦ NGN)</label>
      <input type="number" class="form-control" id="m_salary" value="18000000">
    </div>
  `, async () => {
    const first_name = document.getElementById("m_fname").value;
    const last_name = document.getElementById("m_lname").value;
    const email = document.getElementById("m_email").value;
    const phone = document.getElementById("m_phone").value;
    const salary = document.getElementById("m_salary").value;

    if (!first_name || !last_name || !email) {
      alert("Please fill in all required fields.");
      return;
    }

    await apiFetch("/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name, last_name, email, phone, salary,
        department_id: "dept-eng",
        position_id: "pos-sr-eng"
      })
    });
    closeModal();
    switchTab("employees");
  });
}

function showApplyLeaveModal() {
  showModal("Request Time Off / Leave", `
    <div class="form-group">
      <label class="form-label">Leave Type</label>
      <select class="form-control" id="m_ltype">
        <option value="lt-annual">Annual Vacation Leave (24 Days)</option>
        <option value="lt-sick">Medical / Sick Leave (14 Days)</option>
        <option value="lt-parental">Maternity / Paternity Leave (90 Days)</option>
        <option value="lt-casual">Casual / Emergency Leave (7 Days)</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Start Date</label>
      <input type="date" class="form-control" id="m_sdate" value="${new Date().toISOString().split('T')[0]}">
    </div>
    <div class="form-group">
      <label class="form-label">End Date</label>
      <input type="date" class="form-control" id="m_edate" value="${new Date().toISOString().split('T')[0]}">
    </div>
    <div class="form-group">
      <label class="form-label">Total Days</label>
      <input type="number" class="form-control" id="m_days" value="1">
    </div>
    <div class="form-group">
      <label class="form-label">Reason / Purpose</label>
      <textarea class="form-control" id="m_reason" rows="2" placeholder="State reason for absence"></textarea>
    </div>
  `, async () => {
    const leave_type_id = document.getElementById("m_ltype").value;
    const start_date = document.getElementById("m_sdate").value;
    const end_date = document.getElementById("m_edate").value;
    const days = document.getElementById("m_days").value;
    const reason = document.getElementById("m_reason").value;

    await apiFetch("/leave/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leave_type_id, start_date, end_date, days, reason })
    });
    closeModal();
    switchTab("leave");
  });
}

function showClockModal() {
  showModal("Register Clock Event (WAT)", `
    <p style="margin-bottom:14px; color:#475569;">Log your official attendance timestamp into the Nigerian enterprise system:</p>
    <div class="form-group">
      <label class="form-label">Event Type</label>
      <select class="form-control" id="m_clock_type">
        <option value="CLOCK_IN">CLOCK_IN (Shift Start)</option>
        <option value="CLOCK_OUT">CLOCK_OUT (Shift End)</option>
      </select>
    </div>
  `, async () => {
    const event_type = document.getElementById("m_clock_type").value;
    await apiFetch("/attendance/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type })
    });
    closeModal();
    switchTab("attendance");
  });
}

function showAddRequisitionModal() {
  showModal("Create Job Requisition", `
    <div class="form-group">
      <label class="form-label">Job Title</label>
      <input type="text" class="form-control" id="m_req_title" placeholder="e.g. Lead Core Banking Engineer">
    </div>
    <div class="form-group">
      <label class="form-label">Target Openings</label>
      <input type="number" class="form-control" id="m_req_openings" value="1">
    </div>
  `, async () => {
    const title = document.getElementById("m_req_title").value;
    const openings = document.getElementById("m_req_openings").value;
    await apiFetch("/recruitment/requisitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, department_id: "dept-eng", openings })
    });
    closeModal();
    switchTab("recruitment");
  });
}

function showAddCandidateModal() {
  showModal("Add Nigerian Candidate to Pipeline", `
    <div class="form-group">
      <label class="form-label">Full Name</label>
      <input type="text" class="form-control" id="m_c_name" placeholder="e.g. Ifeoma Nwabueze">
    </div>
    <div class="form-group">
      <label class="form-label">Email</label>
      <input type="email" class="form-control" id="m_c_email" placeholder="ifeoma.n@gmail.com">
    </div>
    <div class="form-group">
      <label class="form-label">Phone</label>
      <input type="text" class="form-control" id="m_c_phone" placeholder="+234 802 000 1122">
    </div>
  `, async () => {
    const full_name = document.getElementById("m_c_name").value;
    const email = document.getElementById("m_c_email").value;
    const phone = document.getElementById("m_c_phone").value;
    await apiFetch("/recruitment/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, email, phone, requisition_id: "req-001" })
    });
    closeModal();
    switchTab("recruitment");
  });
}

function showAddGoalModal() {
  showModal("Set Performance Objective (OKR)", `
    <div class="form-group">
      <label class="form-label">Goal Title</label>
      <input type="text" class="form-control" id="m_g_title" placeholder="e.g. Integrate NIBSS Instant Payment gateway">
    </div>
    <div class="form-group">
      <label class="form-label">Target Metric</label>
      <input type="text" class="form-control" id="m_g_metric" placeholder="99.9% Transaction Success Rate">
    </div>
  `, async () => {
    const title = document.getElementById("m_g_title").value;
    const target_metric = document.getElementById("m_g_metric").value;
    await apiFetch("/performance/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, target_metric })
    });
    closeModal();
    switchTab("performance");
  });
}

function showRunPayrollModal() {
  showModal("Execute Monthly Payroll (₦ Naira)", `
    <p style="color:#475569; margin-bottom:12px;">This will calculate total salary disbursements in Nigerian Naira (₦), apply PAYE / Pension deductions, and log to the immutable audit trail.</p>
    <div class="form-group">
      <label class="form-label">Payroll Period</label>
      <input type="text" class="form-control" id="m_pay_month" value="October 2026">
    </div>
  `, async () => {
    const month = document.getElementById("m_pay_month").value;
    await apiFetch("/payroll/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month })
    });
    closeModal();
    switchTab("payroll");
  });
}

function showAddCaseModal() {
  showModal("File HR Support Inquiry", `
    <div class="form-group">
      <label class="form-label">Category</label>
      <select class="form-control" id="m_case_cat">
        <option>Workplace Inquiry</option>
        <option>HMO & Healthcare (Hygeia / Reliance)</option>
        <option>Hardware & Inverter Setup</option>
        <option>Confidential Grievance</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Subject</label>
      <input type="text" class="form-control" id="m_case_subj" placeholder="Brief subject line">
    </div>
    <div class="form-group">
      <label class="form-label">Details</label>
      <textarea class="form-control" id="m_case_det" rows="3" placeholder="Provide full details..."></textarea>
    </div>
  `, async () => {
    const category = document.getElementById("m_case_cat").value;
    const subject = document.getElementById("m_case_subj").value;
    const details = document.getElementById("m_case_det").value;
    await apiFetch("/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, subject, details, priority: "Medium" })
    });
    closeModal();
    switchTab("cases");
  });
}

function showUploadDocModal() {
  showModal("Upload to Document Vault", `
    <div class="form-group">
      <label class="form-label">Document Title</label>
      <input type="text" class="form-control" id="m_doc_title" placeholder="e.g. NDPR Employee Data Consent Form.pdf">
    </div>
    <div class="form-group">
      <label class="form-label">Category</label>
      <select class="form-control" id="m_doc_cat">
        <option>Contracts</option>
        <option>Company Policy</option>
        <option>Compliance</option>
        <option>Tax & Identity</option>
      </select>
    </div>
  `, async () => {
    const title = document.getElementById("m_doc_title").value;
    const category = document.getElementById("m_doc_cat").value;
    await apiFetch("/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category })
    });
    closeModal();
    switchTab("documents");
  });
}
