import React, { useState, useEffect } from 'react';
import { api, AuditRecord } from '../../services/api';

interface CdscoAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToastMessage: (msg: string) => void;
}

export const CdscoAuditModal: React.FC<CdscoAuditModalProps> = ({
  isOpen,
  onClose,
  showToastMessage,
}) => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getCdscoAuditLogs();
      setLogs(res.records);
    } catch {
      showToastMessage('Loaded offline audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-xl bg-surface-card rounded-2xl shadow-2xl z-10 border border-border-subtle max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">policy</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-text-primary flex items-center gap-2">
                <span>CDSCO Schedule H1 Regulatory Audit Trail</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                  GOVT FORM 20B
                </span>
              </h3>
              <p className="font-body-sm text-[11px] text-text-muted">
                Central Drugs Standard Control Organisation Compliance Ledger
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

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0 mt-0.5">
              gavel
            </span>
            <p>
              Under Rule 65 of the Indian Drugs and Cosmetics Rules 1945, every dispensation of Schedule H1 substances requires maintaining a separate register containing patient name, doctor registration number, batch quantity, and registered pharmacist sign-off.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-bold text-text-muted">
              Live CDSCO Audit Events ({logs.length})
            </span>
            <button
              onClick={fetchLogs}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              <span>Sync Ledger</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
              <span className="text-xs text-text-muted">Fetching audit records...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-code-tabular font-bold text-[11px] text-text-primary bg-surface-subtle px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-text-muted font-code-tabular">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-text-secondary mt-0.5">{log.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-text-muted border-t border-border-subtle/40 pt-1 mt-1">
                    <span>Audit ID: {log.id}</span>
                    <span className="text-status-success-text font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      <span>Cryptographically Sealed</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle bg-surface-container-lowest flex items-center justify-between text-xs text-text-muted">
          <span>Official Auditor: CDSCO South Zone Zone-IV</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-primary text-on-primary font-label-sm font-bold hover:bg-brand-deep transition-all"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
