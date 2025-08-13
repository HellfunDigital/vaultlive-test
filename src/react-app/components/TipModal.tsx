import { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Zap } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';
import type { ExtendedMochaUser } from '@/shared/types';

interface TipModalProps {
  onClose: () => void;
}

export default function TipModal({ onClose }: TipModalProps) {
  const { user } = useAuth();
  const extendedUser = user as ExtendedMochaUser;
  const [amount, setAmount] = useState<number>(0);
  const [tipperName, setTipperName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    // Pre-fill user data if logged in
    if (extendedUser?.localUser) {
      setTipperName(extendedUser.localUser?.name || extendedUser.google_user_data.name || '');
      setEmail(extendedUser.email || '');
      setUserPoints(extendedUser.localUser?.points_balance || 0);
    }
  }, [extendedUser]);

  const predefinedAmounts = [5, 10, 25, 50, 100];
  
  // Points conversion: 1 dollar = 100 points
  const pointsCost = Math.ceil(amount * 100);
  const canUsePoints = userPoints >= pointsCost && pointsCost > 0;

  const handleStripeTip = async () => {
    if (!amount || !tipperName.trim()) {
      console.error('Amount and tipper name are required');
      return;
    }

    setIsProcessing(true);
    
    try {
      const tipData = {
        amount: amount,
        donor_name: tipperName,
        donor_email: email,
        message: message,
        is_anonymous: isAnonymous
      };
      
      console.log('Creating Stripe tip checkout...', tipData);
      
      const response = await fetch('/api/tips/create-stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tipData),
      });

      console.log('Stripe tip response:', {
        status: response.status,
        ok: response.ok,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Stripe tip checkout data:', data);
        if (data.checkout_url) {
          // Redirect to Stripe checkout
          window.location.href = data.checkout_url;
        } else {
          console.error('No checkout URL in response:', data);
          alert('Failed to create checkout session - no checkout URL');
        }
      } else {
        const error = await response.json();
        console.error('Stripe tip error response:', error);
        alert(error.error || 'Failed to create tip');
      }
    } catch (error) {
      console.error('Failed to tip:', error);
      alert('Failed to create tip');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePointsTip = async () => {
    if (!amount || !tipperName.trim()) {
      alert('Amount and tipper name are required');
      return;
    }

    if (!canUsePoints) {
      alert('Insufficient points balance');
      return;
    }

    setIsProcessing(true);
    
    try {
      const tipData = {
        amount: amount,
        donor_name: tipperName,
        donor_email: email,
        message: message,
        is_anonymous: isAnonymous,
        points_cost: pointsCost
      };
      
      const response = await fetch('/api/donations/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(tipData),
      });

      if (response.ok) {
        alert(`Thank you! Your tip of $${amount.toFixed(2)} has been processed using ${pointsCost} points!`);
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to process points tip');
      }
    } catch (error) {
      console.error('Failed to tip with points:', error);
      alert('Failed to process points tip');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
      <div className="bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Support Vaultkeeper</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-green-100 mt-2">
            Help support the stream and keep the content coming!
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={tipperName}
              onChange={(e) => setTipperName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your name"
              maxLength={100}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="your@email.com"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tip Amount ($) *
            </label>
            
            {/* Predefined amounts */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              {predefinedAmounts.map((presetAmount) => (
                <button
                  key={presetAmount}
                  type="button"
                  onClick={() => setAmount(presetAmount)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    amount === presetAmount
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  ${presetAmount}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter custom tip amount"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={3}
              placeholder="Leave a tip message for Vaultkeeper..."
              maxLength={500}
            />
            <div className="text-xs text-gray-400 mt-1">
              {message.length}/500 characters
            </div>
          </div>

          {/* Anonymous */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-300">
              Make this tip anonymous
            </label>
          </div>

          {/* Payment Method */}
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Payment Method</h4>
            
            {/* Card Payment Option */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-purple-300 font-medium">Pay with Card</span>
              </div>
              <button
                onClick={handleStripeTip}
                disabled={!amount || !tipperName.trim() || isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>
                  {isProcessing 
                    ? 'Processing...' 
                    : `Tip with Card - $${amount?.toFixed(2) || '0.00'}`
                  }
                </span>
              </button>
            </div>

            {/* Points Payment Option (if logged in) */}
            {extendedUser?.localUser && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-300 font-medium">Pay with Points</span>
                  <span className="text-gray-400 text-sm">({pointsCost} points required)</span>
                </div>
                <div className="mb-2">
                  <span className="text-gray-400 text-sm">Your points balance: </span>
                  <span className={`font-bold ${canUsePoints ? 'text-yellow-400' : 'text-red-400'}`}>
                    {userPoints} points
                  </span>
                  {!canUsePoints && pointsCost > 0 && (
                    <span className="text-red-400 ml-2 text-sm">
                      (Need {pointsCost - userPoints} more points)
                    </span>
                  )}
                </div>
                <button
                  onClick={handlePointsTip}
                  disabled={!amount || !tipperName.trim() || isProcessing || !canUsePoints}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>
                    {isProcessing 
                      ? 'Processing...' 
                      : `Tip with Points - ${pointsCost} points`
                    }
                  </span>
                </button>
              </div>
            )}

            {/* Alternative PayPal.me Link */}
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.83.83 0 0 0-.832-.832h-3.234l-.69 4.378h2.19c1.385 0 2.49-.542 3.09-1.81.6-1.268.476-2.436-.524-2.736z"/>
                </svg>
                <span className="text-blue-300 font-medium">Alternative: PayPal.me</span>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                You can also tip directly via PayPal:
              </p>
              <a
                href="https://paypal.me/VaultkeeperIRL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline font-medium"
              >
                paypal.me/VaultkeeperIRL
              </a>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Secure payment processing powered by Stripe. Tips help support the stream!
          </p>

          {/* Payment Info */}
          <div className="mt-4 p-4 bg-gray-900 rounded-lg">
            <h4 className="text-green-300 font-semibold text-sm mb-2">💳 Secure Payment</h4>
            <p className="text-green-200 text-xs">
              Your tip will be processed through Stripe, supporting major credit cards and digital wallets for secure transactions. You can also use PayPal.me for direct PayPal tips.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
