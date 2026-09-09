import React from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'order' | 'coldchain' | 'refill' | 'savings';
  read: boolean;
  actionText?: string;
  actionTab?: 'compare' | 'cart' | 'orders' | 'prescriptions';
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onActionClick: (tab: 'compare' | 'cart' | 'orders' | 'prescriptions') => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onActionClick,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return { icon: 'electric_bolt', color: 'bg-primary/10 text-primary' };
      case 'coldchain':
        return { icon: 'ac_unit', color: 'bg-blue-100 text-blue-700' };
      case 'refill':
        return { icon: 'pill', color: 'bg-amber-100 text-amber-800' };
      case 'savings':
        return { icon: 'savings', color: 'bg-status-success-bg text-status-success-text' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 animate-fadeIn">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose}></div>

      <div className="relative w-full sm:max-w-md bg-surface-card h-full sm:h-auto sm:max-h-[85vh] sm:rounded-2xl shadow-2xl z-10 border border-border-subtle flex flex-col mt-0 sm:mt-16 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-container-lowest">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">notifications</span>
            <h3 className="font-headline-sm font-bold text-text-primary">
              Live Notifications
            </h3>
            {notifications.some((n) => !n.read) && (
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-code-tabular text-[11px] font-bold">
                {notifications.filter((n) => !n.read).length} New
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[12px] text-primary font-medium hover:underline px-2 py-1"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 bg-surface-canvas">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-text-muted flex flex-col items-center">
              <span className="material-symbols-outlined text-[36px] mb-2 opacity-50">
                notifications_off
              </span>
              <p className="font-body-md">No current notifications</p>
            </div>
          ) : (
            notifications.map((item) => {
              const { icon, color } = getIcon(item.type);
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                    item.read
                      ? 'bg-surface-card border-border-subtle opacity-90'
                      : 'bg-surface-container-lowest border-primary/30 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md font-bold text-text-primary truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-text-muted font-code-tabular shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[12px] text-text-secondary mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {item.actionText && item.actionTab && (
                    <div className="flex justify-end pt-1 border-t border-border-subtle/40">
                      <button
                        onClick={() => {
                          if (item.actionTab) {
                            onActionClick(item.actionTab);
                            onClose();
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-surface-subtle text-primary hover:bg-surface-container text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <span>{item.actionText}</span>
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
