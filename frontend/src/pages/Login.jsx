import { useState } from 'react';
import { useAuth } from '../AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg" style={{ width: '400px', borderRadius: '12px', border: 'none' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <i className="bi bi-kanban text-primary" style={{ fontSize: '3rem' }}></i>
            <h3 className="fw-bold mt-2">WorkTrack Pro</h3>
            <p className="text-muted">Enterprise Work Tracking</p>
          </div>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold">Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm w-100">
              Login
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <small className="text-muted">Demo: manager@company.com / admin123</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
