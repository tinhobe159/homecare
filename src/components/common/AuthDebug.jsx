import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthDebug = () => {
  const { isAdmin, isCaregiver, currentUser } = useAuth();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs z-50">
      <div className="font-bold mb-2">Auth Debug:</div>
      <div>isAdmin: {isAdmin ? 'true' : 'false'}</div>
      <div>isCaregiver: {isCaregiver ? 'true' : 'false'}</div>
      <div>currentUser: {currentUser ? JSON.stringify(currentUser, null, 2) : 'null'}</div>
      <div className="mt-2">
        <div className="font-bold">localStorage:</div>
        <div>isAdmin: {localStorage.getItem('isAdmin')}</div>
        <div>isCaregiver: {localStorage.getItem('isCaregiver')}</div>
        <div>currentUser: {localStorage.getItem('currentUser')}</div>
      </div>
    </div>
  );
};

export default AuthDebug;
