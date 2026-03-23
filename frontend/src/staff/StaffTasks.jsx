import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Calendar, Check, CheckCircle, Clock, Edit3, MapPin, Phone, X } from 'lucide-react';
import { useStaffAuth } from '../context/StaffAuthContext';

const options = ['In Progress', 'Completed'];

const badgeClass = {
  Completed: 'badge badge-teal',
  'In Progress': 'badge badge-blue',
  Pending: 'badge badge-amber',
};

const StaffTasks = () => {
  const { api } = useStaffAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ status: '', notes: '' });
  const [saving, setSaving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api('get', '/api/staff/tasks');
      setTasks(data);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Unable to load your assigned tasks right now.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const openUpdate = (task) => {
    setExpanded(task._id);
    setForm({ status: task.status, notes: task.notes || '' });
  };

  const submit = async (id) => {
    setSaving(id);
    const payload = { ...form };

    if (form.status === 'Completed') {
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 })
        );
        payload.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch {
        alert('GPS verification is mandatory to complete a task.');
        setSaving(null);
        return;
      }
    }

    try {
      await api('put', `/api/staff/tasks/${id}`, payload);
      setExpanded(null);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Update failed');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="stack-lg">
      <section className="page-head">
        <div>
          <h1>My Tasks</h1>
          <p>Open assigned jobs, update their phase and send verified progress back to the admin panel.</p>
        </div>
      </section>

      {loading ? <div className="panel"><div className="section-body empty-state">Loading your tasks...</div></div> : null}

      {!loading && error ? (
        <div className="panel">
          <div className="section-body">
            <div className="alert alert-error">{error}</div>
          </div>
        </div>
      ) : null}

      {!loading && !tasks.length ? (
        <div className="panel">
          <div className="section-body empty-state">No tasks are assigned to you right now.</div>
        </div>
      ) : null}

      <section className="dual-grid">
        {tasks.map((task) => (
          <article key={task._id} className="panel">
            <div className="section-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <div>
                  <span className={badgeClass[task.status] || 'badge badge-slate'}>{task.status}</span>
                  <h3 style={{ margin: '14px 0 0', fontSize: '1.2rem' }}>{task.clientName}</h3>
                </div>
                <button type="button" className="btn btn-neutral" onClick={() => openUpdate(task)}>
                  <Edit3 size={15} />
                  Update
                </button>
              </div>

              <div style={{ marginTop: 18, display: 'grid', gap: 10, color: 'var(--muted)', fontSize: '.88rem' }}>
                {task.contactNumber ? (
                  <a href={`tel:${task.contactNumber}`} className="chip" style={{ width: 'fit-content' }}>
                    <Phone size={13} />
                    {task.contactNumber}
                  </a>
                ) : null}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Calendar size={14} />
                  {task.date ? new Date(task.date).toLocaleDateString('en-IN') : 'No target date'}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <MapPin size={14} />
                  Field deployment
                </div>
              </div>

              <div className="soft-card" style={{ marginTop: 18, color: 'var(--muted)', lineHeight: 1.7 }}>
                {task.notes || 'No extra instructions were added for this task.'}
              </div>

              {expanded === task._id ? (
                <div className="stack-md" style={{ marginTop: 18 }}>
                  <div>
                    <label className="field-label">Status</label>
                    <div className="page-actions">
                      {options.map((status) => (
                        <button
                          key={status}
                          type="button"
                          className={form.status === status ? 'btn btn-brand' : 'btn btn-neutral'}
                          onClick={() => setForm((prev) => ({ ...prev, status }))}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Notes</label>
                    <textarea
                      className="textarea-shell"
                      value={form.notes}
                      onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  <div className="page-actions">
                    <button type="button" className="btn btn-neutral" onClick={() => setExpanded(null)}>
                      <X size={15} />
                      Cancel
                    </button>
                    <button type="button" className="btn btn-brand" onClick={() => submit(task._id)} disabled={saving === task._id}>
                      {saving === task._id ? 'Syncing...' : (
                        <>
                          <Check size={15} />
                          Save Update
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="soft-card" style={{ marginTop: 18 }}>
                  <div className="badge badge-slate">
                    <AlertCircle size={12} />
                    GPS verification required for completion
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default StaffTasks;
