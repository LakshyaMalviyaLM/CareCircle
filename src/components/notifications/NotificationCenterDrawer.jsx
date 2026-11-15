import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Calendar,
  Pill,
  Users2,
  HeartPulse,
  Volume2,
  VolumeX,
  ExternalLink,
  Clock
} from 'lucide-react';
import { useCare } from '../../context/CareContext';
import voiceService from '../../services/voiceService';

export default function NotificationCenterDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    preferredLanguage
  } = useCare();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'missed' | 'refill' | 'appointments' | 'activity'
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filter notifications based on tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'missed') {
      return (
        n.type === 'danger' ||
        (n.title && (n.title.toLowerCase().includes('miss') || n.title.toLowerCase().includes('skip')))
      );
    }
    if (activeTab === 'refill') {
      return (
        n.type === 'warning' ||
        n.type === 'refill' ||
        (n.title && n.title.toLowerCase().includes('refill'))
      );
    }
    if (activeTab === 'appointments') {
      return (
        n.type === 'info' &&
        (n.title && (n.title.toLowerCase().includes('visit') || n.title.toLowerCase().includes('appointment') || n.title.toLowerCase().includes('consultation')))
      );
    }
    if (activeTab === 'activity') {
      return (
        n.type === 'success' ||
        (n.title && (n.title.toLowerCase().includes('taken') || n.title.toLowerCase().includes('logged') || n.title.toLowerCase().includes('circle')))
      );
    }
    return true;
  });

  const handleNotificationClick = (item) => {
    markNotificationRead(item.id);

    // Speak notification if sound enabled
    if (soundEnabled) {
      voiceService.speak(item.title, { lang: preferredLanguage, rate: 0.9 });
    }

    // Auto-navigate if actionUrl or inferred from type
    if (item.actionUrl) {
      navigate(item.actionUrl);
      onClose();
    } else if (item.type === 'warning' || item.type === 'refill') {
      navigate('/medications');
      onClose();
    } else if (item.title && item.title.toLowerCase().includes('visit')) {
      navigate('/appointments');
      onClose();
    } else if (item.title && item.title.toLowerCase().includes('vitals')) {
      navigate('/vitals');
      onClose();
    }
  };

  const getIconForType = (item) => {
    const title = (item.title || '').toLowerCase();
    if (item.type === 'danger' || title.includes('miss') || title.includes('skip')) {
      return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    }
    if (item.type === 'warning' || item.type === 'refill' || title.includes('refill')) {
      return <Pill className="w-4 h-4 text-amber-600" />;
    }
    if (title.includes('visit') || title.includes('appointment') || title.includes('consultation')) {
      return <Calendar className="w-4 h-4 text-blue-600" />;
    }
    if (title.includes('vital')) {
      return <HeartPulse className="w-4 h-4 text-teal-600" />;
    }
    return <Users2 className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF3FC] text-[#142B4A] flex items-center justify-center relative">
                <Bell className="w-5 h-5 stroke-[2.2]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#142B4A]">Smart Notification Center</h2>
                <p className="text-xs text-slate-500">{unreadCount} unread health updates</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute voice announcements' : 'Enable voice announcements'}
                className="p-2 text-slate-400 hover:text-[#142B4A] rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#13A89E]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Live Surveillance Feed</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-[#13A89E] hover:text-[#0F8C83] font-bold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'missed', label: 'Missed' },
              { id: 'refill', label: 'Low-Stock' },
              { id: 'appointments', label: 'Visits' },
              { id: 'activity', label: 'Care Team' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#142B4A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-3 space-y-1">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">No Notifications</p>
                <p className="text-xs text-slate-400">Everything is up-to-date and within targets.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isUnread = !notif.read;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-start gap-3.5 hover:bg-slate-50 ${
                      isUnread
                        ? 'bg-blue-50/40 border border-blue-100/80 shadow-2xs'
                        : 'bg-white'
                    }`}
                  >
                    {/* Category Icon */}
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getIconForType(notif)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs ${
                            isUnread ? 'font-extrabold text-[#142B4A]' : 'font-semibold text-slate-700'
                          } truncate`}
                        >
                          {notif.title}
                        </h4>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#13A89E] shrink-0" />
                        )}
                      </div>

                      {notif.message && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {notif.time || 'Recently'}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[#13A89E] font-bold hover:underline flex items-center gap-0.5">
                            Open <ExternalLink className="w-2.5 h-2.5" />
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="text-slate-300 hover:text-rose-600 transition-colors p-0.5"
                            title="Dismiss notification"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Connected to CareCircle Realtime Synchronization Engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
