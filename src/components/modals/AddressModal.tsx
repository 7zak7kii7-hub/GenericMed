import React, { useState } from 'react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (addr: string) => void;
  currentAddress: string;
}

interface SavedAddress {
  id: string;
  title: string;
  recipient: string;
  address: string;
  tag: string;
  sla: string;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSelectAddress,
  currentAddress,
}) => {
  const [addressList, setAddressList] = useState<SavedAddress[]>([
    {
      id: 'addr-1',
      title: 'Home',
      recipient: 'Dr. Aris Thorne',
      address: '#402 Palm Grove, 12th Main Indiranagar, Bengaluru 560038',
      tag: 'Default',
      sla: '30-40 mins',
    },
    {
      id: 'addr-2',
      title: 'Clinic / Work',
      recipient: 'Dr. Aris Thorne',
      address: 'Suite 3B, Metro Health Complex, 100ft Road, Bengaluru 560008',
      tag: 'Work',
      sla: '25-35 mins',
    },
    {
      id: 'addr-3',
      title: 'Parents Home',
      recipient: 'V. Thorne',
      address: 'Plot 88, 4th Cross, Koramangala 5th Block, Bengaluru 560034',
      tag: 'Other',
      sla: '45-55 mins',
    },
  ]);

  const [selectedId, setSelectedId] = useState(() => {
    const found = addressList.find((a) => a.address === currentAddress);
    return found ? found.id : 'addr-1';
  });

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRecipient, setNewRecipient] = useState('Dr. Aris Thorne');
  const [newStreet, setNewStreet] = useState('');
  const [newPincode, setNewPincode] = useState('560038');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const selected = addressList.find((a) => a.id === selectedId);
    if (selected) {
      onSelectAddress(selected.address);
    }
    onClose();
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim() || !newTitle.trim()) return;

    const fullAddr = `${newStreet.trim()}, Bengaluru ${newPincode.trim()}`;
    const newEntry: SavedAddress = {
      id: `addr-${Date.now()}`,
      title: newTitle.trim(),
      recipient: newRecipient.trim(),
      address: fullAddr,
      tag: 'Custom',
      sla: '35-45 mins',
    };

    setAddressList((prev) => [newEntry, ...prev]);
    setSelectedId(newEntry.id);
    onSelectAddress(fullAddr);
    setIsAddingNew(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-surface-card rounded-2xl p-5 sm:p-6 shadow-2xl z-10 border border-border-subtle max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">location_on</span>
            <h3 className="font-headline-sm font-bold text-text-primary">
              {isAddingNew ? 'Add Delivery Address' : 'Delivery Destination'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {isAddingNew ? (
          <form onSubmit={handleSaveNewAddress} className="mt-4 flex flex-col gap-3">
            <div>
              <label className="text-[12px] font-bold text-text-secondary block mb-1">
                Address Tag / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Vacation Villa, Lab Office"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-surface-canvas rounded-xl text-body-sm border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-text-secondary block mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                required
                className="w-full px-3 py-2 bg-surface-canvas rounded-xl text-body-sm border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-text-secondary block mb-1">
                Flat / House No., Street, Locality
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Flat 301, Silver Oak Apt, 100ft Road, Indiranagar"
                value={newStreet}
                onChange={(e) => setNewStreet(e.target.value)}
                required
                className="w-full px-3 py-2 bg-surface-canvas rounded-xl text-body-sm border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-text-secondary block mb-1">
                Pincode (Bengaluru)
              </label>
              <input
                type="text"
                value={newPincode}
                onChange={(e) => setNewPincode(e.target.value)}
                required
                className="w-full px-3 py-2 bg-surface-canvas rounded-xl text-body-sm border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 font-code-tabular"
              />
            </div>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-subtle font-label-md font-semibold text-text-primary hover:bg-surface-container"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-brand-deep shadow-sm"
              >
                Save &amp; Deliver Here
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mt-4 flex flex-col gap-2.5">
              {addressList.map((addr) => (
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
                    className="mt-1 w-4 h-4 text-primary focus:ring-0 cursor-pointer"
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

            <button
              onClick={() => setIsAddingNew(true)}
              className="mt-3 w-full py-2 rounded-xl border border-dashed border-primary text-primary hover:bg-primary/5 font-label-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
              <span>Add New Address</span>
            </button>

            <div className="mt-4 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-surface-subtle font-label-md font-semibold text-text-primary hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-brand-deep shadow-sm active:scale-95 transition-all"
              >
                Confirm Location
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
