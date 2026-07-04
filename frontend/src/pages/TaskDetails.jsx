import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const TaskDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [update, setUpdate] = useState({ date: new Date().toISOString().split('T')[0], hours: 0, description: '', completion: 0, blockers: '' });
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = () => {
    axios.get(`/task/${id}`).then(res => setData(res.data));
  };

  const handleComment = async (e) => {
    e.preventDefault();
    await axios.post(`/task/${id}/comment`, { comment });
    setComment('');
    fetchData();
  };

  const handleAccept = async () => {
    await axios.post(`/task/${id}/accept`);
    fetchData();
  };

  const handleComplete = async () => {
    if(window.confirm('Are you sure you want to mark this task as completed?')) {
      await axios.post(`/task/${id}/complete`);
      fetchData();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await axios.post(`/task/${id}/daily_update`, update);
    setShowModal(false);
    fetchData();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    await axios.post(`/task/${id}/attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setFile(null);
    fetchData();
  };

  if (!data) return <div className="p-4">Loading...</div>;

  const { task, updates, comments, attachments } = data;

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
      <div className="mb-2">
        <Link to="/" className="text-decoration-none text-muted" style={{ fontSize: '0.875rem' }}><i className="bi bi-arrow-left"></i> Back to Dashboard</Link>
      </div>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center mb-1">
            <i className="bi bi-check-square-fill me-2" style={{ color: 'var(--jira-blue)' }}></i>
            <span className="text-muted fw-bold me-2">{task.project} / {task.task_id}</span>
          </div>
          <h3 className="fw-bold m-0 text-dark">{task.title}</h3>
        </div>
        <div>
          {user?.id === task.assignee.id && task.status === 'Open' && (
            <button className="btn-jira-primary me-2" onClick={handleAccept}>Accept Task</button>
          )}
          {user?.id === task.assignee.id && task.status !== 'Completed' && (
            <button className="btn btn-outline-primary me-2" style={{ borderRadius: '3px' }} onClick={() => setShowModal(true)}>Log Work</button>
          )}
          {user?.id === task.assignee.id && task.status === 'In Progress' && (
            <button className="btn btn-success me-2" style={{ borderRadius: '3px' }} onClick={handleComplete}><i className="bi bi-check-lg me-1"></i>Mark Completed</button>
          )}
          {user?.role === 'Manager' && (
            <Link to={`/task/${task.id}/update`} className="btn btn-outline-secondary" style={{ borderRadius: '3px' }}>Edit</Link>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="mb-4">
            <h6 className="fw-bold text-muted mb-3">Description</h6>
            <div className="jira-card p-4">
              <p style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>{task.description}</p>
            </div>
          </div>

          <div className="mb-4">
            <h6 className="fw-bold text-muted mb-3">Activity & Work Log</h6>
            <div className="jira-card p-4">
              {updates.length === 0 ? <p className="text-muted small">No work logged yet.</p> : (
                <div className="mt-3">
                  {updates.map(u => (
                    <div key={u.id} className="activity-item">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong className="text-dark">{task.assignee.name}</strong> logged work
                        </div>
                        <span className="text-muted small">{u.date.split('T')[0]}</span>
                      </div>
                      <div className="bg-light p-3 rounded" style={{ border: '1px solid var(--border-color)' }}>
                        <div className="d-flex mb-2">
                          <span className="badge bg-secondary me-2">{u.hours}h</span>
                          <span className="badge bg-primary">Progress: {u.completion}%</span>
                        </div>
                        <p className="mb-1 small">{u.description}</p>
                        {u.blockers && <p className="text-danger small fw-bold mb-0 mt-2">Blocked: {u.blockers}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h6 className="fw-bold text-muted mb-3">Attachments</h6>
            <div className="jira-card p-4">
              {attachments && attachments.length === 0 ? <p className="text-muted small mb-0">No attachments yet.</p> : (
                <div className="d-flex flex-wrap gap-3">
                  {attachments.map(a => (
                    <div key={a.id} className="d-flex align-items-center p-2 bg-light rounded" style={{ border: '1px solid var(--border-color)' }}>
                      <i className="bi bi-file-earmark-pdf-fill text-danger me-2 fs-4"></i>
                      <a href={import.meta.env.PROD ? `/api/${a.filepath}` : `http://localhost:5000/static/${a.filepath}`} target="_blank" rel="noreferrer" className="text-decoration-none fw-bold" style={{ color: 'var(--jira-blue)', fontSize: '0.9rem' }}>
                        {a.filename}
                      </a>
                    </div>
                  ))}
                </div>
              )}
              
              {user?.role === 'Manager' && (
                <form onSubmit={handleUpload} className="d-flex align-items-center mt-3 pt-3 border-top">
                  <input type="file" className="form-control form-control-sm me-2" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ borderRadius: '3px' }} required />
                  <button type="submit" className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '3px', whiteSpace: 'nowrap' }}>Upload PDF</button>
                </form>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h6 className="fw-bold text-muted mb-3">Comments</h6>
            <div className="jira-card p-4">
              {comments.map(c => (
                <div key={c.id} className="d-flex mb-4">
                  <div className="avatar-circle me-3 flex-shrink-0">
                    {c.author.charAt(0)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="mb-1">
                      <strong className="text-dark me-2">{c.author}</strong>
                      <span className="text-muted small">{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <div className="p-3 bg-light rounded" style={{ border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      {c.comment}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="d-flex mt-4">
                <div className="avatar-circle me-3 flex-shrink-0">
                  {user?.name.charAt(0)}
                </div>
                <form onSubmit={handleComment} className="flex-grow-1">
                  <textarea 
                    className="form-control mb-2" 
                    value={comment} 
                    onChange={e => setComment(e.target.value)} 
                    placeholder="Add a comment..." 
                    rows="2" 
                    required 
                    style={{ borderRadius: '3px' }}
                  />
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn-jira-primary">Save</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="jira-card p-4 sticky-top" style={{ top: '20px' }}>
            <h6 className="fw-bold text-muted mb-4 border-bottom pb-2">Details</h6>
            
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted fw-bold" style={{ fontSize: '0.8rem' }}>Status</span>
              <span className={`jira-badge ${getStatusClass(task.status)}`}>{task.status}</span>
            </div>
            
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted fw-bold" style={{ fontSize: '0.8rem' }}>Priority</span>
              <span className={`jira-badge ${getPriorityClass(task.priority)}`}><i className="bi bi-chevron-double-up me-1"></i>{task.priority}</span>
            </div>
            
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted fw-bold" style={{ fontSize: '0.8rem' }}>Issue Type</span>
              <span className="text-dark" style={{ fontSize: '0.9rem' }}>{task.task_type || 'Task'}</span>
            </div>

            {task.sprint && (
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted fw-bold" style={{ fontSize: '0.8rem' }}>Sprint</span>
                <span className="text-dark" style={{ fontSize: '0.9rem' }}>{task.sprint}</span>
              </div>
            )}

            {task.labels && (
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted fw-bold" style={{ fontSize: '0.8rem' }}>Labels</span>
                <span className="badge bg-secondary">{task.labels}</span>
              </div>
            )}
            
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted fw-bold" style={{ fontSize: '0.8rem' }}>Assignee</span>
              <div className="d-flex align-items-center text-dark" style={{ fontSize: '0.9rem' }}>
                <div className="avatar-circle me-2" style={{ width: '20px', height: '20px', fontSize: '0.6rem' }}>
                  {task.assignee.name.charAt(0)}
                </div>
                {task.assignee.name}
              </div>
            </div>
            
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted fw-bold" style={{ fontSize: '0.8rem' }}>Reporter</span>
              <div className="d-flex align-items-center text-dark" style={{ fontSize: '0.9rem' }}>
                <div className="avatar-circle me-2" style={{ width: '20px', height: '20px', fontSize: '0.6rem', backgroundColor: '#5E6C84' }}>
                  {task.assigner.name.charAt(0)}
                </div>
                {task.assigner.name}
              </div>
            </div>

            <div className="d-flex justify-content-between mb-4 border-bottom pb-3">
              <span className="text-muted fw-bold" style={{ fontSize: '0.8rem' }}>Due Date</span>
              <span className="text-dark" style={{ fontSize: '0.9rem' }}>{task.due_date.split('T')[0]}</span>
            </div>

            <h6 className="fw-bold text-muted mb-3 mt-4">Time Tracking</h6>
            <div className="jira-progress-container mb-2" style={{ height: '6px' }}>
              <div className="jira-progress-bar" style={{ width: `${task.completion_percentage}%` }}></div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <small className="text-muted">{task.completion_percentage}% complete</small>
            </div>
            
            <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.8rem' }}>
              <span>Estimated: {task.estimated_hours}h</span>
              <span>Logged: {task.actual_hours}h</span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(9, 30, 66, 0.54)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0" style={{ borderRadius: '3px' }}>
              <form onSubmit={handleUpdate}>
                <div className="modal-header border-0 bg-light">
                  <h5 className="modal-title fw-bold">Log Work</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="fw-bold text-muted small mb-1">Date</label>
                    <input type="date" className="form-control" value={update.date} onChange={e => setUpdate({...update, date: e.target.value})} required style={{ borderRadius: '3px' }}/>
                  </div>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="fw-bold text-muted small mb-1">Hours Logged</label>
                      <input type="number" className="form-control" value={update.hours} onChange={e => setUpdate({...update, hours: e.target.value})} required min="0.1" step="0.1" style={{ borderRadius: '3px' }}/>
                    </div>
                    <div className="col-6">
                      <label className="fw-bold text-muted small mb-1">Total Task Progress (%)</label>
                      <input type="number" className="form-control" value={update.completion} onChange={e => setUpdate({...update, completion: e.target.value})} required min="0" max="100" style={{ borderRadius: '3px' }}/>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="fw-bold text-muted small mb-1">Work Description</label>
                    <textarea className="form-control" rows="3" value={update.description} onChange={e => setUpdate({...update, description: e.target.value})} required style={{ borderRadius: '3px' }}/>
                  </div>
                  <div className="mb-1">
                    <label className="fw-bold text-muted small mb-1">Blockers (Optional)</label>
                    <textarea className="form-control" rows="2" value={update.blockers} onChange={e => setUpdate({...update, blockers: e.target.value})} style={{ borderRadius: '3px' }}/>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn text-muted fw-bold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-jira-primary">Save Worklog</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;
