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
  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    amount: '',
    message: '',
    is_anonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    // Pre-fill user data if logged in
    if (extendedUser?.localUser) {
      setFormData(prev => ({
        ...prev,
        donor_name: extendedUser.localUser?.name || extendedUser.google_user_data.name || '',
        donor_email: extendedUser.email || ''
      }));
      setUserPoints(extendedUser.localUser?.points_balance || 0);
    }
  }, [extendedUser]);

  const predefinedAmounts = [5, 10, 25, 50, 100];
  
  // Points conversion: 1 dollar = 100 points
  const pointsRequired = Math.ceil(parseFloat(formData.amount || '0') * 100);
  const canUsePoints = userPoints >= pointsRequired && pointsRequired > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const amount = parseFloat(formData.amount);
    if (!formData.donor_name.trim() || !amount || amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (usePoints) {
        // Use points for donation
        const response = await fetch('/api/donations/points', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...formData,
            amount,
            points_cost: pointsRequired,
          }),
        });

        if (response.ok) {
          // Points donation successful, close modal
          alert(`Thank you! Your donation of $${amount.toFixed(2)} has been processed using ${pointsRequired} points!`);
          onClose();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to process points donation');
        }
      } else {
        // Regular money donation flow
        const response = await fetch('/api/donations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            amount,
          }),
        });

        if (response.ok) {
          setShowPaymentOptions(true);
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to submit donation');
        }
      }
    } catch (error) {
      console.error('Failed to submit donation:', error);
      alert('Failed to submit donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createStripeCheckout = async () => {
    const amount = parseFloat(formData.amount);
    try {
      const response = await fetch('/api/donations/create-stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          donor_name: formData.donor_name,
          donor_email: formData.donor_email,
          message: formData.message,
          is_anonymous: formData.is_anonymous,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          alert('Failed to create checkout session');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create Stripe checkout');
      }
    } catch (error) {
      console.error('Failed to create Stripe checkout:', error);
      alert('Failed to create Stripe checkout. Please try again.');
    }
  };

  const createPayPalCheckout = async () => {
    const amount = parseFloat(formData.amount);
    try {
      const donationData = {
        amount,
        donor_name: formData.donor_name,
        donor_email: formData.donor_email,
        message: formData.message,
        is_anonymous: formData.is_anonymous,
      };
      
      console.log('Creating PayPal donation checkout...', donationData);

      const response = await fetch('/api/donations/create-paypal-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });

      console.log('PayPal donation response:', {
        status: response.status,
        ok: response.ok,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('PayPal donation checkout data:', data);
        if (data.approval_url) {
          window.location.href = data.approval_url;
        } else {
          console.error('No approval URL in response:', data);
          alert('Failed to create PayPal checkout session - no approval URL');
        }
      } else {
        const error = await response.json();
        console.error('PayPal donation error response:', error);
        alert(error.error || 'Failed to create PayPal checkout');
      }
    } catch (error) {
      console.error('Failed to create PayPal checkout:', error);
      alert('Failed to create PayPal checkout. Please try again.');
    }
  };

  if (showPaymentOptions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Complete Your Tip</h2>
            <p className="text-gray-300 mb-4">
              Amount: <span className="text-green-400 font-bold">${parseFloat(formData.amount).toFixed(2)}</span>
            </p>
            <p className="text-sm text-gray-400">
              Click below to complete your donation securely with Stripe
            </p>
          </div>

          {/* Payment Options */}
          <div className="space-y-3 mb-6">
            <button
              onClick={createStripeCheckout}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>Pay with Card (Stripe)</span>
            </button>
            
            <button
              onClick={createPayPalCheckout}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.83.83 0 0 0-.832-.832h-3.234l-.69 4.378h2.19c1.385 0 2.49-.542 3.09-1.81.6-1.268.476-2.436-.524-2.736z"/>
              </svg>
              <span>Pay with PayPal</span>
            </button>
          </div>

          {/* Close Button */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium transition-all duration-200"
            >
              Thank You! Close
            </button>
            
            <button
              onClick={() => setShowPaymentOptions(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
            >
              ← Back to Edit Tip
            </button>
          </div>

          {/* Secure Process Info */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-2">🔒 Secure Process:</h3>
            <ol className="text-xs text-gray-400 space-y-1">
              <li>1. Click "Pay with Card" above</li>
              <li>2. Complete the payment securely on Stripe</li>
              <li>3. Return here - your tip will be processed automatically</li>
              <li>4. Your message will appear in chat once verified!</li>
            </ol>
            <p className="text-xs text-gray-500 mt-2">
              All tips are processed securely through Stripe ✨
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={formData.donor_name}
              onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
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
              value={formData.donor_email}
              onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="your@email.com"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Donation Amount ($) *
            </label>
            
            {/* Predefined amounts */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              {predefinedAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    formData.amount === amount.toString()
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter custom amount"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message (optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={3}
              placeholder="Leave a message for Vaultkeeper..."
              maxLength={500}
            />
            <div className="text-xs text-gray-400 mt-1">
              {formData.message.length}/500 characters
            </div>
          </div>

          {/* Anonymous */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.is_anonymous}
              onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
              className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-300">
              Make this donation anonymous
            </label>
          </div>

          {/* Points Payment Option */}
          {extendedUser?.localUser && (
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Payment Method</h4>
              
              <div className="space-y-3">
                {/* Money Payment Option */}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="pay-money"
                    checked={!usePoints}
                    onChange={() => setUsePoints(false)}
                    className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 focus:ring-purple-500"
                  />
                  <label htmlFor="pay-money" className="text-sm text-gray-300 flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Pay with Card</span>
                  </label>
                </div>

                {/* Points Payment Option */}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="pay-points"
                    checked={usePoints}
                    onChange={() => setUsePoints(true)}
                    disabled={!canUsePoints}
                    className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 focus:ring-yellow-500 disabled:opacity-50"
                  />
                  <label htmlFor="pay-points" className={`text-sm flex items-center space-x-2 ${canUsePoints ? 'text-gray-300' : 'text-gray-500'}`}>
                    <Zap className="w-4 h-4" />
                    <span>Pay with Points ({pointsRequired} points required)</span>
                  </label>
                </div>

                {/* Points Balance Display */}
                <div className="ml-6 text-xs">
                  <span className="text-gray-400">Your points balance: </span>
                  <span className={`font-bold ${canUsePoints ? 'text-yellow-400' : 'text-red-400'}`}>
                    {userPoints} points
                  </span>
                  {!canUsePoints && pointsRequired > 0 && (
                    <span className="text-red-400 ml-2">
                      (Need {pointsRequired - userPoints} more points)
                    </span>
                  )}
                </div>

                {usePoints && canUsePoints && (
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm">
                      ✨ This donation will be processed instantly using your points!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 ${usePoints 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200`}
            >
              {isSubmitting 
                ? 'Processing...' 
                : usePoints 
                  ? `Donate with Points (${pointsRequired} pts)`
                  : 'Continue →'
              }
            </button>
          </div>
        </form>

        {/* Payment Methods Preview */}
        <div className="px-6 pb-6">
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-xs text-gray-400 text-center mb-2">
              Secure payments powered by:
            </p>
            <div className="flex justify-center space-x-4 text-xs text-purple-400 font-medium">
              <span>Stripe</span>
              <span>•</span>
              <span>PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
