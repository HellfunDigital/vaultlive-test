import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { Link } from 'react-router';
import { Link as LinkIcon, Users, Gift, Copy, Check, Crown, Star, ArrowLeft, Home } from 'lucide-react';


interface ReferralStats {
  referralToken: string;
  referredUsers: number;
  pointsEarned: number;
  recentReferrals: Array<{
    name: string;
    joinedAt: string;
    pointsAwarded: number;
  }>;
}

export default function Referrals() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats>({
    referralToken: '',
    referredUsers: 0,
    pointsEarned: 0,
    recentReferrals: []
  });
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/referrals/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReferralStats();
    }
  }, [user]);

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${stats.referralToken}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform: string) => {
    const referralLink = `${window.location.origin}?ref=${stats.referralToken}`;
    const message = encodeURIComponent('Join me on VaultKeeper! Amazing streaming community with XP, points, and rewards! 🎮');
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${message}&url=${encodeURIComponent(referralLink)}`;
        break;
      case 'discord':
        // For Discord, we'll just copy the message format
        const discordMessage = `Join me on VaultKeeper! Amazing streaming community with XP, points, and rewards! 🎮\n${referralLink}`;
        navigator.clipboard.writeText(discordMessage);
        alert('Discord message copied to clipboard! Paste it in your server.');
        return;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?title=${encodeURIComponent('Check out VaultKeeper!')}&url=${encodeURIComponent(referralLink)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-400">Please login to access your referral dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Stream</span>
              </Link>
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-purple-500" />
                <h1 className="text-2xl font-bold">Referral Program</h1>
              </div>
            </div>
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Referral Program</h1>
              <p className="text-purple-100">Invite friends and earn rewards together!</p>
            </div>
          </div>
          
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.referredUsers}</div>
                <div className="text-sm text-purple-100">Friends Referred</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Gift className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.pointsEarned}</div>
                <div className="text-sm text-purple-100">Points Earned</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Star className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">20pts</div>
                <div className="text-sm text-purple-100">Per Referral</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referral Link */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <LinkIcon className="w-5 h-5" />
              <span>Your Referral Link</span>
            </h2>
            
            {stats.referralToken ? (
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-green-400 break-all">
                      {`${window.location.origin}?ref=${stats.referralToken}`}
                    </code>
                    <button
                      onClick={copyReferralLink}
                      className="ml-2 p-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-300">
                  Share this link with friends! When they sign up, you both get 20 points.
                </div>
                
                {/* Social Sharing */}
                <div className="space-y-2">
                  <div className="font-semibold">Quick Share:</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => shareOnSocial('twitter')}
                      className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm transition-colors"
                    >
                      Twitter
                    </button>
                    <button
                      onClick={() => shareOnSocial('discord')}
                      className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-sm transition-colors"
                    >
                      Discord
                    </button>
                    <button
                      onClick={() => shareOnSocial('reddit')}
                      className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-sm transition-colors"
                    >
                      Reddit
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-gray-400">Loading your referral link...</div>
              </div>
            )}
          </div>

          {/* How It Works */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <div className="font-semibold">Share Your Link</div>
                  <div className="text-sm text-gray-300">Send your unique referral link to friends</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <div className="font-semibold">Friend Signs Up</div>
                  <div className="text-sm text-gray-300">They create an account using your link</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <div className="font-semibold">You Both Get Rewards!</div>
                  <div className="text-sm text-gray-300">20 points for you, 20 welcome points for them</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-green-400">Pro Tip</span>
              </div>
              <div className="text-sm text-gray-300">
                Referred friends who become active community members earn you bonus rewards!
              </div>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        {stats.recentReferrals.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Recent Referrals</h2>
            <div className="space-y-3">
              {stats.recentReferrals.map((referral, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold">{referral.name}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(referral.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-green-400 font-semibold">
                    +{referral.pointsAwarded} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral Leaderboard */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Top Referrers This Month</h2>
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <div>Leaderboard coming soon!</div>
            <div className="text-sm mt-1">Keep referring friends to claim your spot</div>
          </div>
        </div>
      </div>
    </div>
  );
}
