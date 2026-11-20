import React, { createContext, useContext, useState } from 'react';
import { UserProfile, UserRole, ActiveSession } from '../types';
import { MOCK_ACTIVE_SESSIONS } from '../data/mockData';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  sessions: ActiveSession[];
  activeRole: UserRole;
  login: (emailOrPhone: string, pass: string, role?: UserRole) => Promise<{ success: boolean; requiresOtp?: boolean; error?: string }>;
  register: (data: Partial<UserProfile> & { password: string }) => Promise<{ success: boolean; requiresOtp?: boolean }>;
  verifyOtp: (code: string) => Promise<{ success: boolean }>;
  logout: () => void;
  revokeAllOtherSessions: () => void;
  switchRole: (role: UserRole) => void;
  linkChildAccount: (studentId: string, otpCode: string) => Promise<{ success: boolean; studentName?: string }>;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  student: {
    id: 'user-std-101',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@t18tech.edu',
    phone: '+91 98765 43210',
    role: 'student',
    collegeName: 'T18 Institute of Advanced Technology',
    studentId: 'T18-2024-CS089',
    assignedBusId: 'bus-t18-01',
    registeredStopId: 'stop-3', // Oakridge Green Boulevard
    twoFactorEnabled: true,
    sessionsCount: 2
  },
  parent: {
    id: 'user-par-201',
    fullName: 'Meera Sharma',
    email: 'meera.sharma@gmail.com',
    phone: '+91 98450 11223',
    role: 'parent',
    collegeName: 'T18 Institute of Advanced Technology',
    linkedChildId: 'user-std-101',
    linkedChildName: 'Aarav Sharma',
    linkedChildStudentId: 'T18-2024-CS089',
    assignedBusId: 'bus-t18-01',
    twoFactorEnabled: true,
    sessionsCount: 1
  },
  driver: {
    id: 'user-drv-301',
    fullName: 'Vikramaditya Rao',
    email: 'vikram.rao@t18fleet.org',
    phone: '+91 98450 18181',
    role: 'driver',
    collegeName: 'T18 Transport Department',
    assignedBusId: 'bus-t18-01',
    twoFactorEnabled: true,
    sessionsCount: 1
  },
  admin: {
    id: 'user-adm-401',
    fullName: 'Prof. K. Sundaram',
    email: 'transport.director@t18tech.edu',
    phone: '+91 98450 99000',
    role: 'admin',
    collegeName: 'T18 Institute of Advanced Technology',
    twoFactorEnabled: true,
    sessionsCount: 3
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEFAULT_USERS.student);
  const [sessions, setSessions] = useState<ActiveSession[]>(MOCK_ACTIVE_SESSIONS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const login = async (
    emailOrPhone: string,
    _pass: string,
    roleOverride?: UserRole
  ): Promise<{ success: boolean; requiresOtp?: boolean; error?: string }> => {
    // Simulated secure credential verification
    if (!emailOrPhone) {
      return { success: false, error: 'Email or phone required' };
    }
    const role = roleOverride || activeRole;
    const targetUser = DEFAULT_USERS[role];
    setCurrentUser(targetUser);
    setActiveRole(role);
    setIsAuthenticated(true);
    return { success: true };
  };

  const register = async (
    data: Partial<UserProfile> & { password: string }
  ): Promise<{ success: boolean; requiresOtp?: boolean }> => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      fullName: data.fullName || 'New User',
      email: data.email || 'user@t18tech.edu',
      phone: data.phone || '+91 90000 00000',
      role: data.role || 'student',
      collegeName: data.collegeName || 'T18 Institute of Advanced Technology',
      studentId: data.studentId || 'T18-2026-NEW',
      assignedBusId: 'bus-t18-01',
      registeredStopId: 'stop-3',
      twoFactorEnabled: true,
      sessionsCount: 1
    };
    setCurrentUser(newUser);
    setActiveRole(newUser.role);
    setIsAuthenticated(true);
    return { success: true, requiresOtp: true };
  };

  const verifyOtp = async (code: string): Promise<{ success: boolean }> => {
    if (code.length === 6) {
      return { success: true };
    }
    return { success: false };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const revokeAllOtherSessions = () => {
    setSessions(prev => prev.filter(s => s.current));
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        sessionsCount: 1
      });
    }
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    const userForRole = DEFAULT_USERS[role];
    setCurrentUser(userForRole);
    setIsAuthenticated(true);
  };

  const linkChildAccount = async (
    studentId: string,
    _otpCode: string
  ): Promise<{ success: boolean; studentName?: string }> => {
    if (currentUser && currentUser.role === 'parent') {
      const childName = 'Aarav Sharma';
      setCurrentUser({
        ...currentUser,
        linkedChildId: 'user-std-101',
        linkedChildName: childName,
        linkedChildStudentId: studentId,
        assignedBusId: 'bus-t18-01'
      });
      return { success: true, studentName: childName };
    }
    return { success: false };
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        ...data
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        sessions,
        activeRole,
        login,
        register,
        verifyOtp,
        logout,
        revokeAllOtherSessions,
        switchRole,
        linkChildAccount,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAppAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAppAuth must be used within AuthProvider');
  }
  return context;
};
