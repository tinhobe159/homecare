import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => {
    const saved = localStorage.getItem('isAdmin');
    return saved ? JSON.parse(saved) : false;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  const login = (user, admin = false) => {
    if (admin) {
      // Admin login
      setIsAdmin(true);
      setCurrentUser({
        email: user.email,
        user_type: 'Admin',
        user_id: user.user_id || '550e8400-e29b-41d4-a716-446655440000'
      });
    } else {
      // Customer login
      setIsAdmin(false);
      setCurrentUser(user);
    }
    return true;
  };

  const logout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('currentUser');
  };

  const value = {
    isAdmin,
    currentUser,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};