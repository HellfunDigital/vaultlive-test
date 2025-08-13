import { useState, useEffect } from 'react';
import { Users, DollarSign, MessageCircle, Crown, Star, TrendingUp, Zap } from 'lucide-react';

interface CommunityStats {
  totalUsers: number;
  totalSubscribers: number;
  totalMessages: number;
  totalDonations: number;
  totalXp: number;
  totalPoints: number;
  topCombinedUsers: Array<{
    name: string;
    xp_total: number;
    user_level: number;
    points_earned_total: number;
    combined_score: number;
  }>;
  viewerOfMonth: {
    name: string;
    picture: string;
    badges: string;
    month_year: string;
  } | null;
}

export default function CommunityStatsPanel() {
  const [stats, setStats] = useState<CommunityStats>({
    totalUsers: 0,
    totalSubscribers: 0,
    totalMessages: 0,
    totalDonations: 0,
    totalXp: 0,
    totalPoints: 0,
    topCombinedUsers: [],
    viewerOfMonth: null
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/community/stats-enhanced');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch community stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 2 minutes
    const interval = setInterval(fetchStats, 120000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getCurrentMonth = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
            <div className="h-4 bg-gray-600 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
          <span>Community Hub</span>
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Live stats and community highlights
        </p>
      </div>

      <div className="p-4 md:p-6">
        {/* Viewer of the Month */}
        {stats.viewerOfMonth && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={stats.viewerOfMonth.picture || '/default-avatar.png'} 
                    alt={stats.viewerOfMonth.name}
                    className="w-12 h-12 rounded-full border-2 border-yellow-500"
                  />
                  <div className="absolute -top-1 -right-1">
                    <Crown className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-yellow-400">⭐ Viewer of the Month</div>
                  <div className="text-lg font-bold text-white">{stats.viewerOfMonth.name}</div>
                  <div className="text-xs text-gray-300">{getCurrentMonth()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section - OBS Panel Layout */}
        <div className="flex mb-6">
          {/* Left Column - Main Stats */}
          <div className="w-1/3 pr-3">
            <h3 className="font-bold flex items-center space-x-2 mb-3">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Community Stats</span>
            </h3>

            <div className="grid grid-cols-1 gap-2">
              <div className="bg-blue-600/20 rounded p-2 border border-blue-500/30 text-center">
                <Users className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-blue-400">{formatNumber(stats.totalUsers)}</div>
                <div className="text-xs text-gray-400">Members</div>
              </div>
              
              <div className="bg-purple-600/20 rounded p-2 border border-purple-500/30 text-center">
                <Crown className="w-3 h-3 text-purple-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-purple-400">{stats.totalSubscribers}</div>
                <div className="text-xs text-gray-400">Premium</div>
              </div>
              
              <div className="bg-green-600/20 rounded p-2 border border-green-500/30 text-center">
                <DollarSign className="w-3 h-3 text-green-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-green-400">${formatNumber(stats.totalDonations)}</div>
                <div className="text-xs text-gray-400">Donated</div>
              </div>

              <div className="bg-cyan-600/20 rounded p-2 border border-cyan-500/30 text-center">
                <MessageCircle className="w-3 h-3 text-cyan-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-cyan-400">{formatNumber(stats.totalMessages)}</div>
                <div className="text-xs text-gray-400">Messages</div>
              </div>
            </div>
          </div>

          {/* Middle Column - XP & Points */}
          <div className="w-1/3 px-3 border-l border-r border-gray-700">
            <h3 className="font-bold mb-3 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>XP & Points</span>
            </h3>
            
            <div className="space-y-2">
              <div className="bg-gray-700/50 rounded p-2">
                <div className="flex items-center space-x-2 mb-1">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span className="text-sm font-semibold text-white">Community XP</span>
                </div>
                <div className="text-lg font-bold text-blue-400">{formatNumber(stats.totalXp)}</div>
                <div className="text-xs text-gray-300">Total experience earned</div>
              </div>
              
              <div className="bg-gray-700/50 rounded p-2">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-sm font-semibold text-white">Community Points</span>
                </div>
                <div className="text-lg font-bold text-yellow-400">{formatNumber(stats.totalPoints)}</div>
                <div className="text-xs text-gray-300">Total points earned</div>
              </div>
            </div>
          </div>

          {/* Right Column - Community Leaders */}
          <div className="w-1/3 pl-3">
            <h3 className="font-bold mb-3">Community Leaders</h3>
            <div className="space-y-1 overflow-y-auto max-h-44">
              {stats.topCombinedUsers.length === 0 ? (
                <div className="text-center text-gray-400 py-2">
                  <div className="text-xs">No leaders yet</div>
                </div>
              ) : (
                stats.topCombinedUsers.slice(0, 8).map((user, index) => (
                  <div key={user.name} className="flex items-center justify-between bg-gray-700/30 rounded p-1.5">
                    <div className="flex items-center space-x-1">
                      <div className="text-sm">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : 
                         <div className="w-4 h-4 rounded-full bg-gray-600 text-white flex items-center justify-center">
                           <span className="text-xs font-bold">{index + 1}</span>
                         </div>
                        }
                      </div>
                      <span className="text-white text-xs">{user.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-purple-400">{formatNumber(user.combined_score)}</div>
                      <div className="text-xs text-gray-400">Lv.{user.user_level}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        

        
      </div>
    </div>
  );
}
