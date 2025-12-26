import React from 'react';
import { useAuth } from '../context/AuthContext';
import MuiLayout from '../pages/Admin/MuiLayout';
import UserLayout from '../pages/User/UserLayout';

const LayoutWrapper = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  if (isAdmin) {
    return <MuiLayout>{children}</MuiLayout>;
  }

  return <UserLayout>{children}</UserLayout>;
};

export default LayoutWrapper;

