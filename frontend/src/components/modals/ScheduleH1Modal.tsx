import React from 'react';

interface ScheduleH1ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleH1Modal: React.FC<ScheduleH1ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-surface-card rounded-2xl p-6 shadow-2xl z-10 border border-border-subtle max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">fact_check</span>
            <h3 className="font-headline-sm font-bold text-text-primary">
              Schedule H1 Compliance Record
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-muted hover:text-text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="mt-3 text-body-sm text-text-muted">
          Under Drugs and Cosmetics Act (Schedule H1), mandated digital registry entry for antibiotic and specialty formulation dispensing.
        </div>

        <div className="mt-4 p-4 rounded-xl bg-status-info-bg border border-status-info-border text-body-sm flex flex-col gap-2.5">
          <div className="flex justify-between py-1 border-b border-status-info-border/60">
            <span className="text-text-muted">H1 Register Token:</span>
            <span className="font-code-tabular font-bold text-text-primary">#H1-BLR-2026-99215</span>
          </div>
          <div className="flex justify-between py-1 border-b border-status-info-border/60">
            <span className="text-text-muted">Patient Name:</span>
            <span className="font-bold text-text-primary">Dr. Aris Thorne</span>
          </div>
          <div className="flex justify-between py-1 border-b border-status-info-border/60">
            <span className="text-text-muted">Prescriber:</span>
            <span className="font-medium text-text-primary">Dr. Sandeep K. Joshi (MD, KMC-49210)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-status-info-border/60">
            <span className="text-text-muted">Dispensing Pharmacist:</span>
            <span className="font-bold text-primary">Rajesh Kumar (State Lic #KA-48192)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-status-info-border/60">
            <span className="text-text-muted">Batch &amp; Expiry Audit:</span>
            <span className="font-code-tabular text-text-primary">AP-9921 (Exp: 08/2028)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-text-muted">CDSCO Node Hash:</span>
            <span className="font-code-tabular text-[11px] text-secondary font-bold truncate max-w-[200px]">
              0x8f19bca402...99215
            </span>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-brand-deep"
          >
            Acknowledge Audit
          </button>
        </div>
      </div>
    </div>
  );
};
