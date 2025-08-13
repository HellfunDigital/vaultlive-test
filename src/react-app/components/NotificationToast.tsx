import { useEffect, useState } from 'react';
import { X, Bell, DollarSign, Crown, Users, Star, Zap, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useNotifications, NotificationEvent } from '@/react-app/hooks/useNotifications';

interface NotificationToastProps {
  notification: NotificationEvent;
}

function NotificationToast({ notification }: NotificationToastProps) {
  const { dismissNotification } = useNotifications();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 5 seconds for non-persistent notifications
    if (!notification.persistent) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.persistent]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      dismissNotification(notification.id);
    }, 300); // Animation duration
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'donation':
        return <DollarSign className="w-5 h-5 text-green-400" />;
      case 'subscription':
        return <Crown className="w-5 h-5 text-purple-400" />;
      case 'follow':
        return <Users className="w-5 h-5 text-blue-400" />;
      case 'points_purchase':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'level_up':
        return <Star className="w-5 h-5 text-orange-400" />;
      case 'chat_mention':
        return <Bell className="w-5 h-5 text-cyan-400" />;
      case 'admin_alert':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'system':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'donation':
        return 'from-green-600/90 to-emerald-600/90';
      case 'subscription':
        return 'from-purple-600/90 to-violet-600/90';
      case 'follow':
        return 'from-blue-600/90 to-cyan-600/90';
      case 'points_purchase':
        return 'from-yellow-600/90 to-orange-600/90';
      case 'level_up':
        return 'from-orange-600/90 to-red-600/90';
      case 'chat_mention':
        return 'from-cyan-600/90 to-teal-600/90';
      case 'admin_alert':
        return 'from-red-600/90 to-pink-600/90';
      case 'error':
        return 'from-red-600/90 to-red-700/90';
      case 'success':
        return 'from-green-600/90 to-green-700/90';
      case 'system':
      default:
        return 'from-gray-700/90 to-gray-800/90';
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'donation':
        return 'border-green-400';
      case 'subscription':
        return 'border-purple-400';
      case 'follow':
        return 'border-blue-400';
      case 'points_purchase':
        return 'border-yellow-400';
      case 'level_up':
        return 'border-orange-400';
      case 'chat_mention':
        return 'border-cyan-400';
      case 'admin_alert':
        return 'border-red-400';
      case 'error':
        return 'border-red-400';
      case 'success':
        return 'border-green-400';
      case 'system':
      default:
        return 'border-gray-400';
    }
  };

  if (isExiting && !notification) return null;

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isExiting 
          ? 'translate-x-full opacity-0 scale-95' 
          : 'translate-x-0 opacity-100 scale-100'
        }
      `}
    >
      <div
        className={`
          relative max-w-sm w-full
          bg-gradient-to-r ${getBackgroundColor()}
          border-2 ${getBorderColor()}
          rounded-lg shadow-2xl
          backdrop-blur-sm
          overflow-hidden
        `}
      >
        {/* Animated border glow */}
        <div className={`absolute inset-0 rounded-lg border-2 border-white/20 animate-pulse`}></div>
        
        <div className="relative z-10 p-4">
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className="flex-shrink-0 p-1 bg-white/10 rounded-full backdrop-blur-sm">
              {getIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white truncate">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-white/90 mt-1 break-words">
                    {notification.message}
                  </p>
                  
                  {/* Additional data display */}
                  {notification.data?.amount && (
                    <div className="mt-2 text-lg font-bold text-white">
                      ${notification.data.amount.toFixed(2)}
                    </div>
                  )}
                  
                  {notification.data?.points && (
                    <div className="mt-2 text-lg font-bold text-yellow-200">
                      +{notification.data.points.toLocaleString()} points
                    </div>
                  )}

                  <div className="mt-2 text-xs text-white/70">
                    {notification.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 ml-3 p-1 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4 text-white/80" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar for auto-dismiss */}
        {!notification.persistent && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
            <div
              className="h-full bg-white/60 transition-all duration-[5000ms] ease-linear"
              style={{
                width: isExiting ? '0%' : '100%',
                animation: isExiting ? 'none' : 'shrink 5s linear forwards'
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

export default function NotificationToastContainer() {
  const { notifications } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationToast notification={notification} />
        </div>
      ))}
    </div>
  );
}
