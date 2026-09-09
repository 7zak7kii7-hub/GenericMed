import React from 'react';

interface BioequivalenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BioequivalenceModal: React.FC<BioequivalenceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl p-space-base shadow-2xl flex flex-col gap-space-sm z-10 border border-border-subtle max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 rounded-full bg-border-subtle mx-auto mb-1 sm:hidden"></div>

        <div className="flex items-center justify-between border-b border-border-subtle pb-space-xs">
          <h3 className="font-headline-lg text-headline-lg font-bold text-text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">verified</span>
            Bioequivalence Dossier
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="font-body-sm text-body-sm text-text-muted leading-relaxed">
          Certificate of Analysis (CoA) for Lot #GM-2024-88A validated by ISO-17025 accredited labs and verified under CDSCO/FDA bioequivalence benchmarks.
        </p>

        <div className="bg-surface-canvas p-space-base rounded-xl flex flex-col gap-space-xs font-body-sm border border-border-subtle">
          <div className="flex justify-between py-1 border-b border-border-subtle/50">
            <span className="text-text-muted">Active Pharmaceutical Ingredient (API)</span>
            <span className="font-semibold text-text-primary text-right">
              Acetaminophen 650mg + Caffeine 50mg
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-subtle/50">
            <span className="text-text-muted">Dissolution Profile Parity</span>
            <span className="font-code-tabular font-bold text-secondary">99.82% vs Dolo-650</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-subtle/50">
            <span className="text-text-muted">Peak Serum Concentration (Tmax)</span>
            <span className="font-code-tabular font-semibold text-text-primary">32.4 mins (Matched)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-subtle/50">
            <span className="text-text-muted">Pharmacopoeial Standard</span>
            <span className="font-semibold text-text-primary">IP / BP Standard Monograph</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-subtle/50">
            <span className="text-text-muted">Testing Laboratory</span>
            <span className="font-medium text-text-primary">NABL Hub #NABL-TC-8812</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-text-muted">Cold Chain Stability</span>
            <span className="font-code-tabular text-status-success-text font-bold">Stable (15°C - 25°C)</span>
          </div>
        </div>

        <div className="p-3 bg-status-info-bg rounded-xl text-status-info-text text-body-sm flex items-start gap-2 border border-status-info-border">
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
          <span>
            Under Indian National Medical Commission guidelines, bioequivalent generics contain the identical chemical molecule in active strength and form, ensuring clinically identical therapeutic outcomes.
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-space-xs py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-brand-deep active:scale-[0.98] transition-transform shadow-sm"
        >
          Acknowledge &amp; Return
        </button>
      </div>
    </div>
  );
};
