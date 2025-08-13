import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Zap, CreditCard, Check } from 'lucide-react';

interface PointsPurchaseModalProps {
  onClose: () => void;
}

interface PointsPackage {
  id: string;
  points: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

export default function PointsPurchaseModal({ onClose }: PointsPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('package_100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const pointsPackages: PointsPackage[] = [
    {
      id: 'package_100',
      points: 100,
      price: 0.99,
    },
    {
      id: 'package_500',
      points: 500,
      price: 4.99,
      bonus: 50,
    },
    {
      id: 'package_1000',
      points: 1000,
      price: 9.99,
      bonus: 150,
      popular: true,
    },
    {
      id: 'package_2500',
      points: 2500,
      price: 19.99,
      bonus: 500,
    },
    {
      id: 'package_5000',
      points: 5000,
      price: 39.99,
      bonus: 1200,
    },
  ];

  const selectedPkg = pointsPackages.find(pkg => pkg.id === selectedPackage);

  const handlePurchaseClick = () => {
    setShowPaymentOptions(true);
  };

  const handlePayPalPurchaseClick = async () => {
    if (!selectedPkg) return;
    
    setIsProcessing(true);
    try {
      const totalPoints = selectedPkg.points + (selectedPkg.bonus || 0);
      const requestData = {
        package_id: selectedPkg.id,
        points: totalPoints,
        price: selectedPkg.price,
      };

      console.log('Creating PayPal checkout for points...', requestData);

      const response = await fetch('/api/points/create-paypal-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      console.log('PayPal checkout response:', {
        status: response.status,
        ok: response.ok,
      });

      const responseData = await response.json();
      console.log('PayPal checkout data:', responseData);

      if (response.ok && responseData.success) {
        if (responseData.approval_url) {
          window.location.href = responseData.approval_url;
        } else {
          console.error('No approval URL in response:', responseData);
          alert('Failed to get PayPal checkout URL - no approval URL');
        }
      } else {
        console.error('PayPal checkout error response:', responseData);
        alert(responseData.error || 'Failed to create PayPal checkout');
      }
    } catch (error) {
      console.error('Failed to create PayPal checkout:', error);
      alert('Network error occurred while creating PayPal checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const createStripeCheckout = async () => {
    if (!selectedPkg) return;
    
    setIsProcessing(true);
    try {
      const totalPoints = selectedPkg.points + (selectedPkg.bonus || 0);
      const requestData = {
        package_id: selectedPkg.id,
        points: totalPoints,
        price: selectedPkg.price,
      };

      const response = await fetch('/api/points/create-stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        if (responseData.checkout_url) {
          window.location.href = responseData.checkout_url;
        } else {
          alert('Failed to get Stripe checkout URL');
        }
      } else {
        alert(responseData.error || 'Failed to create Stripe checkout');
      }
    } catch (error) {
      console.error('Failed to create Stripe checkout:', error);
      alert('Network error occurred while creating checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const createPayPalCheckout = async () => {
    if (!selectedPkg) return;
    
    setIsProcessing(true);
    try {
      const totalPoints = selectedPkg.points + (selectedPkg.bonus || 0);
      const requestData = {
        package_id: selectedPkg.id,
        points: totalPoints,
        price: selectedPkg.price,
      };

      const response = await fetch('/api/points/create-paypal-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        if (responseData.approval_url) {
          window.location.href = responseData.approval_url;
        } else {
          alert('Failed to get PayPal checkout URL');
        }
      } else {
        alert(responseData.error || 'Failed to create PayPal checkout');
      }
    } catch (error) {
      console.error('Failed to create PayPal checkout:', error);
      alert('Network error occurred while creating PayPal checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showPaymentOptions && selectedPkg) {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Purchase Points</h2>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="text-yellow-400 font-bold text-lg">
                {selectedPkg.points + (selectedPkg.bonus || 0)} Points
              </div>
              {selectedPkg.bonus && (
                <div className="text-green-400 text-sm">
                  {selectedPkg.points} + {selectedPkg.bonus} bonus!
                </div>
              )}
              <div className="text-white text-xl font-bold mt-2">${selectedPkg.price}</div>
            </div>
            <p className="text-sm text-gray-400">
              Complete your purchase with secure card payment
            </p>
          </div>

          {/* Payment Options */}
          <div className="space-y-3 mb-6">
            <button
              onClick={createStripeCheckout}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>Pay with Card (Stripe)</span>
            </button>
            
            <button
              onClick={createPayPalCheckout}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.83.83 0 0 0-.832-.832h-3.234l-.69 4.378h2.19c1.385 0 2.49-.542 3.09-1.81.6-1.268.476-2.436-.524-2.736z"/>
              </svg>
              <span>Pay with PayPal</span>
            </button>
          </div>

          {/* Close Buttons */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-all duration-200"
            >
              Close
            </button>
            
            <button
              onClick={() => setShowPaymentOptions(false)}
              disabled={isProcessing}
              className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors"
            >
              ← Back to Packages
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-xs text-gray-400 text-center mb-2">
              💡 Points are added instantly after payment
            </p>
            <p className="text-xs text-gray-500 text-center">
              Secure payment processing • Points never expire
            </p>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Buy Points</h2>
                <p className="text-yellow-100">Get points to spend on chat effects and features!</p>
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
          {/* Package Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {pointsPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPackage === pkg.id
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                } ${pkg.popular ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPackage === pkg.id ? 'border-yellow-500 bg-yellow-500' : 'border-gray-400'
                    }`}>
                      {selectedPackage === pkg.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {pkg.points.toLocaleString()}
                    {pkg.bonus && (
                      <span className="text-green-400 text-lg">
                        +{pkg.bonus}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-3">Points</div>
                  
                  {pkg.bonus && (
                    <div className="text-green-400 text-sm font-medium mb-3">
                      {pkg.bonus} Bonus Points!
                    </div>
                  )}
                  
                  <div className="text-2xl font-bold text-white mb-2">
                    ${pkg.price}
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    ${(pkg.price / (pkg.points + (pkg.bonus || 0)) * 100).toFixed(1)} per 100 points
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* What You Can Do with Points */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>What Can You Do with Points?</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Highlight Message (25 pts)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Rainbow Message (50 pts)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Priority Message (75 pts)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Name Glow Effect (80 pts)</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Temp VIP Badge (100 pts)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Song Request (150 pts)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Shoutout Request (200 pts)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Donate with Points (100 pts = $1)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Free Ways to Earn Points */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h4 className="text-white font-semibold mb-2 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Free Ways to Earn Points</span>
            </h4>
            <div className="text-gray-300 text-sm space-y-1">
              <p>• Chat actively (+1 point per message)</p>
              <p>• Watch the stream continuously (+5 points per hour)</p>
              <p>• Participate in community events (+50-100 points)</p>
              <p>• Invite friends who join (+20 points per referral)</p>
            </div>
          </div>

          {/* Purchase Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePurchaseClick}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>
                Purchase {selectedPkg ? `${(selectedPkg.points + (selectedPkg.bonus || 0)).toLocaleString()} Points for $${selectedPkg.price}` : 'Points'} with Card
              </span>
            </button>
            
            <button
              onClick={handlePayPalPurchaseClick}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.83.83 0 0 0-.832-.832h-3.234l-.69 4.378h2.19c1.385 0 2.49-.542 3.09-1.81.6-1.268.476-2.436-.524-2.736z"/>
              </svg>
              <span>
                Purchase {selectedPkg ? `${(selectedPkg.points + (selectedPkg.bonus || 0)).toLocaleString()} Points for $${selectedPkg.price}` : 'Points'} with PayPal
              </span>
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Secure payment processing via Stripe & PayPal • Points are added instantly • No expiration
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
