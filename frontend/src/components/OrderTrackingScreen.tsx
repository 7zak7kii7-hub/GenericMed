import React, { useState, useEffect } from 'react';
import { HOTLINK_IMAGES } from '../data/mockData';
import { ColdChainTelemetryCard } from './ColdChainTelemetryCard';
import { DeliveryHandshakeModal } from './modals/DeliveryHandshakeModal';

interface OrderTrackingScreenProps {
  orderId?: string;
  onOpenChatPharmacist: () => void;
  onOpenTaxInvoice: () => void;
  onOpenScheduleH1: () => void;
  showToastMessage: (msg: string) => void;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  orderId = 'ORD-2026-99215',
  onOpenChatPharmacist,
  onOpenTaxInvoice,
  onOpenScheduleH1,
  showToastMessage,
}) => {
  const [isCancelled, setIsCancelled] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [otpCopied, setOtpCopied] = useState(false);

  // Phase 4 State: Geolocation simulation & Delivery Handshake
  const [isDelivered, setIsDelivered] = useState(false);
  const [deliveredAtTime, setDeliveredAtTime] = useState<string>('');
  const [isHandshakeModalOpen, setIsHandshakeModalOpen] = useState(false);
  const [distanceKm, setDistanceKm] = useState(1.4);
  const [etaMinutes, setEtaMinutes] = useState(18);
  const [routeProgress, setRouteProgress] = useState(0.55); // 0.0 to 1.0

  // Simulate courier movement along route
  useEffect(() => {
    if (isDelivered || isCancelled) return;

    const timer = setInterval(() => {
      setRouteProgress((prev) => {
        if (prev >= 0.95) return 0.95;
        const next = prev + 0.03;
        setDistanceKm(Math.max(0.2, Math.round((1.4 * (1 - next)) * 10) / 10));
        setEtaMinutes(Math.max(2, Math.round(18 * (1 - next))));
        return next;
      });
    }, 8000);

    return () => clearInterval(timer);
  }, [isDelivered, isCancelled]);

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

  const handleDeliveryComplete = () => {
    setIsDelivered(true);
    setDeliveredAtTime(
      new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    );
    setDistanceKm(0);
    setEtaMinutes(0);
    setRouteProgress(1.0);
    showToastMessage('🎉 Order delivered! CDSCO Form 20B handover registered.');
  };

  // Compute rider position along SVG curve: M 40 130 Q 120 60 200 90 T 310 45
  // Approximate parametric path points
  const p = routeProgress;
  const riderX = Math.round(40 + p * (310 - 40));
  // Wave fluctuation for road curve
  const riderY = Math.round(130 - Math.sin(p * Math.PI) * 65 - p * 20);

  return (
    <div className="flex flex-col w-full px-space-base gap-space-md max-w-screen-md mx-auto pb-28">
      {/* Top Order Meta Header Card */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-base shadow-sm flex flex-col gap-space-xs relative overflow-hidden border border-border-subtle mt-1">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span
              className={`material-symbols-outlined text-[20px] ${
                isDelivered ? 'text-status-success-text' : 'text-primary'
              }`}
            >
              {isDelivered ? 'verified' : 'local_shipping'}
            </span>
            <span className="font-headline-sm text-headline-sm text-text-primary tracking-tight font-bold">
              Order #{orderId}
            </span>
          </div>
          <span
            className={`font-label-sm text-label-sm px-space-xs py-space-2xs rounded-full flex items-center gap-1 border font-semibold ${
              isDelivered
                ? 'bg-status-success-bg text-status-success-text border-status-success-border'
                : isCancelled
                ? 'bg-red-100 text-red-800 border-red-200'
                : 'bg-status-info-bg text-status-info-text border-status-info-border'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isDelivered
                  ? 'bg-status-success-text'
                  : isCancelled
                  ? 'bg-red-600'
                  : 'bg-primary animate-pulse'
              }`}
            ></span>
            {isDelivered ? 'DELIVERED & VERIFIED' : isCancelled ? 'CANCELLED' : 'LIVE TRACKING'}
          </span>
        </div>
        <div className="flex items-center justify-between text-text-muted">
          <span className="font-body-sm text-body-sm">
            {isDelivered
              ? `Delivered at ${deliveredAtTime || '14:42 IST'} today`
              : 'Placed at 14:22 IST today'}
          </span>
          <span className="font-code-tabular text-code-tabular text-text-secondary font-semibold">
            FR-ORD-01 • Form 20B/21B
          </span>
        </div>
      </div>

      {/* Real-time Live Progress Hero Card */}
      <div
        className={`w-full rounded-xl p-space-base shadow-md flex flex-col gap-space-md text-on-primary relative overflow-hidden transition-all duration-300 ${
          isDelivered ? 'bg-[#005048]' : isCancelled ? 'bg-slate-700' : 'bg-primary'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[18px] text-secondary-container">
                {isDelivered ? 'check_circle' : 'electric_bolt'}
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary-container font-bold">
                {isDelivered ? 'Doorstep Handover Complete' : 'Express Cold-Chain Dispatch'}
              </span>
            </div>
            <div className="font-headline-lg text-headline-lg font-bold text-on-primary">
              {isDelivered
                ? 'Medicine Package Handed Over'
                : isCancelled
                ? 'Order Cancelled (Refunded)'
                : 'Out for Express Delivery'}
            </div>
            <div className="flex items-center gap-space-xs text-white/80">
              <span className="material-symbols-outlined text-[16px]">
                {isDelivered ? 'verified' : 'schedule'}
              </span>
              <span className="font-body-md text-body-md">
                {isDelivered
                  ? 'Cryptographic OTP verified • Form 20B sealed'
                  : isCancelled
                  ? 'Reconciliation complete via PhonePe / UPI'
                  : `Arriving in ~${etaMinutes} mins • Indiranagar Hub`}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md shrink-0 border border-white/10">
            <span className="font-display-sm text-display-sm font-bold text-on-primary leading-none">
              {isDelivered ? '0' : isCancelled ? '0' : etaMinutes}
            </span>
            <span className="font-label-sm text-[10px] uppercase text-white/80 leading-tight mt-1 font-bold">
              {isDelivered ? 'Done' : 'Mins'}
            </span>
          </div>
        </div>

        {/* Live ETA Progress Bar */}
        <div className="flex flex-col gap-space-2xs">
          <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isDelivered
                  ? 'bg-emerald-300 w-full'
                  : isCancelled
                  ? 'bg-red-400 w-full'
                  : 'bg-secondary-container'
              }`}
              style={{ width: isDelivered ? '100%' : `${Math.round(routeProgress * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between font-label-sm text-[10px] text-white/80 font-medium">
            <span>Pharmacy Dispatch (14:31)</span>
            <span>En Route (14:38)</span>
            <span>{isDelivered ? 'Delivered (Doorstep)' : 'Doorstep (14:45)'}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Geolocation & Live Map View */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-xs shadow-sm flex flex-col gap-space-xs border border-border-subtle">
        <div
          className="relative w-full h-48 rounded-lg overflow-hidden border border-border-subtle/60"
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
              {/* Route line */}
              <path
                d="M 40 130 Q 120 60 200 90 T 310 45"
                fill="none"
                stroke="#006a60"
                strokeDasharray="6,4"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
              {/* Origin Point (Pharmacy) */}
              <circle cx="40" cy="130" r="5" fill="#005048" />
              <text x="45" y="145" fontSize="10" fill="#005048" fontWeight="bold">
                Jan Aushadhi #104
              </text>

              {/* Destination Point (Patient Home) */}
              <circle cx="310" cy="45" r="7" fill="#ba1a1a" />
              <circle cx="310" cy="45" r="14" fill="#ba1a1a" fillOpacity="0.2" />
              <text x="260" y="32" fontSize="10" fill="#ba1a1a" fontWeight="bold">
                Home (Palm Grove)
              </text>

              {/* Animated Moving Courier Marker */}
              <g transform={`translate(${riderX - 12}, ${riderY - 12})`}>
                <circle cx="12" cy="12" r="14" fill="#006a60" fillOpacity="0.2" className="animate-ping" />
                <circle cx="12" cy="12" r="10" fill="#006a60" />
                <text x="12" y="16" fontSize="10" textAnchor="middle" fill="white">
                  🏍️
                </text>
              </g>
            </svg>

            {/* Bottom Left Floating Rider HUD */}
            <div className="absolute bottom-3 left-3 bg-surface-container-lowest/95 backdrop-blur-md px-space-sm py-space-2xs rounded-lg shadow-md flex items-center gap-space-xs border border-border-subtle">
              <span
                className={`material-symbols-outlined text-[18px] text-primary ${
                  !isDelivered && 'animate-bounce'
                }`}
              >
                {isDelivered ? 'task_alt' : 'two_wheeler'}
              </span>
              <span className="font-label-sm text-label-sm text-text-primary font-bold">
                {isDelivered
                  ? 'Suresh arrived & delivered package'
                  : `Suresh is ${distanceKm} km away (Indiranagar 100ft Rd)`}
              </span>
            </div>

            {/* Recenter Button */}
            <button
              onClick={() => showToastMessage(`Map tracking courier Suresh K. at 12.9784° N, 77.6408° E`)}
              className="absolute top-3 right-3 bg-surface-container-lowest/95 backdrop-blur-md px-space-xs py-space-2xs rounded-lg shadow-sm font-label-sm text-label-sm text-primary flex items-center gap-space-2xs border border-border-subtle hover:bg-surface-subtle active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">my_location</span>
              <span>Recenter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Phase 4 Live IoT Cold-Chain Telemetry Card */}
      <ColdChainTelemetryCard orderId={orderId} showToastMessage={showToastMessage} />

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
                Jan Aushadhi Partner Courier • 4.9 ★
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
        {!isDelivered ? (
          <div className="w-full bg-status-warning-bg rounded-xl p-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs border border-status-warning-border">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-status-warning-text text-[22px]">
                verified_user
              </span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-status-warning-text font-bold uppercase">
                  Delivery OTP Handshake
                </span>
                <span className="font-body-sm text-body-sm text-status-warning-text/90">
                  Share this 4-digit code with Suresh at delivery
                </span>
              </div>
            </div>

            <div className="flex items-center gap-space-xs self-end sm:self-auto">
              <button
                onClick={handleCopyOtp}
                className="px-space-md py-space-xs bg-surface-container-lowest rounded-lg shadow-sm border border-status-warning-border/60 hover:bg-amber-50 active:scale-95 transition-all"
                title="Click to copy OTP"
              >
                <span className="font-code-tabular text-[18px] font-bold tracking-widest text-text-primary">
                  {otpCopied ? 'COPIED' : '4829'}
                </span>
              </button>

              <button
                onClick={() => setIsHandshakeModalOpen(true)}
                className="px-space-sm py-space-xs bg-primary text-on-primary rounded-lg shadow-sm font-label-sm text-xs font-bold flex items-center gap-1 hover:bg-primary/95 active:scale-95 transition-all"
                title="Simulate courier entering the OTP on his terminal"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                <span>Simulate Handover</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-status-success-bg rounded-xl p-space-sm flex items-center justify-between border border-status-success-border">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-status-success-text text-[22px]">
                task_alt
              </span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-status-success-text font-bold uppercase">
                  Delivery Handshake Completed
                </span>
                <span className="font-body-sm text-body-sm text-status-success-text/90">
                  Verified via OTP 4829 • CDSCO Form 20B custody transfer sealed
                </span>
              </div>
            </div>
            <span className="font-code-tabular text-xs font-bold text-status-success-text px-2 py-1 bg-white/70 rounded-md">
              {deliveredAtTime || '14:42 IST'}
            </span>
          </div>
        )}
      </div>

      {/* Live Fulfillment Timeline / Stepper */}
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
                Idempotent auth key verified • UPI Split Settlement
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
                  Pharmacy Dispensed &amp; Form 20B/21B Signed
                </span>
                <span className="font-code-tabular text-body-sm text-text-muted">14:31 IST</span>
              </div>
              <p className="font-body-sm text-body-sm text-text-muted mt-0.5">
                Reg. Pharmacist Priya Nair verified batch stock &amp; cold-chain seal
              </p>
            </div>
          </div>

          {/* Step 3: Picked Up / Completed */}
          <div className="flex items-start gap-space-sm relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                isDelivered
                  ? 'bg-status-success-bg text-status-success-text border border-status-success-border'
                  : 'bg-primary text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isDelivered ? 'done' : 'pedal_bike'}
              </span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-primary font-bold">
                  Rider Picked Up from Jan Aushadhi #104
                </span>
                <span className="font-code-tabular text-body-sm text-text-muted">
                  14:38 IST
                </span>
              </div>
              <div className="flex items-center gap-space-xs mt-0.5">
                <span className="font-body-sm text-body-sm text-text-secondary">
                  Secured in temperature-controlled carrier (18°C–24°C)
                </span>
              </div>
              {!isDelivered && (
                <div className="mt-space-xs inline-flex items-center gap-space-xs px-space-xs py-space-2xs bg-status-info-bg text-status-info-text rounded-md w-fit border border-status-info-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                  <span className="font-label-sm text-label-sm font-semibold">
                    Suresh K. moving via 100ft Rd ({distanceKm} km away)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Doorstep Delivery */}
          <div className="flex items-start gap-space-sm relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isDelivered
                  ? 'bg-status-success-bg text-status-success-text border border-status-success-border shadow-sm'
                  : 'bg-surface-subtle text-text-muted border border-border-subtle'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isDelivered ? 'check_circle' : 'home_pin'}
              </span>
            </div>
            <div
              className={`flex flex-col flex-1 min-w-0 ${
                !isDelivered && 'opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-label-md text-label-md font-bold ${
                    isDelivered ? 'text-status-success-text' : 'text-text-muted'
                  }`}
                >
                  {isDelivered ? 'Delivered to Doorstep' : 'Doorstep Handover'}
                </span>
                <span className="font-code-tabular text-body-sm text-text-muted">
                  {isDelivered ? (deliveredAtTime || '14:42 IST') : `Est. ${etaMinutes} mins`}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-muted mt-0.5">
                {isDelivered
                  ? 'Handover completed successfully via 4-digit OTP authentication'
                  : 'Requires 4-digit OTP handshake verification with Suresh K.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Items & Settlement Breakdown */}
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
                  Paracetamol IP 650mg
                </span>
                <span className="font-body-sm text-body-sm text-text-muted">
                  15 tabs strip × 2 units • Batch #GEN-2026-09
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
                  Atorvastatin 20mg IP
                </span>
                <span className="font-body-sm text-body-sm text-text-muted">
                  10 tabs strip × 1 unit • Batch #AP-4408
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
                UPI Settled • Split Disbursed
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
                Pharmacist: Priya Nair (D.Pharm)
              </span>
              <span className="font-body-sm text-body-sm text-text-muted">
                State Lic #KA-PH-2021-9941 • Jan Aushadhi Hub
              </span>
            </div>
          </div>
          <button
            onClick={() => showToastMessage('Pharmacist License verified by Karnataka State Pharmacy Council')}
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
            <span className="font-label-sm text-label-sm truncate">Form 20B Invoice</span>
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
              Clinical Assistance &amp; Support
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-status-success-text flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-status-success-text"></span>
            24/7 Duty Desk Active
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-text-muted">
          Need dosage guidance, thermal SLA inquiry, or want to consult a registered pharmacist? Our duty desk is available.
        </p>

        <div className="flex items-center gap-space-xs pt-space-2xs">
          <button
            onClick={onOpenChatPharmacist}
            className="flex-1 h-10 rounded-lg bg-status-info-bg text-status-info-text font-label-md text-label-md font-bold flex items-center justify-center gap-space-xs hover:bg-teal-100 transition-colors border border-status-info-border active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Chat Pharmacist</span>
          </button>
          {!isDelivered && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="h-10 px-space-md rounded-lg bg-status-danger-bg text-status-danger-text font-label-md text-label-md font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-space-2xs border border-status-danger-border active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Delivery Handshake Modal (Courier Terminal Simulator) */}
      <DeliveryHandshakeModal
        isOpen={isHandshakeModalOpen}
        onClose={() => setIsHandshakeModalOpen(false)}
        orderId={orderId}
        patientOtp="4829"
        onDeliveryComplete={handleDeliveryComplete}
        showToastMessage={showToastMessage}
      />

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface-card rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-border-subtle animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-status-danger-bg text-status-danger-text flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <h3 className="font-headline-sm text-center font-bold text-text-primary">
              Cancel Order #{orderId}?
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
