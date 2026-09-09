import React, { useState } from 'react';
import { api } from '../../services/api';
import { HOTLINK_IMAGES } from '../../data/mockData';

interface DeliveryHandshakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  patientOtp: string;
  onDeliveryComplete: () => void;
  showToastMessage: (msg: string) => void;
}

export const DeliveryHandshakeModal: React.FC<DeliveryHandshakeModalProps> = ({
  isOpen,
  onClose,
  orderId,
  patientOtp,
  onDeliveryComplete,
  showToastMessage,
}) => {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deliveredDetails, setDeliveredDetails] = useState<any>(null);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const updated = [...digits];
    updated[index] = clean;
    setDigits(updated);
    setErrorMessage('');

    // Auto-focus next input
    if (clean && index < 3) {
      const nextInput = document.getElementById(`handshake-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`handshake-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleFillDemoOtp = () => {
    const otpChars = (patientOtp || '4829').slice(0, 4).split('');
    setDigits([otpChars[0] || '4', otpChars[1] || '8', otpChars[2] || '2', otpChars[3] || '9']);
    setErrorMessage('');
    showToastMessage('Auto-filled patient OTP from active order');
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = digits.join('');
    if (enteredOtp.length !== 4) {
      setErrorMessage('Please enter all 4 digits of the Delivery OTP.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const res = await api.verifyDeliveryOtp(orderId, enteredOtp);

      if (res.success) {
        setIsDelivered(true);
        setDeliveredDetails(res);
        showToastMessage('🎉 Order successfully handed over & CDSCO Form 20B verified!');
        onDeliveryComplete();
      } else {
        setErrorMessage(res.error || 'Invalid OTP. Please check the code shared by the customer.');
      }
    } catch {
      setErrorMessage('Verification failed. Please retry.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface-card rounded-2xl max-w-md w-full shadow-2xl border border-border-subtle overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
        {/* Terminal Header */}
        <div className="bg-primary text-on-primary p-space-base flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
              <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-base font-bold leading-tight">
                Courier Handshake Terminal
              </span>
              <span className="font-label-sm text-[11px] text-white/80">
                Suresh K. • Rider ID #KA-RIDER-8812
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-space-base flex flex-col gap-space-md overflow-y-auto">
          {!isDelivered ? (
            <>
              {/* Recipient & Package Summary Card */}
              <div className="p-space-sm bg-surface-subtle rounded-xl border border-border-subtle flex flex-col gap-space-xs">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span className="font-bold uppercase tracking-wider">DOORSTEP HANDOVER</span>
                  <span className="font-code-tabular font-bold text-text-primary">
                    #{orderId}
                  </span>
                </div>
                <div className="flex items-start gap-space-sm mt-1">
                  <img
                    alt="Rider Suresh K."
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-border-subtle"
                    src={HOTLINK_IMAGES.deliveryRider}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-sm font-bold text-text-primary truncate">
                      Rahul Sharma (Customer)
                    </span>
                    <span className="font-body-sm text-xs text-text-muted truncate">
                      #402 Palm Grove, 12th Main Indiranagar
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-space-xs border-t border-border-subtle/50 text-xs">
                  <span className="text-text-muted">Carrier Temp: 21.2°C (Optimal)</span>
                  <span className="text-status-success-text font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Tamper Seal Intact
                  </span>
                </div>
              </div>

              {/* OTP Input Section */}
              <div className="flex flex-col items-center gap-space-sm text-center py-2">
                <div className="w-12 h-12 rounded-full bg-status-warning-bg text-status-warning-text flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">pin</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-headline-sm text-base font-bold text-text-primary">
                    Enter Patient 4-Digit Delivery OTP
                  </h3>
                  <p className="font-body-sm text-xs text-text-muted mt-0.5">
                    Ask Rahul Sharma for the 4-digit PIN displayed on his GenericMed app to verify
                    custody handover under CDSCO Rule 65.
                  </p>
                </div>

                {/* 4 Digit Boxes */}
                <div className="flex gap-2.5 my-2">
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`handshake-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      autoFocus={idx === 0}
                      className="w-12 h-14 rounded-xl border-2 border-border-subtle bg-surface-container-lowest text-center font-display-sm text-2xl font-extrabold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  ))}
                </div>

                {/* Auto-fill helper for test simulation */}
                <button
                  type="button"
                  onClick={handleFillDemoOtp}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                  <span>Auto-fill Patient OTP ({patientOtp || '4829'})</span>
                </button>

                {errorMessage && (
                  <div className="p-space-xs px-space-sm bg-red-100 text-red-800 text-xs font-medium rounded-lg border border-red-300 w-full animate-fadeIn">
                    {errorMessage}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-space-xs">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-surface-subtle font-label-md text-sm font-semibold text-text-secondary hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying || digits.join('').length !== 4}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-sm font-bold shadow-md hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  {isVerifying ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Verify Handover</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Success / Delivery Receipt View */
            <div className="flex flex-col items-center text-center gap-space-md py-4 animate-scaleIn">
              <div className="w-16 h-16 rounded-full bg-status-success-bg text-status-success-text flex items-center justify-center shadow-md border border-status-success-border">
                <span className="material-symbols-outlined text-[36px] font-bold">check_circle</span>
              </div>

              <div className="flex flex-col">
                <span className="font-headline-lg text-xl font-bold text-text-primary">
                  Order Successfully Delivered!
                </span>
                <span className="font-body-sm text-xs text-text-muted mt-1">
                  CDSCO Form 20B/21B digital custody handover completed at{' '}
                  {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST.
                </span>
              </div>

              {/* Digital Certificate Receipt Card */}
              <div className="w-full p-space-sm bg-surface-subtle rounded-xl border border-border-subtle flex flex-col gap-space-xs text-left text-xs">
                <div className="flex justify-between border-b border-border-subtle/60 pb-1.5">
                  <span className="text-text-muted">Order ID:</span>
                  <span className="font-code-tabular font-bold text-text-primary">{orderId}</span>
                </div>
                <div className="flex justify-between border-b border-border-subtle/60 py-1">
                  <span className="text-text-muted">Handover Courier:</span>
                  <span className="font-bold text-text-primary">Suresh K. (DL-RIDER-KA-8812)</span>
                </div>
                <div className="flex justify-between border-b border-border-subtle/60 py-1">
                  <span className="text-text-muted">Thermal SLA Status:</span>
                  <span className="font-bold text-status-success-text">100% Compliant (18°C–24°C)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-text-muted">CDSCO Compliance:</span>
                  <span className="font-bold text-primary">Rule 65 Registered Audit Log #DEL-9912</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-md text-sm font-bold shadow-md hover:bg-primary/95 transition-all active:scale-95"
              >
                Done &amp; View Updated Tracking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
