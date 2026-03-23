import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  BadgeIndianRupee,
  BarChart3,
  Calendar,
  CheckSquare,
  LayoutDashboard,
  Package,
  Users,
} from 'lucide-react';
import Header from './Header';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/team', label: 'Staff', icon: Users },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/attendance', label: 'Attendance', icon: Calendar },
  { to: '/performance', label: 'Performance', icon: BarChart3 },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/transactions', label: 'Finance', icon: BadgeIndianRupee },
];

const Layout = () => (
  <div className="app-shell">
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">PE</div>
        <div>
          <h1>Pradeep Enterprises</h1>
          <p>Field Staff Command Center</p>
        </div>
      </div>

      <div className="sidebar-kicker">Navigation</div>
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
        <p className="eyebrow">Admin Access</p>
        <p className="meta">Live overview of staff, assignments, stock and settlements across the whole system.</p>
      </div>
    </aside>

    <div className="shell-main">
      <Header />
      <main className="shell-content">
        <Outlet />
      </main>
    </div>
  </div>
);

export default Layout;
