import React from 'react';

interface SosEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToastMessage?: (msg: string) => void;
}

export const SosEmergencyModal: React.FC<SosEmergencyModalProps> = ({
  isOpen,
  onClose,
  showToastMessage,
}) => {
  if (!isOpen) return null;

  const emergencyHelplines = [
    {
      name: 'National Emergency Response Support (NERS)',
      number: '112',
      badge: 'All Emergencies',
      color: 'bg-red-600',
      description: 'Police, Fire, Ambulance unified response across India',
    },
    {
      name: 'Emergency Medical Service / Ambulance',
      number: '108',
      badge: 'Immediate Medical',
      color: 'bg-emerald-600',
      description: 'Trained paramedic triage and nearest trauma ambulance dispatch',
    },
    {
      name: 'National Poison Information Centre (AIIMS)',
      number: '1800-116-117',
      badge: 'Toxicity / Overdose',
      color: 'bg-amber-600',
      description: '24x7 expert toxicology advice for drug overdose & adverse reactions',
    },
    {
      name: 'National Tele-Consultation Helpline (eSanjeevani)',
      number: '1075',
      badge: 'Government Desk',
      color: 'bg-blue-600',
      description: 'Ministry of Health & Family Welfare emergency clinical support',
    },
  ];

  const nearbyHospitals = [
    {
      name: 'Manipal Hospital, Old Airport Rd',
      distance: '2.1 km',
      erContact: '+91 80 2502 4444',
      facilities: 'Level 1 Trauma • 24/7 Pharmacy • Cath Lab',
    },
    {
      name: 'Chinmaya Mission Hospital, Indiranagar',
      distance: '0.9 km',
      erContact: '+91 80 2528 0150',
      facilities: '24/7 Casualty • Pediatric ICU • Critical Care',
    },
  ];

  const handleCall = (number: string, label: string) => {
    if (showToastMessage) {
      showToastMessage(`Initiating emergency call to ${label} (${number})...`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-surface-card rounded-2xl p-5 sm:p-6 shadow-2xl z-10 border border-status-danger-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-status-danger-bg text-status-danger-text flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">e911_emergency</span>
            </div>
            <div>
              <h3 className="font-headline-sm font-bold text-text-primary">
                Emergency Medical Response
              </h3>
              <span className="text-[11px] text-text-muted">
                24/7 Critical Helpline &amp; Hospital Emergency Desks
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Rapid SOS Helplines */}
        <div className="mt-4 flex flex-col gap-2.5">
          <span className="font-label-sm text-label-sm font-bold text-text-muted uppercase tracking-wider">
            National Emergency Numbers (Toll-Free)
          </span>

          {emergencyHelplines.map((helpline, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-surface-canvas border border-border-subtle flex items-center justify-between gap-3 hover:border-red-300 transition-all"
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-label-md font-bold text-text-primary">
                    {helpline.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-danger-bg text-status-danger-text">
                    {helpline.badge}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5 leading-tight">
                  {helpline.description}
                </p>
              </div>

              <a
                href={`tel:${helpline.number}`}
                onClick={() => handleCall(helpline.number, helpline.name)}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-status-danger-text text-white font-label-md font-bold text-[13px] flex items-center gap-1.5 hover:opacity-90 active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>{helpline.number}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Nearby Verified ER Facilities */}
        <div className="mt-4 flex flex-col gap-2">
          <span className="font-label-sm text-label-sm font-bold text-text-muted uppercase tracking-wider">
            Nearest 24/7 Emergency Casualty Centers
          </span>

          {nearbyHospitals.map((hospital, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-surface-subtle border border-border-subtle flex items-start justify-between gap-3"
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-md font-bold text-text-primary truncate">
                    {hospital.name}
                  </span>
                  <span className="text-[11px] text-primary font-code-tabular font-bold shrink-0">
                    {hospital.distance}
                  </span>
                </div>
                <span className="text-[11px] text-text-muted mt-0.5">
                  {hospital.facilities}
                </span>
              </div>
              <a
                href={`tel:${hospital.erContact.replace(/\s+/g, '')}`}
                onClick={() => handleCall(hospital.erContact, hospital.name)}
                className="shrink-0 p-2 rounded-lg bg-surface-card border border-border-subtle text-primary hover:bg-surface-container active:scale-95 transition-all flex items-center justify-center shadow-xs"
                title={`Call ${hospital.name}`}
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
              </a>
            </div>
          ))}
        </div>

        {/* Emergency First Aid Note */}
        <div className="mt-4 p-3 bg-status-warning-bg border border-status-warning-border rounded-xl text-[12px] text-status-warning-text flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
          <span>
            In the event of severe chest pain, breathing difficulty, or sudden allergic reaction, seek physical hospital admission immediately. Do not delay for online delivery.
          </span>
        </div>

        <div className="mt-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-surface-subtle font-label-md font-semibold text-text-primary hover:bg-surface-container"
          >
            Close Emergency Menu
          </button>
        </div>
      </div>
    </div>
  );
};
