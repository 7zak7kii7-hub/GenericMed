import React, { useState } from 'react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (addr: string) => void;
  currentAddress: string;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSelectAddress,
  currentAddress,
}) => {
  const addresses = [
    {
      id: 'addr-1',
      title: 'Home',
      recipient: 'Dr. Aris Thorne',
      address: '#402 Palm Grove, 12th Main Indiranagar, Bengaluru 560038',
      tag: 'Default',
      sla: '30-40 mins'
    },
    {
      id: 'addr-2',
      title: 'Clinic / Work',
      recipient: 'Dr. Aris Thorne',
      address: 'Suite 3B, Metro Health Complex, 100ft Road, Bengaluru 560008',
      tag: 'Work',
      sla: '25-35 mins'
    },
    {
      id: 'addr-3',
      title: 'Parents Home',
      recipient: 'V. Thorne',
      address: 'Plot 88, 4th Cross, Koramangala 5th Block, Bengaluru 560034',
      tag: 'Other',
      sla: '45-55 mins'
    }
  ];

  const [selectedId, setSelectedId] = useState('addr-1');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const selected = addresses.find((a) => a.id === selectedId);
    if (selected) {
      onSelectAddress(selected.address);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-surface-card rounded-2xl p-6 shadow-2xl z-10 border border-border-subtle">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">location_on</span>
            <h3 className="font-headline-sm font-bold text-text-primary">
              Delivery Destination
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-muted hover:text-text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {addresses.map((addr) => (
            <label
              key={addr.id}
              onClick={() => setSelectedId(addr.id)}
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                selectedId === addr.id
                  ? 'bg-status-info-bg border-primary shadow-xs'
                  : 'bg-surface-canvas border-border-subtle hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="delivery_address"
                checked={selectedId === addr.id}
                onChange={() => setSelectedId(addr.id)}
                className="mt-1 w-4 h-4 text-primary focus:ring-0"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-label-md font-bold text-text-primary">
                    {addr.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-subtle text-text-secondary border border-border-subtle">
                    {addr.sla}
                  </span>
                </div>
                <span className="text-[12px] font-medium text-text-secondary mt-0.5">
                  {addr.recipient}
                </span>
                <p className="text-[12px] text-text-muted mt-0.5 leading-snug">
                  {addr.address}
                </p>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-surface-subtle font-label-md font-semibold text-text-primary hover:bg-surface-container"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-brand-deep shadow-sm"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};
