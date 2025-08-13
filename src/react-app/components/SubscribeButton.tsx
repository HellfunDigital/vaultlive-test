import { useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { Crown, Gift, Sparkles } from 'lucide-react';
import SubscriptionModal from './SubscriptionModal';
import GiftSubscriptionModal from './GiftSubscriptionModal';
import type { ExtendedMochaUser } from '@/shared/types';

export default function SubscribeButton() {
  const { user, redirectToLogin } = useAuth();
  const extendedUser = user as ExtendedMochaUser;
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [, setShowDropdown] = useState(false);

  // Check if user is subscribed (including admin lifetime subscription)
  const isSubscribed = extendedUser?.localUser?.is_subscriber || extendedUser?.localUser?.is_admin;

  

  const handleGiftClick = () => {
    if (!user) {
      redirectToLogin();
      return;
    }
    setShowGiftModal(true);
    setShowDropdown(false);
  };

  const handleButtonClick = () => {
    if (!user) {
      redirectToLogin();
      return;
    }

    if (isSubscribed) {
      // Show gift subscription modal for subscribed users
      setShowGiftModal(true);
    } else {
      // Go directly to subscription modal for non-subscribers
      setShowSubscriptionModal(true);
    }
  };

  if (isSubscribed) {
    return (
      <>
        <button
          onClick={handleButtonClick}
          className="relative bg-black border-2 border-white text-white px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm md:text-base font-bold rounded-lg hover:bg-gray-900 transition-all duration-200 transform hover:scale-105 glitch-container overflow-hidden group"
          data-text="DeadBeat"
        >
          <div className="flex items-center space-x-1 sm:space-x-2 relative z-10">
            <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="glitch" data-text="DeadBeat">DeadBeat</span>
            <Gift className="w-3 h-3 sm:w-4 sm:h-4 opacity-70" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {showGiftModal && (
          <GiftSubscriptionModal onClose={() => setShowGiftModal(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={handleButtonClick}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm md:text-base font-medium rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-1 sm:space-x-2"
        >
          <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Subscribe</span>
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>

        {/* Gift button for additional access */}
        <button
          onClick={handleGiftClick}
          className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white p-1 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
          title="Gift Subscription"
        >
          <Gift className="w-3 h-3" />
        </button>
      </div>

      {showSubscriptionModal && (
        <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}

      {showGiftModal && (
        <GiftSubscriptionModal onClose={() => setShowGiftModal(false)} />
      )}
    </>
  );
}
