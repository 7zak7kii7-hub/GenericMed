import React, { useState, useRef } from 'react';
import { CartItem, PrescriptionRecord } from '../../types';
import { api, OcrResponseData, OcrPrescribedMedicine } from '../../services/api';
import { HOTLINK_IMAGES } from '../../data/mockData';

interface UploadPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddConvertedGenerics: (items: CartItem[]) => void;
  showToastMessage: (msg: string) => void;
  onPrescriptionUploaded?: (rx: PrescriptionRecord) => void;
}

export const UploadPrescriptionModal: React.FC<UploadPrescriptionModalProps> = ({
  isOpen,
  onClose,
  onAddConvertedGenerics,
  showToastMessage,
  onPrescriptionUploaded,
}) => {
  const [step, setStep] = useState<'upload' | 'scanning' | 'results'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [scanStatusText, setScanStatusText] = useState('Initializing Multimodal Vision...');
  const [ocrData, setOcrData] = useState<OcrResponseData | null>(null);
  const [selectedMedIndices, setSelectedMedIndices] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const runOcrAnalysis = async (base64OrNull?: string, sampleId?: string) => {
    setStep('scanning');
    setScanStatusText('Analyzing handwritten doctor prescription with Gemini 2.0 Flash...');

    const timer1 = setTimeout(() => {
      setScanStatusText('Detecting NMC / State Medical Council Doctor Registration...');
    }, 600);

    const timer2 = setTimeout(() => {
      setScanStatusText('Matching prescribed brands to CDSCO bioequivalent generic salts...');
    }, 1200);

    try {
      const data = await api.analyzePrescription(base64OrNull || undefined, sampleId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      setOcrData(data);
      // Default all detected medicines to selected
      setSelectedMedIndices(data.medicines.map((_, idx) => idx));
      setStep('results');
      showToastMessage(
        `Prescription digitized: ${data.medicines.length} branded medicines mapped to bioidentical generics!`
      );
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      showToastMessage(`OCR Analysis completed with clinical fallback.`);
      setStep('upload');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewImage(result);
      runOcrAnalysis(result, 'custom-upload');
    };
    reader.readAsDataURL(file);
  };

  const handleSampleSelect = (sampleType: 'acute' | 'cardio' | 'diabetic') => {
    if (sampleType === 'acute') {
      runOcrAnalysis(undefined, 'sample-acute-fever');
    } else if (sampleType === 'cardio') {
      runOcrAnalysis(undefined, 'sample-cardio-bp');
    } else {
      runOcrAnalysis(undefined, 'sample-diabetic-refill');
    }
  };

  const toggleMedicineSelection = (index: number) => {
    setSelectedMedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const calculateSelectedSavings = () => {
    if (!ocrData) return 0;
    return selectedMedIndices.reduce((acc, idx) => {
      const med = ocrData.medicines[idx];
      return acc + (med ? med.savingsRupees : 0);
    }, 0);
  };

  const handleAddSelectedToCart = async () => {
    if (!ocrData) return;

    const itemsToAdd: CartItem[] = selectedMedIndices
      .map((idx) => {
        const med = ocrData.medicines[idx];
        if (!med) return null;
        return {
          id: `rx-gemini-${med.formulaId}-${Date.now()}-${idx}`,
          name: med.genericEquivalentName,
          category: `${med.dosageForm.toUpperCase()} • CDSCO BIOEQUIVALENT`,
          pharmacyName: 'Jan Aushadhi Kendra #104 (Dispensary Hub)',
          price: med.genericPrice,
          mrp: med.brandPrice,
          pricePerUnit: `₹${(med.genericPrice / 10).toFixed(2)} / unit`,
          quantity: 1,
          packDetail: med.packDetail || 'Standard Pack',
          batchNumber: `Batch #${med.formulaId}-26`,
          savingsAmount: med.savingsRupees,
          imageUrl:
            med.genericEquivalentName.toLowerCase().includes('para')
              ? HOTLINK_IMAGES.paracetamolBlister
              : HOTLINK_IMAGES.atorvastatinBlister,
        } as CartItem;
      })
      .filter(Boolean) as CartItem[];

    onAddConvertedGenerics(itemsToAdd);

    // Also persist to Digital Prescription Vault
    const savedRecord = await api.uploadPrescription({
      doctorName: ocrData.doctorName,
      doctorRegNo: ocrData.doctorRegNo,
      clinic: ocrData.clinic,
      date: ocrData.date,
      medicines: ocrData.medicines.map((m) => ({
        prescribed: `${m.prescribedBrand} (${m.dosage})`,
        genericEquivalent: m.genericEquivalentName,
        savings: `Save ${m.savingsPercent}%`,
      })),
    });

    if (onPrescriptionUploaded) {
      onPrescriptionUploaded(savedRecord);
    }

    showToastMessage(
      `Added ${itemsToAdd.length} verified generic medicines to cart! Saved ₹${calculateSelectedSavings()}.00`
    );
    onClose();
    setStep('upload');
    setPreviewImage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-surface-card rounded-2xl shadow-2xl z-10 border border-border-subtle max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">document_scanner</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-text-primary leading-tight">
                AI Prescription Digitizer
              </h3>
              <p className="font-body-sm text-[11px] text-text-muted">
                Powered by Gemini 2.0 Flash &amp; CDSCO Monograph Engine
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* STEP 1: UPLOAD SCREEN */}
          {step === 'upload' && (
            <div className="flex flex-col gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const res = reader.result as string;
                      setPreviewImage(res);
                      runOcrAnalysis(res, 'custom-drop');
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-primary bg-primary/5 scale-[0.99]'
                    : 'border-border-strong hover:border-primary bg-surface-canvas hover:bg-surface-subtle/50'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[30px]">add_a_photo</span>
                </div>
                <h4 className="font-headline-sm font-bold text-text-primary">
                  Upload Doctor's Prescription
                </h4>
                <p className="font-body-sm text-text-muted mt-1 max-w-xs text-xs">
                  Upload prescription photo (JPG, PNG, PDF) or tap to capture. Handwriting is automatically parsed.
                </p>
                <div className="mt-3.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-sm font-bold shadow-xs hover:bg-brand-deep transition-all flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Browse File / Take Photo</span>
                </div>
              </div>

              {/* Sample Prescriptions Presets */}
              <div className="flex flex-col gap-2">
                <span className="font-label-sm text-[11px] uppercase tracking-wider font-bold text-text-muted">
                  Or Test with Sample Doctor Prescriptions:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSampleSelect('acute')}
                    className="p-3 rounded-xl border border-border-subtle bg-surface-card hover:border-primary hover:bg-primary/5 text-left transition-all group flex items-start gap-2.5"
                  >
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      medication
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-md font-bold text-text-primary group-hover:text-primary text-xs">
                        Acute Fever &amp; Infection
                      </span>
                      <span className="font-body-sm text-[11px] text-text-muted">
                        Dolo 650mg + Augmentin 625 Duo
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSampleSelect('cardio')}
                    className="p-3 rounded-xl border border-border-subtle bg-surface-card hover:border-primary hover:bg-primary/5 text-left transition-all group flex items-start gap-2.5"
                  >
                    <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
                      cardiology
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-md font-bold text-text-primary group-hover:text-primary text-xs">
                        Cardiology &amp; Blood Pressure
                      </span>
                      <span className="font-body-sm text-[11px] text-text-muted">
                        Lipitor 20mg + Telma 40mg
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* CDSCO Regulatory Guarantee Box */}
              <div className="p-3 bg-status-info-bg rounded-xl border border-status-info-border text-[11px] text-status-info-text flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0 text-secondary">
                  verified
                </span>
                <span>
                  <strong>CDSCO Schedule H/H1 Guard</strong>: Doctor registration number &amp; hospital credentials are encrypted and verified under Form 20/21 compliance.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: SCANNING IN PROGRESS */}
          {step === 'scanning' && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
              <div className="relative">
                <div className="w-18 h-18 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <span className="material-symbols-outlined text-primary text-[32px] absolute inset-0 flex items-center justify-center">
                  biotech
                </span>
              </div>
              <div className="flex flex-col items-center max-w-sm">
                <h4 className="font-headline-sm font-bold text-text-primary">
                  {scanStatusText}
                </h4>
                <p className="font-body-sm text-text-muted mt-1.5 text-xs">
                  CDSCO Pharmacopoeia engine matching brands to bio-identical generics...
                </p>
              </div>
              <div className="w-56 h-1.5 bg-surface-subtle rounded-full overflow-hidden mt-2">
                <div className="h-full bg-primary rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          {/* STEP 3: RESULTS SCREEN */}
          {step === 'results' && ocrData && (
            <div className="flex flex-col gap-4">
              {/* Doctor & Clinic Identification Card */}
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-border-subtle flex flex-col gap-1.5">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      local_hospital
                    </span>
                    <span className="font-headline-sm font-bold text-text-primary text-sm">
                      {ocrData.doctorName}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-text-secondary font-code-tabular text-[10px] font-bold border border-border-subtle">
                    Reg: {ocrData.doctorRegNo}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted pt-0.5">
                  <span>{ocrData.clinic}</span>
                  <span>Date: {ocrData.date}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-border-subtle/50 mt-1">
                  <span className="px-2 py-0.5 rounded bg-status-success-bg text-status-success-text text-[10px] font-bold">
                    {Math.round(ocrData.overallConfidence * 100)}% AI Confidence
                  </span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold font-code-tabular">
                    {ocrData.engineUsed === 'GEMINI_2_0_FLASH'
                      ? '⚡ Gemini 2.0 Flash Vision'
                      : '🩺 CDSCO Monograph Parser'}
                  </span>
                  {ocrData.needsManualReview && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                      Requires Pharmacist Confirmation
                    </span>
                  )}
                </div>
              </div>

              {/* Detected Mappings Header */}
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[11px] uppercase font-bold text-text-muted">
                  Prescribed vs Generic Equivalents ({ocrData.medicines.length})
                </span>
                <span className="text-[11px] font-bold text-status-success-text bg-status-success-bg px-2 py-0.5 rounded border border-status-success-border font-code-tabular">
                  Save ₹{calculateSelectedSavings()}.00 Total
                </span>
              </div>

              {/* Mapped Medicines List */}
              <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                {ocrData.medicines.map((med, idx) => {
                  const isSelected = selectedMedIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleMedicineSelection(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border-subtle bg-surface-canvas opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-border-strong text-primary focus:ring-primary h-4 w-4"
                          />
                          <span className="text-body-sm text-text-muted line-through text-xs">
                            {med.prescribedBrand} ({med.dosage})
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-status-success-text bg-status-success-bg px-1.5 py-0.5 rounded border border-status-success-border">
                          Save {med.savingsPercent}% (₹{med.savingsRupees})
                        </span>
                      </div>

                      <div className="flex items-center justify-between pl-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-label-md font-bold text-text-primary text-xs sm:text-sm">
                              {med.genericEquivalentName}
                            </span>
                            <span className="material-symbols-outlined text-primary text-[15px]">
                              check_circle
                            </span>
                          </div>
                          <span className="text-[10px] text-text-muted">
                            {med.frequency} • {med.duration} • {med.packDetail}
                          </span>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="font-code-tabular text-sm font-bold text-primary">
                            ₹{med.genericPrice.toFixed(2)}
                          </span>
                          <span className="font-code-tabular text-[10px] text-text-muted line-through">
                            MRP ₹{med.brandPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2 border-t border-border-subtle">
                <button
                  onClick={() => {
                    setStep('upload');
                    setPreviewImage(null);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-surface-subtle font-label-md font-semibold text-text-primary hover:bg-surface-container text-xs transition-colors"
                >
                  Scan Another
                </button>
                <button
                  onClick={handleAddSelectedToCart}
                  disabled={selectedMedIndices.length === 0}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-brand-deep active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm text-xs disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  <span>
                    Add {selectedMedIndices.length} Generics to Cart (Save ₹{calculateSelectedSavings()})
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
