import React, { useState } from 'react';
import { ScreenTab, CartItem, ComparisonPair } from './types';
import { INITIAL_CART_ITEMS } from './data/mockData';
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('compare');
  const [selectedMoleculeId, setSelectedMoleculeId] = useState<string>('comp-1');
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [currentAddress, setCurrentAddress] = useState<string>(
    '#402 Palm Grove, 12th Main Indiranagar, Bengaluru 560038'
  );

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

  const handleCheckoutSuccess = () => {
    // Keep items for tracking reference
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-surface-canvas text-text-primary flex flex-col antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Universal Header */}
      <Header
        currentTab={currentTab}
        cartCount={totalCartCount}
        onNavigate={setCurrentTab}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
        onOpenArchitecture={() => setIsArchModalOpen(true)}
        onOpenArchitectureModal={() => setIsArchModalOpen(true)}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        unreadNotifications={notifications.filter((n) => !n.read).length}
        showToastMessage={showToast}
        currentAddress={currentAddress}
      />

      {/* Main View Port Container */}
      <main className="flex-1 w-full pt-2">
        {currentTab === 'compare' && (
          <CompareScreen
            onNavigate={setCurrentTab}
            onSelectMoleculeDetail={(idOrName) => {
              setSelectedMoleculeId(idOrName);
              setCurrentTab('medicine-detail');
            }}
            onSelectMedicine={(idOrName) => {
              setSelectedMoleculeId(idOrName);
              setCurrentTab('medicine-detail');
            }}
            onAddToCart={handleAddComparisonPairToCart}
            onOpenUploadPrescription={() => setIsUploadModalOpen(true)}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenLabVerification={() => setIsBioModalOpen(true)}
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
            onCheckoutSuccess={handleCheckoutSuccess}
            currentAddress={currentAddress}
          />
        )}

        {currentTab === 'orders' && (
          <OrderTrackingScreen
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
    </div>
  );
}
