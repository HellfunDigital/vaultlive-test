import { useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { LogIn, LogOut, DollarSign, Shield, User, Crown, Zap, Bell } from 'lucide-react';
import { Link } from 'react-router';
import PointsPurchaseModal from './PointsPurchaseModal';
import SubscribeButton from './SubscribeButton';
import NotificationSettings from './NotificationSettings';
import { useNotifications } from '@/react-app/hooks/useNotifications';
import type { ExtendedMochaUser } from '@/shared/types';

interface HeaderProps {
  onTip: () => void;
}

export default function Header({ onTip }: HeaderProps) {
  const { user, redirectToLogin, logout } = useAuth();
  const extendedUser = user as ExtendedMochaUser;
  const { settings } = useNotifications();
  const [showPointsPurchase, setShowPointsPurchase] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  return (
    <>
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
        {/* Tip Button */}
        <button
          onClick={onTip}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
        >
          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm md:text-base">Tip</span>
        </button>

        {/* Subscribe Button */}
        <SubscribeButton />

        {/* Notification Settings Button - Only show for logged in users */}
        {user && (
          <button
            onClick={() => setShowNotificationSettings(true)}
            className={`flex items-center justify-center px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              settings.audioEnabled || settings.browserNotificationsEnabled
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title="Notification Settings"
          >
            <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        )}

        {user ? (
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            {/* Admin Link */}
            {extendedUser.localUser?.is_admin && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* Moderator Link - Show for all moderators (including admins who are also mods) */}
            {extendedUser.localUser?.is_moderator && (
              <Link
                to="/moderator"
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Mod</span>
              </Link>
            )}

            {/* Buy Points Button */}
            <button
              onClick={() => setShowPointsPurchase(true)}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
              title="Buy Points"
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">Buy Points</span>
              <span className="md:hidden">{extendedUser.localUser?.points_balance || 0}</span>
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Link
                to="/profile"
                className="flex items-center space-x-1 sm:space-x-2 hover:bg-gray-700 rounded-lg p-1 transition-colors"
                title="View Profile"
              >
                {user.google_user_data.picture ? (
                  <img
                    src={user.google_user_data.picture}
                    alt={user.google_user_data.name || user.email}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-purple-500"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                )}
                <span className="text-xs sm:text-sm text-gray-300 hidden md:inline max-w-20 sm:max-w-32 truncate">
                  {user.google_user_data.name || user.email}
                </span>
                {extendedUser.localUser?.is_subscriber && (
                  <div title="Premium Subscriber" className="flex items-center">
                    <Crown className="w-2 h-2 sm:w-3 sm:h-3 text-purple-400" />
                  </div>
                )}
              </Link>
            </div>

            {/* Referrals */}
            <Link
              to="/referrals"
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              title="Invite Friends"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden lg:inline">Referrals</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => redirectToLogin()}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm md:text-base">Login</span>
          </button>
        )}
      </div>

      {/* Points Purchase Modal */}
      {showPointsPurchase && (
        <PointsPurchaseModal
          onClose={() => setShowPointsPurchase(false)}
        />
      )}

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <NotificationSettings
          onClose={() => setShowNotificationSettings(false)}
        />
      )}
    </>
  );
}
