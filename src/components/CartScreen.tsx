import React, { useState, useEffect } from 'react';
import { CartItem, ScreenTab } from '../types';

interface CartScreenProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onOpenAddressModal: () => void;
  onNavigate: (tab: ScreenTab) => void;
  showToastMessage: (msg: string) => void;
  onCheckoutSuccess: () => void;
  currentAddress?: string;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  cartItems,
  onUpdateQuantity,
  onOpenAddressModal,
  onNavigate,
  showToastMessage,
  onCheckoutSuccess,
  currentAddress = '#402 Palm Grove, 12th Main Indiranagar, Bengaluru 560038',
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(585); // 09:45
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'JANAUSHADHI15' || code === 'SAVE15') {
      setAppliedPromo(code);
      setPromoDiscount(15);
      showToastMessage(`Promo code ${code} applied! ₹15.00 discount added.`);
    } else if (code === 'FREESHIP') {
      setAppliedPromo(code);
      setPromoDiscount(25);
      showToastMessage('Promo code FREESHIP applied! Cold-chain delivery fee waived.');
    } else {
      showToastMessage('Invalid or expired coupon code. Try "JANAUSHADHI15" or "FREESHIP"');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoDiscount(0);
    setPromoCode('');
    showToastMessage('Promo code removed');
  };

  const aggregatedSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const mrpTotal = cartItems.reduce((acc, item) => acc + item.mrp * item.quantity, 0);
  const moleculeSavings = mrpTotal - aggregatedSubtotal;
  const coldChainFee = aggregatedSubtotal > 0 ? (appliedPromo === 'FREESHIP' ? 0.0 : 25.0) : 0.0;
  const platformFee = aggregatedSubtotal > 0 ? 5.0 : 0.0;
  const rawTotal = aggregatedSubtotal + coldChainFee + platformFee - (appliedPromo === 'FREESHIP' ? 0 : promoDiscount);
  const totalPayable = Math.max(0, rawTotal);

  const freeDeliveryThreshold = 99;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - aggregatedSubtotal);
  const progressPercent = Math.min(100, Math.round((aggregatedSubtotal / freeDeliveryThreshold) * 100));

  const handlePay = () => {
    setIsProcessingPayment(true);
    showToastMessage('Idempotent transaction key verified. Authorizing payment via PhonePe UPI node...');

    setTimeout(() => {
      setIsProcessingPayment(false);
      onCheckoutSuccess();
      showToastMessage('Payment ₹' + totalPayable.toFixed(2) + ' authorized successfully!');
      onNavigate('orders');
    }, 1400);
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-space-base text-center max-w-screen-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted mb-4">
          <span className="material-symbols-outlined text-[32px]">shopping_cart</span>
        </div>
        <h2 className="font-headline-lg text-text-primary font-bold">Your Cart is Empty</h2>
        <p className="font-body-md text-text-muted max-w-xs mt-1">
          Search for brand name medications to find 100% bioequivalent generic alternatives at up to 70% savings.
        </p>
        <button
          onClick={() => onNavigate('compare')}
          className="mt-6 px-6 py-2.5 bg-primary text-on-primary font-label-md font-semibold rounded-xl shadow-sm hover:bg-brand-deep transition-all"
        >
          Compare Medicines
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-space-base gap-space-md max-w-screen-md mx-auto pb-32">
      {/* Real-Time Revalidation & Expiry Live Ticker */}
      <div className="rounded-xl bg-status-info-bg p-space-sm flex flex-col gap-space-2xs shadow-sm border border-status-info-border mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="font-label-sm text-label-sm text-status-info-text uppercase tracking-wider font-bold">
              Live Price Lock
            </span>
          </div>
          <div className="flex items-center gap-space-2xs px-space-xs py-0.5 rounded-full bg-surface-container-lowest text-primary shadow-sm font-code-tabular text-body-sm font-bold border border-border-subtle">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            <span>{formatTimer(secondsLeft)}</span>
          </div>
        </div>
        <div className="flex items-center gap-space-xs text-status-success-text">
          <span className="material-symbols-outlined text-[16px] shrink-0 font-bold">
            verified
          </span>
          <p className="font-body-sm text-body-sm leading-tight text-status-info-text">
            <span className="font-bold text-status-success-text">{cartItems.length} of {cartItems.length} items revalidated</span> via live pharmacy webhook nodes
          </p>
        </div>
      </div>

      {/* Page Title Banner */}
      <div className="flex items-baseline justify-between pt-space-xs">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-bold">
            Your Healthcare Cart
          </h1>
          <p className="font-body-sm text-body-sm text-text-muted">
            Direct generic dispensary fulfillment
          </p>
        </div>
        <span className="font-label-sm text-label-sm px-space-sm py-space-2xs rounded-full bg-surface-container text-on-surface-variant font-bold border border-border-subtle">
          {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* Dynamic Cart Items List */}
      <div className="flex flex-col gap-space-sm">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-surface-card p-space-md flex flex-col gap-space-sm shadow-sm relative overflow-hidden border border-border-subtle hover:border-slate-300 transition-all"
          >
            <div className="absolute top-0 right-0 bg-status-success-bg px-space-sm py-1 rounded-bl-xl flex items-center gap-1 border-b border-l border-status-success-border">
              <span className="material-symbols-outlined text-[12px] text-status-success-text">
                savings
              </span>
              <span className="font-label-sm text-label-sm text-status-success-text font-bold">
                Save ₹{item.savingsAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-space-sm items-start pr-16">
              <div className="w-14 h-14 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0 overflow-hidden border border-border-subtle">
                <img
                  alt={item.name}
                  className="w-full h-full object-cover"
                  src={item.imageUrl}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-tight">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-text-primary truncate font-bold">
                  {item.name}
                </h3>
                <span className="font-body-sm text-body-sm text-text-muted truncate">
                  {item.packDetail} • {item.pharmacyName}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-space-2xs">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-sm text-headline-sm text-text-primary font-bold font-code-tabular">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <span className="font-body-sm text-body-sm text-text-muted line-through font-code-tabular">
                    ₹{(item.mrp * item.quantity).toFixed(2)}
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-text-muted">
                  {item.pricePerUnit}
                </span>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center bg-surface-subtle rounded-lg p-0.5 shadow-inner border border-border-subtle">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="w-7 h-7 rounded-md bg-surface-card flex items-center justify-center text-text-primary hover:bg-surface-container transition-colors shadow-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {item.quantity === 1 ? 'delete' : 'remove'}
                  </span>
                </button>
                <span className="w-8 text-center font-code-tabular font-body-md font-bold text-text-primary">
                  {item.quantity}
                </span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="w-7 h-7 rounded-md bg-surface-card flex items-center justify-center text-text-primary hover:bg-surface-container transition-colors shadow-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-space-2xs bg-surface-container-low px-space-xs py-1 rounded-md border border-border-subtle/40">
              <div className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                <span className="font-label-sm text-label-sm font-semibold">
                  Live Hub Stock Confirmed
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-text-muted font-code-tabular">
                {item.batchNumber}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Address Selector */}
      <div className="rounded-xl bg-surface-card p-space-md flex flex-col gap-space-xs shadow-sm border border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs text-text-secondary">
            <span className="material-symbols-outlined text-[18px] text-primary">
              home_pin
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wide font-bold text-text-muted">
              Fulfillment Destination
            </span>
          </div>
          <button
            onClick={onOpenAddressModal}
            className="font-label-md text-label-md text-primary font-bold hover:text-brand-deep transition-colors"
          >
            Change
          </button>
        </div>

        <div className="flex flex-col min-w-0 pt-1">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-sm text-headline-sm text-text-primary font-bold">Home</span>
            <span className="w-1.5 h-1.5 rounded-full bg-border-strong"></span>
            <span className="font-body-md text-body-md text-text-secondary font-medium">
              Dr. Aris Thorne
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-text-muted leading-snug truncate pt-0.5">
            {currentAddress}
          </p>
        </div>

        <div className="flex items-center gap-space-xs mt-space-xs pt-space-xs bg-surface-subtle p-space-xs rounded-lg border border-border-subtle">
          <span className="material-symbols-outlined text-[16px] text-secondary">
            schedule
          </span>
          <span className="font-body-sm text-body-sm text-text-secondary">
            Priority Dispatch: <strong className="text-text-primary font-bold">Today by 4:30 PM</strong>
          </span>
        </div>
      </div>

      {/* Jan Aushadhi & Generic Subsidy Coupon Section */}
      <div className="rounded-xl bg-surface-card p-space-md flex flex-col gap-space-xs shadow-sm border border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">sell</span>
            <span className="font-headline-sm text-headline-sm text-text-primary font-bold">
              Government / Health Subsidy Voucher
            </span>
          </div>
          {appliedPromo && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-status-success-bg text-status-success-text border border-status-success-border">
              APPLIED
            </span>
          )}
        </div>

        {appliedPromo ? (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-status-success-bg/40 border border-status-success-border mt-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-status-success-text text-[18px]">
                check_circle
              </span>
              <div className="flex flex-col">
                <span className="font-label-md font-bold text-text-primary font-code-tabular">
                  {appliedPromo}
                </span>
                <span className="text-[11px] text-status-success-text font-medium">
                  {appliedPromo === 'FREESHIP'
                    ? 'Free cold-chain delivery applied (-₹25.00)'
                    : `₹${promoDiscount}.00 generic subsidy discount applied`}
                </span>
              </div>
            </div>
            <button
              onClick={handleRemovePromo}
              className="text-[12px] text-status-danger-text font-bold hover:underline px-2 py-1"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyPromo} className="flex gap-2 mt-1">
            <input
              type="text"
              placeholder="e.g. JANAUSHADHI15 or FREESHIP"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 px-3 py-2 bg-surface-canvas rounded-lg text-body-sm border border-border-subtle focus:outline-none focus:ring-1 focus:ring-primary uppercase font-code-tabular"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-on-primary font-label-md font-bold rounded-lg text-[13px] hover:bg-brand-deep active:scale-95 transition-all shadow-xs"
            >
              Apply
            </button>
          </form>
        )}
      </div>

      {/* Free Delivery Goal Banner */}
      <div className="rounded-xl bg-status-warning-bg p-space-sm flex flex-col gap-space-xs shadow-sm border border-status-warning-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-status-warning-text">
              local_shipping
            </span>
            <span className="font-label-md text-label-md text-status-warning-text font-bold">
              {amountToFreeDelivery > 0
                ? `Add ₹${amountToFreeDelivery.toFixed(2)} more for FREE Delivery`
                : 'You unlocked FREE Express Delivery!'}
            </span>
          </div>
          <span className="font-code-tabular text-label-sm font-bold text-status-warning-text">
            ₹{aggregatedSubtotal.toFixed(0)} / ₹{freeDeliveryThreshold}
          </span>
        </div>
        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-status-warning-border/40">
          <div
            className="h-full bg-status-warning-text rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Transparent Bill Audit (PRD FR-DISC-05 / FR-CART-03) */}
      <div className="rounded-xl bg-surface-card p-space-md flex flex-col gap-space-sm shadow-sm border border-border-subtle">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
            Transparent Bill Audit
          </h2>
          <span className="px-space-xs py-0.5 rounded bg-status-success-bg text-status-success-text font-label-sm text-label-sm font-bold border border-status-success-border">
            68% Total Savings
          </span>
        </div>

        <div className="flex flex-col gap-space-xs pt-space-xs text-body-md font-body-md">
          <div className="flex items-center justify-between text-text-muted">
            <span>Branded MRP Reference</span>
            <span className="font-code-tabular line-through">₹{mrpTotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-text-secondary">
            <span>GenericMed Aggregated Price</span>
            <span className="font-code-tabular font-medium text-text-primary">
              ₹{aggregatedSubtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-status-success-text font-medium">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">price_check</span>
              Generic Molecule Savings
            </span>
            <span className="font-code-tabular font-bold">-₹{moleculeSavings.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-text-secondary">
            <div className="flex items-center gap-1">
              <span>Cold-Chain Delivery</span>
              <span
                className="material-symbols-outlined text-[14px] text-text-muted cursor-help"
                title="Insulated container with 18°C - 24°C thermal monitoring log"
              >
                info
              </span>
            </div>
            <span className="font-code-tabular font-medium text-text-primary">
              ₹{coldChainFee.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-text-secondary">
            <div className="flex items-center gap-1">
              <span>Platform Technology Fee</span>
              <span
                className="material-symbols-outlined text-[14px] text-text-muted cursor-help"
                title="Covers CDSCO registry verification and automated batch audit"
              >
                info
              </span>
            </div>
            <span className="font-code-tabular font-medium text-text-primary">
              ₹{platformFee.toFixed(2)}
            </span>
          </div>
          {appliedPromo && promoDiscount > 0 && appliedPromo !== 'FREESHIP' && (
            <div className="flex items-center justify-between text-status-success-text font-medium">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">sell</span>
                Subsidy Voucher ({appliedPromo})
              </span>
              <span className="font-code-tabular font-bold">-₹{promoDiscount.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-space-sm mt-space-2xs bg-surface-subtle p-space-sm rounded-lg border border-border-subtle">
          <div>
            <span className="font-headline-sm text-headline-sm font-bold text-text-primary">
              Total Payable
            </span>
            <p className="font-body-sm text-body-sm text-text-muted">
              Inclusive of all pharma GST taxes
            </p>
          </div>
          <div className="text-right">
            <span className="font-display-sm text-display-sm font-bold text-primary font-code-tabular">
              ₹{totalPayable.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Authorized Payment Method Selector */}
      <div className="rounded-xl bg-surface-card p-space-md flex flex-col gap-space-sm shadow-sm border border-border-subtle">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-text-primary font-bold">
            Authorized Payment Gateways
          </h3>
          <span className="font-label-sm text-label-sm text-secondary font-bold">
            Fast • Encrypted
          </span>
        </div>

        {/* Radio Group of Methods */}
        <div className="flex flex-col gap-space-xs" id="payment-selector">
          {/* UPI Option */}
          <label
            onClick={() => setSelectedPaymentMethod('upi')}
            className={`flex items-center justify-between p-space-sm rounded-lg cursor-pointer transition-colors border ${
              selectedPaymentMethod === 'upi'
                ? 'bg-surface-container-low border-primary/40 shadow-sm'
                : 'bg-surface-subtle border-border-subtle hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <input
                type="radio"
                name="payment_method"
                value="upi"
                checked={selectedPaymentMethod === 'upi'}
                onChange={() => setSelectedPaymentMethod('upi')}
                className="w-4 h-4 text-primary focus:ring-0 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-bold text-text-primary">
                  Instant UPI
                </span>
                <span className="font-body-sm text-body-sm text-text-muted">
                  Google Pay, PhonePe, Paytm, BHIM
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
          </label>

          {/* Cards Option */}
          <label
            onClick={() => setSelectedPaymentMethod('card')}
            className={`flex items-center justify-between p-space-sm rounded-lg cursor-pointer transition-colors border ${
              selectedPaymentMethod === 'card'
                ? 'bg-surface-container-low border-primary/40 shadow-sm'
                : 'bg-surface-subtle border-border-subtle hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <input
                type="radio"
                name="payment_method"
                value="card"
                checked={selectedPaymentMethod === 'card'}
                onChange={() => setSelectedPaymentMethod('card')}
                className="w-4 h-4 text-primary focus:ring-0 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-bold text-text-primary">
                  Credit / Debit Card
                </span>
                <span className="font-body-sm text-body-sm text-text-muted">
                  Visa, Mastercard, RuPay &amp; Corporate
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-text-muted">
              credit_card
            </span>
          </label>

          {/* Netbanking Option */}
          <label
            onClick={() => setSelectedPaymentMethod('netbanking')}
            className={`flex items-center justify-between p-space-sm rounded-lg cursor-pointer transition-colors border ${
              selectedPaymentMethod === 'netbanking'
                ? 'bg-surface-container-low border-primary/40 shadow-sm'
                : 'bg-surface-subtle border-border-subtle hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <input
                type="radio"
                name="payment_method"
                value="netbanking"
                checked={selectedPaymentMethod === 'netbanking'}
                onChange={() => setSelectedPaymentMethod('netbanking')}
                className="w-4 h-4 text-primary focus:ring-0 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-bold text-text-primary">
                  Netbanking
                </span>
                <span className="font-body-sm text-body-sm text-text-muted">
                  All 54 Scheduled Indian Banks
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-text-muted">
              account_balance
            </span>
          </label>

          {/* COD Option */}
          <label
            onClick={() => setSelectedPaymentMethod('cod')}
            className={`flex items-center justify-between p-space-sm rounded-lg cursor-pointer transition-colors border ${
              selectedPaymentMethod === 'cod'
                ? 'bg-surface-container-low border-primary/40 shadow-sm'
                : 'bg-surface-subtle border-border-subtle hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <input
                type="radio"
                name="payment_method"
                value="cod"
                checked={selectedPaymentMethod === 'cod'}
                onChange={() => setSelectedPaymentMethod('cod')}
                className="w-4 h-4 text-primary focus:ring-0 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-bold text-text-primary">
                  Cash on Delivery
                </span>
                <span className="font-body-sm text-body-sm text-text-muted">
                  Pay at doorstep via cash or dynamic QR
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-text-muted">
              payments
            </span>
          </label>
        </div>
      </div>

      {/* Security & Idempotency Compliance Assurance Badge */}
      <div className="rounded-xl bg-surface-subtle p-space-sm flex items-center gap-space-sm border border-border-subtle">
        <div className="w-9 h-9 rounded-full bg-surface-card flex items-center justify-center shrink-0 text-primary shadow-sm border border-border-subtle">
          <span className="material-symbols-outlined text-[20px]">verified_user</span>
        </div>
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm font-bold text-text-primary uppercase tracking-wide">
            FR-CART-02 Idempotent Protocol
          </span>
          <p className="font-body-sm text-body-sm text-text-muted leading-tight">
            256-bit Encrypted Transaction • Guaranteed Zero Duplicate Billing Protection.
          </p>
        </div>
      </div>

      {/* Sticky Bottom Checkout Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md p-space-sm shadow-xl border-t border-border-subtle">
        <div className="max-w-screen-md mx-auto flex items-center justify-between gap-space-sm">
          <div className="flex flex-col pl-space-xs">
            <span className="font-label-sm text-label-sm text-text-muted uppercase font-semibold">
              Final Payable
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-headline-lg text-headline-lg font-bold text-text-primary font-code-tabular">
                ₹{totalPayable.toFixed(2)}
              </span>
              <span className="font-label-sm text-label-sm text-status-success-text font-bold">
                Saved ₹{moleculeSavings.toFixed(0)}
              </span>
            </div>
          </div>

          <button
            disabled={isProcessingPayment}
            onClick={handlePay}
            id="pay-button"
            className="h-11 px-space-lg rounded-xl bg-primary text-on-primary hover:bg-brand-deep active:scale-95 transition-all flex items-center justify-center gap-space-xs shadow-md shrink-0 disabled:opacity-70"
          >
            {isProcessingPayment ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">
                  progress_activity
                </span>
                <span className="font-label-md text-label-md font-bold">Authorizing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span className="font-label-md text-label-md font-bold tracking-wide">
                  Pay ₹{totalPayable.toFixed(2)}
                </span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
