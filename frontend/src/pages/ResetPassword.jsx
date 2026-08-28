import React from 'react';
import ResetPassword from '../components/auth/ResetPassword';

export const ResetPasswordPage = () => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <ResetPassword />
    </div>
  );
};

export default ResetPasswordPage;
