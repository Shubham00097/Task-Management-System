import React, { useState, useEffect } from 'react';
import {
  Plus, Search, RefreshCw, Pencil, Trash2, CheckCircle2,
  Clock, AlertCircle, Filter, Calendar, ChevronDown
} from 'lucide-react';
import TaskModal from './TaskModal.jsx';

const API_BASE = '/api/v1';

const statuses = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];
const priorities = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];

export default function Dashboard({ user, token, showToast }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt:desc');
  
  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== 'ALL') query.set('status', statusFilter);
      if (priorityFilter !== 'ALL') query.set('priority', priorityFilter);
      if (search.trim()) query.set('search', search.trim());
      query.set('sortBy', sortBy);

      const res = await fetch(`${API_BASE}/tasks?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks);
      } else {
        showToast(data.error?.message || 'Failed to fetch tasks', 'error');
      }
    } catch (err) {
      showToast('Error loading tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reload tasks when filter/sort configurations change
  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, search, sortBy]);

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setDeletingId(taskId);
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Task deleted successfully', 'success');
        setTasks(prev => prev.filter(t => t.id !== taskId));
      } else {
        showToast(data.error?.message || 'Failed to delete task', 'error');
      }
    } catch (err) {
      showToast('Error deleting task', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate task statistics
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
  };

  // Format date helper
  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Stats row grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Tasks', value: stats.total, icon: <Filter size={16} />, color: 'var(--primary-light)', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Pending', value: stats.pending, icon: <Clock size={16} />, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
          { label: 'In Progress', value: stats.inProgress, icon: <AlertCircle size={16} />, color: 'var(--secondary)', bg: 'rgba(6,182,212,0.1)' },
          { label: 'Completed', value: stats.completed, icon: <CheckCircle2 size={16} />, color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 500 }}>{s.label}</p>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '4px', color: s.color }}>{s.value}</h2>
            </div>
            <div style={{ padding: '8px', background: s.bg, borderRadius: '6px', color: s.color }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filter and control panel */}
      <div className="card" style={{ padding: '14px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        
        {/* Text Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Select */}
        <div style={{ position: 'relative' }}>
          <select
            className="form-input"
            style={{ paddingRight: '28px', fontSize: '0.85rem', minWidth: '130px', cursor: 'pointer' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statuses.map(st => (
              <option key={st} value={st}>{st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        {/* Priority Select */}
        <div style={{ position: 'relative' }}>
          <select
            className="form-input"
            style={{ paddingRight: '28px', fontSize: '0.85rem', minWidth: '130px', cursor: 'pointer' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            {priorities.map(pr => (
              <option key={pr} value={pr}>{pr === 'ALL' ? 'All Priorities' : pr}</option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div style={{ position: 'relative' }}>
          <select
            className="form-input"
            style={{ paddingRight: '28px', fontSize: '0.85rem', minWidth: '150px', cursor: 'pointer' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="dueDate:asc">Due Date (Soonest)</option>
            <option value="dueDate:desc">Due Date (Latest)</option>
            <option value="title:asc">Title A-Z</option>
          </select>
        </div>

        {/* Action buttons */}
        <button
          onClick={fetchTasks}
          className="btn btn-secondary"
          style={{ padding: '8px 12px' }}
          title="Refresh List"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>

        <button
          onClick={() => { setEditingTask(null); setShowModal(true); }}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Plus size={15} /> Add Task
        </button>
      </div>

      {/* Task content body list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-sub)' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', borderStyle: 'dashed' }}>
          <CheckCircle2 size={36} style={{ margin: '0 auto 10px', color: 'var(--text-muted)' }} />
          <h4 style={{ color: 'var(--text-sub)', marginBottom: '4px' }}>No tasks found</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '14px' }}>
            {search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' ? 'Change your filter parameters.' : 'Add your first task to get started.'}
          </p>
          {!search && statusFilter === 'ALL' && priorityFilter === 'ALL' && (
            <button
              onClick={() => { setEditingTask(null); setShowModal(true); }}
              className="btn btn-primary"
            >
              <Plus size={14} /> Create a Task
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {tasks.map(task => (
            <div key={task.id} className="card task-card">
              
              {/* Header Title & Edit/Delete Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <h3 style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                  opacity: task.status === 'COMPLETED' ? 0.6 : 1,
                  wordBreak: 'break-word',
                  flex: 1
                }}>
                  {task.title}
                </h3>
                
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button
                    onClick={() => { setEditingTask(task); setShowModal(true); }}
                    style={{ background: '#272732', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: 'var(--text-sub)' }}
                    title="Edit"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={deletingId === task.id}
                    style={{ background: '#272732', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: 'var(--text-sub)' }}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Task Description text */}
              {task.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {task.description}
                </p>
              )}

              {/* Status and Priority pills */}
              <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                <span className={`badge ${task.status === 'PENDING' ? 'badge-pending' : task.status === 'IN_PROGRESS' ? 'badge-in-progress' : 'badge-completed'}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className={`badge ${task.priority === 'HIGH' ? 'badge-high' : task.priority === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                  {task.priority}
                </span>
              </div>

              {/* Footer dates info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>Created {formatDateStr(task.createdAt)}</span>
                {task.dueDate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'var(--danger)' : 'var(--text-sub)' }}>
                    <Calendar size={10} />
                    Due {formatDateStr(task.dueDate)}
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Task Modal popup */}
      {showModal && (
        <TaskModal
          task={editingTask}
          token={token}
          showToast={showToast}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSave={() => { setShowModal(false); setEditingTask(null); fetchTasks(); }}
        />
      )}

    </div>
  );
}
