import React, { useState } from 'react';
import { MOLECULE_OFFERS } from '../data/mockData';
import { PharmacyOffer, CartItem } from '../types';

interface MedicineDetailScreenProps {
  onAddToCart: (item: CartItem) => void;
  onOpenBioModal: () => void;
  showToastMessage: (msg: string) => void;
  onNavigateToCart: () => void;
  selectedMoleculeId?: string;
  onNavigateBack?: () => void;
}

const getMoleculeData = (id?: string) => {
  const query = (id || '').toLowerCase();
  if (query.includes('comp-2') || query.includes('amox') || query.includes('clav') || query.includes('augmentin')) {
    return {
      formulaCode: 'AMOX-CLAV-625',
      name: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
      category: 'ANTIBIOTIC • IP/BP GRADE',
      referenceBrands: ['Augmentin 625', 'Moxikind-CV 625'],
      basePrice: 48.0,
      baseMrp: 192.0,
      tabletsPerStrip: 10,
      packText: 'Strip of 10 Tablets',
      dissolutionParity: '99.4%',
      bioequivalence: '100% Bio-identical molecule composition',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA0P1UtMCeQiNx2w-bcWeCUFFpzLF24iIe3Cp14GAZ5EB13ymClblYwtJWU7ByhbebjjxryBDdp4OmJXRHka7igtzWaMWtXv9me9YlSXChLWYZfW_-jsUyR8HjK1C0LGpXemLMNThRUpKBpKU7eVMukONcRCHPBm7Kf626g4YQgmyLof3wdsPQ611VG3SgU4zHJmczu85b5JETLuuRKe8vqJ9obmmoClxrwGcEvtgTr5P-8gwiWM459Ow',
    };
  }
  if (query.includes('comp-3') || query.includes('ator') || query.includes('lipitor')) {
    return {
      formulaCode: 'ATOR-20-IP',
      name: 'Atorvastatin Calcium 20mg IP',
      category: 'CARDIOVASCULAR • LIPID REGULATOR',
      referenceBrands: ['Lipitor 20mg', 'Atorva 20'],
      basePrice: 28.0,
      baseMrp: 180.0,
      tabletsPerStrip: 10,
      packText: 'Blister of 10 Tablets',
      dissolutionParity: '99.8%',
      bioequivalence: 'USP & IP Dissolution Verified',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC2ox6R8_W0rkSEFboR7B4tYoVqdnvB8FaadBVFLBDVxeDwjdsIQhrdgaYARQkZDYIzVuyDAvc5rUufa5vcTZfYjsHh2aW17Tz2mbfru9TpYH8Gatk1Xq44HMG6xpxskqcZyRB25nTmFCVdRmWn0b8YbuzOQrEjvPQxsWgLB2MKXuOOKwfGISB0S044qiizjYpE8c_36lRYyuPGUsekFiCPJChOqE0d_ZuzyRRqzrzWCX5AcJUi2SIMUw',
    };
  }
  if (query.includes('comp-4') || query.includes('metformin') || query.includes('glycomet')) {
    return {
      formulaCode: 'MET-500-SR',
      name: 'Metformin HCl Sustained Release 500mg',
      category: 'ANTIDIABETIC • BIGUANIDE IP',
      referenceBrands: ['Glycomet 500 SR', 'Obimet 500'],
      basePrice: 14.0,
      baseMrp: 45.0,
      tabletsPerStrip: 20,
      packText: 'Strip of 20 Tablets',
      dissolutionParity: '99.6%',
      bioequivalence: 'CDSCO Bioequivalence Cleared',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA0P1UtMCeQiNx2w-bcWeCUFFpzLF24iIe3Cp14GAZ5EB13ymClblYwtJWU7ByhbebjjxryBDdp4OmJXRHka7igtzWaMWtXv9me9YlSXChLWYZfW_-jsUyR8HjK1C0LGpXemLMNThRUpKBpKU7eVMukONcRCHPBm7Kf626g4YQgmyLof3wdsPQ611VG3SgU4zHJmczu85b5JETLuuRKe8vqJ9obmmoClxrwGcEvtgTr5P-8gwiWM459Ow',
    };
  }
  // Default Paracetamol
  return {
    formulaCode: 'PARA-650-IP',
    name: 'Paracetamol 650mg + Caffeine 50mg',
    category: 'ANALGESIC • IP GRADE',
    referenceBrands: ['Dolo-650', 'Calpol 650'],
    basePrice: 21.0,
    baseMrp: 54.0,
    tabletsPerStrip: 15,
    packText: 'Strip of 15 Tablets',
    dissolutionParity: '99.7%',
    bioequivalence: '100% Active Drug Parity',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA0P1UtMCeQiNx2w-bcWeCUFFpzLF24iIe3Cp14GAZ5EB13ymClblYwtJWU7ByhbebjjxryBDdp4OmJXRHka7igtzWaMWtXv9me9YlSXChLWYZfW_-jsUyR8HjK1C0LGpXemLMNThRUpKBpKU7eVMukONcRCHPBm7Kf626g4YQgmyLof3wdsPQ611VG3SgU4zHJmczu85b5JETLuuRKe8vqJ9obmmoClxrwGcEvtgTr5P-8gwiWM459Ow',
  };
};

