import React, { useState } from 'react';
import { useAppAuth } from '../../context/AuthContext';
import { useAppAudio } from '../../context/AudioContext';
import { UserRole } from '../../types';
import {
  Lock,
  Mail,
  Phone,
  User,
  GraduationCap,
  Shield,
  KeyRound,
  X,
  CheckCircle2,
  Smartphone,
  LogOut,
  Laptop
} from 'lucide-react';

export const LoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onOpenForgot: () => void;
}> = ({ isOpen, onClose, onOpenRegister, onOpenForgot }) => {
  const { login, activeRole } = useAppAuth();
  const { playUiClick } = useAppAudio();

  const [identifier, setIdentifier] = useState('aarav.sharma@t18tech.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>(activeRole);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playUiClick();
    const res = await login(identifier, password, selectedRole);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[650] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-t18-cyan/40 shadow-glow-cyan text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-t18-blue/20 border border-t18-cyan/40 text-t18-cyan shadow-glow-cyan">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-gaming uppercase tracking-wide">
              Secure Terminal Login
            </h3>
            <span className="text-[10px] text-white/50 font-mono">
              256-BIT ENCRYPTED SESSION HANDSHAKE
            </span>
          </div>
        </div>

        {/* Role Selector Pill */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 my-4 text-[11px] font-gaming font-bold uppercase">
          {(['student', 'parent', 'driver', 'admin'] as const).map(role => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`py-1.5 rounded-lg transition-all ${
                selectedRole === role
                  ? 'bg-t18-cyan text-black font-black shadow-glow-cyan'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-mono text-white/70 block mb-1">
              Registered Gmail or Phone
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-white/40" />
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full bg-t18-surface border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-mono text-white/70">Password</label>
              <button
                type="button"
                onClick={onOpenForgot}
                className="text-[11px] font-mono text-t18-cyan hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-t18-surface border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
                required
              />
            </div>
          </div>

          {error && <div className="text-xs text-red-400 font-mono">{error}</div>}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-t18-blue to-t18-cyan text-black font-gaming font-black text-xs uppercase tracking-wider shadow-glow-cyan mt-2"
          >
            Authenticate & Enter
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs font-mono text-white/60">
          New to T18?{' '}
          <button
            onClick={() => {
              onClose();
              onOpenRegister();
            }}
            className="text-t18-cyan font-bold hover:underline"
          >
            Register Student / Guardian Account
          </button>
        </div>
      </div>
    </div>
  );
};

export const RegisterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onSuccessNeedOtp: () => void;
}> = ({ isOpen, onClose, onOpenLogin, onSuccessNeedOtp }) => {
  const { register } = useAppAuth();
  const { playUiClick } = useAppAudio();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeName, setCollegeName] = useState('T18 Institute of Advanced Technology');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playUiClick();
    const res = await register({
      fullName,
      email,
      phone,
      collegeName,
      studentId,
      role,
      password
    });
    if (res.success) {
      onClose();
      onSuccessNeedOtp();
    }
  };

  return (
    <div className="fixed inset-0 z-[650] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
      <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-t18-cyan/40 shadow-glow-cyan text-white relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold font-gaming uppercase tracking-wide mb-1">
          Create T18 Account
        </h3>
        <p className="text-xs text-white/60 font-mono mb-4">
          Student, Parent & Driver Transportation Enrollment
        </p>

        {/* Role Selector */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 mb-4 text-[11px] font-gaming font-bold uppercase">
          {(['student', 'parent', 'driver', 'admin'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-1.5 rounded-lg transition-all ${
                role === r
                  ? 'bg-t18-cyan text-black font-black shadow-glow-cyan'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-mono text-white/70 block mb-1">Full Legal Name</label>
            <input
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-t18-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-mono text-white/70 block mb-1">Gmail Address</label>
              <input
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-t18-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-mono text-white/70 block mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-t18-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-mono text-white/70 block mb-1">College Name</label>
              <input
                type="text"
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                className="w-full bg-t18-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-mono text-white/70 block mb-1">Student / Roll ID</label>
              <input
                type="text"
                placeholder="T18-2024-CS089"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full bg-t18-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-white/70 block mb-1">Password</label>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-t18-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-t18-blue to-t18-cyan text-black font-gaming font-black text-xs uppercase tracking-wider shadow-glow-cyan mt-3"
          >
            Register & Send OTP
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs font-mono text-white/60">
          Already registered?{' '}
          <button
            onClick={() => {
              onClose();
              onOpenLogin();
            }}
            className="text-t18-cyan font-bold hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};

export const OTPModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { verifyOtp } = useAppAuth();
  const { playUiClick } = useAppAudio();

  const [otp, setOtp] = useState(['4', '5', '8', '1', '9', '2']);
  const [timer, setTimer] = useState(48);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    playUiClick();
    const res = await verifyOtp(otp.join(''));
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[650] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-t18-cyan/40 shadow-glow-cyan text-white text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-t18-blue/20 border border-t18-cyan mx-auto flex items-center justify-center mb-2">
          <Smartphone className="w-6 h-6 text-t18-cyan" />
        </div>

        <h3 className="text-xl font-bold font-gaming uppercase tracking-wide">
          2-Step OTP Verification
        </h3>
        <p className="text-xs text-white/60 font-mono mb-5">
          Enter the 6-digit verification passcode sent to your registered Gmail and Phone number.
        </p>

        <form onSubmit={handleVerify}>
          <div className="flex justify-center gap-2 mb-4">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => {
                  const val = e.target.value;
                  const newOtp = [...otp];
                  newOtp[idx] = val;
                  setOtp(newOtp);
                }}
                className="w-11 h-12 rounded-xl bg-t18-surface border border-white/20 text-center text-lg font-mono font-bold text-t18-cyan focus:border-t18-cyan focus:outline-none"
              />
            ))}
          </div>

          <div className="text-xs font-mono text-white/50 mb-5">
            Resend OTP in <span className="text-t18-cyan font-bold">{timer}s</span>
          </div>

          {success && (
            <div className="text-xs text-emerald-400 font-mono mb-3">
              ✓ Verification Complete! Session Active.
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-t18-blue to-t18-cyan text-black font-gaming font-black text-xs uppercase tracking-wider shadow-glow-cyan"
          >
            Confirm Passcode
          </button>
        </form>
      </div>
    </div>
  );
};
