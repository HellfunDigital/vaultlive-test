import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Crown, Gift, Check, User, Search } from 'lucide-react';

interface GiftSubscriptionModalProps {
  onClose: () => void;
  prefilledUsername?: string;
}

export default function GiftSubscriptionModal({ onClose, prefilledUsername }: GiftSubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [recipientUsername, setRecipientUsername] = useState(prefilledUsername || '');
  const [recipients, setRecipients] = useState<Array<{id: number, name: string, picture?: string}>>([]);
  const [quantity, setQuantity] = useState(1);
  const [giftMessage, setGiftMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const plans = {
    monthly: {
      name: 'Premium Monthly Gift',
      price: 4.99,
      billing: 'monthly',
      savings: null,
    },
    yearly: {
      name: 'Premium Annual Gift',
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

  // Search for users as the user types
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const users = await response.json();
        setSearchResults(users.slice(0, 10)); // Limit to 10 results
        setShowResults(true);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle username input change
  const handleUsernameChange = (value: string) => {
    setRecipientUsername(value);
    searchUsers(value);
  };

  // Select a user from search results
  const selectUser = (user: any) => {
    // Check if user is already in recipients list
    if (!recipients.find(r => r.id === user.id)) {
      setRecipients(prev => [...prev, {
        id: user.id,
        name: user.name,
        picture: user.picture
      }]);
    }
    setRecipientUsername('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Remove a recipient
  const removeRecipient = (userId: number) => {
    setRecipients(prev => prev.filter(r => r.id !== userId));
  };

  // Use effect to handle search debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (recipientUsername.length >= 2) {
        searchUsers(recipientUsername);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [recipientUsername]);

  const handleGiftSubscription = async () => {
    if (recipients.length === 0 && !recipientUsername.trim()) {
      alert('Please select at least one recipient or leave empty for community gift');
      return;
    }

    if (quantity < 1 || quantity > 100) {
      alert('Quantity must be between 1 and 100');
      return;
    }

    setIsProcessing(true);
    
    try {
      const totalAmount = plans[selectedPlan].price * quantity;
      
      const response = await fetch('/api/subscriptions/create-gift-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          plan_type: 'premium',
          amount: totalAmount,
          billing_cycle: plans[selectedPlan].billing,
          recipients: recipients,
          quantity: quantity,
          gift_message: giftMessage.trim() || null,
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
        alert(error.error || 'Failed to create gift subscription');
      }
    } catch (error) {
      console.error('Failed to create gift subscription:', error);
      alert('Failed to create gift subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalGiftSubscription = async () => {
    if (recipients.length === 0 && !recipientUsername.trim()) {
      alert('Please select at least one recipient or leave empty for community gift');
      return;
    }

    if (quantity < 1 || quantity > 100) {
      alert('Quantity must be between 1 and 100');
      return;
    }

    setIsProcessing(true);
    
    try {
      const totalAmount = plans[selectedPlan].price * quantity;
      
      const response = await fetch('/api/subscriptions/create-paypal-gift-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          plan_type: 'premium',
          amount: totalAmount,
          billing_cycle: plans[selectedPlan].billing,
          recipients: recipients,
          quantity: quantity,
          gift_message: giftMessage.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.approval_url) {
          // Redirect to PayPal checkout
          window.location.href = data.approval_url;
        } else {
          alert('Failed to create PayPal checkout session');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create PayPal gift subscription');
      }
    } catch (error) {
      console.error('Failed to create PayPal gift subscription:', error);
      alert('Failed to create PayPal gift subscription');
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
              <Gift className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Gift Vaultkeeper.live Subscription</h2>
                <p className="text-purple-100">Share the premium experience with a friend</p>
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
          {/* Recipient Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-400" />
              Gift Recipient
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipients (leave empty for community gift)
                </label>
                
                {/* Selected Recipients */}
                {recipients.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {recipients.map((recipient) => (
                      <div key={recipient.id} className="flex items-center bg-purple-600/20 border border-purple-500/50 rounded-lg px-3 py-1">
                        {recipient.picture ? (
                          <img src={recipient.picture} alt="" className="w-4 h-4 rounded-full mr-2" />
                        ) : (
                          <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
                        )}
                        <span className="text-white text-sm">{recipient.name}</span>
                        <button
                          onClick={() => removeRecipient(recipient.id)}
                          className="ml-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="relative">
                  <input
                    type="text"
                    value={recipientUsername}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="Search to add more recipients..."
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                    maxLength={50}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {isSearching ? (
                      <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                    ) : (
                      <Search className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => selectUser(user)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center space-x-3 transition-colors"
                      >
                        {user.picture ? (
                          <img src={user.picture} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
                        )}
                        <div className="flex-1">
                          <div className="text-white font-medium">{user.name}</div>
                          {user.is_subscriber && (
                            <div className="text-xs text-purple-400 flex items-center">
                              <Crown className="w-3 h-3 mr-1" />
                              Current Subscriber
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {showResults && searchResults.length === 0 && recipientUsername.length >= 2 && !isSearching && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg p-3">
                    <div className="text-gray-400 text-sm">No users found matching "{recipientUsername}"</div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gift Message (Optional)
                </label>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Add a personal message with your gift..."
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {giftMessage.length}/200 characters
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Number of Subscriptions</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Cost
                </label>
                <div className="bg-gray-700 rounded-lg px-4 py-3 text-white font-semibold">
                  ${(plans[selectedPlan].price * quantity).toFixed(2)}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {recipients.length > 0 
                ? `${recipients.length} specific recipient(s) selected. Extra subscriptions will be distributed to the community.`
                : "All subscriptions will be distributed to the community (extending existing subscriptions or creating new ones)."
              }
            </p>
          </div>

          {/* Plan Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Select Gift Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <h4 className="font-semibold text-white">{plan.name}</h4>
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
          </div>

          {/* Features List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Crown className="w-5 h-5 mr-2 text-purple-400" />
              Premium Features (What They'll Get)
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

          {/* Gift Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGiftSubscription}
              disabled={isProcessing || quantity < 1}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Gift className="w-5 h-5" />
              <span>
                {isProcessing 
                  ? 'Processing...' 
                  : `Gift with Card - $${(plans[selectedPlan].price * quantity).toFixed(2)}`
                }
              </span>
            </button>
            
            <button
              onClick={handlePayPalGiftSubscription}
              disabled={isProcessing || quantity < 1}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.83.83 0 0 0-.832-.832h-3.234l-.69 4.378h2.19c1.385 0 2.49-.542 3.09-1.81.6-1.268.476-2.436-.524-2.736z"/>
              </svg>
              <span>
                {isProcessing 
                  ? 'Processing...' 
                  : `Gift with PayPal - $${(plans[selectedPlan].price * quantity).toFixed(2)}`
                }
              </span>
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Recipients will be notified of your gift and can start using premium features immediately. Secure payment via Stripe or PayPal.
          </p>

          {/* Gift Info */}
          <div className="mt-4 p-4 bg-gray-900 rounded-lg">
            <h4 className="text-purple-300 font-semibold text-sm mb-2">🎁 How Multi-Gifting Works</h4>
            <div className="text-purple-200 text-xs space-y-1">
              <p>• Selected recipients receive premium access immediately after payment</p>
              <p>• Extra subscriptions automatically go to the community pool</p>
              <p>• Community subscriptions extend existing subscriptions or create new ones</p>
              <p>• All recipients see special notifications about your generosity</p>
              <p>• Your gift message is shared with all recipients</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
