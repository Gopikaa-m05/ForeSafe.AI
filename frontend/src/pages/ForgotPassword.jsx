import React from 'react';
import ForgotPassword from '../components/auth/ForgotPassword';

export const ForgotPasswordPage = () => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <ForgotPassword />
    </div>
  );
};

export default ForgotPasswordPage;
