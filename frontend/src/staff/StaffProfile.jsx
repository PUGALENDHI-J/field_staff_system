import React, { useEffect, useState } from 'react';
import { IndianRupee, Phone, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { useStaffAuth } from '../context/StaffAuthContext';

const StaffProfile = () => {
  const { staffUser, api, refreshProfile } = useStaffAuth();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api('get', '/api/staff/transactions');
        setTxns(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshProfile();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshProfile]);

  const now = new Date();
  const thisYear = now.getFullYear();
  const yearlySalary = txns
    .filter((t) => t.type === 'Salary' && new Date(t.createdAt).getFullYear() === thisYear)
    .reduce((sum, t) => sum + t.amount, 0);
  const yearlyCollections = txns
    .filter((t) => t.type === 'Collection' && new Date(t.createdAt).getFullYear() === thisYear)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSalary = txns.filter((t) => t.type === 'Salary').reduce((sum, t) => sum + t.amount, 0);

  const cards = [
    { label: 'Base Salary', value: `Rs ${Number(staffUser?.base_salary || 0).toLocaleString()}`, icon: <IndianRupee size={20} />, color: '#dbeafe', text: '#1d4ed8' },
    { label: 'Advance Outstanding', value: `Rs ${Number(staffUser?.advance_taken || 0).toLocaleString()}`, icon: <Wallet size={20} />, color: '#fee2e2', text: '#b91c1c' },
    { label: 'Yearly Salary Paid', value: `Rs ${yearlySalary.toLocaleString()}`, icon: <ShieldCheck size={20} />, color: '#dcfce7', text: '#15803d' },
    { label: 'Yearly Collections', value: `Rs ${yearlyCollections.toLocaleString()}`, icon: <TrendingUp size={20} />, color: '#ccfbf1', text: '#0f766e' },
  ];

  return (
    <div className="stack-lg">
      <section className="hero-card" style={{ background: 'linear-gradient(135deg, #1d4ed8, #0f172a 120%)' }}>
        <div className="page-head" style={{ marginBottom: 0, position: 'relative', zIndex: 1 }}>
          <div>
            <h1>{staffUser?.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.82)' }}>
              Review your account details, salary records and collection history from one cleaner profile page.
            </p>
          </div>
          <div className="page-actions">
            <div className="chip" style={{ background: 'rgba(255,255,255,0.16)', color: 'white', borderColor: 'rgba(255,255,255,0.16)' }}>
              <Phone size={14} />
              {staffUser?.phone}
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        {cards.map((card) => (
          <article key={card.label} className="metric-card">
            <div className="metric-icon" style={{ background: card.color, color: card.text }}>
              {card.icon}
            </div>
            <p className="metric-label">{card.label}</p>
            <p className="metric-value">{loading ? '...' : card.value}</p>
            <p className="metric-note">Live staff account data</p>
          </article>
        ))}
      </section>

      <section className="split-grid">
        <div className="panel">
          <div className="section-bar">
            <h3>Identity & Compensation</h3>
          </div>
          <div className="section-body stack-md">
            <div className="soft-card">
              <div className="field-label">Role</div>
              <div style={{ fontWeight: 800 }}>{staffUser?.role}</div>
            </div>
            <div className="soft-card">
              <div className="field-label">Phone Number</div>
              <div style={{ fontWeight: 800 }}>{staffUser?.phone}</div>
            </div>
            <div className="soft-card">
              <div className="field-label">Lifetime Salary Received</div>
              <div style={{ fontWeight: 800 }}>Rs {totalSalary.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="section-bar">
            <h3>Support</h3>
          </div>
          <div className="section-body stack-md">
            <div className="soft-card">
              <div className="field-label">Primary Support</div>
              <div style={{ fontWeight: 800 }}>7010425239</div>
            </div>
            <div className="soft-card">
              <div className="field-label">Secondary Support</div>
              <div style={{ fontWeight: 800 }}>9384424111</div>
            </div>
            <div className="soft-card" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
              Contact admin if salary settlement, advances or task issues need immediate help.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StaffProfile;
