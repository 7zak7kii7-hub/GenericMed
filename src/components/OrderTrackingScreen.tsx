import React, { useState } from 'react';
import { HOTLINK_IMAGES } from '../data/mockData';

interface OrderTrackingScreenProps {
  onOpenChatPharmacist: () => void;
  onOpenTaxInvoice: () => void;
  onOpenScheduleH1: () => void;
  showToastMessage: (msg: string) => void;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  onOpenChatPharmacist,
  onOpenTaxInvoice,
  onOpenScheduleH1,
  showToastMessage,
}) => {
  const [isCancelled, setIsCancelled] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [otpCopied, setOtpCopied] = useState(false);

  const handleCopyOtp = () => {
    navigator.clipboard?.writeText('4829');
    setOtpCopied(true);
    showToastMessage('Delivery OTP 4829 copied to clipboard');
    setTimeout(() => setOtpCopied(false), 2000);
  };

  const handleCancelOrder = () => {
    setIsCancelled(true);
    setShowCancelModal(false);
    showToastMessage('Order cancellation initiated. Auto-refund ₹100.00 routed to UPI handle.');
  };

  return (
    <div className="flex flex-col w-full px-space-base gap-space-md max-w-screen-md mx-auto pb-28">
      {/* Top Order Meta Header Card */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-base shadow-sm flex flex-col gap-space-xs relative overflow-hidden border border-border-subtle mt-1">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">
              local_shipping
            </span>
            <span className="font-headline-sm text-headline-sm text-text-primary tracking-tight font-bold">
              Order #ORD-2026-99215
            </span>
          </div>
          <span className="font-label-sm text-label-sm px-space-xs py-space-2xs bg-status-info-bg text-status-info-text rounded-full flex items-center gap-1 border border-status-info-border font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            LIVE TRACKING
          </span>
        </div>
        <div className="flex items-center justify-between text-text-muted">
          <span className="font-body-sm text-body-sm">Placed at 14:22 IST today</span>
          <span className="font-code-tabular text-code-tabular text-text-secondary font-semibold">
            FR-ORD-01 • Verified
          </span>
        </div>
      </div>

      {/* Real-time Live Progress Hero Card */}
      <div className="w-full bg-primary rounded-xl p-space-base shadow-md flex flex-col gap-space-md text-on-primary relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[18px] text-secondary-container">
                electric_bolt
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary-container font-bold">
                Express Dispatch
              </span>
            </div>
            <div className="font-headline-lg text-headline-lg font-bold text-on-primary">
              {isCancelled ? 'Order Cancelled (Refunded)' : 'Out for Express Delivery'}
            </div>
            <div className="flex items-center gap-space-xs text-white/80">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span className="font-body-md text-body-md">
                {isCancelled
                  ? 'Reconciliation complete via Razorpay/PhonePe'
                  : 'Arriving in 18 minutes • By 14:45 IST'}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md shrink-0 border border-white/10">
            <span className="font-display-sm text-display-sm font-bold text-on-primary leading-none">
              {isCancelled ? '0' : '18'}
            </span>
            <span className="font-label-sm text-[10px] uppercase text-white/80 leading-tight mt-1 font-bold">
              Mins
            </span>
          </div>
        </div>

        {/* Live ETA Progress Bar */}
        <div className="flex flex-col gap-space-2xs">
          <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isCancelled ? 'bg-red-400 w-full' : 'bg-secondary-container w-[78%]'
              }`}
            ></div>
          </div>
          <div className="flex justify-between font-label-sm text-[10px] text-white/80 font-medium">
            <span>Pharmacy Dispatch (14:31)</span>
            <span>En Route (14:38)</span>
            <span>Doorstep (14:45)</span>
          </div>
        </div>
      </div>

      {/* Live Map Location View with Static / SVG Container */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-xs shadow-sm flex flex-col gap-space-xs border border-border-subtle">
        <div
          className="relative w-full h-44 rounded-lg overflow-hidden border border-border-subtle/60"
          data-location="Indiranagar 100ft Road, Bengaluru"
        >
          <div className="w-full h-full bg-surface-container flex items-center justify-center relative bg-slate-100">
            {/* Grid styling to resemble map roads */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#005048_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Delivery Route Visualization Overlay */}
            <svg
              className="w-full h-full absolute inset-0 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 40 130 Q 120 60 200 90 T 310 45"
                fill="none"
                stroke="#006a60"
                strokeDasharray="6,4"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
              {/* Destination Point */}
              <circle cx="310" cy="45" r="6" fill="#ba1a1a" />
              <circle cx="310" cy="45" r="12" fill="#ba1a1a" fillOpacity="0.2" />
            </svg>

            <div className="absolute bottom-3 left-3 bg-surface-container-lowest/95 backdrop-blur-md px-space-sm py-space-2xs rounded-lg shadow-md flex items-center gap-space-xs border border-border-subtle">
              <span className="material-symbols-outlined text-[18px] text-primary animate-bounce">
                two_wheeler
              </span>
              <span className="font-label-sm text-label-sm text-text-primary font-bold">
                Suresh is 1.4 km away
              </span>
            </div>

            <button
              onClick={() => showToastMessage('Map recentered on delivery partner (Indiranagar 100ft Rd)')}
              className="absolute top-3 right-3 bg-surface-container-lowest/95 backdrop-blur-md px-space-xs py-space-2xs rounded-lg shadow-sm font-label-sm text-label-sm text-primary flex items-center gap-space-2xs border border-border-subtle hover:bg-surface-subtle active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">my_location</span>
              <span>Recenter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Partner & Secure Handshake (OTP) Card */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-base shadow-sm flex flex-col gap-space-md border border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <img
              alt="Delivery partner Suresh K."
              className="w-12 h-12 rounded-full object-cover shrink-0 border border-border-subtle"
              src={HOTLINK_IMAGES.deliveryRider}
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-text-primary truncate font-bold">
                  Suresh K.
                </span>
                <span className="material-symbols-outlined text-primary text-[16px]">
                  verified
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-text-muted">
                Apollo Med Indiranagar Courier • 4.9 ★
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-xs">
            <a
              href="tel:9876543210"
              aria-label="Call Delivery Partner"
              className="w-10 h-10 rounded-xl bg-status-info-bg text-status-info-text flex items-center justify-center active:scale-95 transition-transform border border-status-info-border hover:bg-teal-100"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
            </a>
            <button
              aria-label="Track on Fullscreen Map"
              onClick={() => showToastMessage('Live GPS coordinates: 12.9784° N, 77.6408° E')}
              className="w-10 h-10 rounded-xl bg-surface-subtle text-text-primary flex items-center justify-center active:scale-95 transition-transform border border-border-subtle hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[20px]">near_me</span>
            </button>
          </div>
        </div>

        {/* Handshake PIN / OTP highlight */}
        <div className="w-full bg-status-warning-bg rounded-xl p-space-sm flex items-center justify-between border border-status-warning-border">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-status-warning-text text-[20px]">
              verified_user
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-status-warning-text font-bold uppercase">
                Delivery OTP
              </span>
              <span className="font-body-sm text-body-sm text-status-warning-text/90">
                Share with Suresh upon arrival
              </span>
            </div>
          </div>
          <button
            onClick={handleCopyOtp}
            className="px-space-md py-space-xs bg-surface-container-lowest rounded-lg shadow-sm border border-status-warning-border/60 hover:bg-amber-50 active:scale-95 transition-all"
            title="Click to copy OTP"
          >
            <span className="font-code-tabular text-[18px] font-bold tracking-widest text-text-primary">
              {otpCopied ? 'COPIED' : '4829'}
            </span>
          </button>
        </div>
      </div>

      {/* Live Fulfillment Timeline / Stepper (PRD Section 9.6 FR-ORD-02) */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-base shadow-sm flex flex-col gap-space-md border border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">
              network_check
            </span>
            <span className="font-headline-sm text-headline-sm text-text-primary font-bold">
              Settlement &amp; Verification Lifecycle
            </span>
          </div>
          <span className="font-code-tabular text-body-sm text-text-muted font-medium">
            Trace ID: #TC-4910
          </span>
        </div>

        <div className="relative flex flex-col gap-space-lg pl-space-xs pt-space-xs">
          {/* Continuous vertical track line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border-subtle"></div>

          {/* Step 1: Completed */}
          <div className="flex items-start gap-space-sm relative z-10">
            <div className="w-8 h-8 rounded-full bg-status-success-bg text-status-success-text flex items-center justify-center shrink-0 shadow-sm border border-status-success-border">
              <span className="material-symbols-outlined text-[16px] font-bold">done</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-bold">
                  Order Placed &amp; Payment Confirmed
                </span>
                <span className="font-code-tabular text-body-sm text-text-muted">14:23 IST</span>
              </div>
              <p className="font-body-sm text-body-sm text-text-muted mt-0.5">
                Idempotent auth key verified • PhonePe UPI Settlement
              </p>
            </div>
          </div>

          {/* Step 2: Completed */}
          <div className="flex items-start gap-space-sm relative z-10">
            <div className="w-8 h-8 rounded-full bg-status-success-bg text-status-success-text flex items-center justify-center shrink-0 shadow-sm border border-status-success-border">
              <span className="material-symbols-outlined text-[16px] font-bold">check_circle</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-bold">
                  Pharmacy Dispensed &amp; Form 20/21 Batch Verified
                </span>
                <span className="font-code-tabular text-body-sm text-text-muted">14:31 IST</span>
              </div>
              <p className="font-body-sm text-body-sm text-text-muted mt-0.5">
                Reg. Pharmacist Rajesh Kumar verified pack &amp; cold-chain seal
              </p>
            </div>
          </div>

          {/* Step 3: Active Picked Up */}
          <div className="flex items-start gap-space-sm relative z-10">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[16px]">pedal_bike</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-primary font-bold">
                  Rider Picked Up from Apollo Med
                </span>
                <span className="font-code-tabular text-body-sm text-primary font-semibold">
                  14:38 IST
                </span>
              </div>
              <div className="flex items-center gap-space-xs mt-0.5">
                <span className="font-body-sm text-body-sm text-text-secondary">
                  Secured in temperature-controlled carrier (18°C - 24°C)
                </span>
              </div>
              <div className="mt-space-xs inline-flex items-center gap-space-xs px-space-xs py-space-2xs bg-status-info-bg text-status-info-text rounded-md w-fit border border-status-info-border">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                <span className="font-label-sm text-label-sm font-semibold">
                  Suresh K. moving via 100ft Rd
                </span>
              </div>
            </div>
          </div>

          {/* Step 4: Pending */}
          <div className="flex items-start gap-space-sm relative z-10">
            <div className="w-8 h-8 rounded-full bg-surface-subtle text-text-muted flex items-center justify-center shrink-0 border border-border-subtle">
              <span className="material-symbols-outlined text-[16px]">home_pin</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0 opacity-75">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-muted font-medium">
                  Delivered to Doorstep
                </span>
                <span className="font-code-tabular text-body-sm text-text-muted">Est. 14:45 IST</span>
              </div>
              <p className="font-body-sm text-body-sm text-text-muted mt-0.5">
                Handover after 4-digit OTP handshake verification
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Items & Settlement Breakdown (PRD Section 9.6 FR-ORD-03) */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-base shadow-sm flex flex-col gap-space-md border border-border-subtle">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm text-text-primary font-bold">
            Ordered Prescriptions (2)
          </span>
          <span className="font-label-sm text-label-sm text-status-success-text px-space-xs py-space-2xs bg-status-success-bg rounded-md font-bold border border-status-success-border">
            UPI Settled
          </span>
        </div>

        <div className="flex flex-col gap-space-sm divide-y-0">
          {/* Item 1 */}
          <div className="flex items-center justify-between gap-space-sm p-space-xs bg-surface-subtle/80 rounded-lg border border-border-subtle">
            <div className="flex items-center gap-space-sm min-w-0">
              <img
                alt="Paracetamol 650mg"
                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border-subtle"
                src={HOTLINK_IMAGES.paracetamolOrderItem}
              />
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-text-primary truncate font-bold">
                  Paracetamol 650mg
                </span>
                <span className="font-body-sm text-body-sm text-text-muted">
                  15 tabs strip × 2 units
                </span>
              </div>
            </div>
            <span className="font-code-tabular text-body-md text-text-primary font-bold shrink-0">
              ₹42.00
            </span>
          </div>

          {/* Item 2 */}
          <div className="flex items-center justify-between gap-space-sm p-space-xs bg-surface-subtle/80 rounded-lg border border-border-subtle">
            <div className="flex items-center gap-space-sm min-w-0">
              <img
                alt="Atorvastatin 20mg"
                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border-subtle"
                src={HOTLINK_IMAGES.atorvastatinOrderItem}
              />
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-text-primary truncate font-bold">
                  Atorvastatin 20mg
                </span>
                <span className="font-body-sm text-body-sm text-text-muted">
                  10 tabs strip × 1 unit
                </span>
              </div>
            </div>
            <span className="font-code-tabular text-body-md text-text-primary font-bold shrink-0">
              ₹28.00
            </span>
          </div>
        </div>

        {/* Settlement Ledger Table */}
        <div className="flex flex-col gap-space-xs pt-space-xs border-t border-border-subtle/60">
          <div className="flex justify-between font-body-sm text-body-sm text-text-muted">
            <span>Item Subtotal</span>
            <span className="font-code-tabular">₹70.00</span>
          </div>
          <div className="flex justify-between font-body-sm text-body-sm text-text-muted">
            <span>Temperature-Controlled Delivery</span>
            <span className="font-code-tabular">₹25.00</span>
          </div>
          <div className="flex justify-between font-body-sm text-body-sm text-text-muted">
            <span>Pharmacist Verification Fee</span>
            <span className="font-code-tabular">₹5.00</span>
          </div>
          <div className="flex items-center justify-between pt-space-xs border-t border-border-subtle/50">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-text-primary font-bold">
                Total Paid
              </span>
              <span className="font-label-sm text-label-sm text-text-muted flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">
                  account_balance_wallet
                </span>
                PhonePe UPI • Auth: pay_Pzm10491
              </span>
            </div>
            <span className="font-display-sm text-display-sm font-bold text-primary font-code-tabular">
              ₹100.00
            </span>
          </div>
        </div>
      </div>

      {/* Compliance & Quality Dossier */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-base shadow-sm flex flex-col gap-space-sm border border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">
              verified
            </span>
            <span className="font-headline-sm text-headline-sm text-text-primary font-bold">
              Compliance &amp; Quality Dossier
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-status-success-text px-space-xs py-space-2xs bg-status-success-bg rounded font-bold border border-status-success-border">
            CDSCO COMPLIANT
          </span>
        </div>

        {/* Pharmacist Stamp Card */}
        <div className="p-space-sm bg-surface-subtle rounded-lg flex items-center justify-between gap-space-sm border border-border-subtle">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">medical_services</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-text-primary font-bold truncate">
                Pharmacist: Rajesh Kumar
              </span>
              <span className="font-body-sm text-body-sm text-text-muted">
                State Lic #KA-48192 • Apollo Hub
              </span>
            </div>
          </div>
          <button
            onClick={() => showToastMessage('Pharmacist License #KA-48192 verified by Karnataka State Pharmacy Council')}
            className="px-space-xs py-space-2xs rounded-md bg-surface-container-lowest shadow-sm text-primary font-label-sm text-label-sm shrink-0 flex items-center gap-1 border border-border-subtle font-bold"
          >
            <span className="material-symbols-outlined text-[14px]">history_edu</span>
            <span>Seal</span>
          </button>
        </div>

        {/* Download Links */}
        <div className="grid grid-cols-2 gap-space-xs pt-space-2xs">
          <button
            onClick={onOpenTaxInvoice}
            className="h-10 px-space-xs rounded-lg bg-surface-subtle text-text-secondary hover:text-primary flex items-center justify-center gap-space-xs transition-colors border border-border-subtle active:scale-95 font-medium"
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span className="font-label-sm text-label-sm truncate">Tax Invoice (PDF)</span>
          </button>
          <button
            onClick={onOpenScheduleH1}
            className="h-10 px-space-xs rounded-lg bg-surface-subtle text-text-secondary hover:text-primary flex items-center justify-center gap-space-xs transition-colors border border-border-subtle active:scale-95 font-medium"
          >
            <span className="material-symbols-outlined text-[16px]">fact_check</span>
            <span className="font-label-sm text-label-sm truncate">Schedule H1 Audit</span>
          </button>
        </div>
      </div>

      {/* Clinical Escalation & Support Trigger Section */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-base shadow-sm flex flex-col gap-space-sm border border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">
              support_agent
            </span>
            <span className="font-headline-sm text-headline-sm text-text-primary font-bold">
              Clinical Assistance
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-status-success-text flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-status-success-text"></span>
            24/7 Desk Active
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-text-muted">
          Need dosage advice, cold-chain inquiry, or want to modify address? Our duty pharmacist is online.
        </p>

        <div className="flex items-center gap-space-xs pt-space-2xs">
          <button
            onClick={onOpenChatPharmacist}
            className="flex-1 h-10 rounded-lg bg-status-info-bg text-status-info-text font-label-md text-label-md font-bold flex items-center justify-center gap-space-xs hover:bg-teal-100 transition-colors border border-status-info-border active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Chat Pharmacist</span>
          </button>
          <button
            onClick={() => setShowCancelModal(true)}
            className="h-10 px-space-md rounded-lg bg-status-danger-bg text-status-danger-text font-label-md text-label-md font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-space-2xs border border-status-danger-border active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
            <span>Cancel Order</span>
          </button>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-card rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-border-subtle animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-status-danger-bg text-status-danger-text flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <h3 className="font-headline-sm text-center font-bold text-text-primary">
              Cancel Order #ORD-2026-99215?
            </h3>
            <p className="font-body-sm text-center text-text-muted mt-2">
              Suresh is currently en route with cold-chain verified products. If cancelled, a 100% refund of ₹100.00 will be credited back via UPI within 15 minutes.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-subtle font-label-md font-semibold text-text-primary hover:bg-surface-container"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 py-2.5 rounded-xl bg-status-danger-text text-white font-label-md font-semibold hover:opacity-90"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
