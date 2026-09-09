import React, { useState, useEffect } from 'react';
import { ScreenTab, CartItem, ComparisonPair, PrescriptionRecord } from './types';
import { INITIAL_CART_ITEMS } from './data/mockData';
import { api, UserSession } from './services/api';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CompareScreen } from './components/CompareScreen';
import { MedicineDetailScreen } from './components/MedicineDetailScreen';
import { CartScreen } from './components/CartScreen';
import { OrderTrackingScreen } from './components/OrderTrackingScreen';
import { PrescriptionsScreen } from './components/PrescriptionsScreen';

// Modals
import { BioequivalenceModal } from './components/modals/BioequivalenceModal';
import { TaxInvoiceModal } from './components/modals/TaxInvoiceModal';
import { ScheduleH1Modal } from './components/modals/ScheduleH1Modal';
import { ChatPharmacistModal } from './components/modals/ChatPharmacistModal';
import { UploadPrescriptionModal } from './components/modals/UploadPrescriptionModal';
import { ArchitecturePRDModal } from './components/modals/ArchitecturePRDModal';
import { AddressModal } from './components/modals/AddressModal';
import { SosEmergencyModal } from './components/modals/SosEmergencyModal';
import { NotificationsModal, NotificationItem } from './components/modals/NotificationsModal';
import { AuthModal } from './components/modals/AuthModal';
import { CdscoAuditModal } from './components/modals/CdscoAuditModal';
import { PaymentGatewayModal } from './components/modals/PaymentGatewayModal';
import { DispensaryPortalModal } from './components/modals/DispensaryPortalModal';
import { AbhaSyncModal } from './components/modals/AbhaSyncModal';
import { CdscoSugamModal } from './components/modals/CdscoSugamModal';
import { OfflineBanner } from './components/OfflineBanner';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('compare');
  const [selectedMoleculeId, setSelectedMoleculeId] = useState<string>('comp-1');
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [currentAddress, setCurrentAddress] = useState<string>(
    '#402 Palm Grove, 12th Main Indiranagar, Bengaluru 560038'
  );

  // Authentication & RBAC User State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => api.getCurrentUser());

  // Prescriptions Vault State
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);

  // Phase 3 States: Payments, Batch Locking & Dispensary
  const [payableAmount, setPayableAmount] = useState<number>(100.0);
  const [activeOrderId, setActiveOrderId] = useState<string>('ORD-8921');

  // Modals state
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isH1ModalOpen, setIsH1ModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDispensaryModalOpen, setIsDispensaryModalOpen] = useState(false);
  const [isAbhaModalOpen, setIsAbhaModalOpen] = useState(false);
  const [isSugamModalOpen, setIsSugamModalOpen] = useState(false);

  // Initial Prescriptions Load
  useEffect(() => {
    api.getPrescriptions().then((data) => {
      setPrescriptions(data);
    });
  }, []);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Prescription Refill Scheduled',
      description: 'Your Metformin 500mg SR refill is due in 3 days. Generic bundle prepared.',
      time: '10 mins ago',
      type: 'refill',
      read: false,
      actionText: 'View Refill',
      actionTab: 'prescriptions',
    },
    {
      id: 'notif-2',
      title: 'Order Dispatched (Cold-Chain Verified)',
      description: 'Your courier has picked up Order #ORD-8921 with active temp sensor reading 4.8°C.',
      time: '45 mins ago',
      type: 'coldchain',
      read: false,
      actionText: 'Track Live',
      actionTab: 'orders',
    },
    {
      id: 'notif-3',
      title: 'Generic Subsidy Applied',
      description: 'You saved ₹332.00 on your recent Jan Aushadhi generic substitutions this month.',
      time: '2 hours ago',
      type: 'savings',
      read: true,
      actionText: 'See Savings',
      actionTab: 'compare',
    },
  ]);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToastMessage(message);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
    setToastTimer(timer);
  };

  // Register PWA Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('[PWA] Service worker registration skipped:', err);
      });
    }
  }, []);

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id || i.name === item.name);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleAddComparisonPairToCart = (pair: ComparisonPair) => {
    const item: CartItem = {
      id: `cart-pair-${pair.id}-${Date.now()}`,
      name: pair.genericName,
      category: 'GENERIC BIOEQUIVALENT',
      pharmacyName: pair.genericManufacturer,
      price: pair.genericPrice,
      mrp: pair.brandPrice,
      pricePerUnit: `₹${(pair.genericPrice / 10).toFixed(2)} / tab`,
      quantity: 1,
      packDetail: pair.genericPack,
      batchNumber: `Batch #${pair.formulaId}`,
      savingsAmount: pair.savingsRupees,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA0P1UtMCeQiNx2w-bcWeCUFFpzLF24iIe3Cp14GAZ5EB13ymClblYwtJWU7ByhbebjjxryBDdp4OmJXRHka7igtzWaMWtXv9me9YlSXChLWYZfW_-jsUyR8HjK1C0LGpXemLMNThRUpKBpKU7eVMukONcRCHPBm7Kf626g4YQgmyLof3wdsPQ611VG3SgU4zHJmczu85b5JETLuuRKe8vqJ9obmmoClxrwGcEvtgTr5P-8gwiWM459Ow',
    };
    handleAddToCart(item);
    showToast(`Swapped to ${pair.genericName} and added to cart! Saved ₹${pair.savingsRupees}`);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
    showToast('Updated cart item quantity');
  };

  const handleAddConvertedGenerics = (items: CartItem[]) => {
    setCartItems((prev) => [...prev, ...items]);
  };

  const handlePrescriptionUploaded = (newRx: PrescriptionRecord) => {
    setPrescriptions((prev) => [newRx, ...prev]);
  };

  const handleImportAbdmPrescription = (importedRx: PrescriptionRecord, newItems: CartItem[]) => {
    setPrescriptions((prev) => [importedRx, ...prev]);
    setCartItems((prev) => [...prev, ...newItems]);
    showToast(`Imported ${importedRx.clinic} e-prescription! ${newItems.length} generics added to cart.`);
  };

  const handleOpenPayment = (amount: number) => {
    setPayableAmount(amount);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (data: { orderId: string; amount: number; items: CartItem[] }) => {
    setActiveOrderId(data.orderId);
    showToast(`Payment captured! Order ${data.orderId} batch reserved.`);
    setCurrentTab('orders');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-surface-canvas text-text-primary flex flex-col antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* PWA Offline Network Banner */}
      <OfflineBanner />

      {/* Universal Header */}
      <Header
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenArchitecture={() => setIsArchModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenDispensaryPortal={() => setIsDispensaryModalOpen(true)}
        onOpenAbhaModal={() => setIsAbhaModalOpen(true)}
        onOpenSugamModal={() => setIsSugamModalOpen(true)}
        currentUser={currentUser}
        unreadNotifications={notifications.filter((n) => !n.read).length}
        cartCount={totalCartCount}
        showToastMessage={showToast}
        currentAddress={currentAddress}
      />

      {/* Main Body Canvas */}
      <main className="flex-1 w-full flex flex-col pt-24 max-w-screen-md mx-auto">
        {currentTab === 'compare' && (
          <CompareScreen
            onNavigate={setCurrentTab}
            onSelectMedicine={(id) => {
              setSelectedMoleculeId(id);
              setCurrentTab('medicine-detail');
            }}
            onAddToCart={handleAddComparisonPairToCart}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenBioModal={() => setIsBioModalOpen(true)}
            showToastMessage={showToast}
          />
        )}

        {(currentTab === 'medicine-detail' || (currentTab as string) === 'details') && (
          <MedicineDetailScreen
            selectedMoleculeId={selectedMoleculeId}
            onNavigateBack={() => setCurrentTab('compare')}
            onAddToCart={handleAddToCart}
            onOpenBioModal={() => setIsBioModalOpen(true)}
            showToastMessage={showToast}
            onNavigateToCart={() => setCurrentTab('cart')}
          />
        )}

        {currentTab === 'cart' && (
          <CartScreen
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onOpenAddressModal={() => setIsAddressModalOpen(true)}
            onNavigate={setCurrentTab}
            showToastMessage={showToast}
            onCheckoutSuccess={() => {}}
            onOpenPaymentGateway={handleOpenPayment}
            currentAddress={currentAddress}
          />
        )}

        {currentTab === 'orders' && (
          <OrderTrackingScreen
            orderId={activeOrderId}
            onOpenChatPharmacist={() => setIsChatModalOpen(true)}
            onOpenTaxInvoice={() => setIsInvoiceModalOpen(true)}
            onOpenScheduleH1={() => setIsH1ModalOpen(true)}
            showToastMessage={showToast}
          />
        )}

        {currentTab === 'prescriptions' && (
          <PrescriptionsScreen
            onOpenUpload={() => setIsUploadModalOpen(true)}
            showToastMessage={showToast}
            onSelectMedicine={(name) => {
              setSelectedMoleculeId(name);
              setCurrentTab('compare');
            }}
            onAddConvertedGenerics={handleAddConvertedGenerics}
            onNavigateToCart={() => setCurrentTab('cart')}
            onOpenAbhaModal={() => setIsAbhaModalOpen(true)}
            externalPrescriptions={prescriptions}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNavigate={setCurrentTab}
        cartCount={totalCartCount}
      />

      {/* Floating System Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce duration-300 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-surface-container-lowest/95 backdrop-blur-md shadow-lg border border-primary/20 text-text-primary text-body-sm flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              verified
            </span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <BioequivalenceModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
      />

      <TaxInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        orderId={activeOrderId}
      />

      <ScheduleH1Modal
        isOpen={isH1ModalOpen}
        onClose={() => setIsH1ModalOpen(false)}
      />

      <ChatPharmacistModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />

      <UploadPrescriptionModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddConvertedGenerics={handleAddConvertedGenerics}
        onPrescriptionUploaded={handlePrescriptionUploaded}
        showToastMessage={showToast}
      />

      <ArchitecturePRDModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelectAddress={setCurrentAddress}
        currentAddress={currentAddress}
      />

      <SosEmergencyModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        showToastMessage={showToast}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onActionClick={(tab) => {
          setCurrentTab(tab);
          setIsNotificationsModalOpen(false);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => setCurrentUser(user)}
        onLogout={() => {
          api.logout();
          setCurrentUser(null);
        }}
        showToastMessage={showToast}
      />

      <CdscoAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        showToastMessage={showToast}
      />

      {/* Phase 3 Modals */}
      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={payableAmount}
        cartItems={cartItems}
        onPaymentSuccess={handlePaymentSuccess}
        showToastMessage={showToast}
      />

      <DispensaryPortalModal
        isOpen={isDispensaryModalOpen}
        onClose={() => setIsDispensaryModalOpen(false)}
        showToastMessage={showToast}
      />

      {/* Phase 5 Modals */}
      <AbhaSyncModal
        isOpen={isAbhaModalOpen}
        onClose={() => setIsAbhaModalOpen(false)}
        onImportPrescription={handleImportAbdmPrescription}
        showToastMessage={showToast}
      />

      <CdscoSugamModal
        isOpen={isSugamModalOpen}
        onClose={() => setIsSugamModalOpen(false)}
        showToastMessage={showToast}
      />
    </div>
  );
}
