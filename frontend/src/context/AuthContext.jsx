import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const DEMO_USERS = {
  ADMIN: {
    username: 'admin',
    name: 'Navodaya Admin',
    role: 'ADMIN',
    roleLabel: 'Administrator',
    email: 'admin@navodaya.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
  },
  PRINCIPAL: {
    username: 'principal',
    name: 'Dr. K. Sharma',
    role: 'PRINCIPAL',
    roleLabel: 'Principal',
    email: 'principal@navodaya.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
  },
  TEACHER_CALLER: {
    username: 'anitha',
    name: 'P. Anitha (Staff)',
    role: 'TEACHER_CALLER',
    roleLabel: 'Fee Collection Staff',
    email: 'anitha@navodaya.edu',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('edufee_role');
    return DEMO_USERS[saved] || DEMO_USERS.ADMIN;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Default to true for convenience if already set, or check localStorage
    return localStorage.getItem('edufee_authenticated') === 'true';
  });

  const login = (role = 'ADMIN') => {
    const u = DEMO_USERS[role] || DEMO_USERS.ADMIN;
    setCurrentUser(u);
    setIsAuthenticated(true);
    localStorage.setItem('edufee_role', u.role);
    localStorage.setItem('edufee_authenticated', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('edufee_authenticated');
  };

  const switchRole = (newRole) => {
    if (DEMO_USERS[newRole]) {
      const u = DEMO_USERS[newRole];
      setCurrentUser(u);
      setIsAuthenticated(true);
      localStorage.setItem('edufee_role', u.role);
      localStorage.setItem('edufee_authenticated', 'true');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        role: currentUser.role,
        isAuthenticated,
        login,
        logout,
        switchRole,
        isCaller: currentUser.role === 'TEACHER_CALLER',
        isAdmin: currentUser.role === 'ADMIN',
        isPrincipal: currentUser.role === 'PRINCIPAL'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
