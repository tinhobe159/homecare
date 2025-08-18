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

  const [isCaregiver, setIsCaregiver] = useState(() => {
    const saved = localStorage.getItem('isCaregiver');
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
    localStorage.setItem('isCaregiver', JSON.stringify(isCaregiver));
  }, [isCaregiver]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  const login = (user, userType = 'customer') => {
    if (userType === 'admin') {
      // Admin login
      setIsAdmin(true);
      setIsCaregiver(false);
      setCurrentUser({
        email: user.email,
        user_type: 'Admin',
        user_id: user.user_id || '550e8400-e29b-41d4-a716-446655440000'
      });
    } else if (userType === 'caregiver') {
      // Caregiver login
      setIsAdmin(false);
      setIsCaregiver(true);
      setCurrentUser({
        ...user,
        user_type: 'Caregiver'
      });
    } else {
      // Customer login
      setIsAdmin(false);
      setIsCaregiver(false);
      setCurrentUser(user);
    }
    return true;
  };

  const logout = () => {
    setIsAdmin(false);
    setIsCaregiver(false);
    setCurrentUser(null);
    
    // Clear all localStorage items
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isCaregiver');
    localStorage.removeItem('currentUser');
    
    // Force clear any other potential auth-related items
    localStorage.clear();
  };

  const value = {
    isAdmin,
    isCaregiver,
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