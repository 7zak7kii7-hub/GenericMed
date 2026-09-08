import React from 'react';

interface TaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-surface-card rounded-2xl p-6 shadow-2xl z-10 border border-border-subtle max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">receipt</span>
            <h3 className="font-headline-sm font-bold text-text-primary">
              Tax Invoice — Form 20/21
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-muted hover:text-text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-surface-canvas border border-border-subtle text-body-sm flex flex-col gap-3 font-code-tabular">
          <div className="flex justify-between text-text-muted">
            <span>INVOICE #: INV-2026-99215</span>
            <span>DATE: 08-SEP-2026</span>
          </div>

          <div className="text-text-primary">
            <div className="font-bold">SELLER: Apollo MedPlus Indiranagar Hub</div>
            <div className="text-[11px] text-text-muted">DL No: KA-BLR-20B-189 &amp; KA-BLR-21B-404</div>
            <div className="text-[11px] text-text-muted">GSTIN: 29AAAAA0000A1Z5</div>
          </div>

          <div className="h-px bg-border-subtle"></div>

          <div className="text-text-primary">
            <div className="font-bold">PATIENT / BUYER: Dr. Aris Thorne</div>
            <div className="text-[11px] text-text-muted">#402 Palm Grove, 12th Main Indiranagar, Bengaluru</div>
          </div>

          <table className="w-full text-left text-[11px] mt-2 border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted">
                <th className="py-1">Item / Molecule</th>
                <th className="py-1 text-center">Batch</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 text-text-primary">
              <tr>
                <td className="py-1.5">Paracetamol 650mg (Strip of 15)</td>
                <td className="py-1.5 text-center">AP-9921</td>
                <td className="py-1.5 text-center">2</td>
                <td className="py-1.5 text-right">₹42.00</td>
              </tr>
              <tr>
                <td className="py-1.5">Atorvastatin 20mg (Blister of 10)</td>
                <td className="py-1.5 text-center">MP-4408</td>
                <td className="py-1.5 text-center">1</td>
                <td className="py-1.5 text-right">₹28.00</td>
              </tr>
              <tr>
                <td className="py-1.5 text-text-muted">Insulated Cold-Chain Logistics</td>
                <td className="py-1.5 text-center">-</td>
                <td className="py-1.5 text-center">1</td>
                <td className="py-1.5 text-right">₹25.00</td>
              </tr>
              <tr>
                <td className="py-1.5 text-text-muted">Platform Technology Fee</td>
                <td className="py-1.5 text-center">-</td>
                <td className="py-1.5 text-center">1</td>
                <td className="py-1.5 text-right">₹5.00</td>
              </tr>
            </tbody>
          </table>

          <div className="h-px bg-border-subtle"></div>

          <div className="flex justify-between items-center text-body-md font-bold text-text-primary">
            <span>TOTAL PAID (INCL. GST):</span>
            <span className="text-primary text-headline-sm">₹100.00</span>
          </div>
          <div className="text-[10px] text-text-muted">
            Payment Mode: UPI (PhonePe) • Auth: pay_Pzm10491
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-surface-subtle font-label-md font-bold text-text-primary hover:bg-surface-container flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Print Invoice</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-brand-deep"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
