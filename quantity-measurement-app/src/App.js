import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Guard component — checks token before allowing access
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('qm_token');
  const isInvalidToken = !token || token === 'undefined' || token.split('.').length !== 3;
  if (isInvalidToken) {
    return <Navigate to="/" replace />;  // redirect to login if no token
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
