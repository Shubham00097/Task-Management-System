import React, { useState, useEffect } from 'react';
import {
  Users, Shield, Trash2, ChevronDown, RefreshCw,
  Crown, User as UserIcon, ListTodo
} from 'lucide-react';

const API_BASE = '/api/v1';

export default function AdminPanel({ token, currentUserId, showToast }) {
  const [users, setUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [tab, setTab] = useState('users'); // 'users' or 'tasks'
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  // Fetch all registered users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        showToast(data.error?.message || 'Failed to load users', 'error');
      }
    } catch (err) {
      showToast('Error fetching user accounts', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch all tasks from all users
  const fetchAllTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`${API_BASE}/tasks?all=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAllTasks(data.tasks);
      } else {
        showToast(data.error?.message || 'Failed to load tasks', 'error');
      }
    } catch (err) {
      showToast('Error fetching system tasks', 'error');
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAllTasks();
  }, []);

  // Update a user's role
  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRole(userId);
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Role updated successfully to ${newRole}`, 'success');
        // update local list state
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        showToast(data.error?.message || 'Failed to update user role', 'error');
      }
    } catch (err) {
      showToast('Error changing role', 'error');
    } finally {
      setUpdatingRole(null);
    }
  };

  // Delete a task globally
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task globally? This cannot be undone.')) return;
    setDeletingTaskId(taskId);
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Task deleted successfully', 'success');
        setAllTasks(prev => prev.filter(t => t.id !== taskId));
      } else {
        showToast(data.error?.message || 'Failed to delete task', 'error');
      }
    } catch (err) {
      showToast('Error deleting task', 'error');
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Admin Panel Warning/Info Banner */}
      <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderColor: 'var(--secondary)' }}>
        <div style={{ padding: '8px', background: 'rgba(6,182,212,0.1)', borderRadius: '6px', color: 'var(--secondary)' }}>
          <Shield size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Authorized Admin Access Only</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '2px' }}>
            You can modify user access groups, observe overall system activities, and delete tasks globally.
          </p>
        </div>
      </div>

      {/* Switch Tab Section */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={() => setTab('users')}
          className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
        >
          <Users size={14} /> Accounts ({users.length})
        </button>
        <button
          onClick={() => setTab('tasks')}
          className={`btn ${tab === 'tasks' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
        >
          <ListTodo size={14} /> All Tasks ({allTasks.length})
        </button>
        
        <button
          onClick={() => { fetchUsers(); fetchAllTasks(); }}
          className="btn btn-secondary"
          style={{ padding: '8px 12px', marginLeft: 'auto' }}
          title="Refresh statistics"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* USER ACCOUNTS TAB */}
      {tab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={15} style={{ color: 'var(--primary-light)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Registered Accounts</span>
          </div>

          {loadingUsers ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-sub)' }}>
              <RefreshCw size={18} className="spin" style={{ margin: '0 auto 6px', display: 'block' }} />
              Loading users list...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#17171c', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-sub)' }}>User</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-sub)' }}>Email</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-sub)' }}>Role</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-sub)' }}>Tasks count</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-sub)' }}>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: u.role === 'ADMIN' ? 'var(--primary)' : '#272732', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {u.role === 'ADMIN' ? <Crown size={14} color="white" /> : <UserIcon size={14} color="var(--text-sub)" />}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                            {u.id === currentUserId && <span style={{ fontSize: '0.68rem', color: 'var(--secondary)', marginLeft: '6px', fontWeight: 'bold' }}>(You)</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-sub)' }}>{u.email}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-medium' : 'badge-low'}`}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 'bold' }}>{u.taskCount}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <select
                            className="form-input"
                            style={{ padding: '4px 8px', fontSize: '0.8rem', minWidth: '95px', cursor: 'pointer' }}
                            value={u.role}
                            disabled={updatingRole === u.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          {updatingRole === u.id && <RefreshCw size={12} className="spin" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ALL TASKS TAB */}
      {tab === 'tasks' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListTodo size={15} style={{ color: 'var(--secondary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Global Platform Tasks Log</span>
          </div>

          {loadingTasks ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-sub)' }}>
              <RefreshCw size={18} className="spin" style={{ margin: '0 auto 6px', display: 'block' }} />
              Loading global task entries...
            </div>
          ) : allTasks.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No tasks found in the database.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#17171c', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-sub)' }}>Task Title</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-sub)' }}>Creator Name</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-sub)' }}>Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-sub)' }}>Priority</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-sub)' }}>Due Date</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-sub)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allTasks.map(task => (
                    <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 14px', maxWidth: '220px' }}>
                        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 500 }}>{task.user?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{task.user?.email}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${task.status === 'PENDING' ? 'badge-pending' : task.status === 'IN_PROGRESS' ? 'badge-in-progress' : 'badge-completed'}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${task.priority === 'HIGH' ? 'badge-high' : task.priority === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-sub)' }}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={deletingTaskId === task.id}
                          className="btn btn-danger"
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        >
                          <Trash2 size={11} /> {deletingTaskId === task.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
