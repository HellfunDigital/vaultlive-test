import { useState, useEffect } from 'react';
import { Heart, Users, DollarSign, MessageCircle, TrendingUp, Sparkles, Star, Zap, Award, Crown } from 'lucide-react';

interface RecentActivity {
  id: number;
  type: 'donation' | 'follower' | 'message' | 'subscriber';
  username: string;
  amount?: number;
  message?: string;
  timestamp: string;
}

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

type TabType = 'activity' | 'stats';

export default function CommunityTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('activity');
  const [activities, setActivities] = useState<RecentActivity[]>([]);
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
  const [activityStats, setActivityStats] = useState({
    totalDonations: 0,
    recentFollowers: 0,
    messagesCount: 0,
    subscribers: 0,
  });

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/community/recent-activity');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
        setActivityStats(data.stats || activityStats);
      }
    } catch (error) {
      console.error('Failed to fetch community activity:', error);
      // Set mock data for demo
      setActivities([
        {
          id: 1,
          type: 'donation',
          username: 'GamerGirl123',
          amount: 25,
          message: 'Love the stream! 🔥',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          type: 'follower',
          username: 'StreamFan42',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          type: 'subscriber',
          username: 'VaultSupporter',
          timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        },
      ]);
      setActivityStats({
        totalDonations: 147,
        recentFollowers: 23,
        messagesCount: 1842,
        subscribers: 8,
      });
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/community/stats-enhanced');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch community stats:', error);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
    fetchStats();
    const interval = setInterval(() => {
      fetchRecentActivity();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <DollarSign className="w-3 h-3 text-green-400" />;
      case 'follower':
        return <Users className="w-3 h-3 text-blue-400" />;
      case 'subscriber':
        return <Sparkles className="w-3 h-3 text-purple-400" />;
      case 'message':
        return <MessageCircle className="w-3 h-3 text-cyan-400" />;
      default:
        return <Heart className="w-3 h-3 text-pink-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'donation':
        return 'border-green-500/30 bg-green-500/10';
      case 'follower':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'subscriber':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'message':
        return 'border-cyan-500/30 bg-cyan-500/10';
      default:
        return 'border-pink-500/30 bg-pink-500/10';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 overflow-hidden h-full flex flex-col">
      {/* Tab Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Community Hub</span>
          </h2>
          <div className="text-purple-100 text-xs">Live</div>
        </div>
        
        {/* Tab Buttons */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1 text-xs font-medium rounded transition-all ${
              activeTab === 'activity'
                ? 'bg-white/20 text-white'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1 text-xs font-medium rounded transition-all ${
              activeTab === 'stats'
                ? 'bg-white/20 text-white'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Stats & Leaderboard
          </button>
        </div>
      </div>

      <div className="p-3">
        {activeTab === 'activity' ? (
          <>
            {/* Activity Stats */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="bg-gray-800/50 rounded border border-gray-600 p-2 text-center">
                <Sparkles className="w-3 h-3 text-purple-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-purple-400">{activityStats.subscribers}</div>
                <div className="text-xs text-gray-400">Subs</div>
              </div>
              <div className="bg-gray-800/50 rounded border border-gray-600 p-2 text-center">
                <Users className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-blue-400">+{activityStats.recentFollowers}</div>
                <div className="text-xs text-gray-400">Follows</div>
              </div>
              <div className="bg-gray-800/50 rounded border border-gray-600 p-2 text-center">
                <MessageCircle className="w-3 h-3 text-cyan-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-cyan-400">{formatNumber(activityStats.messagesCount)}</div>
                <div className="text-xs text-gray-400">Messages</div>
              </div>
              <div className="bg-gray-800/50 rounded border border-gray-600 p-2 text-center">
                <Sparkles className="w-3 h-3 text-purple-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-purple-400">{activityStats.subscribers}</div>
                <div className="text-xs text-gray-400">Subs</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="text-center py-4">
                  <Heart className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-400 text-sm">No recent activity</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex items-start space-x-2 p-2 rounded border ${getActivityColor(activity.type)}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-white text-xs truncate">
                            {activity.username}
                          </span>
                          {activity.amount && (
                            <span className="bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                              ${activity.amount}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-300">
                        {activity.type === 'donation' && 'donated'}
                        {activity.type === 'follower' && 'followed'}
                        {activity.type === 'subscriber' && 'subscribed'}
                        {activity.type === 'message' && 'messaged'}
                      </div>
                      {activity.message && (
                        <div className="text-xs text-gray-200 mt-1 bg-gray-700/50 rounded px-1 py-0.5 truncate">
                          "{activity.message}"
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Viewer of the Month */}
            {stats.viewerOfMonth && (
              <div className="mb-3">
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded p-2">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <img 
                        src={stats.viewerOfMonth.picture || '/default-avatar.png'} 
                        alt={stats.viewerOfMonth.name}
                        className="w-8 h-8 rounded-full border border-yellow-500"
                      />
                      <Crown className="absolute -top-0.5 -right-0.5 w-3 h-3 text-yellow-500" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-yellow-400">Viewer of Month</div>
                      <div className="text-sm font-bold text-white">{stats.viewerOfMonth.name}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Overall Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-800/50 rounded border border-gray-600 p-2">
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span className="text-xs font-semibold text-white">Community XP</span>
                </div>
                <div className="text-lg font-bold text-blue-400">{formatNumber(stats.totalXp)}</div>
              </div>
              <div className="bg-gray-800/50 rounded border border-gray-600 p-2">
                <div className="flex items-center space-x-1 mb-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs font-semibold text-white">Points</span>
                </div>
                <div className="text-lg font-bold text-yellow-400">{formatNumber(stats.totalPoints)}</div>
              </div>
            </div>

            {/* Mini Stats Grid */}
            <div className="grid grid-cols-4 gap-1 mb-3">
              <div className="text-center">
                <div className="text-sm font-bold text-blue-400">{formatNumber(stats.totalUsers)}</div>
                <div className="text-xs text-gray-400">Users</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-purple-400">{stats.totalSubscribers}</div>
                <div className="text-xs text-gray-400">Premium</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-green-400">${formatNumber(stats.totalDonations)}</div>
                <div className="text-xs text-gray-400">Donated</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-cyan-400">{formatNumber(stats.totalMessages)}</div>
                <div className="text-xs text-gray-400">Messages</div>
              </div>
            </div>

            {/* Unified Leaderboard */}
            <div className="bg-gray-800/50 rounded border border-purple-500/30 p-2 max-h-48 overflow-y-auto">
              <div className="flex items-center space-x-1 mb-2">
                <Award className="w-3 h-3 text-purple-400" />
                <span className="text-xs font-semibold text-white">Community Leaders</span>
              </div>
              <div className="space-y-1">
                {stats.topCombinedUsers.slice(0, 8).map((user, index) => (
                  <div key={user.name} className="flex items-start justify-between">
                    <div className="flex items-start space-x-1 min-w-0 flex-1">
                      <div className="flex-shrink-0 mt-0.5 text-sm">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : 
                         <div className="w-3 h-3 rounded-full bg-gray-600 text-white flex items-center justify-center">
                           <span className="text-xs font-bold">{index + 1}</span>
                         </div>
                        }
                      </div>
                      <span className="text-white text-xs leading-tight truncate max-w-20">{user.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-1 mt-0.5">
                      <div className="text-purple-400 text-xs font-semibold">{formatNumber(user.combined_score)}</div>
                      <div className="text-gray-400 text-xs">L{user.user_level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        
      </div>
    </div>
  );
}
