import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    axios.get('/dashboard').then(res => setData(res.data));
  }, []);

  if (!data) return <div className="p-4">Loading...</div>;

  const getPriorityClass = (priority) => {
    const p = priority.toLowerCase();
    if(p === 'critical') return 'priority-critical';
    if(p === 'high') return 'priority-high';
    if(p === 'medium') return 'priority-medium';
    return 'priority-low';
  };

  const getStatusClass = (status) => {
    const s = status.toLowerCase().replace(' ', '');
    return `badge-${s}`;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0" style={{ letterSpacing: '-0.5px' }}>My Work</h3>
        <span className="text-secondary">Welcome back, {user?.name}!</span>
      </div>
      
      <div className="row mb-4">
        {[
          { label: 'Pending', value: data.metrics.pending, icon: 'bi-hourglass-split', color: 'text-warning' },
          { label: 'In Progress', value: data.metrics.in_progress, icon: 'bi-play-circle', color: 'text-primary' },
          { label: 'Completed', value: data.metrics.completed, icon: 'bi-check-circle', color: 'text-success' }
        ].map((metric, i) => (
          <div key={i} className="col-md-4">
            <div className="metric-card p-3 h-100">
              <div className="d-flex justify-content-between mb-2">
                <h6 className="text-muted text-uppercase fw-bold m-0" style={{ fontSize: '0.75rem' }}>{metric.label}</h6>
                <i className={`bi ${metric.icon} fs-5 ${metric.color}`}></i>
              </div>
              <div className="metric-value text-dark">{metric.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col-12">
          <div className="jira-card p-4">
            <h5 className="fw-bold mb-4" style={{ fontSize: '1rem' }}>Assigned to Me</h5>
            <div className="table-responsive">
              <table className="jira-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Summary</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Progress</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tasks.length === 0 ? (
                    <tr><td colSpan="7" className="text-center text-muted py-4">No tasks assigned.</td></tr>
                  ) : null}
                  {data.tasks.map(t => (
                    <tr key={t.id}>
                      <td className="fw-bold"><Link to={`/task/${t.id}`} className="text-decoration-none" style={{ color: 'var(--jira-blue)' }}>{t.task_id}</Link></td>
                      <td>{t.title}</td>
                      <td><span className={`jira-badge ${getPriorityClass(t.priority)}`}><i className="bi bi-chevron-double-up me-1"></i>{t.priority}</span></td>
                      <td><span className={`jira-badge ${getStatusClass(t.status)}`}>{t.status}</span></td>
                      <td className="text-muted">{t.due_date.split('T')[0]}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="jira-progress-container flex-grow-1 me-2" style={{ maxWidth: '100px' }}>
                            <div className="jira-progress-bar" style={{ width: `${t.completion_percentage}%` }}></div>
                          </div>
                          <small className="text-muted">{t.completion_percentage}%</small>
                        </div>
                      </td>
                      <td>
                        <Link to={`/task/${t.id}`} className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '3px' }}>Update</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
