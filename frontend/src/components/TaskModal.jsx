import React, { useState, useEffect } from 'react';
import { X, Plus, Save, AlertTriangle, Calendar, Flag, AlignLeft, Tag } from 'lucide-react';

export default function TaskModal({ task, onClose, onSave, showToast, token }) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'PENDING');
  const [priority, setPriority] = useState(task?.priority || 'MEDIUM');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split('T')[0] : '');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (!title.trim()) {
      setErrors(['Task title cannot be blank.']);
      return;
    }

    setLoading(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    };

    try {
      const url = isEdit ? `/api/v1/tasks/${task.id}` : '/api/v1/tasks';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors.map(err => err.message));
        } else {
          setErrors([data.error?.message || 'Failed to save task']);
        }
        return;
      }

      showToast(isEdit ? 'Task updated successfully' : 'Task created successfully', 'success');
      onSave();
    } catch (err) {
      setErrors(['Could not connect to the server. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 800,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-card)',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Modal Header bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            background: '#1a1a20',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
              {isEdit ? '✏️ Edit Task' : '➕ Create Task'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-sub)',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal form fields */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {errors.length > 0 && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '6px', padding: '10px' }}>
              {errors.map((err, i) => (
                <p key={i} style={{ color: '#f87171', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={12} /> {err}
                </p>
              ))}
            </div>
          )}

          {/* Title input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Tag size={12} /> Title *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="E.g., Read database notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Description input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlignLeft size={12} /> Description (Optional)
            </label>
            <textarea
              className="form-input"
              style={{ minHeight: '70px', resize: 'vertical' }}
              placeholder="Describe this task details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Select options row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flag size={12} /> Status
              </label>
              <select
                className="form-input"
                style={{ cursor: 'pointer' }}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="PENDING">⏳ Pending</option>
                <option value="IN_PROGRESS">⚡ In Progress</option>
                <option value="COMPLETED">✅ Completed</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flag size={12} /> Priority
              </label>
              <select
                className="form-input"
                style={{ cursor: 'pointer' }}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🔴 High</option>
              </select>
            </div>
          </div>

          {/* Due date input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> Due Date
            </label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '8px 12px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, padding: '8px 12px' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
