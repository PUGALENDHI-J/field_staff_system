import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Calendar, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const statusBadge = {
  Completed: 'badge badge-teal',
  'In Progress': 'badge badge-blue',
  Pending: 'badge badge-amber',
};

const Dashboard = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState({ staff: 0, tasks: 0, attendance: 0, pending: 0, completionRate: 0, attendanceRate: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const [uRes, tRes, aRes] = await Promise.all([
        api('get', '/api/admin/users'),
        api('get', '/api/admin/tasks'),
        api('get', '/api/admin/attendance'),
      ]);
      const staffCount = uRes.data.filter((u) => u.role === 'Staff').length;
      const tasks = tRes.data;
      const attendance = aRes.data;
      const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
      const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
      const presentAttendance = attendance.filter((a) => a.status === 'Present').length;
      setStats({
        staff: staffCount,
        tasks: tasks.length,
        attendance: attendance.length,
        pending: pendingTasks,
        completionRate: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
        attendanceRate: attendance.length ? Math.round((presentAttendance / attendance.length) * 100) : 0,
      });
      setRecentTasks(tasks.slice(0, 6));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const metricCards = [
    { label: 'Active Staff', value: stats.staff, note: 'Available on field', icon: <Users size={22} />, color: '#dbeafe', text: '#1d4ed8' },
    { label: 'Total Tasks', value: stats.tasks, note: 'Across active jobs', icon: <CheckCircle size={22} />, color: '#dcfce7', text: '#15803d' },
    { label: 'Attendance Logs', value: stats.attendance, note: 'Verified records', icon: <Activity size={22} />, color: '#ccfbf1', text: '#0f766e' },
    { label: 'Pending Jobs', value: stats.pending, note: 'Needs action', icon: <Clock size={22} />, color: '#ffedd5', text: '#c2410c' },
  ];

  return (
    <div className="stack-lg">
      <section className="hero-card">
        <div className="page-head" style={{ marginBottom: 0, position: 'relative', zIndex: 1 }}>
          <div>
            <h1>Operations Command Center</h1>
            <p style={{ color: 'rgba(255,255,255,0.82)' }}>
              A cleaner executive view for staffing, live task flow, attendance and field performance.
            </p>
          </div>
          <div className="page-actions">
            <div className="chip" style={{ background: 'rgba(255,255,255,0.16)', color: 'white', borderColor: 'rgba(255,255,255,0.16)' }}>
              <Calendar size={14} />
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        {metricCards.map((card) => (
          <article key={card.label} className="metric-card">
            <div className="metric-icon" style={{ background: card.color, color: card.text }}>
              {card.icon}
            </div>
            <p className="metric-label">{card.label}</p>
            <p className="metric-value">{loading ? '...' : card.value}</p>
            <p className="metric-note">{card.note}</p>
          </article>
        ))}
      </section>

      <section className="split-grid">
        <div className="panel">
          <div className="section-bar">
            <h3>Recent Field Actions</h3>
            <Link to="/tasks" className="chip" style={{ color: 'var(--brand)' }}>
              Open Task Board
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="section-body" style={{ paddingTop: 18 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client / Site</th>
                    <th>Assigned Staff</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!recentTasks.length ? (
                    <tr>
                      <td colSpan={3} className="empty-state">
                        No recent task activity found.
                      </td>
                    </tr>
                  ) : (
                    recentTasks.map((task) => (
                      <tr key={task._id}>
                        <td>
                          <div style={{ fontWeight: 800 }}>{task.clientName}</div>
                          <div style={{ color: 'var(--muted)', fontSize: '.82rem', marginTop: 4 }}>
                            {new Date(task.date).toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td>{task.assignedTo?.name || 'Unassigned'}</td>
                        <td>
                          <span className={statusBadge[task.status] || 'badge badge-slate'}>{task.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="stack-md">
          <div className="panel">
            <div className="section-bar">
              <h3>Completion Rate</h3>
            </div>
            <div className="section-body">
              <p className="metric-value">{loading ? '...' : `${stats.completionRate}%`}</p>
              <p className="metric-note">Task completion across tracked field jobs.</p>
              <div className="soft-card" style={{ marginTop: 18, padding: 10 }}>
                <div
                  style={{
                    width: `${stats.completionRate}%`,
                    height: 12,
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #2563eb, #0f766e)',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="section-bar">
              <h3>Attendance Quality</h3>
            </div>
            <div className="section-body">
              <p className="metric-value">{loading ? '...' : `${stats.attendanceRate}%`}</p>
              <p className="metric-note">Based on recorded present check-ins.</p>
              <div className="soft-card" style={{ marginTop: 18 }}>
                <strong style={{ display: 'block', fontSize: '1rem' }}>Support Line</strong>
                <div style={{ color: 'var(--muted)', marginTop: 6 }}>7010425239 | 9384424111</div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="section-bar">
              <h3>System Direction</h3>
            </div>
            <div className="section-body">
              <div className="soft-card">
                <div className="badge badge-blue">Recommended</div>
                <p style={{ margin: '12px 0 0', lineHeight: 1.7, color: 'var(--muted)' }}>
                  Focus next on pending tasks and staff attendance exceptions to keep operations balanced.
                </p>
              </div>
              <div className="soft-card" style={{ marginTop: 14 }}>
                <div className="badge badge-teal">
                  <TrendingUp size={12} />
                  Live Oversight
                </div>
                <p style={{ margin: '12px 0 0', lineHeight: 1.7, color: 'var(--muted)' }}>
                  The refreshed dashboard now keeps executive metrics, actions and support information within one scan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
