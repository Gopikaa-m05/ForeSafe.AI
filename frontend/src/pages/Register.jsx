import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

export const Register = () => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <RegisterForm />
    </div>
  );
};

export default Register;
