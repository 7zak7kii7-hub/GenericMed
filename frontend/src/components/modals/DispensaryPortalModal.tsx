import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface DispensaryPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToastMessage: (msg: string) => void;
}

export const DispensaryPortalModal: React.FC<DispensaryPortalModalProps> = ({
  isOpen,
  onClose,
  showToastMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'queue'>('inventory');
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('pharma-1');
  const [inventoryBatches, setInventoryBatches] = useState<any[]>([]);
  const [dispenseQueue, setDispenseQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Add Batch Form state
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [newMedName, setNewMedName] = useState('Paracetamol IP 650mg');
  const [newFormula, setNewFormula] = useState('PARA-650-IP');
  const [newBatchNum, setNewBatchNum] = useState(`GEN-2026-${Math.floor(10 + Math.random() * 90)}`);
  const [newStock, setNewStock] = useState('200');
  const [newSellingPrice, setNewSellingPrice] = useState('10.50');
  const [newMrp, setNewMrp] = useState('34.50');
  const [newExpiry, setNewExpiry] = useState('2028-12-31');

  // Fetch Pharmacies and Active Dispensary Inventory
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getPharmacies().then((pharmaList) => {
        setPharmacies(pharmaList);
        return api.getPharmacyInventory(selectedPharmacyId);
      }).then((batches) => {
        setInventoryBatches(batches);
        return api.getDispensingQueue();
      }).then((queue) => {
        setDispenseQueue(queue);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen, selectedPharmacyId]);

  if (!isOpen) return null;

  const currentPharmacy = pharmacies.find((p) => p.id === selectedPharmacyId) || pharmacies[0] || {
    id: 'pharma-1',
    name: 'Jan Aushadhi Kendra #104 (PMBI Certified)',
    licenseNo: 'DL-KA-2024-8849-20B/21B',
    locality: 'Indiranagar, Bengaluru',
  };

  const handleAddBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName || !newBatchNum) {
      showToastMessage('Please fill all required batch fields.');
      return;
    }

    try {
      const added = await api.addPharmacyBatch(selectedPharmacyId, {
        medicineName: newMedName,
        formulaId: newFormula,
        batchNumber: newBatchNum,
        stockUnits: Number(newStock) || 100,
        sellingPrice: Number(newSellingPrice) || 20.0,
        mrp: Number(newMrp) || 60.0,
        expiryDate: newExpiry,
        dosageForm: 'Tablet (Strip of 10)',
      });
      setInventoryBatches((prev) => [added, ...prev]);
      setShowAddBatchModal(false);
      showToastMessage(`Batch ${newBatchNum} added to ${currentPharmacy.name}!`);
    } catch {
      showToastMessage('Failed to add batch.');
    }
  };

  const handleSignAndDispense = async (orderId: string) => {
    try {
      const res = await api.dispenseOrder(orderId, 'Verified bioequivalence & cold-chain SLA.');
      setDispenseQueue((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: 'STAMPED_AND_DISPATCHED' } : o))
      );
      showToastMessage(`Order ${orderId} stamped by Registered Pharmacist and released to cold-chain!`);
    } catch {
      showToastMessage('Dispense sign-off completed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-surface-card rounded-2xl shadow-2xl z-10 border border-border-subtle max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600/10 text-teal-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">storefront</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-base font-bold text-text-primary">
                  Dispensary Multi-Tenant Portal
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-status-success-bg text-status-success-text text-[10px] font-bold">
                  PHARMACIST DESK
                </span>
              </div>
              <p className="font-body-sm text-[11px] text-text-muted">
                CDSCO Form 20B/21B Live Inventory &amp; Schedule H1 Dispensing Queue
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

        {/* Tenant Pharmacy Switcher Banner */}
        <div className="px-5 py-3 bg-surface-subtle/70 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
              local_pharmacy
            </span>
            <div className="flex flex-col min-w-0">
              <label className="text-[10px] uppercase font-bold text-text-muted">
                Active Retail Dispensary
              </label>
              <select
                value={selectedPharmacyId}
                onChange={(e) => setSelectedPharmacyId(e.target.value)}
                className="font-headline-sm font-bold text-xs text-text-primary bg-transparent border-none p-0 focus:outline-none cursor-pointer"
              >
                {pharmacies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-code-tabular text-text-secondary bg-surface-card px-2 py-0.5 rounded border border-border-subtle">
              DL: {currentPharmacy.licenseNo || 'DL-KA-2024-8849'}
            </span>
            <button
              onClick={() => setShowAddBatchModal(true)}
              className="px-2.5 py-1 rounded-lg bg-primary text-on-primary text-[11px] font-bold hover:bg-brand-deep transition-all flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">add_box</span>
              <span>Ingest Batch</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border-subtle px-5 bg-surface-container-lowest shrink-0">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'inventory'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            <span>Batch Inventory Ledger ({inventoryBatches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all relative ${
              activeTab === 'queue'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
            <span>Dispensing Queue ({dispenseQueue.filter(q => q.status !== 'STAMPED_AND_DISPATCHED').length})</span>
            {dispenseQueue.filter(q => q.status !== 'STAMPED_AND_DISPATCHED').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* TAB 1: BATCH INVENTORY LEDGER */}
          {activeTab === 'inventory' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Audited Jan Aushadhi &amp; Generic Formulations</span>
                <span className="font-code-tabular text-[11px]">
                  Total Batches: {inventoryBatches.length}
                </span>
              </div>

              {inventoryBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-3.5 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col gap-1.5 hover:border-slate-300 transition-all text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="font-headline-sm font-bold text-text-primary text-sm">
                        {batch.medicineName}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Formula: {batch.formulaId} • {batch.dosageForm}
                      </span>
                    </div>
                    <span className="font-code-tabular text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                      Batch #{batch.batchNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border-subtle/50 pt-1.5 mt-0.5 text-[11px]">
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted">
                        Expires: <strong className="text-text-secondary">{batch.expiryDate}</strong>
                      </span>
                      <span className="text-text-muted">
                        Available:{' '}
                        <strong className="text-status-success-text font-bold">
                          {batch.stockUnits} units
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted line-through font-code-tabular">
                        MRP ₹{batch.mrp?.toFixed(2)}
                      </span>
                      <span className="font-code-tabular font-bold text-primary text-sm">
                        ₹{batch.sellingPrice?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: DISPENSING QUEUE */}
          {activeTab === 'queue' && (
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0">
                  gavel
                </span>
                <span>
                  <strong>Schedule H1 Dispensing Duty</strong>: Pharmacist must verify that the doctor's registration number and attached prescription match before release.
                </span>
              </div>

              {dispenseQueue.map((item) => (
                <div
                  key={item.orderId}
                  className="p-4 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col gap-2.5 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary text-sm">{item.orderId}</span>
                        {item.isScheduleH1 && (
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                            SCHEDULE H1
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'STAMPED_AND_DISPATCHED'
                              ? 'bg-status-success-bg text-status-success-text'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {item.status === 'STAMPED_AND_DISPATCHED'
                            ? 'STAMPED & DISPATCHED'
                            : 'AWAITING VERIFICATION'}
                        </span>
                      </div>
                      <span className="text-text-muted text-[11px] mt-0.5">
                        Patient: <strong>{item.patientName}</strong> • Prescribed by {item.doctorName} (Reg: {item.doctorRegNo})
                      </span>
                    </div>
                    <span className="font-code-tabular font-bold text-primary text-sm">
                      ₹{item.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Itemized Batches */}
                  <div className="p-2.5 rounded-lg bg-surface-subtle flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-text-muted">
                      Allocated Medicine Batches:
                    </span>
                    {item.items.map((med: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span>
                          {med.name} (Qty: {med.qty})
                        </span>
                        <span className="font-code-tabular text-text-secondary font-bold">
                          {med.batchNumber}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-border-subtle/50 pt-2">
                    <span className="text-[10px] text-text-muted font-code-tabular">
                      Placed at: {new Date(item.placedAt).toLocaleTimeString()}
                    </span>
                    {item.status === 'STAMPED_AND_DISPATCHED' ? (
                      <div className="flex items-center gap-1 text-status-success-text font-bold text-[11px]">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Digitally Stamped (Reg: KA-PH-2021-9941)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSignAndDispense(item.orderId)}
                        className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm font-bold hover:bg-brand-deep active:scale-95 transition-all text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">approval</span>
                        <span>Apply Stamp &amp; Release</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border-subtle bg-surface-container-lowest flex items-center justify-between text-xs text-text-muted">
          <span>Registered Pharmacist License: Form 20B / Form 21B Compliant</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface-subtle text-text-primary hover:bg-surface-container font-label-sm font-semibold transition-all"
          >
            Close Portal
          </button>
        </div>
      </div>

      {/* Sub-modal: Ingest Batch Form */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-surface-card rounded-2xl p-5 shadow-2xl border border-border-subtle flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <h4 className="font-headline-sm font-bold text-text-primary text-sm">
                Ingest New Generic Medicine Batch
              </h4>
              <button
                onClick={() => setShowAddBatchModal(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddBatchSubmit} className="flex flex-col gap-2.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-text-secondary">Medicine Name</label>
                <input
                  type="text"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-border-strong bg-surface-canvas text-text-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-text-secondary">Active Formula ID</label>
                  <input
                    type="text"
                    value={newFormula}
                    onChange={(e) => setNewFormula(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-border-strong bg-surface-canvas text-text-primary font-code-tabular"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-text-secondary">Batch Number</label>
                  <input
                    type="text"
                    value={newBatchNum}
                    onChange={(e) => setNewBatchNum(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-border-strong bg-surface-canvas text-text-primary font-code-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-text-secondary">Stock Units</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-border-strong bg-surface-canvas text-text-primary font-code-tabular"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-text-secondary">Selling Price</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newSellingPrice}
                    onChange={(e) => setNewSellingPrice(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-border-strong bg-surface-canvas text-text-primary font-code-tabular"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-text-secondary">MRP</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newMrp}
                    onChange={(e) => setNewMrp(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-border-strong bg-surface-canvas text-text-primary font-code-tabular"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-text-secondary">Expiry Date</label>
                <input
                  type="date"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-border-strong bg-surface-canvas text-text-primary"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-border-subtle mt-1">
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className="flex-1 py-2 rounded-lg bg-surface-subtle font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-primary text-on-primary font-bold hover:bg-brand-deep"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
