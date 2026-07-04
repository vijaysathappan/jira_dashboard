import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import TaskDetails from './pages/TaskDetails';
import TaskCreate from './pages/TaskCreate';
import TaskUpdate from './pages/TaskUpdate';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={
          user?.role === 'Manager' ? <ManagerDashboard /> : <EmployeeDashboard />
        } />
        
        <Route path="task/new" element={
          <ProtectedRoute allowedRoles={['Manager']}><TaskCreate /></ProtectedRoute>
        } />
        
        <Route path="task/:id" element={<TaskDetails />} />
        
        <Route path="task/:id/update" element={
          <ProtectedRoute allowedRoles={['Manager']}><TaskUpdate /></ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
