import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Briefcase, Calendar, CheckCircle, IndianRupee, MapPin, Wallet } from 'lucide-react';
import { useStaffAuth } from '../context/StaffAuthContext';

const badgeClass = {
  Completed: 'badge badge-teal',
  'In Progress': 'badge badge-blue',
  Pending: 'badge badge-amber',
};

const StaffDashboard = () => {
  const { api, staffUser, refreshProfile } = useStaffAuth();
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        await refreshProfile();
        const [t, a, tr] = await Promise.all([
          api('get', '/api/staff/tasks'),
          api('get', '/api/staff/attendance'),
          api('get', '/api/staff/transactions'),
        ]);
        if (!active) return;
        setTasks(t.data);
        setAttendance(a.data);
        setTxns(tr.data);
      } catch (e) {
        console.error(e);
        if (active) {
          setError(e.response?.data?.message || 'Unable to load your live staff data right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [api, refreshProfile]);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthlySalary = txns
    .filter((t) => t.type === 'Salary' && new Date(t.createdAt).getFullYear() === thisYear && new Date(t.createdAt).getMonth() === thisMonth)
    .reduce((sum, t) => sum + t.amount, 0);
  const todayDone = attendance.some((a) => new Date(a.createdAt).toDateString() === new Date().toDateString());

  const metrics = [
    { label: 'Pending Tasks', value: tasks.filter((t) => t.status === 'Pending').length, icon: <Briefcase size={20} />, color: '#ffedd5', text: '#c2410c' },
    { label: 'In Progress', value: tasks.filter((t) => t.status === 'In Progress').length, icon: <Activity size={20} />, color: '#dbeafe', text: '#1d4ed8' },
    { label: 'Completed', value: tasks.filter((t) => t.status === 'Completed').length, icon: <CheckCircle size={20} />, color: '#dcfce7', text: '#15803d' },
    { label: 'This Month Salary', value: `Rs ${monthlySalary.toLocaleString()}`, icon: <IndianRupee size={20} />, color: '#ccfbf1', text: '#0f766e' },
  ];

  return (
    <div className="stack-lg">
      <section className="hero-card" style={{ background: 'linear-gradient(135deg, #0f766e, #1d4ed8 120%)' }}>
        <div className="page-head" style={{ marginBottom: 0, position: 'relative', zIndex: 1 }}>
          <div>
            <h1>{`Welcome back, ${staffUser?.name || 'Staff'}`}</h1>
            <p style={{ color: 'rgba(255,255,255,0.84)' }}>
              Stay on top of today&apos;s assignments, check-in status and your current earnings.
            </p>
          </div>
          <div className="page-actions">
            <div className="chip" style={{ background: 'rgba(255,255,255,0.16)', color: 'white', borderColor: 'rgba(255,255,255,0.14)' }}>
              <MapPin size={14} />
              {todayDone ? 'Attendance marked' : 'Attendance pending'}
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="metrics-grid">
        {metrics.map((card) => (
          <article key={card.label} className="metric-card">
            <div className="metric-icon" style={{ background: card.color, color: card.text }}>
              {card.icon}
            </div>
            <p className="metric-label">{card.label}</p>
            <p className="metric-value">{loading ? '...' : card.value}</p>
            <p className="metric-note">{card.label === 'This Month Salary' ? `Advance outstanding: Rs ${Number(staffUser?.advance_taken || 0).toLocaleString()}` : 'Updated from live portal records'}</p>
          </article>
        ))}
      </section>

      <section className="split-grid">
        <div className="panel">
          <div className="section-bar">
            <h3>My Current Tasks</h3>
            <Link to="/staff/tasks" className="chip" style={{ color: 'var(--brand)' }}>
              Manage Tasks
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="section-body" style={{ paddingTop: 18 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client / Site</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!tasks.length ? (
                    <tr>
                      <td colSpan={3} className="empty-state">
                        No tasks assigned right now.
                      </td>
                    </tr>
                  ) : (
                    tasks.slice(0, 5).map((task) => (
                      <tr key={task._id}>
                        <td>
                          <div style={{ fontWeight: 800 }}>{task.clientName}</div>
                          <div style={{ color: 'var(--muted)', fontSize: '.82rem', marginTop: 4 }}>{task.notes || 'No notes'}</div>
                        </td>
                        <td>{task.date ? new Date(task.date).toLocaleDateString('en-IN') : '-'}</td>
                        <td>
                          <span className={badgeClass[task.status] || 'badge badge-slate'}>{task.status}</span>
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
              <h3>Today&apos;s Status</h3>
            </div>
            <div className="section-body">
              <div className={todayDone ? 'badge badge-teal' : 'badge badge-amber'}>
                <Calendar size={12} />
                {todayDone ? 'Attendance completed' : 'Please mark attendance'}
              </div>
              <p style={{ marginTop: 14, color: 'var(--muted)', lineHeight: 1.7 }}>
                Attendance must be marked before starting field work. Use the attendance page if today&apos;s check-in is still pending.
              </p>
            </div>
          </div>

          <div className="panel">
            <div className="section-bar">
              <h3>Salary Summary</h3>
            </div>
            <div className="section-body">
              <p className="metric-value">{`Rs ${Number(staffUser?.base_salary || 0).toLocaleString()}`}</p>
              <p className="metric-note">Base monthly salary</p>
              <div className="soft-card" style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 800 }}>Advance Outstanding</div>
                <div style={{ color: 'var(--danger)', marginTop: 6 }}>
                  Rs {Number(staffUser?.advance_taken || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="section-bar">
              <h3>Support</h3>
            </div>
            <div className="section-body">
              <div className="soft-card">
                <div style={{ fontWeight: 800 }}>HQ Contacts</div>
                <div style={{ color: 'var(--muted)', marginTop: 6, lineHeight: 1.8 }}>7010425239<br />9384424111</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StaffDashboard;
