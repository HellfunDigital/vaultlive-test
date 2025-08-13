import { X, Zap, MessageCircle, Crown, Gift, Star, Heart, Coins, DollarSign, Clock } from 'lucide-react';

interface PointsGuideModalProps {
  onClose: () => void;
}

export default function PointsGuideModal({ onClose }: PointsGuideModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4" style={{ zIndex: 999999 }}>
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Points System Guide</h2>
                <p className="text-yellow-100">Everything you need to know about earning and spending points!</p>
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

        <div className="p-6 space-y-8">
          {/* What are Points? */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Coins className="w-6 h-6 text-yellow-400" />
              <span>What are Points?</span>
            </h3>
            <p className="text-gray-300 mb-4">
              Points are VaultKeeper's virtual currency that you can earn by being active in the community 
              and spend on awesome chat effects, cosmetic upgrades, and special requests!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-2">💰 You can also donate with points!</h4>
                <p className="text-gray-400 text-sm">100 points = $1.00 donation value</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2">🛒 Buy points with real money</h4>
                <p className="text-gray-400 text-sm">Get points instantly via Stripe or PayPal</p>
              </div>
            </div>
          </div>

          {/* How to Earn Points */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Star className="w-6 h-6 text-green-400" />
              <span>How to Earn Points (100% Free!)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-white">Chat Activity</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">+1 point per message sent</p>
                <p className="text-gray-400 text-xs">Be active in chat to earn steadily!</p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-white">Watch Time</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">+5 points per hour</p>
                <p className="text-gray-400 text-xs">Just watching the stream earns you points!</p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <span className="font-semibold text-white">Community Events</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">+50-100 points per event</p>
                <p className="text-gray-400 text-xs">Participate in games and contests!</p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Gift className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-white">Referrals</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">+20 points per friend</p>
                <p className="text-gray-400 text-xs">Invite friends who join the community!</p>
              </div>
            </div>
          </div>

          {/* Points Shop Items */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span>Points Shop - What You Can Buy</span>
            </h3>
            
            <div className="space-y-6">
              {/* Chat Effects */}
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-6">
                <h4 className="text-blue-400 font-bold mb-4 flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>💬 Chat Effects</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">25</div>
                    <div className="text-white font-medium mb-2">✨ Highlight Message</div>
                    <div className="text-gray-400 text-sm">Golden glow effect on your next message</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">50</div>
                    <div className="text-white font-medium mb-2">🌈 Rainbow Message</div>
                    <div className="text-gray-400 text-sm">Animated rainbow text colors</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">75</div>
                    <div className="text-white font-medium mb-2">📌 Priority Message</div>
                    <div className="text-gray-400 text-sm">Pin message to top for 30 seconds</div>
                  </div>
                </div>
              </div>

              {/* Cosmetic Effects */}
              <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-6">
                <h4 className="text-purple-400 font-bold mb-4 flex items-center space-x-2">
                  <Crown className="w-5 h-5" />
                  <span>👑 Cosmetic Effects</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">80</div>
                    <div className="text-white font-medium mb-2">✨ Name Glow Effect</div>
                    <div className="text-gray-400 text-sm">Glowing username for 30 minutes</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">100</div>
                    <div className="text-white font-medium mb-2">👑 Temp VIP Badge</div>
                    <div className="text-gray-400 text-sm">VIP badge for 1 hour</div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-6">
                <h4 className="text-green-400 font-bold mb-4 flex items-center space-x-2">
                  <Gift className="w-5 h-5" />
                  <span>🎵 Special Requests</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">150</div>
                    <div className="text-white font-medium mb-2">🎵 Song Request</div>
                    <div className="text-gray-400 text-sm">Request a song (subject to approval)</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">200</div>
                    <div className="text-white font-medium mb-2">📢 Shoutout Request</div>
                    <div className="text-gray-400 text-sm">Request a shoutout (subject to approval)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Donations with Points */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              <span>Donate with Points</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-green-400 font-semibold mb-2">💡 How it works</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Use your earned points to make donations! Every 100 points = $1.00 donation value.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">500 points</span>
                    <span className="text-green-400">= $5.00 donation</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">1000 points</span>
                    <span className="text-green-400">= $10.00 donation</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">2500 points</span>
                    <span className="text-green-400">= $25.00 donation</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-yellow-400 font-semibold mb-2">🎯 Why donate with points?</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Support the stream without spending money</li>
                  <li>• Your donation appears in chat and on OBS</li>
                  <li>• Same recognition as monetary donations</li>
                  <li>• Use points you earned by being active</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation Help */}
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">🧭 Quick Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="text-blue-400 font-semibold mb-2">Header Menu</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>• "Buy Points" - Purchase with money</li>
                  <li>• "Donate" - Support with money or points</li>
                  <li>• Profile - View your points balance</li>
                </ul>
              </div>
              <div>
                <h4 className="text-purple-400 font-semibold mb-2">Chat Features</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>• Points Shop button in chat</li>
                  <li>• TTS controls (mods/admins)</li>
                  <li>• Settings menu for preferences</li>
                </ul>
              </div>
              <div>
                <h4 className="text-green-400 font-semibold mb-2">Your Profile</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>• Current points balance</li>
                  <li>• Total points earned</li>
                  <li>• XP level and progress</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
