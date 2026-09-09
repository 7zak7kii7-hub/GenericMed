import React, { useState } from 'react';
import { COMPARISON_PAIRS, HOTLINK_IMAGES } from '../data/mockData';
import { ComparisonPair, ScreenTab } from '../types';

interface CompareScreenProps {
  onNavigate: (tab: ScreenTab) => void;
  onSelectMoleculeDetail?: (moleculeId: string) => void;
  onSelectMedicine?: (medicineName: string) => void;
  onAddToCart?: ((pair: ComparisonPair) => void) | ((item: any) => void);
  onOpenUploadPrescription?: () => void;
  onOpenUploadModal?: () => void;
  onOpenLabVerification?: () => void;
  onOpenBioModal?: () => void;
  showToastMessage?: (msg: string) => void;
}

export const CompareScreen: React.FC<CompareScreenProps> = ({
  onNavigate,
  onSelectMoleculeDetail,
  onSelectMedicine,
  onAddToCart,
  onOpenUploadPrescription,
  onOpenUploadModal,
  onOpenLabVerification,
  onOpenBioModal,
  showToastMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [selectedPill, setSelectedPill] = useState<string | null>(null);
  const [monthlySpend, setMonthlySpend] = useState<number>(2500);

  const genericMonthlySpend = Math.round(monthlySpend * 0.32);
  const annualSavings = (monthlySpend - genericMonthlySpend) * 12;

  const handleSelectMolecule = (idOrName: string) => {
    if (onSelectMoleculeDetail) {
      onSelectMoleculeDetail(idOrName);
    } else if (onSelectMedicine) {
      onSelectMedicine(idOrName);
    } else {
      onNavigate('medicine-detail');
    }
  };

  const handleUploadPrescription = onOpenUploadPrescription || onOpenUploadModal || (() => {});
  const handleLabVerification = onOpenLabVerification || onOpenBioModal || (() => {});
  const handleToast = showToastMessage || ((_msg: string) => {});

  const handleAddPair = (pair: ComparisonPair) => {
    if (onAddToCart) {
      onAddToCart(pair);
    } else {
      handleToast(`Added ${pair.genericName} to cart`);
    }
  };

  const saltPills = [
    'Paracetamol 650mg',
    'Atorvastatin 20mg',
    'Metformin 500mg',
    'Amoxicillin 625mg',
    'Telmisartan 40mg'
  ];

  const handleVoiceSearch = () => {
    setIsVoiceListening(true);
    handleToast('Listening for salt or medicine name...');
    setTimeout(() => {
      setIsVoiceListening(false);
      setSearchQuery('Paracetamol 650mg');
      handleToast('Recognized "Paracetamol 650mg"');
    }, 1800);
  };

  const handlePillClick = (pillName: string) => {
    if (selectedPill === pillName) {
      setSelectedPill(null);
      setSearchQuery('');
    } else {
      setSelectedPill(pillName);
      setSearchQuery(pillName.split(' ')[0]);
    }
  };

  const filteredPairs = COMPARISON_PAIRS.filter((pair) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      pair.brandName.toLowerCase().includes(query) ||
      pair.genericName.toLowerCase().includes(query) ||
      pair.formulaId.toLowerCase().includes(query) ||
      pair.brandManufacturer.toLowerCase().includes(query) ||
      pair.genericManufacturer.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col w-full px-space-base gap-space-lg max-w-screen-md mx-auto pb-6">
      {/* Interactive Search & Scan Master Card */}
      <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-md p-space-base gap-space-md border border-border-subtle mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
              Salt Molecule Engine v4.2
            </span>
          </div>
          <span className="font-code-tabular text-code-tabular text-text-muted">
            CDSCO Compliant
          </span>
        </div>

        {/* Master Input Bar */}
        <div className="relative flex items-center bg-surface-subtle rounded-xl shadow-sm px-space-sm py-space-xs transition-all duration-200 focus-within:bg-surface-container-lowest focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/20">
          <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mr-space-xs">
            manage_search
          </span>
          <input
            id="medicine-search-input"
            aria-label="Search medicine"
            className="w-full bg-transparent font-body-md text-body-md text-text-primary placeholder:text-text-muted focus:outline-none min-w-0"
            placeholder={
              isVoiceListening
                ? 'Listening... Say medicine salt name...'
                : 'Search by medicine, salt molecule, or brand...'
            }
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="w-6 h-6 rounded-full text-text-muted hover:text-text-primary flex items-center justify-center mr-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
          <div className="flex items-center gap-space-xs shrink-0 ml-space-xs">
            <button
              id="voice-search-btn"
              aria-label="Voice Search"
              onClick={handleVoiceSearch}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isVoiceListening
                  ? 'text-red-600 bg-red-100 animate-pulse'
                  : 'text-text-muted hover:text-primary hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
            <button
              id="camera-scan-btn"
              aria-label="Scan Prescription"
              onClick={onOpenUploadPrescription}
              className="h-8 px-space-xs rounded-lg bg-secondary-container text-on-secondary-container flex items-center gap-space-2xs shadow-sm active:scale-95 transition-all hover:bg-emerald-200"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span className="font-label-sm text-label-sm hidden sm:inline font-bold">Rx Scan</span>
            </button>
          </div>
        </div>

        {/* Quick Salt Discovery Pills */}
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary font-medium">
              High-Demand Molecules Today
            </span>
            <span className="font-code-tabular text-[11px] text-primary font-bold">
              1,420+ Salts
            </span>
          </div>
          <div
            className="flex gap-space-xs overflow-x-auto pb-space-2xs -mx-space-base px-space-base"
            style={{ scrollbarWidth: 'none' }}
          >
            {saltPills.map((pill) => {
              const isActive = selectedPill === pill;
              return (
                <button
                  key={pill}
                  onClick={() => handlePillClick(pill)}
                  className={`salt-pill shrink-0 flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full text-body-sm font-body-sm transition-all active:scale-95 shadow-sm border ${
                    isActive
                      ? 'bg-secondary-container text-on-secondary-container border-emerald-400 font-semibold'
                      : 'bg-surface-subtle text-text-primary border-border-subtle hover:bg-status-info-bg hover:text-status-info-text'
                  }`}
                >
                  <span className="material-symbols-outlined text-primary text-[14px]">science</span>
                  <span>{pill}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Value Prop & Clinical Trust Banner */}
      <div className="relative overflow-hidden bg-primary rounded-xl shadow-md p-space-base text-on-primary">
        <div className="relative z-10 flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="px-space-xs py-space-2xs rounded bg-white/15 font-label-sm text-label-sm font-semibold tracking-wide uppercase text-on-primary">
              NABL &amp; CDSCO Certified
            </span>
            <span className="font-code-tabular text-code-tabular text-emerald-200 font-semibold">
              Save up to 70%
            </span>
          </div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-primary leading-snug">
            Why Pay More for Brand Names?
          </h2>
          <p className="font-body-sm text-body-sm text-emerald-100 leading-relaxed">
            Compare identical bioequivalent molecules. Same therapeutic purity, dosage formulation, and safety index—delivered directly from certified Indian pharma laboratories.
          </p>

          {/* Interactive Savings Counter Widget */}
          <div className="mt-space-2xs flex items-center justify-between bg-black/15 rounded-lg p-space-sm backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
                savings
              </span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-emerald-200">
                  Bengaluru Users Saved
                </span>
                <span className="font-code-tabular text-body-lg font-bold text-on-primary">
                  ₹3,42,890 this week
                </span>
              </div>
            </div>
            <button
              onClick={handleLabVerification}
              className="px-space-sm py-1.5 bg-secondary-container text-on-secondary-container rounded font-label-sm text-label-sm font-bold hover:bg-secondary-fixed transition-transform active:scale-95 shadow-sm"
            >
              Verify Labs
            </button>
          </div>
        </div>

        {/* Decorative Clinical Sparkline SVG Background */}
        <div className="absolute -right-8 -bottom-6 opacity-20 pointer-events-none text-white">
          <svg fill="none" height="120" viewBox="0 0 220 120" width="220">
            <path
              d="M0 60 H40 L50 20 L65 95 L80 40 L95 70 L105 50 H140 L155 10 L170 110 L185 55 H220"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          </svg>
        </div>
      </div>

      {/* Interactive Annual Household Generic Savings Calculator */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-base border border-border-subtle flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">calculate</span>
            <h3 className="font-headline-sm text-headline-sm text-text-primary font-bold">
              Household Generic Savings Estimator
            </h3>
          </div>
          <span className="text-[11px] font-bold text-status-success-text px-2 py-0.5 rounded bg-status-success-bg border border-status-success-border">
            Avg 68% Lower
          </span>
        </div>

        <p className="text-body-sm text-text-muted">
          Estimate how much you save on chronic prescriptions (BP, Diabetes, Cholesterol) by switching from branded marketing formulations to CDSCO certified generics.
        </p>

        <div className="bg-surface-subtle p-3 rounded-xl border border-border-subtle flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-label-sm font-bold text-text-secondary">
              Monthly Branded Spend:
            </span>
            <span className="font-code-tabular text-headline-sm font-bold text-text-primary">
              ₹{monthlySpend.toLocaleString('en-IN')}
            </span>
          </div>

          <input
            type="range"
            min="500"
            max="15000"
            step="250"
            value={monthlySpend}
            onChange={(e) => setMonthlySpend(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer h-2 bg-slate-200 rounded-lg"
          />

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border-subtle/60 text-center">
            <div className="p-2 rounded-lg bg-surface-canvas border border-border-subtle">
              <span className="text-[11px] text-text-muted block">Generic Med Equivalent</span>
              <span className="font-code-tabular text-[15px] font-bold text-primary">
                ₹{genericMonthlySpend.toLocaleString('en-IN')}/mo
              </span>
            </div>
            <div className="p-2 rounded-lg bg-status-success-bg border border-status-success-border">
              <span className="text-[11px] text-status-success-text block font-medium">
                Annual Household Savings
              </span>
              <span className="font-code-tabular text-[15px] font-bold text-status-success-text">
                ₹{annualSavings.toLocaleString('en-IN')}/yr
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Comparison Matchups (High Density Cards) */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">
              compare_arrows
            </span>
            <h3 className="font-headline-sm text-headline-sm text-text-primary font-bold">
              Direct Molecule Equivalents
            </h3>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="font-label-sm text-label-sm text-primary hover:underline font-semibold"
          >
            View All ({COMPARISON_PAIRS.length})
          </button>
        </div>

        {filteredPairs.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-xl text-center border border-border-subtle">
            <span className="material-symbols-outlined text-[36px] text-text-muted mb-2">search_off</span>
            <h4 className="font-headline-sm text-text-primary font-bold">No exact molecule match</h4>
            <p className="font-body-sm text-text-muted mt-1">
              Try searching for &quot;Paracetamol&quot;, &quot;Atorvastatin&quot;, &quot;Augmentin&quot;, or &quot;Metformin&quot;.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedPill(null); }}
              className="mt-3 px-4 py-1.5 bg-primary text-on-primary rounded-lg font-label-sm font-semibold"
            >
              Reset Search
            </button>
          </div>
        ) : (
          filteredPairs.map((pair) => (
            <div
              key={pair.id}
              className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm p-space-base gap-space-sm transition-all duration-200 hover:shadow-md border border-border-subtle"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-status-success-bg text-status-success-text font-label-sm text-label-sm font-bold flex items-center gap-1 border border-status-success-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success-text"></span>
                  {pair.badge}
                </span>
                <span className="font-code-tabular text-code-tabular text-text-muted">
                  Formula ID: {pair.formulaId}
                </span>
              </div>

              <div
                className="grid grid-cols-2 gap-space-sm items-stretch cursor-pointer"
                onClick={() => handleSelectMolecule(pair.id)}
                title="Click to view full scientific and pharmacy breakdown"
              >
                {/* Brand Side */}
                <div className="flex flex-col justify-between bg-surface-subtle p-space-sm rounded-lg border border-border-subtle hover:border-slate-300 transition-colors">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-text-muted uppercase font-semibold">
                        Brand Prescribed
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-text-muted">
                        verified_user
                      </span>
                    </div>
                    <p className="font-headline-sm text-headline-sm text-text-primary font-semibold mt-1">
                      {pair.brandName}
                    </p>
                    <span className="font-body-sm text-body-sm text-text-muted">
                      {pair.brandManufacturer}
                    </span>
                  </div>
                  <div className="mt-space-xs flex items-baseline gap-1">
                    <span className="font-code-tabular text-headline-sm font-bold text-text-primary">
                      ₹{pair.brandPrice.toFixed(2)}
                    </span>
                    <span className="font-body-sm text-body-sm text-text-muted">
                      / {pair.brandPack}
                    </span>
                  </div>
                </div>

                {/* Generic Bioequivalent Side */}
                <div className="flex flex-col justify-between bg-status-info-bg p-space-sm rounded-lg relative overflow-hidden border border-status-info-border hover:border-teal-400 transition-colors">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-primary"></div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-status-info-text uppercase font-semibold">
                        Generic Salt
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        check_circle
                      </span>
                    </div>
                    <p className="font-headline-sm text-headline-sm text-text-primary font-semibold mt-1">
                      {pair.genericName}
                    </p>
                    <span className="font-body-sm text-body-sm text-status-info-text">
                      {pair.genericManufacturer}
                    </span>
                  </div>
                  <div className="mt-space-xs flex items-baseline gap-1">
                    <span className="font-code-tabular text-headline-sm font-bold text-primary">
                      ₹{pair.genericPrice.toFixed(2)}
                    </span>
                    <span className="font-body-sm text-body-sm text-text-muted">
                      / {pair.genericPack}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-space-xs border-t border-border-subtle/50">
                <div className="flex items-center gap-space-2xs text-text-secondary">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    verified
                  </span>
                  <span className="font-label-sm text-label-sm">{pair.verifiedTag}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectMolecule(pair.id)}
                    className="px-2 py-1 text-[11px] font-label-sm text-primary hover:underline font-semibold"
                  >
                    Compare Hubs
                  </button>
                  <button
                    onClick={() => handleAddPair(pair)}
                    className="px-space-sm py-1 bg-primary text-on-primary font-label-sm text-label-sm font-semibold rounded hover:bg-brand-deep transition-all active:scale-95 shadow-sm flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                    <span>Swap &amp; Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Verified Pharmacy Fulfillment Network in Bengaluru */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-text-primary font-bold">
              Verified Fulfillment Hubs
            </h3>
            <p className="font-body-sm text-body-sm text-text-muted">
              Near Indiranagar, Bengaluru · Form 20/21 Licensed
            </p>
          </div>
          <span className="px-2 py-1 rounded bg-status-success-bg text-status-success-text font-label-sm text-label-sm font-semibold flex items-center gap-1 border border-status-success-border">
            <span className="material-symbols-outlined text-[14px]">bolt</span> Live SLAs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
          {/* Apollo Pharmacy */}
          <div className="flex items-center justify-between bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-border-subtle">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[22px]">local_pharmacy</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-[14px] text-text-primary font-bold truncate">
                  Apollo MedPlus Hub
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-code-tabular text-[10px] text-text-muted">
                    Lic #KA-BLR-20B-189
                  </span>
                  <span className="w-1 h-1 rounded-full bg-text-muted"></span>
                  <span className="font-label-sm text-[11px] text-secondary font-semibold">
                    4.8 ★
                  </span>
                </div>
              </div>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded bg-status-info-bg text-status-info-text font-code-tabular text-[11px] font-bold border border-status-info-border">
              32 mins
            </span>
          </div>

          {/* MedPlus Health */}
          <div className="flex items-center justify-between bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-border-subtle">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[22px]">vaccines</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-[14px] text-text-primary font-bold truncate">
                  MedPlus Pharma 100ft
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-code-tabular text-[10px] text-text-muted">
                    Lic #KA-BLR-21B-404
                  </span>
                  <span className="w-1 h-1 rounded-full bg-text-muted"></span>
                  <span className="font-label-sm text-[11px] text-secondary font-semibold">
                    4.9 ★
                  </span>
                </div>
              </div>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded bg-status-info-bg text-status-info-text font-code-tabular text-[11px] font-bold border border-status-info-border">
              38 mins
            </span>
          </div>

          {/* Wellness Forever */}
          <div className="flex items-center justify-between bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-border-subtle">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-[14px] text-text-primary font-bold truncate">
                  Wellness Forever 24/7
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-code-tabular text-[10px] text-text-muted">
                    Cold Chain Active
                  </span>
                  <span className="w-1 h-1 rounded-full bg-text-muted"></span>
                  <span className="font-label-sm text-[11px] text-secondary font-semibold">
                    4.7 ★
                  </span>
                </div>
              </div>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded bg-status-info-bg text-status-info-text font-code-tabular text-[11px] font-bold border border-status-info-border">
              42 mins
            </span>
          </div>
        </div>
      </div>

      {/* Educational Trust Card: How Equivalence Works */}
      <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm p-space-base gap-space-md border border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">
              school
            </span>
            <h3 className="font-headline-sm text-headline-sm text-text-primary font-bold">
              Clinical Equivalence Protocol
            </h3>
          </div>
          <span className="font-code-tabular text-code-tabular text-status-info-text bg-status-info-bg px-2 py-0.5 rounded border border-status-info-border">
            FDA / CDSCO Guidelines
          </span>
        </div>

        {/* 3 Step Graphic Visual */}
        <div className="grid grid-cols-3 gap-space-xs text-center">
          <div className="flex flex-col items-center bg-surface-subtle p-space-sm rounded-lg border border-border-subtle">
            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[18px]">biotech</span>
            </div>
            <span className="font-label-sm text-label-sm text-text-primary font-bold">
              1. Identical API
            </span>
            <span className="font-body-sm text-[11px] text-text-muted leading-tight mt-1">
              Exact active chemical molecular structure
            </span>
          </div>

          <div className="flex flex-col items-center bg-surface-subtle p-space-sm rounded-lg border border-border-subtle">
            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[18px]">query_stats</span>
            </div>
            <span className="font-label-sm text-label-sm text-text-primary font-bold">
              2. Bioavailability
            </span>
            <span className="font-body-sm text-[11px] text-text-muted leading-tight mt-1">
              80–125% rate &amp; extent absorption matching
            </span>
          </div>

          <div className="flex flex-col items-center bg-surface-subtle p-space-sm rounded-lg border border-border-subtle">
            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
            <span className="font-label-sm text-label-sm text-text-primary font-bold">
              3. NABL Assured
            </span>
            <span className="font-body-sm text-[11px] text-text-muted leading-tight mt-1">
              Batch-tested by government certified labs
            </span>
          </div>
        </div>

        {/* Inline Clinical Evidence Banner with Visual Hotlinked Image */}
        <div className="flex items-center gap-space-sm p-space-sm bg-surface-subtle rounded-lg border border-border-subtle">
          <img
            alt="Pharmaceutical research chemist"
            className="w-14 h-14 object-cover rounded shrink-0"
            src={HOTLINK_IMAGES.labChemist}
          />
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-text-primary font-bold">
              Ministry of Health &amp; Family Welfare Directive
            </span>
            <p className="font-body-sm text-body-sm text-text-secondary line-clamp-2">
              Doctors are mandated by the National Medical Commission (NMC) to prescribe generic chemical names to reduce out-of-pocket costs.
            </p>
          </div>
        </div>
      </div>

      {/* Real-Time User Savings Alert Banner (Delight Micro-interaction) */}
      <div className="flex items-center justify-between bg-status-success-bg p-space-sm rounded-xl text-status-success-text shadow-sm border border-status-success-border">
        <div className="flex items-center gap-space-xs min-w-0">
          <span className="material-symbols-outlined text-[20px] text-status-success-text shrink-0 animate-bounce">
            celebration
          </span>
          <span className="font-body-sm text-body-sm truncate">
            <strong>Rajesh K.</strong> just saved ₹420 switching to Generic Telmisartan!
          </span>
        </div>
        <span className="font-code-tabular text-[10px] shrink-0 font-semibold ml-space-xs bg-white/70 px-1.5 py-0.5 rounded">
          2m ago
        </span>
      </div>

      {/* Bottom CTA for Prescription Upload */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-space-base bg-surface-container-lowest rounded-xl shadow-sm gap-space-sm border border-border-subtle">
        <div className="flex items-center gap-space-sm">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">receipt_long</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-text-primary font-bold">
              Have an offline prescription?
            </span>
            <span className="font-body-sm text-body-sm text-text-muted">
              Our AI pharmacists convert brand names to generic alternatives in 60 seconds.
            </span>
          </div>
        </div>
        <button
          onClick={handleUploadPrescription}
          className="w-full sm:w-auto px-space-lg py-2.5 bg-primary text-on-primary font-label-md text-label-md font-bold rounded-lg hover:bg-brand-deep active:scale-95 transition-all shadow-md shrink-0 flex items-center justify-center gap-space-xs"
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          <span>Upload Prescription</span>
        </button>
      </div>
    </div>
  );
};
