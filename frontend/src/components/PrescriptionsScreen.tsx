import React, { useState, useEffect } from 'react';
import { PrescriptionRecord, CartItem } from '../types';
import { api } from '../services/api';

interface PrescriptionsScreenProps {
  onOpenUpload: () => void;
  showToastMessage: (msg: string) => void;
  onSelectMedicine: (name: string) => void;
  onAddConvertedGenerics?: (items: CartItem[]) => void;
  onNavigateToCart?: () => void;
  onOpenAbhaModal?: () => void;
  externalPrescriptions?: PrescriptionRecord[];
}

export const PrescriptionsScreen: React.FC<PrescriptionsScreenProps> = ({
  onOpenUpload,
  showToastMessage,
  onSelectMedicine,
  onAddConvertedGenerics,
  onNavigateToCart,
  onOpenAbhaModal,
  externalPrescriptions,
}) => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchPrescriptions = async () => {
    setSyncing(true);
    try {
      const data = await api.getPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      console.warn('Failed to load prescriptions from backend:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (externalPrescriptions && externalPrescriptions.length > 0) {
      setPrescriptions(externalPrescriptions);
      setLoading(false);
    } else {
      fetchPrescriptions();
    }
  }, [externalPrescriptions]);

  const handleOrderAllGenerics = (rx: PrescriptionRecord) => {
    const newItems: CartItem[] = rx.medicines.map((m, idx) => ({
      id: `rx-item-${rx.id}-${idx}-${Date.now()}`,
      name: m.genericEquivalent,
      category: 'PRESCRIPTION GENERIC',
      pharmacyName: 'Jan Aushadhi Kendra #104 (Indiranagar)',
      price: 24.0 + idx * 8,
      mrp: 65.0 + idx * 20,
      pricePerUnit: `₹${(2.4 + idx * 0.8).toFixed(2)} / tab`,
      quantity: 1,
      packDetail: 'Strip of 10 Tablets',
      batchNumber: `Batch #${rx.id}-GEN${idx + 1}`,
      savingsAmount: 41.0 + idx * 12,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA0P1UtMCeQiNx2w-bcWeCUFFpzLF24iIe3Cp14GAZ5EB13ymClblYwtJWU7ByhbebjjxryBDdp4OmJXRHka7igtzWaMWtXv9me9YlSXChLWYZfW_-jsUyR8HjK1C0LGpXemLMNThRUpKBpKU7eVMukONcRCHPBm7Kf626g4YQgmyLof3wdsPQ611VG3SgU4zHJmczu85b5JETLuuRKe8vqJ9obmmoClxrwGcEvtgTr5P-8gwiWM459Ow',
    }));

    if (onAddConvertedGenerics) {
      onAddConvertedGenerics(newItems);
    }
    const totalSavings = newItems.reduce((acc, i) => acc + i.savingsAmount, 0);
    showToastMessage(
      `Added ${newItems.length} generic equivalents from ${rx.id} to cart! Total savings: ₹${totalSavings}`
    );
  };

  return (
    <div className="flex flex-col w-full px-space-base gap-space-md max-w-screen-md mx-auto pb-28">
      {/* Top Banner */}
      <div className="flex items-center justify-between pt-space-xs mt-1">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary font-bold tracking-tight">
            Digital Prescription Vault
          </h1>
          <p className="font-body-sm text-body-sm text-text-muted">
            CDSCO &amp; NMC Form 20/21 verified generic repository
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPrescriptions}
            disabled={syncing}
            title="Sync with CDSCO Cloud Vault"
            className="w-10 h-10 rounded-xl bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-muted hover:text-primary transition-all active:scale-95 disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                syncing ? 'animate-spin text-primary' : ''
              }`}
            >
              sync
            </span>
          </button>
          {onOpenAbhaModal && (
            <button
              onClick={onOpenAbhaModal}
              title="Import Government Hospital e-Prescriptions via ABHA"
              className="h-10 px-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 font-label-md text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-blue-100 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-700">health_and_safety</span>
              <span className="hidden sm:inline">Sync ABHA</span>
            </button>
          )}
          <button
            onClick={onOpenUpload}
            className="h-10 px-space-md rounded-xl bg-primary text-on-primary font-label-md font-bold flex items-center gap-1.5 shadow-sm hover:bg-brand-deep active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            <span>Upload New</span>
          </button>
        </div>
      </div>

      {/* AI Conversion Status Card */}
      <div className="p-space-base rounded-xl bg-status-info-bg border border-status-info-border flex items-start gap-space-sm shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center shrink-0 shadow-xs">
          <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md font-bold text-text-primary">
            Live Multimodal OCR &amp; Salt Matching Connected
          </span>
          <p className="font-body-sm text-body-sm text-text-secondary mt-0.5 text-xs">
            Handwritten doctor brand names are automatically extracted via Gemini 2.0 Flash Vision and matched against the CDSCO Jan Aushadhi generic catalog.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && prescriptions.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin"></div>
          <span className="text-xs text-text-muted">Loading verified prescriptions...</span>
        </div>
      )}

      {/* Prescriptions List */}
      <div className="flex flex-col gap-space-md">
        {prescriptions.map((rx) => (
          <div
            key={rx.id}
            className="rounded-xl bg-surface-card p-space-base shadow-sm border border-border-subtle flex flex-col gap-space-sm hover:border-slate-300 transition-all"
          >
            <div className="flex items-start justify-between border-b border-border-subtle/60 pb-space-xs">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-headline-sm font-bold text-text-primary">
                    {rx.doctorName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success-text font-code-tabular text-[10px] font-bold border border-status-success-border">
                    {rx.status}
                  </span>
                </div>
                <span className="font-body-sm text-text-muted text-xs">
                  {rx.clinic} • Issued: {rx.date}
                </span>
              </div>
              <span className="font-code-tabular text-[11px] text-text-muted bg-surface-subtle px-2 py-0.5 rounded font-semibold shrink-0">
                {rx.id}
              </span>
            </div>

            {/* Mapped Medicines */}
            <div className="flex flex-col gap-space-xs pt-1">
              <span className="font-label-sm uppercase tracking-wide text-text-muted font-bold text-[10px]">
                Prescribed Brand vs Certified Generic Molecule Match
              </span>
              <div className="flex flex-col gap-2">
                {rx.medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle/80 border border-border-subtle"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-body-sm text-text-muted line-through text-xs truncate">
                        {med.prescribed}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-label-md font-bold text-text-primary text-xs sm:text-sm truncate">
                          {med.genericEquivalent}
                        </span>
                        <span className="material-symbols-outlined text-primary text-[15px] shrink-0">
                          check_circle
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-code-tabular text-[11px] font-bold text-status-success-text bg-status-success-bg px-2 py-0.5 rounded border border-status-success-border">
                        {med.savings}
                      </span>
                      <button
                        onClick={() => onSelectMedicine(med.genericEquivalent)}
                        className="px-2.5 py-1 bg-surface-card text-primary rounded font-label-sm font-bold border border-border-subtle hover:bg-surface-container active:scale-95 text-xs"
                      >
                        Compare
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-space-xs border-t border-border-subtle/50 mt-1 flex-wrap gap-2">
              <span className="font-body-sm text-text-muted flex items-center gap-1 text-xs">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  verified_user
                </span>
                Digitized by Registered Pharmacist (Form 21)
              </span>
              <div className="flex items-center gap-2">
                {onNavigateToCart && (
                  <button
                    onClick={onNavigateToCart}
                    className="px-3 py-1.5 rounded-lg bg-surface-subtle text-primary font-label-sm font-semibold hover:bg-surface-container active:scale-95 text-[12px] border border-border-subtle flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">shopping_cart</span>
                    <span>View Cart</span>
                  </button>
                )}
                <button
                  onClick={() => handleOrderAllGenerics(rx)}
                  className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-sm font-bold hover:bg-brand-deep active:scale-95 transition-all shadow-xs flex items-center gap-1 text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                  <span>Reorder Generic Bundle</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
