import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface TaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
}

export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({
  isOpen,
  onClose,
  orderId = 'ORD-8921',
}) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getOrderInvoice(orderId)
        .then((data) => setInvoice(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const inv = invoice || {
    invoiceNumber: `INV-${orderId}-2026`,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    pharmacy: {
      name: 'Jan Aushadhi Kendra #104 (PMBI Certified)',
      drugLicense: 'DL-KA-2024-8849-20B/21B',
      gstin: '29AABCP1330F1ZT',
      address: '12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    },
    patient: {
      name: 'Rahul Sharma',
      address: '#402 Palm Grove, Indiranagar, Bengaluru 560038',
    },
    items: [
      { hsn: '3004', name: 'Paracetamol IP 650mg', batch: 'GEN-2026-09', expiry: '08/2028', qty: 2, mrp: 54.0, rate: 21.0, gst: '5%' },
      { hsn: '3004', name: 'Atorvastatin 20mg IP', batch: 'AP-4408', expiry: '11/2027', qty: 1, mrp: 180.0, rate: 28.0, gst: '5%' },
    ],
    subtotal: 70.0,
    cgst: 1.75,
    sgst: 1.75,
    grandTotal: 73.5,
    totalSavings: 218.0,
    registeredPharmacistSignature: 'Priya Nair, Reg No. KA-PH-2021-9941',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-surface-card rounded-2xl p-6 shadow-2xl z-10 border border-border-subtle max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">receipt_long</span>
            <div>
              <h3 className="font-headline-sm font-bold text-text-primary text-base">
                Tax Invoice — CDSCO Form 20B/21B
              </h3>
              <p className="text-[10px] text-text-muted">
                Goods and Services Tax (GST) Medical Invoice
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

        {/* Invoice Body Canvas */}
        <div className="mt-4 p-4 rounded-xl bg-surface-canvas border border-border-subtle text-xs flex flex-col gap-3 font-code-tabular flex-1">
          <div className="flex justify-between text-text-muted text-[11px]">
            <span>INVOICE #: <strong className="text-text-primary">{inv.invoiceNumber}</strong></span>
            <span>DATE: {inv.date}</span>
          </div>

          <div className="text-text-primary border-t border-border-subtle/50 pt-2">
            <div className="font-bold text-sm text-primary">{inv.pharmacy?.name}</div>
            <div className="text-[10px] text-text-muted">
              Drug License: <span className="font-semibold text-text-secondary">{inv.pharmacy?.drugLicense}</span>
            </div>
            <div className="text-[10px] text-text-muted">
              GSTIN: <span className="font-semibold text-text-secondary">{inv.pharmacy?.gstin}</span>
            </div>
            <div className="text-[10px] text-text-muted">{inv.pharmacy?.address}</div>
          </div>

          <div className="border-t border-border-subtle/50 pt-2 text-text-primary">
            <div className="font-bold text-xs">BUYER / PATIENT: {inv.patient?.name}</div>
            <div className="text-[10px] text-text-muted">{inv.patient?.address}</div>
          </div>

          {/* Itemized Table */}
          <div className="border-t border-border-subtle/50 pt-2">
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted font-bold">
                  <th className="py-1">HSN</th>
                  <th className="py-1">Molecule / Item</th>
                  <th className="py-1 text-center">Batch</th>
                  <th className="py-1 text-center">Expiry</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/40 text-text-primary">
                {inv.items?.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-1.5 text-text-muted">{item.hsn || '3004'}</td>
                    <td className="py-1.5 font-medium">{item.name}</td>
                    <td className="py-1.5 text-center">{item.batch || 'GEN-26'}</td>
                    <td className="py-1.5 text-center text-text-muted">{item.expiry || '08/2028'}</td>
                    <td className="py-1.5 text-center">{item.qty || 1}</td>
                    <td className="py-1.5 text-right font-bold">₹{Number(item.rate || 20).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown */}
          <div className="border-t border-border-subtle pt-2 flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-text-muted">
              <span>Medicine Taxable Subtotal:</span>
              <span className="font-bold text-text-primary">₹{Number(inv.subtotal || 70).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>CGST (2.5% on Medicaments):</span>
              <span>₹{Number(inv.cgst || 1.75).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>SGST (2.5% on Medicaments):</span>
              <span>₹{Number(inv.sgst || 1.75).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-status-success-text font-bold">
              <span>Total Generic Savings vs Brand MRP:</span>
              <span>Save ₹{Number(inv.totalSavings || 218).toFixed(2)}</span>
            </div>
            <div className="border-t border-border-subtle pt-1 mt-1 flex justify-between items-center text-sm font-bold text-text-primary">
              <span>TOTAL INVOICE AMOUNT:</span>
              <span className="text-primary text-base font-bold">₹{Number(inv.grandTotal || 73.5).toFixed(2)}</span>
            </div>
          </div>

          {/* Pharmacist Stamp */}
          <div className="border-t border-border-subtle/50 pt-2 flex items-center justify-between text-[10px] text-text-muted">
            <div className="flex flex-col">
              <span className="font-bold text-text-primary">Dispensary Pharmacist Verification:</span>
              <span>{inv.registeredPharmacistSignature}</span>
            </div>
            <div className="flex items-center gap-1 text-status-success-text font-bold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>DIGITALLY SIGNED</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-surface-subtle font-label-md font-bold text-text-primary hover:bg-surface-container flex items-center justify-center gap-1.5 text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Invoice</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-brand-deep text-xs transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
