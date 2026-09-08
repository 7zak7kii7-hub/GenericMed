import React from 'react';
import { HOTLINK_IMAGES } from '../../data/mockData';

interface ArchitecturePRDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitecturePRDModal: React.FC<ArchitecturePRDModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-surface-card rounded-2xl p-6 shadow-2xl z-10 border border-border-subtle max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">account_tree</span>
            <div>
              <h3 className="font-headline-sm font-bold text-text-primary">
                System Architecture &amp; CDSCO PRD Spec
              </h3>
              <p className="text-[11px] text-text-muted">
                Reference Model • FR-DISC, FR-NORM, FR-CART, FR-ORD Compliant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-muted hover:text-text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Multi-Tenant SaaS Diagram Image */}
        <div className="mt-4 rounded-xl overflow-hidden border border-border-subtle bg-slate-900 p-4 text-white">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
            <span className="font-code-tabular text-[12px] font-bold text-teal-400">
              MULTI-TENANT SAAS CLOUD ARCHITECTURE
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-code-tabular">
              K8s Cluster • CDSCO API
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[11px] font-code-tabular">
            <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700 flex flex-col gap-1">
              <span className="text-emerald-400 font-bold">CLIENT APP</span>
              <span className="text-slate-300 text-[10px]">React 19 + PWA</span>
              <span className="text-slate-400 text-[9px]">Idempotent Checkout</span>
            </div>
            <div className="p-2.5 rounded-lg bg-teal-950/80 border border-teal-600/50 flex flex-col gap-1">
              <span className="text-teal-300 font-bold">API GATEWAY</span>
              <span className="text-slate-300 text-[10px]">Rate-Limit &amp; Auth</span>
              <span className="text-teal-400 text-[9px]">Webhook Ingress</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700 flex flex-col gap-1">
              <span className="text-sky-400 font-bold">TENANT ENGINE</span>
              <span className="text-slate-300 text-[10px]">PostgreSQL + Redis</span>
              <span className="text-slate-400 text-[9px]">Batch Reserve Lock</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
            <span>Pharmacy Nodes: Apollo • MedPlus • Wellness</span>
            <span className="text-emerald-400 font-semibold">Cold-Chain SLA: 18°C-24°C</span>
          </div>
        </div>

        {/* PRD Pillars */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-sm">
          <div className="p-3 bg-surface-canvas rounded-xl border border-border-subtle">
            <div className="flex items-center gap-2 text-primary font-bold">
              <span className="material-symbols-outlined text-[18px]">biotech</span>
              <span>1. Bioequivalence &amp; API Match</span>
            </div>
            <p className="text-[12px] text-text-muted mt-1 leading-snug">
              Guarantees 100% molecular equivalence in active salt, dosage strength, and bioavailability profiles audited against Indian Pharmacopoeia (IP).
            </p>
          </div>

          <div className="p-3 bg-surface-canvas rounded-xl border border-border-subtle">
            <div className="flex items-center gap-2 text-primary font-bold">
              <span className="material-symbols-outlined text-[18px]">calculate</span>
              <span>2. Normalization Engine</span>
            </div>
            <p className="text-[12px] text-text-muted mt-1 leading-snug">
              Eliminates strip-size distortion by standardizing comparisons down to single tablet/capsule active cost benchmarks.
            </p>
          </div>

          <div className="p-3 bg-surface-canvas rounded-xl border border-border-subtle">
            <div className="flex items-center gap-2 text-primary font-bold">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>3. Idempotent Checkout</span>
            </div>
            <p className="text-[12px] text-text-muted mt-1 leading-snug">
              Zero duplicate transactions on UPI/Card webhooks with live 10-minute price-locks and automated pharmacy batch reserve.
            </p>
          </div>

          <div className="p-3 bg-surface-canvas rounded-xl border border-border-subtle">
            <div className="flex items-center gap-2 text-primary font-bold">
              <span className="material-symbols-outlined text-[18px]">ac_unit</span>
              <span>4. Cold-Chain Audit Log</span>
            </div>
            <p className="text-[12px] text-text-muted mt-1 leading-snug">
              Insulated transport carriers (18°C - 24°C) with end-to-end telemetry and 4-digit OTP handover verification.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-brand-deep shadow-xs"
          >
            Close Architecture Spec
          </button>
        </div>
      </div>
    </div>
  );
};
