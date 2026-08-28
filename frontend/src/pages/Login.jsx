import React from 'react';
import LoginForm from '../components/auth/LoginForm';

export const Login = () => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <LoginForm />
    </div>
  );
};

export default Login;
