import React from 'react';
import { HOTLINK_IMAGES } from '../data/mockData';
import { ScreenTab } from '../types';

interface HeaderProps {
  currentTab: ScreenTab;
  onNavigate: (tab: ScreenTab) => void;
  onOpenAddressModal: () => void;
  onOpenSosModal?: () => void;
  onOpenNotifications?: () => void;
  onOpenArchitecture?: () => void;
  onOpenArchitectureModal?: () => void;
  unreadNotifications?: number;
  cartCount?: number;
  showToastMessage?: (msg: string) => void;
  currentAddress?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenAddressModal,
  onOpenSosModal,
  onOpenNotifications,
  onOpenArchitecture,
  onOpenArchitectureModal,
  unreadNotifications = 2,
  showToastMessage,
  currentAddress = '#402 Palm Grove, 12th Main Indiranagar, Bengaluru 560038',
}) => {
  const handleArchitecture = onOpenArchitecture || onOpenArchitectureModal || (() => {});
  const handleSos = onOpenSosModal || (() => {
    if (showToastMessage) {
      showToastMessage('Emergency SOS helpline: Calling 108 / 112 (Emergency Medical Response)...');
    }
  });
  const handleNotifications = onOpenNotifications || (() => {
    if (showToastMessage) {
      showToastMessage('You have 2 active prescription refills due this week.');
    }
  });

  const isDetailView = currentTab === 'medicine-detail' || (currentTab as string) === 'details';

  if (isDetailView) {
    return (
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-border-subtle">
        <div className="h-16 px-space-base flex items-center justify-between gap-space-sm max-w-screen-md mx-auto">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go Back"
              className="w-11 h-11 rounded-xl text-text-primary hover:bg-surface-subtle flex items-center justify-center shrink-0 transition-colors active:scale-95"
              onClick={() => onNavigate('compare')}
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <img
              alt="Brand logo"
              className="h-7 w-auto object-contain shrink-0 cursor-pointer"
              src={HOTLINK_IMAGES.brandLogo}
              onClick={() => onNavigate('compare')}
            />
            <h1 className="font-headline-sm text-headline-sm text-text-primary font-bold truncate ml-space-xs">
              Medicine Details
            </h1>
          </div>

          <div className="flex items-center gap-space-xs shrink-0">
            <button
              onClick={handleArchitecture}
              title="View Architecture & PRD Blueprint"
              className="px-2 py-1 rounded-md bg-surface-subtle text-text-secondary hover:text-primary text-[11px] font-code-tabular flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">schema</span>
              <span className="hidden sm:inline">SaaS Arch</span>
            </button>
            <button
              aria-label="Emergency Support"
              onClick={handleSos}
              className="w-10 h-10 rounded-xl bg-status-danger-bg text-status-danger-text hover:bg-red-100 flex items-center justify-center transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">e911_emergency</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-border-subtle">
      <div className="h-20 px-space-base flex flex-col justify-center gap-space-2xs max-w-screen-md mx-auto">
        <div className="flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0 flex-1">
            <img
              alt="Brand logo"
              className="h-8 w-auto object-contain shrink-0 cursor-pointer"
              src={HOTLINK_IMAGES.brandLogo}
              onClick={() => onNavigate('compare')}
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span
                  onClick={() => onNavigate('compare')}
                  className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold truncate cursor-pointer hover:opacity-90"
                >
                  GenericMed
                </span>
                <span className="font-label-sm text-label-sm px-space-xs py-space-2xs bg-status-success-bg text-status-success-text rounded">
                  OPS VERIFIED
                </span>
              </div>
              <div className="flex items-center gap-space-xs text-text-muted">
                <span className="material-symbols-outlined text-[14px] text-primary shrink-0">location_on</span>
                <button
                  onClick={onOpenAddressModal}
                  className="font-label-sm text-label-sm text-text-secondary hover:text-primary truncate flex items-center gap-space-2xs text-left"
                >
                  <span className="truncate">Deliver to: {currentAddress}</span>
                  <span className="material-symbols-outlined text-[14px]">expand_more</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-space-xs shrink-0">
            <button
              onClick={handleArchitecture}
              title="View Architecture & PRD Blueprint"
              className="px-2 py-1 rounded-md bg-surface-subtle text-text-secondary hover:text-primary text-[11px] font-code-tabular flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">schema</span>
              <span className="hidden sm:inline">SaaS Arch</span>
            </button>
            <button
              aria-label="Emergency Support"
              onClick={handleSos}
              className="h-10 min-w-[40px] px-space-xs rounded-xl bg-status-danger-bg text-status-danger-text flex items-center justify-center gap-space-2xs hover:bg-red-100 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">e911_emergency</span>
              <span className="font-label-sm text-label-sm hidden sm:inline font-bold">SOS</span>
            </button>
            <button
              aria-label="Notifications"
              onClick={handleNotifications}
              className="w-10 h-10 rounded-xl text-text-secondary hover:text-primary hover:bg-surface-subtle flex items-center justify-center relative transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 ml-space-2xs text-on-primary">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