export const MedicineDetailScreen: React.FC<MedicineDetailScreenProps> = ({
  onAddToCart,
  onOpenBioModal,
  showToastMessage,
  onNavigateToCart,
  selectedMoleculeId = 'CAN-MOL-1049',
  onNavigateBack,
}) => {
  const currentMol = getMoleculeData(selectedMoleculeId);
  const [normalizationMode, setNormalizationMode] = useState<'tab' | 'strip'>('tab');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string>('offer-apollo');
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  // Dynamically compute offer prices relative to the active molecule
  const dynamicOffers = MOLECULE_OFFERS.map((offer, idx) => {
    const multiplier = idx === 0 ? 1.0 : idx === 1 ? 1.09 : 1.15;
    const price = Math.round(currentMol.basePrice * multiplier);
    const mrp = currentMol.baseMrp;
    return {
      ...offer,
      pricePerStrip: price,
      mrpPerStrip: mrp,
      tabletsPerStrip: currentMol.tabletsPerStrip,
      savingsAmount: mrp - price,
    };
  });

  const selectedOffer = dynamicOffers.find((o) => o.id === selectedOfferId) || dynamicOffers[0];

  const handleToggleMode = (mode: 'tab' | 'strip') => {
    setNormalizationMode(mode);
    if (mode === 'tab') {
      showToastMessage('Normalized to cost per single tablet');
    } else {
      showToastMessage('Comparing standard pack pricing');
    }
  };

  const handleSelectOffer = (offer: PharmacyOffer) => {
    setSelectedOfferId(offer.id);
    showToastMessage(`Switched selection to ${offer.pharmacyName}`);
  };

  const handleAddCurrentOffer = () => {
    setIsAddedAnimation(true);
    const cartItem: CartItem = {
      id: `cart-mol-${selectedOffer.id}-${Date.now()}`,
      name: currentMol.name,
      category: currentMol.category,
      pharmacyName: selectedOffer.pharmacyName,
      price: selectedOffer.pricePerStrip,
      mrp: selectedOffer.mrpPerStrip,
      pricePerUnit: `₹${(selectedOffer.pricePerStrip / selectedOffer.tabletsPerStrip).toFixed(2)} / tab`,
      quantity: 1,
      packDetail: currentMol.packText,
      batchNumber: `Batch #AP-${Math.floor(1000 + Math.random() * 9000)}`,
      savingsAmount: selectedOffer.savingsAmount || (selectedOffer.mrpPerStrip - selectedOffer.pricePerStrip),
      imageUrl: currentMol.imageUrl,
    };
    onAddToCart(cartItem);
    showToastMessage(`${selectedOffer.pharmacyName} offer for ${currentMol.name} added to healthcare cart`);
    setTimeout(() => {
      setIsAddedAnimation(false);
    }, 1800);
  };

  const calculateUnitCost = (offer: PharmacyOffer) => {
    return (offer.pricePerStrip / offer.tabletsPerStrip).toFixed(2);
  };

  return (
    <div className="flex flex-col w-full pb-32 max-w-screen-md mx-auto">
      {/* Molecule Clinical Header Block */}
      <div className="px-space-base pt-space-md pb-space-sm">
        <div className="bg-surface-container-lowest p-space-base rounded-xl shadow-sm flex flex-col gap-space-xs border border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              {onNavigateBack && (
                <button
                  onClick={onNavigateBack}
                  className="p-1.5 -ml-1 rounded-lg text-text-secondary hover:bg-surface-subtle hover:text-primary active:scale-95 transition-all flex items-center"
                  title="Back to Comparisons"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
              )}
              <span className="px-space-xs py-0.5 rounded-full bg-status-info-bg text-status-info-text font-code-tabular text-[11px] font-medium tracking-tight border border-status-info-border">
                {currentMol.formulaCode}
              </span>
              <span className="px-space-xs py-0.5 rounded-full bg-status-success-bg text-status-success-text font-label-sm text-[11px] font-bold flex items-center gap-1 border border-status-success-border">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                CDSCO IP Standard
              </span>
            </div>
            <button
              onClick={onOpenBioModal}
              className="w-8 h-8 rounded-lg bg-surface-subtle text-text-secondary flex items-center justify-center transition-colors hover:bg-surface-container hover:text-primary active:scale-95 border border-border-subtle"
              title="View Lab Verification & Certificate of Analysis"
            >
              <span className="material-symbols-outlined text-[18px]">science</span>
            </button>
          </div>

          <h2 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-bold pt-1">
            {currentMol.name}
          </h2>

          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="font-label-sm text-label-sm text-text-muted">Bioequivalent reference:</span>
            {currentMol.referenceBrands.map((brand) => (
              <span
                key={brand}
                className="font-label-sm text-label-sm text-primary font-bold bg-status-info-bg px-space-xs py-0.5 rounded border border-status-info-border"
              >
                {brand}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-space-sm mt-space-2xs pt-space-xs text-text-muted font-body-sm text-body-sm border-t border-border-subtle/50">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary font-bold">
                verified_user
              </span>
              {currentMol.bioequivalence}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary font-bold">
                inventory_2
              </span>
              3 Direct Pharmacy Stocks
            </span>
          </div>
        </div>
      </div>

      {/* Normalization Switch & Strategy Card */}
      <div className="px-space-base py-space-xs">
        <div className="bg-surface-subtle p-1 rounded-full flex items-center justify-between border border-border-subtle shadow-inner">
          <button
            onClick={() => handleToggleMode('tab')}
            className={`flex-1 py-1.5 px-space-sm rounded-full font-label-sm text-label-sm transition-all duration-200 flex items-center justify-center gap-1 ${
              normalizationMode === 'tab'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">calculate</span>
            <span>Per Tablet Normalizer</span>
            <span className="font-code-tabular font-bold">(₹1.40/tab)</span>
          </button>

          <button
            onClick={() => handleToggleMode('strip')}
            className={`flex-1 py-1.5 px-space-sm rounded-full font-label-sm text-label-sm transition-all duration-200 flex items-center justify-center gap-1 ${
              normalizationMode === 'strip'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">view_agenda</span>
            <span>Per Strip MRP</span>
          </button>
        </div>
      </div>

      {/* Section Title with Freshness Badge */}
      <div className="px-space-base pt-space-sm pb-space-xs flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted font-bold">
            Live Normalized Offers
          </span>
        </div>
        <span className="font-code-tabular text-body-sm text-text-muted font-medium">
          3 Verified Fulfillers
        </span>
      </div>

      {/* HIGHLIGHTED WINNER CARD: Apollo Med Central */}
      <div className="px-space-base pb-space-sm">
        <div
          className={`bg-surface-container-lowest rounded-xl shadow-md overflow-hidden relative transition-all duration-200 border ${
            selectedOfferId === 'offer-apollo' ? 'border-primary ring-2 ring-primary/10' : 'border-border-subtle'
          }`}
        >
          {/* Winner Banner Ribbon */}
          <div className="bg-primary text-on-primary px-space-base py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary-fixed">
                workspace_premium
              </span>
              <span className="font-label-sm text-label-sm font-bold tracking-wide uppercase">
                Lowest Verified Offer
              </span>
            </div>
            <span className="bg-secondary text-on-secondary px-2 py-0.5 rounded-full font-code-tabular text-[11px] font-bold">
              61% OFF BRANDED
            </span>
          </div>

          <div className="p-space-base flex flex-col gap-space-sm">
            {/* Pharmacy Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-status-info-bg text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[24px]">local_pharmacy</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-headline-sm text-headline-sm text-text-primary font-bold leading-tight">
                      Apollo Med Central
                    </h3>
                    <span
                      className="material-symbols-outlined text-secondary text-[16px]"
                      title="Form 20/21 Licensed & Audited"
                    >
                      verified
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-text-muted flex items-center gap-1">
                    <span>Indiranagar</span> • <span>1.2 km</span> •
                    <span className="flex items-center text-status-warning-text font-semibold">
                      <span className="material-symbols-outlined text-[13px] fill-current mr-0.5">
                        star
                      </span>
                      4.9
                    </span>
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-status-success-bg text-status-success-text font-label-sm text-label-sm rounded-md flex items-center gap-1 border border-status-success-border">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Form 20/21
              </span>
            </div>

            {/* Product Presentation & Price Highlight */}
            <div className="bg-surface-subtle p-space-sm rounded-xl flex items-center justify-between border border-border-subtle">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-text-muted">
                  Generic Formulation Strip
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display-sm text-display-sm font-bold text-primary">
                    {normalizationMode === 'tab' ? '₹1.40' : '₹21.00'}
                  </span>
                  <span className="font-body-sm text-body-sm text-text-muted line-through">
                    {normalizationMode === 'tab' ? '₹3.60' : '₹54.00'}
                  </span>
                </div>
                <span className="font-code-tabular text-body-sm text-secondary font-semibold">
                  {normalizationMode === 'tab'
                    ? 'Normalized per Tablet (15 Pack Total: ₹21.00)'
                    : '₹1.40 per tablet • 15 Tabs'}
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="px-2 py-0.5 bg-status-success-bg text-status-success-text font-code-tabular text-label-sm font-bold rounded border border-status-success-border">
                  SAVE ₹33.00
                </span>
                <span className="font-body-sm text-body-sm text-text-muted mt-1 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">schedule</span> 35 min delivery
                </span>
              </div>
            </div>

            {/* Stock Freshness & SLA Tags */}
            <div className="flex items-center justify-between font-body-sm text-body-sm text-text-muted">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-secondary">cached</span>
                Stock synced 4m ago (120+ packs)
              </span>
              <span className="text-primary font-semibold">₹15 or FREE &gt; ₹99</span>
            </div>

            {/* Interactive 'Why This Is Lowest' Drawer Button */}
            <div className="pt-space-2xs">
              <button
                onClick={() => setIsInspectorOpen(!isInspectorOpen)}
                className="w-full py-2 px-space-sm rounded-xl bg-status-info-bg text-brand-deep font-label-sm text-label-sm flex items-center justify-between transition-colors hover:bg-teal-100 active:scale-[0.99] border border-status-info-border"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="material-symbols-outlined text-[17px] text-primary">insights</span>
                  Why this is mathematically the lowest offer
                </span>
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                    isInspectorOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Collapsible Breakdown Drawer Content */}
              {isInspectorOpen && (
                <div className="flex flex-col gap-space-xs pt-space-sm text-body-sm animate-fadeIn">
                  <div className="bg-surface-canvas p-space-sm rounded-lg flex flex-col gap-1 font-body-sm border border-border-subtle">
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>Direct Batch Cost (15 Tabs)</span>
                      <span className="font-code-tabular text-text-primary font-semibold">₹21.00</span>
                    </div>
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>Normalized Unit Active Parity</span>
                      <span className="font-code-tabular text-text-primary font-semibold">
                        ₹1.40 / 700mg Actives
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-status-success-text font-medium">
                      <span>Dynamic Dispatch Distance Rebate</span>
                      <span className="font-code-tabular font-bold">- ₹0.15 / unit</span>
                    </div>
                    <div className="h-px bg-border-subtle my-1"></div>
                    <div className="flex justify-between items-center font-bold text-brand-deep">
                      <span>Net Certified Normalized Cost</span>
                      <span className="font-code-tabular text-headline-sm text-primary font-bold">
                        ₹1.25 / eff. dose
                      </span>
                    </div>
                    <p className="font-body-sm text-[11px] text-text-muted mt-1 leading-normal">
                      Audited against CDSCO pricing schedules. Outperforms competing strip packs by a minimum of ₹0.16 per tablet after adjusting for batch proximity and courier SLA.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bioequivalence Lab Assurance Module */}
      <div className="px-space-base py-space-xs">
        <div
          onClick={onOpenBioModal}
          className="bg-surface-container-lowest p-space-base rounded-xl shadow-sm flex items-center gap-space-base border border-border-subtle cursor-pointer hover:border-teal-400 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-status-success-bg text-secondary flex items-center justify-center shrink-0 border border-status-success-border">
            <span className="material-symbols-outlined text-[28px]">biotech</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-label-md text-label-md font-bold text-text-primary">
                NABL Verified Batch Parity
              </h4>
              <span className="px-1.5 py-0.2 bg-secondary-container text-on-secondary-container font-code-tabular text-[10px] font-bold rounded">
                99.8%
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-text-muted truncate mt-0.5">
              Identical therapeutic curve and peak absorption rate as branded innovators.
            </p>
          </div>
          <span className="material-symbols-outlined text-text-muted text-[18px]">chevron_right</span>
        </div>
      </div>

      {/* Other Audited Offers */}
      <div className="px-space-base pt-space-md pb-space-xs flex items-center justify-between">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted font-bold">
          Other Audited Offers
        </span>
        <span className="font-body-sm text-body-sm text-text-muted">
          Sorted by Normalized Unit Cost
        </span>
      </div>

      <div className="px-space-base flex flex-col gap-space-sm">
        {/* Competing Offer 1: MedPlus */}
        <div
          className={`bg-surface-container-lowest p-space-base rounded-xl shadow-sm flex flex-col gap-space-xs border transition-all ${
            selectedOfferId === 'offer-medplus' ? 'border-primary ring-2 ring-primary/10' : 'border-border-subtle'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-headline-sm text-headline-sm font-semibold text-text-primary">
                  MedPlus Pharmacy
                </h4>
                <span className="material-symbols-outlined text-secondary text-[14px]">
                  check_circle
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-muted flex items-center gap-1">
                <span>CMH Road</span> • <span>2.1 km</span> •
                <span className="flex items-center text-text-secondary font-medium">
                  <span className="material-symbols-outlined text-[13px] text-status-warning-text fill-current mr-0.5">
                    star
                  </span>
                  4.8
                </span>
              </p>
            </div>
            <div className="text-right">
              <span className="font-headline-lg text-headline-lg font-bold text-text-primary">
                {normalizationMode === 'tab'
                  ? `₹${(dynamicOffers[1].pricePerStrip / dynamicOffers[1].tabletsPerStrip).toFixed(2)}`
                  : `₹${dynamicOffers[1].pricePerStrip.toFixed(2)}`}
              </span>
              <p className="font-code-tabular text-[11px] text-text-muted">
                ₹{(dynamicOffers[1].pricePerStrip / dynamicOffers[1].tabletsPerStrip).toFixed(2)}/tab • {dynamicOffers[1].tabletsPerStrip} pack
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-body-sm text-text-muted pt-1 border-t border-border-subtle/50">
            <span className="flex items-center gap-1 text-[12px]">
              <span className="material-symbols-outlined text-[14px] text-text-secondary">
                local_shipping
              </span>
              Delivery in 45 mins
            </span>
            <button
              onClick={() => handleSelectOffer(dynamicOffers[1])}
              className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm font-semibold active:scale-95 transition-all border ${
                selectedOfferId === 'offer-medplus'
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-subtle text-primary border-border-subtle hover:bg-surface-container'
              }`}
            >
              {selectedOfferId === 'offer-medplus' ? 'Selected' : 'Select Option'}
            </button>
          </div>
        </div>

        {/* Competing Offer 2: Wellness Forever (10 pack) */}
        <div
          className={`bg-surface-container-lowest p-space-base rounded-xl shadow-sm flex flex-col gap-space-xs border transition-all ${
            selectedOfferId === 'offer-wellness' ? 'border-primary ring-2 ring-primary/10' : 'border-border-subtle'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-headline-sm text-headline-sm font-semibold text-text-primary">
                  Wellness Forever
                </h4>
                <span className="material-symbols-outlined text-secondary text-[14px]">
                  check_circle
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-text-muted flex items-center gap-1">
                <span>Old Airport Rd</span> • <span>0.8 km</span> •
                <span className="flex items-center text-text-secondary font-medium">
                  <span className="material-symbols-outlined text-[13px] text-status-warning-text fill-current mr-0.5">
                    star
                  </span>
                  4.7
                </span>
              </p>
            </div>
            <div className="text-right">
              <span className="font-headline-lg text-headline-lg font-bold text-text-primary">
                {normalizationMode === 'tab'
                  ? `₹${(dynamicOffers[2].pricePerStrip / dynamicOffers[2].tabletsPerStrip).toFixed(2)}`
                  : `₹${dynamicOffers[2].pricePerStrip.toFixed(2)}`}
              </span>
              <div className="flex items-center justify-end gap-1">
                <span className="bg-status-warning-bg text-status-warning-text px-1 rounded font-code-tabular text-[10px] font-bold border border-status-warning-border">
                  VERIFIED
                </span>
                <p className="font-code-tabular text-[11px] text-text-muted">
                  ₹{(dynamicOffers[2].pricePerStrip / dynamicOffers[2].tabletsPerStrip).toFixed(2)}/tab
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-body-sm text-text-muted pt-1 border-t border-border-subtle/50">
            <span className="flex items-center gap-1 text-[12px] text-status-success-text font-medium">
              <span className="material-symbols-outlined text-[14px] text-secondary">bolt</span>
              Hyper-fast 25m dispatch
            </span>
            <button
              onClick={() => handleSelectOffer(dynamicOffers[2])}
              className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm font-semibold active:scale-95 transition-all border ${
                selectedOfferId === 'offer-wellness'
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-subtle text-primary border-border-subtle hover:bg-surface-container'
              }`}
            >
              {selectedOfferId === 'offer-wellness' ? 'Selected' : 'Select Option'}
            </button>
          </div>
        </div>
      </div>

      {/* NABL Compliance Transparency Banner */}
      <div className="px-space-base py-space-md">
        <div className="p-space-base rounded-xl bg-status-info-bg text-on-surface flex items-start gap-space-sm border border-status-info-border">
          <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
            gavel
          </span>
          <div className="text-body-sm leading-relaxed">
            <p className="font-semibold text-text-primary">Jan Aushadhi &amp; CDSCO Compliant Registry</p>
            <p className="text-text-muted text-[12px] mt-0.5">
              All vendor partners hold validated Form 20/21 wholesale distribution licenses. Active potency tests conducted at certified NABL laboratories.
            </p>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-space-base py-space-sm border-t border-border-subtle">
        <div className="max-w-screen-md mx-auto flex items-center justify-between gap-space-base">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-display-sm text-display-sm font-bold text-text-primary">
                ₹{selectedOffer.pricePerStrip.toFixed(2)}
              </span>
              <span className="text-[11px] font-label-sm px-1.5 py-0.5 rounded bg-status-success-bg text-status-success-text font-bold border border-status-success-border">
                {selectedOffer.isLowest ? '61% SAVED' : 'GENERIC VALUE'}
              </span>
            </div>
            <span className="font-code-tabular text-[11px] text-text-muted">
              {selectedOffer.pharmacyName} • {selectedOffer.deliveryTimeMins}m ETA
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              onClick={handleAddCurrentOffer}
              className={`flex-1 max-w-[200px] py-3 px-space-base rounded-xl font-headline-sm text-headline-sm font-bold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                isAddedAnimation
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-primary text-on-primary hover:bg-brand-deep'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isAddedAnimation ? 'check' : 'shopping_bag'}
              </span>
              <span>{isAddedAnimation ? 'Added to Cart!' : 'Add to Cart'}</span>
            </button>
            <button
              onClick={onNavigateToCart}
              className="py-3 px-3 rounded-xl bg-surface-subtle text-primary border border-border-subtle hover:bg-surface-container active:scale-95 transition-all flex items-center justify-center"
              title="View Cart"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
