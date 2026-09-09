import React, { useState, useEffect } from 'react';
import { api, SugamRecallRecord } from '../../services/api';

interface CdscoSugamModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToastMessage: (msg: string) => void;
}

export const CdscoSugamModal: React.FC<CdscoSugamModalProps> = ({
  isOpen,
  onClose,
  showToastMessage,
}) => {
  const [bulletins, setBulletins] = useState<SugamRecallRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [batchQuery, setBatchQuery] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadBulletins();
    }
  }, [isOpen]);

  const loadBulletins = async () => {
    setLoading(true);
    try {
      const res = await api.getSugamRecalls();
      setBulletins(res.bulletins);
    } catch {
      console.warn('Failed to load Sugam bulletins');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBatch = async (batchToCheck?: string) => {
    const code = (batchToCheck || batchQuery).trim();
    if (!code) {
      showToastMessage('Please enter a medicine batch number.');
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    try {
      const res = await api.verifyBatchRecall(code);
      setVerificationResult(res);
      if (res.isSafe) {
        showToastMessage(`✅ Batch ${code} verified safe by CDSCO Sugam Registry`);
      } else {
        showToastMessage(`⚠️ ALERT: Batch ${code} is under national recall!`);
      }
    } catch {
      showToastMessage('Batch check failed. Please retry.');
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface-card rounded-2xl max-w-xl w-full shadow-2xl border border-border-subtle overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
        {/* CDSCO Sugam Header */}
        <div className="bg-[#1A365D] text-white p-space-base flex items-center justify-between border-b border-border-subtle">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <span className="material-symbols-outlined text-[24px] text-amber-300">
                gavel
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-base font-bold leading-tight">
                CDSCO Sugam National Registry
              </span>
              <span className="font-label-sm text-[11px] text-white/80">
                Central Drugs Standard Control Organisation • Drug Safety Portal
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

        {/* Modal Body */}
        <div className="p-space-base flex flex-col gap-space-md overflow-y-auto">
          {/* Quick Batch Verification Cockpit */}
          <div className="p-space-sm bg-surface-subtle rounded-xl border border-border-subtle flex flex-col gap-space-xs">
            <span className="font-label-sm text-xs font-bold text-text-primary uppercase tracking-wider">
              Verify Batch Safety Against National Recall Bulletins
            </span>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={batchQuery}
                onChange={(e) => {
                  setBatchQuery(e.target.value);
                  setVerificationResult(null);
                }}
                placeholder="Enter batch number (e.g. GEN-2026-09 or RECALL-DOLO-99)"
                className="flex-1 h-10 px-3 rounded-lg border border-border-subtle bg-surface-container-lowest font-code-tabular text-xs font-semibold text-text-primary focus:border-primary outline-none"
              />
              <button
                type="button"
                onClick={() => handleVerifyBatch()}
                disabled={verifying}
                className="px-4 h-10 rounded-lg bg-primary text-on-primary font-label-md text-xs font-bold shadow-xs hover:bg-primary/95 flex items-center gap-1 active:scale-95 disabled:opacity-50"
              >
                {verifying ? (
                  <span>Checking...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Verify</span>
                  </>
                )}
              </button>
            </div>

            {/* Test batch shortcut chips */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[11px] text-text-muted">Test quick batches:</span>
              <button
                onClick={() => {
                  setBatchQuery('GEN-2026-09');
                  handleVerifyBatch('GEN-2026-09');
                }}
                className="text-[11px] font-code-tabular font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              >
                GEN-2026-09 (Safe)
              </button>
              <button
                onClick={() => {
                  setBatchQuery('RECALL-DOLO-99');
                  handleVerifyBatch('RECALL-DOLO-99');
                }}
                className="text-[11px] font-code-tabular font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 hover:bg-red-200"
              >
                RECALL-DOLO-99 (Recalled)
              </button>
            </div>

            {/* Verification Result Card */}
            {verificationResult && (
              <div
                className={`mt-2 p-space-sm rounded-xl border flex flex-col gap-1 animate-fadeIn ${
                  verificationResult.isSafe
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span className="material-symbols-outlined text-[18px]">
                    {verificationResult.isSafe ? 'check_circle' : 'dangerous'}
                  </span>
                  <span>
                    {verificationResult.isSafe
                      ? `BATCH ${verificationResult.batchNumber}: PASSED CDSCO SAFETY SURVEILLANCE`
                      : `BATCH ${verificationResult.batchNumber}: CRITICAL RECALL NOTICE`}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {verificationResult.isSafe
                    ? verificationResult.message
                    : verificationResult.warning}
                </p>
                {!verificationResult.isSafe && verificationResult.recallAlert && (
                  <div className="mt-1 pt-1 border-t border-red-200 text-[11px] flex flex-col gap-0.5">
                    <span>
                      <strong>Circular:</strong> {verificationResult.recallAlert.circularId}
                    </span>
                    <span>
                      <strong>Reason:</strong> {verificationResult.recallAlert.reason}
                    </span>
                    <span>
                      <strong>Action:</strong> {verificationResult.recallAlert.regulatoryAction}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active National Drug Bulletins */}
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  campaign
                </span>
                <span className="font-headline-sm text-sm font-bold text-text-primary">
                  Active National Drug Bulletins &amp; Spurious Alerts
                </span>
              </div>
              <span className="text-[10px] text-text-muted font-code-tabular">
                Last Sync: Live
              </span>
            </div>

            <div className="flex flex-col gap-space-sm">
              {bulletins.map((bulletin) => (
                <div
                  key={bulletin.circularId}
                  className="p-space-sm bg-surface-subtle rounded-xl border border-border-subtle flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-text-primary text-sm">
                        {bulletin.drugName}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {bulletin.activeSalt} • Mfr: {bulletin.manufacturer}
                      </span>
                    </div>
                    <span
                      className={`font-label-sm text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        bulletin.riskTier === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : bulletin.riskTier === 'HIGH'
                          ? 'bg-amber-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }`}
                    >
                      {bulletin.riskTier} RISK
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-text-secondary mt-1">
                    <span>
                      Batch: <strong className="font-code-tabular text-red-700">{bulletin.batchNumber}</strong>
                    </span>
                    <span>Exp: {bulletin.expiryDate}</span>
                    <span>Issued: {bulletin.dateIssued}</span>
                  </div>

                  <p className="text-[11px] text-text-muted bg-white p-2 rounded-lg border border-border-subtle mt-1 leading-relaxed">
                    <strong>Surveillance Finding:</strong> {bulletin.reason}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-border-subtle/50">
                    <span className="font-code-tabular font-semibold">
                      {bulletin.circularId}
                    </span>
                    <span className="text-red-600 font-bold">
                      {bulletin.regulatoryAction}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-surface-subtle font-label-md text-xs font-bold text-text-secondary hover:bg-surface-container transition-colors"
          >
            Close Sugam Registry
          </button>
        </div>
      </div>
    </div>
  );
};
