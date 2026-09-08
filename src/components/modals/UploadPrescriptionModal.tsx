import React, { useState } from 'react';
import { CartItem } from '../../types';

interface UploadPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddConvertedGenerics: (items: CartItem[]) => void;
  showToastMessage: (msg: string) => void;
}

export const UploadPrescriptionModal: React.FC<UploadPrescriptionModalProps> = ({
  isOpen,
  onClose,
  onAddConvertedGenerics,
  showToastMessage,
}) => {
  const [step, setStep] = useState<'upload' | 'scanning' | 'results'>('upload');
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleStartScan = () => {
    setStep('scanning');
    setTimeout(() => {
      setStep('results');
      showToastMessage('OCR completed: 3 brand medicines converted to verified generic molecules!');
    }, 2000);
  };

  const convertedResults: CartItem[] = [
    {
      id: `rx-item-1-${Date.now()}`,
      name: 'Paracetamol IP 650mg',
      category: 'ANALGESIC • IP GRADE',
      pharmacyName: 'Apollo Med Central',
      price: 21.00,
      mrp: 54.00,
      pricePerUnit: '₹1.40 / tab',
      quantity: 1,
      packDetail: 'Strip of 15',
      batchNumber: 'Batch #AP-9921',
      savingsAmount: 33.00,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0P1UtMCeQiNx2w-bcWeCUFFpzLF24iIe3Cp14GAZ5EB13ymClblYwtJWU7ByhbebjjxryBDdp4OmJXRHka7igtzWaMWtXv9me9YlSXChLWYZfW_-jsUyR8HjK1C0LGpXemLMNThRUpKBpKU7eVMukONcRCHPBm7Kf626g4YQgmyLof3wdsPQ611VG3SgU4zHJmczu85b5JETLuuRKe8vqJ9obmmoClxrwGcEvtgTr5P-8gwiWM459Ow'
    },
    {
      id: `rx-item-2-${Date.now()}`,
      name: 'Amoxy-Clav 625mg',
      category: 'ANTIBIOTIC • CDSCO COMPLIANT',
      pharmacyName: 'Apollo Med Central',
      price: 50.00,
      mrp: 192.00,
      pricePerUnit: '₹5.00 / tab',
      quantity: 1,
      packDetail: 'Strip of 10',
      batchNumber: 'Batch #AP-3104',
      savingsAmount: 142.00,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2ox6R8_W0rkSEFboR7B4tYoVqdnvB8FaadBVFLBDVxeDwjdsIQhrdgaYARQkZDYIzVuyDAvc5rUufa5vcTZfYjsHh2aW17Tz2mbfru9TpYH8Gatk1Xq44HMG6xpxskqcZyRB25nTmFCVdRmWn0b8YbuzOQrEjvPQxsWgLB2MKXuOOKwfGISB0S044qiizjYpE8c_36lRYyuPGUsekFiCPJChOqE0d_ZuzyRRqzrzWCX5AcJUi2SIMUw'
    }
  ];

  const handleAddAll = () => {
    onAddConvertedGenerics(convertedResults);
    showToastMessage('Added 2 converted generic medications to cart!');
    onClose();
    setStep('upload');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-surface-card rounded-2xl p-6 shadow-2xl z-10 border border-border-subtle">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">receipt_long</span>
            <h3 className="font-headline-sm font-bold text-text-primary">
              AI Prescription Converter
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-muted hover:text-text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {step === 'upload' && (
          <div className="mt-4 flex flex-col gap-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleStartScan(); }}
              onClick={handleStartScan}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border-strong hover:border-primary bg-surface-canvas'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-surface-subtle flex items-center justify-center text-primary mb-3">
                <span className="material-symbols-outlined text-[30px]">add_a_photo</span>
              </div>
              <h4 className="font-headline-sm font-bold text-text-primary">
                Upload or Take Photo
              </h4>
              <p className="font-body-sm text-text-muted mt-1 max-w-xs">
                Drag &amp; drop doctor prescription (JPG, PNG, PDF) or tap to upload sample
              </p>
              <div className="mt-4 px-4 py-1.5 rounded-lg bg-secondary-container text-on-secondary-container font-label-sm font-bold shadow-xs">
                Browse Files
              </div>
            </div>

            <div className="p-3 bg-status-info-bg rounded-xl border border-status-info-border text-[12px] text-status-info-text flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">verified</span>
              <span>
                Processed through CDSCO-compliant OCR model. Doctor signatures and Form 20/21 compliance verified.
              </span>
            </div>
          </div>
        )}

        {step === 'scanning' && (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <span className="material-symbols-outlined text-primary text-[28px] absolute inset-0 flex items-center justify-center">
                document_scanner
              </span>
            </div>
            <div>
              <h4 className="font-headline-sm font-bold text-text-primary">
                Analyzing Salt Formulations...
              </h4>
              <p className="font-body-sm text-text-muted mt-1">
                Matching doctor brands to highest-purity generic bioequivalents
              </p>
            </div>
            <div className="w-48 h-1.5 bg-surface-subtle rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase font-bold text-text-muted">
                Detected Generic Equivalents
              </span>
              <span className="text-[11px] font-bold text-status-success-text bg-status-success-bg px-2 py-0.5 rounded border border-status-success-border">
                Save ₹175.00 Total
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
              <div className="p-3 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-text-muted line-through">Dolo 650mg</span>
                  <span className="font-code-tabular text-body-sm font-bold text-primary">₹21.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-md font-bold text-text-primary">
                    Paracetamol IP 650mg (15 tabs)
                  </span>
                  <span className="text-[10px] text-status-success-text font-bold">Save 68%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-text-muted line-through">Augmentin 625mg</span>
                  <span className="font-code-tabular text-body-sm font-bold text-primary">₹50.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-md font-bold text-text-primary">
                    Amoxy-Clav 625mg (10 tabs)
                  </span>
                  <span className="text-[10px] text-status-success-text font-bold">Save 74%</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setStep('upload')}
                className="py-2.5 px-3 rounded-xl bg-surface-subtle font-label-md font-semibold text-text-primary hover:bg-surface-container"
              >
                Scan Another
              </button>
              <button
                onClick={handleAddAll}
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-brand-deep active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                <span>Add All to Cart</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
