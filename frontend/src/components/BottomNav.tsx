import React from 'react';
import { ScreenTab } from '../types';

interface BottomNavProps {
  currentTab: ScreenTab;
  onSelectTab?: (tab: ScreenTab) => void;
  onNavigate?: (tab: ScreenTab) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, onNavigate, cartCount }) => {
  const handleTab = onSelectTab || onNavigate || (() => {});
  const isCompareActive =
    currentTab === 'compare' || currentTab === 'medicine-detail' || (currentTab as string) === 'details';

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(15,23,42,0.05)] border-t border-border-subtle">
      <div className="h-16 px-space-sm flex items-center justify-around max-w-screen-md mx-auto">
        <button
          onClick={() => handleTab('compare')}
          className={`flex-1 h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-150 ${
            isCompareActive
              ? 'text-primary font-semibold bg-status-info-bg'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">manage_search</span>
          <span className="font-label-sm text-label-sm mt-space-2xs">Compare</span>
        </button>

        <button
          onClick={() => handleTab('prescriptions')}
          className={`flex-1 h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-150 ${
            currentTab === 'prescriptions'
              ? 'text-primary font-semibold bg-status-info-bg'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          <span className="font-label-sm text-label-sm mt-space-2xs">Prescriptions</span>
        </button>

        <button
          onClick={() => handleTab('cart')}
          className={`flex-1 h-12 flex flex-col items-center justify-center rounded-xl relative transition-all duration-150 ${
            currentTab === 'cart'
              ? 'text-primary font-semibold bg-status-info-bg'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <div className="relative">
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[16px] h-4 rounded-full bg-primary text-on-primary font-code-tabular text-[10px] leading-none flex items-center justify-center font-bold shadow-sm">
                {cartCount}
              </span>
            )}
          </div>
          <span className="font-label-sm text-label-sm mt-space-2xs">Cart</span>
        </button>

        <button
          onClick={() => handleTab('orders')}
          className={`flex-1 h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-150 ${
            currentTab === 'orders'
              ? 'text-primary font-semibold bg-status-info-bg'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">local_shipping</span>
          <span className="font-label-sm text-label-sm mt-space-2xs">Orders</span>
        </button>
      </div>
    </nav>
  );
};
