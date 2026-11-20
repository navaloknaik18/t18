import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAppAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { TrackingProvider, useTracking } from './context/TrackingContext';
import { Header } from './components/layout/Header';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { ParentDashboard } from './components/dashboards/ParentDashboard';
import { DriverDashboard } from './components/dashboards/DriverDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { LiveBusMap } from './components/map/LiveBusMap';
import { Garage3D } from './components/garage/Garage3D';
import { RacingArena3D } from './components/racing/RacingArena3D';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { SmartArrivalAlarmModal } from './components/alarm/SmartArrivalAlarmModal';
import { SimulatedPhoneCallModal } from './components/alarm/SimulatedPhoneCallModal';
import { EmergencySOSModal } from './components/common/EmergencySOSModal';
import { LoginModal, RegisterModal, OTPModal } from './components/auth/AuthModals';
import { UserProfileModal } from './components/profile/UserProfileModal';

const MainContent: React.FC = () => {
  const { activeRole } = useAppAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modal States
  const [alarmModalOpen, setAlarmModalOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-t18-cyan selection:text-black">
      {/* Top Header */}
      <Header
        onOpenNotifications={() => setActiveTab('notifications')}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-24 pt-2">
        {activeTab === 'dashboard' && (
          <>
            {activeRole === 'student' && (
              <StudentDashboard
                onOpenMap={() => setActiveTab('map')}
                onOpenGarage={() => setActiveTab('garage')}
                onOpenAlarm={() => setAlarmModalOpen(true)}
                onOpenSos={() => setSosModalOpen(true)}
              />
            )}
            {activeRole === 'parent' && (
              <ParentDashboard
                onOpenMap={() => setActiveTab('map')}
                onOpenAlarm={() => setAlarmModalOpen(true)}
              />
            )}
            {activeRole === 'driver' && (
              <DriverDashboard onOpenMap={() => setActiveTab('map')} />
            )}
            {activeRole === 'admin' && (
              <AdminDashboard onOpenMap={() => setActiveTab('map')} />
            )}
          </>
        )}

        {activeTab === 'map' && (
          <div className="h-[calc(100vh-140px)] min-h-[520px] p-2 lg:p-4">
            <LiveBusMap
              onOpenAlarm={() => setAlarmModalOpen(true)}
              onOpenSos={() => setSosModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'garage' && <Garage3D />}

        {activeTab === 'racing' && (
          <div className="p-2 lg:p-4">
            <RacingArena3D />
          </div>
        )}

        {activeTab === 'notifications' && <NotificationCenter />}

        {activeTab === 'profile' && (
          <div className="p-4">
            <div className="text-center my-8">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="py-3 px-6 rounded-xl bg-t18-cyan text-black font-gaming font-black uppercase tracking-wider shadow-glow-cyan"
              >
                Open Security & Profile Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile-First Gaming Navigation Dock */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={tab => {
          if (tab === 'profile') {
            setProfileModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* Global Interactive Modals */}
      <SmartArrivalAlarmModal
        isOpen={alarmModalOpen}
        onClose={() => setAlarmModalOpen(false)}
      />

      <SimulatedPhoneCallModal />

      <EmergencySOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onOpenRegister={() => setRegisterModalOpen(true)}
        onOpenForgot={() => alert('Password reset link sent to your registered Gmail address.')}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onOpenLogin={() => setLoginModalOpen(true)}
        onSuccessNeedOtp={() => setOtpModalOpen(true)}
      />

      <OTPModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
      />

      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <AuthProvider>
          <TrackingProvider>
            <MainContent />
          </TrackingProvider>
        </AuthProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}
