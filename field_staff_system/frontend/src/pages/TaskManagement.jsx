import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Calendar, ChevronRight, Plus, Search, Trash2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const COLS = ['Pending', 'In Progress', 'Completed'];

const badgeClass = {
  Pending: 'badge badge-amber',
  'In Progress': 'badge badge-blue',
  Completed: 'badge badge-teal',
};

const TaskManagement = () => {
  const { api } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ clientName: '', contactNumber: '', assignedTo: '', notes: '', date: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const [t, u] = await Promise.all([api('get', '/api/admin/tasks'), api('get', '/api/admin/users')]);
      setTasks(t.data);
      setStaff(u.data.filter((member) => member.role === 'Staff'));
    } catch (e) {
      console.error(e);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!form.clientName || !form.contactNumber || !form.assignedTo) {
      setError('Client name, contact number and assigned staff are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api('post', '/api/admin/tasks', form);
      setModal(false);
      setForm({ clientName: '', contactNumber: '', assignedTo: '', notes: '', date: '' });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api('put', `/api/admin/tasks/${id}`, { status });
      await load();
    } catch {
      alert('Status update failed');
    }
  };

  const removeTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api('delete', `/api/admin/tasks/${id}`);
      await load();
    } catch {
      alert('Delete failed');
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      task.assignedTo?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="stack-lg">
      <section className="page-head">
        <div>
          <h1>Task Board</h1>
          <p>Track every assigned job, keep staff accountable and move field work cleanly from pending to complete.</p>
        </div>
        <div className="page-actions">
          <div className="relative" style={{ minWidth: 280 }}>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="search-shell"
              style={{ paddingLeft: 46 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks or staff"
            />
          </div>
          <button type="button" className="btn btn-brand" onClick={() => setModal(true)}>
            <Plus size={16} />
            Assign Task
          </button>
        </div>
      </section>

      <section className="triple-grid">
        {COLS.map((column) => {
          const columnTasks = filteredTasks.filter((task) => task.status === column);
          return (
            <div key={column} className="panel">
              <div className="section-bar">
                <h3>{column}</h3>
                <span className={badgeClass[column]}>{columnTasks.length}</span>
              </div>
              <div className="section-body" style={{ display: 'grid', gap: 14 }}>
                {!columnTasks.length ? (
                  <div className="soft-card" style={{ color: 'var(--muted)' }}>
                    No tasks in this stage.
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <article key={task._id} className="soft-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{task.clientName}</h4>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--muted)', marginTop: 8, fontSize: '.84rem' }}>
                            <User size={14} />
                            {task.assignedTo?.name || 'Unassigned'}
                          </div>
                        </div>
                        <button type="button" className="btn btn-danger" onClick={() => removeTask(task._id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: '.86rem', lineHeight: 1.6 }}>
                        {task.notes || 'No special instructions added for this job.'}
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--muted)', marginTop: 14, fontSize: '.82rem' }}>
                        <Calendar size={14} />
                        {task.date ? new Date(task.date).toLocaleDateString('en-IN') : 'No date selected'}
                      </div>

                      <div className="relative" style={{ marginTop: 16 }}>
                        <select
                          className="select-shell"
                          value={task.status}
                          onChange={(e) => changeStatus(task._id, e.target.value)}
                        >
                          {COLS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <ChevronRight size={16} className="absolute right-14 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </section>

      {modal ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-head">
              <h3>Assign New Task</h3>
              <p>Create a cleaner job brief and assign the right field staff immediately.</p>
            </div>
            <div className="modal-body">
              {error ? (
                <div className="alert alert-error" style={{ marginBottom: 18 }}>
                  <AlertCircle size={16} style={{ marginRight: 8 }} />
                  {error}
                </div>
              ) : null}

              <div className="dual-grid">
                <div>
                  <label className="field-label">Client / Site</label>
                  <input className="input-shell" value={form.clientName} onChange={(e) => setForm((x) => ({ ...x, clientName: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label">Contact Number</label>
                  <input className="input-shell" value={form.contactNumber} onChange={(e) => setForm((x) => ({ ...x, contactNumber: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label">Assign Staff</label>
                  <select className="select-shell" value={form.assignedTo} onChange={(e) => setForm((x) => ({ ...x, assignedTo: e.target.value }))}>
                    <option value="">Select staff member</option>
                    {staff.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Target Date</label>
                  <input type="date" className="input-shell" value={form.date} onChange={(e) => setForm((x) => ({ ...x, date: e.target.value }))} />
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <label className="field-label">Instructions</label>
                <textarea className="textarea-shell" value={form.notes} onChange={(e) => setForm((x) => ({ ...x, notes: e.target.value }))} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-neutral" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-brand" onClick={handleCreate} disabled={saving}>
                {saving ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TaskManagement;
