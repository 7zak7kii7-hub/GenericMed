import React, { useState } from 'react';
import { api, UserSession } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
  onLoginSuccess: (user: UserSession) => void;
  onLogout: () => void;
  showToastMessage: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  showToastMessage,
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState(currentUser?.phone || '+919876543210');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'PHARMACIST' | 'ADMIN'>(
    (currentUser?.role as any) || 'PATIENT'
  );
  const [loading, setLoading] = useState(false);
  const [otpHint, setOtpHint] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      showToastMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.sendOtp(phone);
      setStep('otp');
      setOtpHint(res.otpInDev || '489201');
      showToastMessage(res.message);
    } catch (err: any) {
      showToastMessage(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      showToastMessage('Please enter the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.verifyOtp(phone, otp, role);
      onLoginSuccess(res.user);
      showToastMessage(`Logged in successfully as ${res.user.name} (${res.user.role})!`);
      onClose();
      setStep('phone');
      setOtp('');
    } catch (err: any) {
      showToastMessage(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickRole: 'PATIENT' | 'PHARMACIST' | 'ADMIN') => {
    setLoading(true);
    const mockPhones: Record<string, string> = {
      PATIENT: '+919876543210',
      PHARMACIST: '+919876543211',
      ADMIN: '+919876543213',
    };
    try {
      const p = mockPhones[quickRole];
      const res = await api.verifyOtp(p, '489201', quickRole);
      onLoginSuccess(res.user);
      showToastMessage(`Switched session to ${res.user.name} (${quickRole})!`);
      onClose();
    } catch (err: any) {
      showToastMessage(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-surface-card rounded-2xl shadow-2xl z-10 border border-border-subtle overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-container-lowest">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-text-primary">
                CDSCO Healthcare Login
              </h3>
              <p className="font-body-sm text-[11px] text-text-muted">
                Role-Based Access for Patients &amp; Pharmacists
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Active Session Info */}
          {currentUser && (
            <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-md font-bold text-text-primary text-xs">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-text-muted">
                  {currentUser.phone} • Role: {currentUser.role}
                </span>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  showToastMessage('Logged out successfully.');
                }}
                className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-label-sm font-semibold text-xs border border-red-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Quick Demo Switcher */}
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-bold text-text-muted">
              1-Click Demo Profiles (RBAC Testing):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickLogin('PATIENT')}
                disabled={loading}
                className="p-2.5 rounded-xl border border-border-subtle bg-surface-card hover:border-primary hover:bg-primary/5 flex flex-col items-center text-center transition-all group"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                <span className="font-label-md font-bold text-text-primary text-[11px] mt-1">
                  Patient
                </span>
                <span className="text-[10px] text-text-muted">Rahul S.</span>
              </button>

              <button
                onClick={() => handleQuickLogin('PHARMACIST')}
                disabled={loading}
                className="p-2.5 rounded-xl border border-border-subtle bg-surface-card hover:border-primary hover:bg-primary/5 flex flex-col items-center text-center transition-all group"
              >
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  prescriptions
                </span>
                <span className="font-label-md font-bold text-text-primary text-[11px] mt-1">
                  Pharmacist
                </span>
                <span className="text-[10px] text-text-muted">Priya N.</span>
              </button>

              <button
                onClick={() => handleQuickLogin('ADMIN')}
                disabled={loading}
                className="p-2.5 rounded-xl border border-border-subtle bg-surface-card hover:border-primary hover:bg-primary/5 flex flex-col items-center text-center transition-all group"
              >
                <span className="material-symbols-outlined text-amber-600 text-[20px]">
                  security
                </span>
                <span className="font-label-md font-bold text-text-primary text-[11px] mt-1">
                  CDSCO Admin
                </span>
                <span className="text-[10px] text-text-muted">Dr. Vikram</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 my-1">
            <div className="h-[1px] bg-border-subtle flex-1"></div>
            <span className="text-[11px] uppercase font-bold text-text-muted">Or Mobile Login</span>
            <div className="h-[1px] bg-border-subtle flex-1"></div>
          </div>

          {/* Form */}
          {step === 'phone' ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-xs font-semibold text-text-secondary">
                  Mobile Number (India +91)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-text-muted material-symbols-outlined text-[18px]">
                    smartphone
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border-strong bg-surface-canvas text-text-primary text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-xs font-semibold text-text-secondary">
                  Role Classification
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-border-strong bg-surface-canvas text-text-primary text-sm focus:border-primary focus:outline-none"
                >
                  <option value="PATIENT">Verified Patient (Standard)</option>
                  <option value="PHARMACIST">Registered Clinical Pharmacist (Schedule H1 Access)</option>
                  <option value="ADMIN">CDSCO Drug Regulatory Auditor</option>
                </select>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-brand-deep active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <span>Send 6-Digit OTP</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-status-info-bg rounded-xl border border-status-info-border text-[11px] text-status-info-text">
                OTP code sent to <strong>{phone}</strong>. For demo testing, enter{' '}
                <strong className="font-code-tabular">{otpHint || '489201'}</strong>.
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-xs font-semibold text-text-secondary">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  placeholder="489201"
                  className="w-full px-4 py-2.5 rounded-xl border border-border-strong bg-surface-canvas text-center text-text-primary tracking-widest text-lg font-code-tabular font-bold focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setStep('phone')}
                  className="py-2.5 px-3 rounded-xl bg-surface-subtle font-label-md font-semibold text-text-primary text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-brand-deep active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Verify &amp; Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
