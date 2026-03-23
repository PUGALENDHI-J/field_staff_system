import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, LogOut, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TITLES = {
  '/': ['Operations Overview', 'Monitor staff, jobs, finance and field activity from one control room.'],
  '/team': ['Staff Management', 'Manage staff profiles, access, salary and account status.'],
  '/tasks': ['Task Board', 'Track active jobs, assignments and field execution in real time.'],
  '/attendance': ['Attendance Control', 'Review daily check-ins, timing and map verification.'],
  '/performance': ['Performance Analytics', 'Compare trends, attendance and financial output by staff member.'],
  '/inventory': ['Inventory Control', 'Keep equipment, quantities and reorder thresholds in sync.'],
  '/transactions': ['Financial Registry', 'Track salary, advances and collections with clean records.'],
};

const Header = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [title, subtitle] = TITLES[pathname] || TITLES['/'];

  return (
    <header className="shell-topbar">
      <div className="topbar-title">
        <div className="brand-mark">PE</div>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="chip">
          <Phone size={14} />
          7010425239 | 9384424111
        </div>
        <div className="chip">
          <Bell size={14} />
          Admin Session
        </div>
        <div className="chip">
          <strong>{user?.name}</strong>
          <span style={{ color: 'var(--muted)' }}>{user?.phone}</span>
        </div>
        <button onClick={logout} className="btn btn-danger" type="button">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
