import React, { useState, useEffect } from 'react';
import { CartItem } from '../../types';
import { api } from '../../services/api';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  cartItems: CartItem[];
  onPaymentSuccess: (orderData: any) => void;
  showToastMessage: (msg: string) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  amount,
  cartItems,
  onPaymentSuccess,
  showToastMessage,
}) => {
  const [activeMethod, setActiveMethod] = useState<'upi' | 'cards' | 'netbanking'>('upi');
  const [upiVpa, setUpiVpa] = useState('rahul.patient@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('Initiating Payment...');
  const [secondsLeft, setSecondsLeft] = useState(580); // 09:40
  const [intentData, setIntentData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      api.createPaymentIntent({
        amount,
        items: cartItems,
        paymentMethod: activeMethod,
        upiVpa,
      }).then((res) => {
        setIntentData(res);
      });
    }
  }, [isOpen, amount, activeMethod]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleAuthorizePayment = async () => {
    setIsProcessing(true);
    setProcessingStep('Connecting to NPCI UPI Clearing House node...');

    const timer1 = setTimeout(() => {
      setProcessingStep('Validating CDSCO Form 20B/21B Dispensary Batch Allocation...');
    }, 700);

    const timer2 = setTimeout(() => {
      setProcessingStep('Decrementing Jan Aushadhi Kendra Inventory & Recording Split Settlement...');
    }, 1400);

    try {
      const orderId = intentData?.orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const txnId = intentData?.transactionId || `txn_upi_${Date.now()}`;

      await api.verifyPayment({
        orderId,
        transactionId: txnId,
        paymentMethod: activeMethod.toUpperCase(),
        items: cartItems,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsProcessing(false);
      showToastMessage(`Payment ₹${amount.toFixed(2)} captured! Order ${orderId} reserved.`);
      onPaymentSuccess({ orderId, amount, items: cartItems });
      onClose();
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsProcessing(false);
      showToastMessage(err.message || 'Payment authorization failed.');
    }
  };

  const subtotal = Math.max(0, amount - 30);
  const retailerPayout = Number((subtotal * 0.95).toFixed(2));
  const coldChainFee = 25.0;
  const platformFee = 5.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-surface-card rounded-2xl shadow-2xl z-10 border border-border-subtle max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-base font-bold text-text-primary">
                  GenericMed UPI &amp; Cards
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-status-success-bg text-status-success-text text-[10px] font-bold">
                  NPCI SECURED
                </span>
              </div>
              <p className="font-body-sm text-[11px] text-text-muted">
                Jan Aushadhi Escrow Account • CDSCO Form 20B Verified
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
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Price & Timer Banner */}
          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-border-subtle flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
                Total Amount Payable
              </span>
              <span className="text-2xl font-bold font-code-tabular text-primary">
                ₹{amount.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-text-muted">Price Lock Countdown</span>
              <div className="flex items-center gap-1 font-code-tabular text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <span className="material-symbols-outlined text-[13px]">timer</span>
                <span>{formatTimer(secondsLeft)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="flex rounded-xl bg-surface-subtle p-1 border border-border-subtle">
            <button
              onClick={() => setActiveMethod('upi')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeMethod === 'upi'
                  ? 'bg-surface-card text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
              <span>UPI Intent &amp; QR</span>
            </button>
            <button
              onClick={() => setActiveMethod('cards')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeMethod === 'cards'
                  ? 'bg-surface-card text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">credit_card</span>
              <span>Cards</span>
            </button>
            <button
              onClick={() => setActiveMethod('netbanking')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeMethod === 'netbanking'
                  ? 'bg-surface-card text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">account_balance</span>
              <span>Net Banking</span>
            </button>
          </div>

          {/* TAB 1: UPI INTENT & DYNAMIC QR */}
          {activeMethod === 'upi' && (
            <div className="flex flex-col gap-3">
              {/* Dynamic QR Display */}
              <div className="p-4 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col items-center text-center gap-2">
                <div className="relative p-2.5 bg-white rounded-xl shadow-xs border border-slate-200">
                  {/* Generated Stylized QR Visual */}
                  <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="#ffffff" />
                    {/* Corner Position Detection Patterns */}
                    <rect x="5" y="5" width="26" height="26" fill="#005048" rx="4" />
                    <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                    <rect x="13" y="13" width="10" height="10" fill="#005048" />

                    <rect x="69" y="5" width="26" height="26" fill="#005048" rx="4" />
                    <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                    <rect x="77" y="13" width="10" height="10" fill="#005048" />

                    <rect x="5" y="69" width="26" height="26" fill="#005048" rx="4" />
                    <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="2" />
                    <rect x="13" y="77" width="10" height="10" fill="#005048" />

                    {/* Data Matrix Dots */}
                    <circle cx="40" cy="18" r="3" fill="#005048" />
                    <circle cx="52" cy="18" r="3" fill="#005048" />
                    <circle cx="46" cy="28" r="3" fill="#005048" />
                    <circle cx="18" cy="45" r="3" fill="#005048" />
                    <circle cx="28" cy="52" r="3" fill="#005048" />
                    <circle cx="40" cy="45" r="3" fill="#005048" />
                    <circle cx="52" cy="52" r="3" fill="#005048" />
                    <circle cx="64" cy="45" r="3" fill="#005048" />
                    <circle cx="78" cy="52" r="3" fill="#005048" />
                    <circle cx="45" cy="70" r="3" fill="#005048" />
                    <circle cx="58" cy="78" r="3" fill="#005048" />
                    <circle cx="70" cy="70" r="3" fill="#005048" />
                    <circle cx="82" cy="80" r="3" fill="#005048" />

                    {/* Center Medical Cross Emblem */}
                    <circle cx="50" cy="50" r="9" fill="#ffffff" />
                    <circle cx="50" cy="50" r="7" fill="#005048" />
                    <rect x="48.5" y="45.5" width="3" height="9" fill="#ffffff" />
                    <rect x="45.5" y="48.5" width="9" height="3" fill="#ffffff" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md font-bold text-text-primary text-xs">
                    Scan with any UPI App
                  </span>
                  <span className="text-[11px] text-text-muted">
                    PhonePe • Google Pay • Paytm • BHIM • Cred
                  </span>
                </div>
              </div>

              {/* VPA Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-text-secondary">
                  Or enter your Virtual Payment Address (VPA / UPI ID)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    placeholder="mobile@upi or user@okhdfcbank"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-strong bg-surface-canvas text-text-primary text-xs focus:border-primary focus:outline-none font-code-tabular"
                  />
                  <button
                    onClick={() => setUpiVpa('rahul.patient@okhdfcbank')}
                    className="absolute right-2 top-2 px-2 py-0.5 rounded bg-surface-subtle text-primary font-bold text-[10px] hover:bg-surface-container"
                  >
                    Demo VPA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CARDS */}
          {activeMethod === 'cards' && (
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-text-secondary">Card Number</label>
                <input
                  type="text"
                  placeholder="4532 •••• •••• 8821"
                  defaultValue="4532 9912 3401 8821"
                  className="w-full px-3 py-2 rounded-xl border border-border-strong bg-surface-canvas text-text-primary text-xs font-code-tabular"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-text-secondary">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="08/29"
                    className="w-full px-3 py-2 rounded-xl border border-border-strong bg-surface-canvas text-text-primary text-xs font-code-tabular"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-text-secondary">CVV</label>
                  <input
                    type="password"
                    maxLength={3}
                    placeholder="•••"
                    defaultValue="482"
                    className="w-full px-3 py-2 rounded-xl border border-border-strong bg-surface-canvas text-text-primary text-xs font-code-tabular text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NET BANKING */}
          {activeMethod === 'netbanking' && (
            <div className="grid grid-cols-2 gap-2">
              {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                <button
                  key={bank}
                  onClick={() => setSelectedBank(bank)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                    selectedBank === bank
                      ? 'border-primary bg-primary/5 font-bold text-primary'
                      : 'border-border-subtle bg-surface-canvas text-text-primary hover:border-slate-300'
                  }`}
                >
                  <span>{bank}</span>
                  {selectedBank === bank && (
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Automated Split Settlement Ledger */}
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-border-subtle text-[11px] flex flex-col gap-1">
            <span className="font-bold text-text-primary flex items-center justify-between">
              <span>Automated Split Settlement Accounting</span>
              <span className="text-secondary font-code-tabular">ESCROW LOCKED</span>
            </span>
            <div className="flex justify-between text-text-muted">
              <span>Jan Aushadhi Retailer Payout (95% subtotal):</span>
              <span className="font-code-tabular font-semibold text-text-primary">₹{retailerPayout.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Insulated Cold-Chain Logistics SLA:</span>
              <span className="font-code-tabular text-text-primary">₹{coldChainFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Platform Technology Fee:</span>
              <span className="font-code-tabular text-text-primary">₹{platformFee.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border-subtle bg-surface-container-lowest flex items-center justify-between gap-3 shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted">Payable to Jan Aushadhi</span>
            <span className="font-code-tabular font-bold text-base text-primary">₹{amount.toFixed(2)}</span>
          </div>
          <button
            onClick={handleAuthorizePayment}
            disabled={isProcessing}
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-brand-deep active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm text-xs disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                <span>{processingStep}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span>Authorize &amp; Pay ₹{amount.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
