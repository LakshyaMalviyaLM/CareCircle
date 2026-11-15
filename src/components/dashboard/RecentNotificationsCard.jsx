import { useState } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Calendar,
  Pill,
  Users2,
  ExternalLink,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useCare } from '../../context/CareContext';
import { useNavigate } from 'react-router-dom';
import NotificationCenterDrawer from '../notifications/NotificationCenterDrawer';

export default function RecentNotificationsCard() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification
  } = useCare();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'refill':
        return <Pill className="w-4 h-4 text-amber-600" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'caregiver':
        return <Users2 className="w-4 h-4 text-teal-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#13A89E]" />;
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-rose-50 border-rose-200';
      case 'warning':
      case 'refill':
        return 'bg-amber-50 border-amber-200';
      case 'appointment':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-teal-50 border-teal-200';
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EAF3FC] text-[#142B4A] flex items-center justify-center">
                <Bell className="w-4 h-4 text-[#13A89E]" />
              </div>
              <h3 className="text-lg font-bold text-[#142B4A]">Smart Notifications & Alerts</h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white animate-pulse">
                  {unreadCount} New
                </span>
              ) : (
                <Badge variant="success" size="sm">
                  Up to Date
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Missed dose alerts, low stock warnings, and appointment reminders
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Mark All Read</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#142B4A] hover:bg-[#1E3E6B] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-100 mt-2">
          {notifications.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">All Caught Up!</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                No active notifications or clinical alerts for Eleanor Vance.
              </p>
            </div>
          ) : (
            notifications.slice(0, 4).map((notif) => (
              <div
                key={notif.id}
                className={`py-3 px-2 rounded-xl transition-colors flex items-start justify-between gap-3 ${
                  !notif.read ? 'bg-teal-50/40 hover:bg-teal-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getNotificationBg(
                      notif.type
                    )}`}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#142B4A] truncate">
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#13A89E] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notif.timestamp || 'Recent'}
                      </span>
                      {notif.actionUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            markNotificationRead(notif.id);
                            navigate(notif.actionUrl);
                          }}
                          className="font-bold text-[#13A89E] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Review</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dismiss action */}
                <button
                  type="button"
                  onClick={() => deleteNotification(notif.id)}
                  className="p-1 text-slate-300 hover:text-rose-500 rounded-md transition-colors cursor-pointer shrink-0"
                  title="Dismiss alert"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Notification Center Drawer */}
      <NotificationCenterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
