import React, { useState } from 'react';
import { api, AbhaProfile, AbdmPrescription } from '../../services/api';
import { PrescriptionRecord, CartItem } from '../../types';

interface AbhaSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportPrescription: (importedRx: PrescriptionRecord, cartItems: CartItem[]) => void;
  showToastMessage: (msg: string) => void;
}

export const AbhaSyncModal: React.FC<AbhaSyncModalProps> = ({
  isOpen,
  onClose,
  onImportPrescription,
  showToastMessage,
}) => {
  const [step, setStep] = useState<'INPUT' | 'OTP' | 'PROFILE'>('INPUT');
  const [abhaInput, setAbhaInput] = useState('91-4829-1029-4819');
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [profile, setProfile] = useState<AbhaProfile | null>(null);
  const [ehrPrescriptions, setEhrPrescriptions] = useState<AbdmPrescription[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async () => {
    if (!abhaInput.trim()) {
      setErrorMessage('Please enter an ABHA Number or ABHA Address.');
      return;
    }
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.verifyAbha(abhaInput.trim());
      if (res.status === 'OTP_SENT') {
        setStep('OTP');
        showToastMessage('📲 Aadhaar OTP sent to mobile ******4210 (Demo: 482910)');
      } else if (res.profile) {
        setProfile(res.profile);
        setStep('PROFILE');
        loadEhrRecords();
      }
    } catch {
      setErrorMessage('Failed to connect to ABDM Gateway.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpInput.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit Aadhaar OTP.');
      return;
    }
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.verifyAbha(abhaInput.trim(), otpInput.trim());
      if (res.status === 'VERIFIED' && res.profile) {
        setProfile(res.profile);
        setStep('PROFILE');
        showToastMessage('🇮🇳 ABHA Health ID linked via National Health Authority Gateway!');
        loadEhrRecords();
      } else {
        setErrorMessage(res.error || 'Invalid OTP. Please enter 482910.');
      }
    } catch {
      setErrorMessage('OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadEhrRecords = async () => {
    try {
      const res = await api.getAbdmPrescriptions();
      setEhrPrescriptions(res.prescriptions);
    } catch (err) {
      console.warn('EHR fetch error:', err);
    }
  };

  const handleImportEhr = async (ehr: AbdmPrescription) => {
    setImportingId(ehr.id);
    try {
      const res = await api.importAbdmPrescription(ehr.id);

      // Create cart items for generic substitutes
      const newCartItems: CartItem[] = ehr.medicines.map((m, idx) => ({
        id: `abdm-item-${ehr.id}-${idx}-${Date.now()}`,
        name: m.genericEquivalent,
        category: 'GOVT EHR GENERIC',
        pharmacyName: 'Jan Aushadhi Kendra #104 (PMBI Certified)',
        price: m.genericPrice,
        mrp: m.mrp,
        pricePerUnit: `₹${(m.genericPrice / 10).toFixed(2)} / tab`,
        quantity: 1,
        packDetail: 'Strip of 10 Tablets',
        batchNumber: `ABDM-${ehr.id.slice(-4)}-G${idx + 1}`,
        savingsAmount: m.savingsRupees,
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA0P1UtMCeQiNx2w-bcWeCUFFpzLF24iIe3Cp14GAZ5EB13ymClblYwtJWU7ByhbebjjxryBDdp4OmJXRHka7igtzWaMWtXv9me9YlSXChLWYZfW_-jsUyR8HjK1C0LGpXemLMNThRUpKBpKU7eVMukONcRCHPBm7Kf626g4YQgmyLof3wdsPQ611VG3SgU4zHJmczu85b5JETLuuRKe8vqJ9obmmoClxrwGcEvtgTr5P-8gwiWM459Ow',
      }));

      onImportPrescription(res.prescription, newCartItems);
      showToastMessage(
        `✅ Imported ${ehr.hospital} e-Prescription! Added ${newCartItems.length} bioequivalent generics to cart.`
      );
      onClose();
    } catch {
      showToastMessage('Failed to import e-Prescription.');
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface-card rounded-2xl max-w-lg w-full shadow-2xl border border-border-subtle overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
        {/* ABDM Header with Indian National Healthcare Brand Accent */}
        <div className="bg-gradient-to-r from-[#003B46] via-[#005048] to-[#07575B] text-white p-space-base relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <span className="material-symbols-outlined text-[24px] text-amber-300">
                  health_and_safety
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-base font-bold leading-tight">
                  Ayushman Bharat Digital Mission (ABDM)
                </span>
                <span className="font-label-sm text-[11px] text-white/80">
                  National Health Authority (NHA) • Government of India
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          {/* Subtle Tricolor Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-500"></div>
        </div>

        {/* Modal Body */}
        <div className="p-space-base flex flex-col gap-space-md overflow-y-auto">
          {step === 'INPUT' && (
            <div className="flex flex-col gap-space-md">
              <div className="p-space-sm bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed flex items-start gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">
                  info
                </span>
                <span>
                  Connect your 14-digit ABHA Health ID to sync electronic health records, OPD
                  prescriptions from government hospitals (AIIMS, Safdarjung), and automatically
                  discover cheaper generic equivalents.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-xs font-bold text-text-primary uppercase tracking-wider">
                  ABHA Number / ABHA Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
                    badge
                  </span>
                  <input
                    type="text"
                    value={abhaInput}
                    onChange={(e) => {
                      setAbhaInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="e.g. 91-4829-1029-4819 or name@abdm"
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-border-subtle bg-surface-container-lowest font-code-tabular text-sm font-semibold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAbhaInput('91-4829-1029-4819')}
                  className="text-[11px] font-bold text-primary hover:underline self-start flex items-center gap-1 mt-1"
                >
                  <span className="material-symbols-outlined text-[12px]">auto_fix_high</span>
                  <span>Use Demo ABHA (91-4829-1029-4819)</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-100 text-red-800 text-xs rounded-lg border border-red-300">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-surface-subtle font-label-md text-xs font-bold text-text-secondary hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-xs font-bold shadow-md hover:bg-primary/95 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Connecting NHA...</span>
                  ) : (
                    <>
                      <span>Request Aadhaar OTP</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'OTP' && (
            <div className="flex flex-col gap-space-md text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[24px]">sms</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-base font-bold text-text-primary">
                  Enter Aadhaar Verification OTP
                </h3>
                <p className="font-body-sm text-xs text-text-muted mt-0.5">
                  6-digit authentication code dispatched to registered mobile number ******4210.
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, ''));
                    setErrorMessage('');
                  }}
                  placeholder="• • • • • •"
                  className="w-48 h-12 text-center tracking-widest font-display-sm text-xl font-bold rounded-xl border-2 border-primary/40 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setOtpInput('482910')}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                  <span>Auto-fill Demo OTP (482910)</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-2 bg-red-100 text-red-800 text-xs rounded-lg border border-red-300">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('INPUT')}
                  className="flex-1 py-2.5 rounded-xl bg-surface-subtle font-label-md text-xs font-bold text-text-secondary"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otpInput.length !== 6}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-xs font-bold shadow-md hover:bg-primary/95 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Authenticate & Link'}
                </button>
              </div>
            </div>
          )}

          {step === 'PROFILE' && profile && (
            <div className="flex flex-col gap-space-md">
              {/* Official Digital ABHA Health Card Display */}
              <div className="w-full bg-gradient-to-br from-[#0F3057] to-[#00587A] rounded-2xl p-space-base text-white shadow-lg border border-white/20 relative overflow-hidden">
                {/* Tricolor corner indicator */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-radial from-amber-500/30 to-transparent blur-xl pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-white/20 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-300 text-[20px]">
                      local_hospital
                    </span>
                    <span className="font-label-sm text-xs font-bold uppercase tracking-wider">
                      National Digital Health Mission
                    </span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                    ABHA Card Verified
                  </span>
                </div>

                <div className="flex items-start gap-space-md">
                  <img
                    alt={profile.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-white/40 shadow-sm shrink-0"
                    src={profile.photoUrl}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <h3 className="font-headline-sm text-base font-bold truncate leading-tight">
                      {profile.name}
                    </h3>
                    <span className="font-code-tabular text-amber-300 font-bold text-xs mt-0.5 tracking-wider">
                      {profile.abhaNumber}
                    </span>
                    <span className="text-[11px] text-white/80 font-mono mt-0.5">
                      {profile.abhaAddress}
                    </span>
                    <div className="flex items-center gap-3 text-[10px] text-white/70 mt-1">
                      <span>Gender: {profile.gender}</span>
                      <span>DOB: {profile.dateOfBirth}</span>
                    </div>
                  </div>

                  {/* QR Code Graphic */}
                  <div className="w-14 h-14 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 40 40">
                      <rect width="40" height="40" fill="white" />
                      <rect x="2" y="2" width="12" height="12" fill="#0F3057" />
                      <rect x="4" y="4" width="8" height="8" fill="white" />
                      <rect x="6" y="6" width="4" height="4" fill="#0F3057" />
                      <rect x="26" y="2" width="12" height="12" fill="#0F3057" />
                      <rect x="28" y="4" width="8" height="8" fill="white" />
                      <rect x="30" y="6" width="4" height="4" fill="#0F3057" />
                      <rect x="2" y="26" width="12" height="12" fill="#0F3057" />
                      <rect x="4" y="28" width="8" height="8" fill="white" />
                      <rect x="6" y="30" width="4" height="4" fill="#0F3057" />
                      <rect x="18" y="18" width="6" height="6" fill="#0F3057" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Linked Government Hospital EHR e-Prescriptions */}
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      folder_shared
                    </span>
                    <span className="font-headline-sm text-sm font-bold text-text-primary">
                      Linked Hospital e-Prescriptions ({ehrPrescriptions.length})
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted font-medium">
                    FHIR R4 Compliant
                  </span>
                </div>

                {ehrPrescriptions.map((ehr) => (
                  <div
                    key={ehr.id}
                    className="p-space-sm bg-surface-subtle rounded-xl border border-border-subtle flex flex-col gap-space-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-xs font-bold text-text-primary truncate">
                          {ehr.hospital}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          {ehr.department} • {ehr.doctorName}
                        </span>
                      </div>
                      <span className="text-[10px] font-code-tabular font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md shrink-0">
                        {ehr.encounterDate}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 my-1 p-2 bg-white rounded-lg border border-border-subtle/70">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        Prescribed Brands &amp; Generics:
                      </span>
                      {ehr.medicines.map((m, mIdx) => (
                        <div key={mIdx} className="flex justify-between text-xs items-center">
                          <span className="text-text-primary font-medium">
                            {m.prescribedBrand} → <strong className="text-primary">{m.genericEquivalent}</strong>
                          </span>
                          <span className="text-status-success-text font-bold text-[11px]">
                            Save ₹{m.savingsRupees}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-text-muted font-code-tabular">
                        Bundle: {ehr.fhirBundleId}
                      </span>
                      <button
                        onClick={() => handleImportEhr(ehr)}
                        disabled={importingId === ehr.id}
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-xs font-bold shadow-xs hover:bg-primary/95 transition-all flex items-center gap-1 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[14px]">download</span>
                        <span>
                          {importingId === ehr.id ? 'Importing...' : 'Import to Vault & Find Generics'}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-surface-subtle font-label-md text-xs font-bold text-text-secondary hover:bg-surface-container transition-colors"
              >
                Close ABHA Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
