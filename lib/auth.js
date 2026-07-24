/* auth.js — Simple session-based auth for Pemprov Bali Dashboard
   Demo mode: hardcoded credentials. Replace with real auth (Supabase/OAuth) in production.
*/

const Auth = {
  // Demo credentials
  // ponytail: admin role = import; viewer = read-only dashboards
  DEMO_USERS: {
    'duan1816': { password: 'duan1816', name: 'Admin Duan', role: 'admin' },
    'admin': { password: 'bali2026', name: 'Administrator', role: 'viewer' },
    'disdik': { password: 'bali2026', name: 'Dinas Pendidikan', role: 'viewer' },
  },

  SESSION_KEY: 'bali_dashboard_auth',
  SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours

  login(username, password) {
    const user = this.DEMO_USERS[username.toLowerCase()];
    if (!user || user.password !== password) {
      return { success: false, message: 'Nama pengguna atau kata sandi salah.' };
    }

    const session = {
      username: username.toLowerCase(),
      name: user.name,
      role: user.role,
      loginAt: Date.now(),
      expiresAt: Date.now() + this.SESSION_DURATION,
    };

    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return { success: true };
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    window.location.href = 'login.html';
  },

  getSession() {
    const raw = sessionStorage.getItem(this.SESSION_KEY);
    if (!raw) return null;

    try {
      const session = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        sessionStorage.removeItem(this.SESSION_KEY);
        return null;
      }
      return session;
    } catch (e) {
      sessionStorage.removeItem(this.SESSION_KEY);
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getSession();
  },

  isAdmin() {
    const s = this.getSession();
    return !!(s && s.role === 'admin');
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  requireAdmin() {
    if (!this.requireAuth()) return false;
    if (!this.isAdmin()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  getUserName() {
    const s = this.getSession();
    return s ? s.name : '';
  },

  getRole() {
    const s = this.getSession();
    return s ? s.role : '';
  },

  /** Hide Import Data nav for non-admin */
  applyNavRole() {
    if (this.isAdmin()) return;
    document.querySelectorAll('a[href="import-data.html"]').forEach(function (el) {
      el.style.display = 'none';
    });
  },
};

// Auto-redirect: if on a dashboard page and not authenticated, go to login
(function() {
  const path = window.location.pathname.split('/').pop();
  const protectedPages = [
    'index.html', 'school-detail.html', 'index-breakdown.html',
    'school-list.html', 'national-dashboard.html', 'adopsi.html',
    'import-data.html', 'annual-report.html',
  ];
  if (protectedPages.includes(path) && !Auth.isAuthenticated()) {
    window.location.href = 'login.html';
  }
})();
