import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ManagerDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('/dashboard').then(res => setData(res.data));
  }, []);

  if (!data) return <div className="p-4">Loading...</div>;

  const chartData = {
    labels: ['Open', 'In Progress', 'Blocked', 'Completed'],
    datasets: [{
      data: [
        data.tasks.filter(t => t.status === 'Open').length,
        data.tasks.filter(t => t.status === 'In Progress').length,
        data.tasks.filter(t => t.status === 'Blocked').length,
        data.tasks.filter(t => t.status === 'Completed').length,
      ],
      backgroundColor: ['#DFE1E6', '#0052CC', '#FFEBE6', '#E3FCEF'],
      borderColor: ['#DFE1E6', '#0052CC', '#FF5630', '#006644'],
      borderWidth: 1
    }]
  };

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
        <h3 className="fw-bold m-0" style={{ letterSpacing: '-0.5px' }}>Dashboard Overview</h3>
        <Link to="/task/new" className="btn-jira-primary text-decoration-none">Create Task</Link>
      </div>
      
      <div className="row mb-4">
        {[
          { label: 'Total Tasks', value: data.metrics.total, icon: 'bi-list-task', color: 'text-primary' },
          { label: 'Completed', value: data.metrics.completed, icon: 'bi-check-circle', color: 'text-success' },
          { label: 'Pending', value: data.metrics.pending, icon: 'bi-hourglass-split', color: 'text-warning' },
          { label: 'Overdue', value: data.metrics.overdue, icon: 'bi-exclamation-triangle', color: 'text-danger' }
        ].map((metric, i) => (
          <div key={i} className="col-md-3">
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

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="jira-card h-100 p-4">
            <h5 className="fw-bold mb-4" style={{ fontSize: '1rem' }}>Task Status Distribution</h5>
            <div style={{ height: '220px' }}>
              <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="jira-card h-100 p-4">
            <h5 className="fw-bold mb-4" style={{ fontSize: '1rem' }}>Today's Updates Activity</h5>
            <div>
              {data.recent_updates.length === 0 ? <p className="text-muted">No updates yet today.</p> : null}
              {data.recent_updates.map(u => (
                <div key={u.id} className="activity-item">
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong className="text-dark">{u.employee_name}</strong> updated <Link to={`/task/${u.task_db_id}`} className="text-decoration-none fw-bold" style={{ color: 'var(--jira-blue)' }}>{u.task_id}</Link>
                    </div>
                    <span className="text-muted small">{u.hours}h logged</span>
                  </div>
                  <div className="mt-2">
                    <div className="d-flex align-items-center">
                      <span className="me-2 small fw-bold text-muted">Progress</span>
                      <div className="jira-progress-container flex-grow-1" style={{ maxWidth: '200px' }}>
                        <div className="jira-progress-bar" style={{ width: `${u.completion}%` }}></div>
                      </div>
                      <span className="ms-2 small">{u.completion}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="jira-card p-4">
            <h5 className="fw-bold mb-4" style={{ fontSize: '1rem' }}>All Tasks</h5>
            <div className="table-responsive">
              <table className="jira-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Summary</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tasks.map(t => (
                    <tr key={t.id}>
                      <td className="fw-bold"><Link to={`/task/${t.id}`} className="text-decoration-none" style={{ color: 'var(--jira-blue)' }}>{t.task_id}</Link></td>
                      <td>{t.title}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle me-2" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                            {t.assignee.name.charAt(0)}
                          </div>
                          {t.assignee.name}
                        </div>
                      </td>
                      <td><span className={`jira-badge ${getPriorityClass(t.priority)}`}><i className="bi bi-chevron-double-up me-1"></i>{t.priority}</span></td>
                      <td><span className={`jira-badge ${getStatusClass(t.status)}`}>{t.status}</span></td>
                      <td className="text-muted">{t.due_date.split('T')[0]}</td>
                      <td>
                        <div className="jira-progress-container" style={{ width: '100px' }}>
                          <div className="jira-progress-bar" style={{ width: `${t.completion_percentage}%` }}></div>
                        </div>
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

export default ManagerDashboard;
