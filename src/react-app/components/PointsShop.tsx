import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { X, Zap, Crown, Sparkles, MessageCircle, Gift, ShoppingCart, Check } from 'lucide-react';


interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  category: 'chat' | 'cosmetic' | 'special';
  available: boolean;
  cooldown?: number; // minutes
}

interface PointsShopProps {
  onClose: () => void;
}

export default function PointsShop({ onClose }: PointsShopProps) {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'chat' | 'cosmetic' | 'special'>('chat');

  const shopItems: ShopItem[] = [
    // Chat Items
    {
      id: 'highlight_message',
      name: 'Highlight Message',
      description: 'Make your next message stand out with a golden glow',
      cost: 25,
      icon: <Sparkles className="w-5 h-5" />,
      category: 'chat',
      available: true,
      cooldown: 5
    },
    {
      id: 'rainbow_message',
      name: 'Rainbow Message',
      description: 'Send a message with rainbow animated text colors',
      cost: 50,
      icon: <MessageCircle className="w-5 h-5" />,
      category: 'chat',
      available: true,
      cooldown: 10
    },
    {
      id: 'priority_message',
      name: 'Priority Message',
      description: 'Pin your message to the top of chat for 30 seconds',
      cost: 75,
      icon: <Crown className="w-5 h-5" />,
      category: 'chat',
      available: true,
      cooldown: 15
    },
    
    // Cosmetic Items
    {
      id: 'name_glow',
      name: 'Name Glow Effect',
      description: 'Add a glowing effect to your username for 30 minutes',
      cost: 80,
      icon: <Sparkles className="w-5 h-5" />,
      category: 'cosmetic',
      available: true,
      cooldown: 45
    },
    {
      id: 'temp_badge',
      name: 'Temp VIP Badge',
      description: 'Show a VIP badge next to your name for 1 hour',
      cost: 100,
      icon: <Crown className="w-5 h-5" />,
      category: 'cosmetic',
      available: true,
      cooldown: 60
    },
    
    // Special Items
    {
      id: 'song_request',
      name: 'Song Request',
      description: 'Request a song to be played on stream (subject to approval)',
      cost: 150,
      icon: <Gift className="w-5 h-5" />,
      category: 'special',
      available: true,
      cooldown: 60
    },
    {
      id: 'shoutout_request',
      name: 'Shoutout Request',
      description: 'Request a shoutout for yourself or a friend (subject to approval)',
      cost: 200,
      icon: <Gift className="w-5 h-5" />,
      category: 'special',
      available: true,
      cooldown: 120
    },
  ];

  const fetchUserPoints = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch('/api/users/me', {
        credentials: 'include',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const userData = await response.json();
        setUserPoints(userData.localUser?.points_balance || 0);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch user points:', error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserPoints();
    }
  }, [user]);

  const purchaseItem = async (item: ShopItem) => {
    if (isLoading || userPoints < item.cost) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/points-shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          item_id: item.id,
          cost: item.cost
        }),
      });

      if (response.ok) {
        await response.json();
        setUserPoints(prev => prev - item.cost);
        setPurchaseSuccess(item.name);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setPurchaseSuccess(null);
        }, 3000);

        // If it's a chat effect, show instructions
        if (item.category === 'chat') {
          alert(`${item.name} purchased! Your next message will have this effect applied automatically.`);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to purchase item');
      }
    } catch (error) {
      console.error('Failed to purchase item:', error);
      alert('Failed to purchase item');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = shopItems.filter(item => item.category === activeCategory);

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-gray-300 mb-6">You need to be logged in to access the Points Shop</p>
          <button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Points Shop</h2>
                <p className="text-yellow-100">Spend your earned points on awesome rewards!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Points Balance */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-200" />
              <span className="text-white font-medium">Your Points:</span>
              <span className="text-2xl font-bold text-white">{userPoints.toLocaleString()}</span>
            </div>
            {purchaseSuccess && (
              <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500 rounded-lg px-3 py-1">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm">{purchaseSuccess} purchased!</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Category Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveCategory('chat')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeCategory === 'chat'
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Chat Effects
            </button>
            <button
              onClick={() => setActiveCategory('cosmetic')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeCategory === 'cosmetic'
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Cosmetics
            </button>
            <button
              onClick={() => setActiveCategory('special')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeCategory === 'special'
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Special Requests
            </button>
          </div>

          {/* Shop Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const canAfford = userPoints >= item.cost;
              const isAvailable = item.available;
              
              return (
                <div
                  key={item.id}
                  className={`bg-gray-700 rounded-lg border-2 transition-all ${
                    canAfford && isAvailable
                      ? 'border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-lg'
                      : 'border-gray-600 opacity-75'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        canAfford && isAvailable ? 'bg-yellow-600' : 'bg-gray-600'
                      }`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        {item.cooldown && (
                          <p className="text-xs text-gray-400">
                            {item.cooldown}min cooldown
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 min-h-[40px]">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className={`font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                          {item.cost.toLocaleString()}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => purchaseItem(item)}
                        disabled={!canAfford || !isAvailable || isLoading}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          canAfford && isAvailable && !isLoading
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isLoading ? 'Buying...' : 'Purchase'}
                      </button>
                    </div>
                    
                    {!canAfford && (
                      <div className="mt-2 text-center">
                        <span className="text-red-400 text-xs">
                          Need {(item.cost - userPoints).toLocaleString()} more points
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* How to Earn Points */}
          <div className="mt-8 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
            <h3 className="text-white font-semibold mb-2 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span>How to Earn Points</span>
            </h3>
            <div className="text-gray-300 text-sm space-y-1">
              <p>• Chat actively in the stream (+1 point per message)</p>
              <p>• Watch the stream continuously (+5 points per hour)</p>
              <p>• Get featured in highlights (+25 points)</p>
              <p>• Participate in community events (+50-100 points)</p>
              <p>• Invite friends who join (+20 points per referral)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
