import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Crown, Sparkles, Check, CreditCard } from 'lucide-react';

interface SubscriptionModalProps {
  onClose: () => void;
}

export default function SubscriptionModal({ onClose }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = {
    monthly: {
      name: 'Premium Monthly',
      price: 4.99,
      billing: 'monthly',
      savings: null,
    },
    yearly: {
      name: 'Premium Annual',
      price: 39.99,
      billing: 'yearly',
      savings: '33% off',
    },
  };

  const features = [
    'Custom emojis in chat',
    'Emoji shortcuts (:smile:, :fire:, etc.)',
    'Priority chat support',
    'Special subscriber badge',
    'Early access to new features',
    'Ad-free experience'
  ];

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/subscriptions/create-stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          plan_type: 'premium',
          amount: plans[selectedPlan].price,
          billing_cycle: plans[selectedPlan].billing,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkout_url) {
          // Redirect to Stripe checkout
          window.location.href = data.checkout_url;
        } else {
          alert('Failed to create checkout session');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('Failed to create subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      const subscriptionData = {
        plan_type: 'premium',
        amount: plans[selectedPlan].price,
        billing_cycle: plans[selectedPlan].billing,
      };
      
      console.log('Creating PayPal subscription checkout...', subscriptionData);
      
      const response = await fetch('/api/subscriptions/create-paypal-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subscriptionData),
      });

      console.log('PayPal subscription response:', {
        status: response.status,
        ok: response.ok,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('PayPal subscription checkout data:', data);
        if (data.approval_url) {
          // Redirect to PayPal checkout
          window.location.href = data.approval_url;
        } else {
          console.error('No approval URL in response:', data);
          alert('Failed to create PayPal checkout session - no approval URL');
        }
      } else {
        const error = await response.json();
        console.error('PayPal subscription error response:', error);
        alert(error.error || 'Failed to create PayPal subscription');
      }
    } catch (error) {
      console.error('Failed to create PayPal subscription:', error);
      alert('Failed to create PayPal subscription - network error');
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4" style={{ zIndex: 999999999, position: 'fixed' }}>
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Vaultkeeper.live Subscription</h2>
                <p className="text-purple-100">Unlock exclusive chat features</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Plan Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPlan === key
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setSelectedPlan(key as 'monthly' | 'yearly')}
              >
                {plan.savings && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {plan.savings}
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedPlan === key ? 'border-purple-500 bg-purple-500' : 'border-gray-400'
                  }`}>
                    {selectedPlan === key && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  ${plan.price}
                  <span className="text-sm text-gray-400 font-normal">
                    /{plan.billing === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {key === 'yearly' && (
                  <p className="text-sm text-green-400">
                    Save ${(4.99 * 12 - 39.99).toFixed(2)} per year
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Features List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
              Premium Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emoji Preview */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-white mb-2">Emoji Preview:</h4>
            <div className="text-2xl space-x-2">
              😊 😂 ❤️ 🔥 👍 👀 💀 🎉 🚀 💯 👏 🌈 ⭐ 💎
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Type :smile: :fire: :heart: and more in chat!
            </p>
          </div>

          {/* Subscribe Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>
                {isProcessing 
                  ? 'Processing...' 
                  : `Subscribe with Card - $${plans[selectedPlan].price}`
                }
              </span>
            </button>
            
            <button
              onClick={handlePayPalSubscribe}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.83.83 0 0 0-.832-.832h-3.234l-.69 4.378h2.19c1.385 0 2.49-.542 3.09-1.81.6-1.268.476-2.436-.524-2.736z"/>
              </svg>
              <span>
                {isProcessing 
                  ? 'Processing...' 
                  : `Subscribe with PayPal - $${plans[selectedPlan].price}`
                }
              </span>
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Secure payment processing powered by Stripe. Contact support to cancel if needed.
          </p>

          {/* Payment Info */}
          <div className="mt-4 p-4 bg-gray-900 rounded-lg">
            <h4 className="text-purple-300 font-semibold text-sm mb-2">💳 Secure Payment</h4>
            <p className="text-purple-200 text-xs">
              Your subscription will be processed through Stripe or PayPal. Both options support major credit cards, debit cards, and digital wallets for secure transactions.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
