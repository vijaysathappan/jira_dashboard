import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const TaskCreate = () => {
  const [employees, setEmployees] = useState([]);
  const [task, setTask] = useState({
    title: '', description: '', project: '', assigned_to: '', priority: 'Medium', due_date: '', estimated_hours: 0, task_type: 'Task', labels: '', sprint: ''
  });
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/employees').then(res => setEmployees(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post('/task', { ...task, assigned_to: parseInt(task.assigned_to) });
    
    if (file && res.data.task) {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`/task/${res.data.task.id}/attachment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    navigate('/');
  };

  return (
    <div>
      <div className="mb-2">
        <Link to="/" className="text-decoration-none text-muted" style={{ fontSize: '0.875rem' }}><i className="bi bi-arrow-left"></i> Back to Dashboard</Link>
      </div>
      
      <div className="jira-card p-4 mx-auto mt-2" style={{ maxWidth: '800px' }}>
        <h4 className="fw-bold mb-4" style={{ color: 'var(--jira-dark)' }}>Create New Issue</h4>
        <form onSubmit={handleSubmit}>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small mb-1">Project</label>
              <input type="text" className="form-control" style={{ borderRadius: '3px' }} value={task.project} onChange={e => setTask({...task, project: e.target.value})} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small mb-1">Issue Type</label>
              <select className="form-select" style={{ borderRadius: '3px' }} value={task.task_type} onChange={e => setTask({...task, task_type: e.target.value})}>
                <option>Task</option>
                <option>Story</option>
                <option>Bug</option>
                <option>Epic</option>
              </select>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label fw-bold text-muted small mb-1">Summary</label>
            <input type="text" className="form-control" style={{ borderRadius: '3px' }} value={task.title} onChange={e => setTask({...task, title: e.target.value})} required />
          </div>
          
          <div className="mb-3">
            <label className="form-label fw-bold text-muted small mb-1">Description</label>
            <textarea className="form-control" rows="5" style={{ borderRadius: '3px' }} value={task.description} onChange={e => setTask({...task, description: e.target.value})} required />
          </div>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small mb-1">Assignee</label>
              <select className="form-select" style={{ borderRadius: '3px' }} value={task.assigned_to} onChange={e => setTask({...task, assigned_to: e.target.value})} required>
                <option value="">Select Employee...</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small mb-1">Priority</label>
              <select className="form-select" style={{ borderRadius: '3px' }} value={task.priority} onChange={e => setTask({...task, priority: e.target.value})}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small mb-1">Sprint</label>
              <input type="text" className="form-control" style={{ borderRadius: '3px' }} placeholder="e.g. Sprint 42" value={task.sprint} onChange={e => setTask({...task, sprint: e.target.value})} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small mb-1">Labels</label>
              <input type="text" className="form-control" style={{ borderRadius: '3px' }} placeholder="e.g. frontend, ui" value={task.labels} onChange={e => setTask({...task, labels: e.target.value})} />
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small mb-1">Due Date</label>
              <input type="date" className="form-control" style={{ borderRadius: '3px' }} value={task.due_date} onChange={e => setTask({...task, due_date: e.target.value})} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-muted small mb-1">Original Estimate (hours)</label>
              <input type="number" className="form-control" style={{ borderRadius: '3px' }} value={task.estimated_hours} onChange={e => setTask({...task, estimated_hours: e.target.value})} min="0" step="0.5" />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="form-label fw-bold text-muted small mb-1">Attachment (Optional PDF)</label>
            <input type="file" className="form-control" accept=".pdf" style={{ borderRadius: '3px' }} onChange={e => setFile(e.target.files[0])} />
          </div>
          
          <div className="d-flex justify-content-end border-top pt-3">
            <button type="button" className="btn text-muted fw-bold me-2" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="btn-jira-primary px-4">Create Issue</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreate;
