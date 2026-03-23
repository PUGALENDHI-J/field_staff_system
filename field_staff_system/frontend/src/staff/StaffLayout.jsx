import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Calendar, CheckCircle, Home, LogOut, User } from 'lucide-react';
import { useStaffAuth } from '../context/StaffAuthContext';

const NAV = [
  { to: '/staff', label: 'Dashboard', icon: Home, end: true },
  { to: '/staff/tasks', label: 'My Tasks', icon: CheckCircle },
  { to: '/staff/attendance', label: 'Attendance', icon: Calendar },
  { to: '/staff/profile', label: 'Profile', icon: User },
];

const TITLES = {
  '/staff': ['Field Dashboard', 'Keep track of your jobs, attendance and earnings in one place.'],
  '/staff/tasks': ['Task Updates', 'Move assigned jobs forward and report progress back to HQ.'],
  '/staff/attendance': ['Daily Check-In', 'Mark verified presence before starting your field shift.'],
  '/staff/profile': ['My Profile', 'Review salary, advances and personal account details.'],
};

const StaffLayout = () => {
  const { staffUser, logout } = useStaffAuth();
  const { pathname } = useLocation();
  const [title, subtitle] = TITLES[pathname] || TITLES['/staff'];

  return (
    <div className="app-shell staff-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">PE</div>
          <div>
            <h1>Staff Portal</h1>
            <p>Field operations workspace</p>
          </div>
        </div>

        <div className="sidebar-kicker">Workspace</div>
        <nav className="sidebar-nav">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        </nav>

        <div className="sidebar-footer-card">
          <p className="eyebrow">Logged In</p>
          <p className="meta">{staffUser?.name}</p>
          <p className="meta">{staffUser?.phone}</p>
          <button type="button" onClick={logout} className="btn btn-neutral" style={{ marginTop: 14, width: '100%' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="shell-main">
        <header className="shell-topbar">
          <div className="topbar-title">
            <div className="brand-mark">PE</div>
            <div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="chip">Active Staff Session</div>
            <div className="chip">
              <strong>{staffUser?.name}</strong>
              <span style={{ color: 'var(--muted)' }}>{staffUser?.phone}</span>
            </div>
          </div>
        </header>

        <main className="shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
