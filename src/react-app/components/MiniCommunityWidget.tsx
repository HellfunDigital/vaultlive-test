import { useState, useEffect } from 'react';
import { Users, DollarSign, MessageCircle, TrendingUp, Sparkles, Star, Zap, Award, Crown, User } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';

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

export default function MiniCommunityWidget() {
  const { user } = useAuth();
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
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (error) {
      // User not logged in or error fetching
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
    fetchStats();
    if (user) {
      fetchCurrentUser();
    }
    const interval = setInterval(() => {
      fetchRecentActivity();
      fetchStats();
      if (user) {
        fetchCurrentUser();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <DollarSign className="w-2 h-2 text-green-400" />;
      case 'follower':
        return <Users className="w-2 h-2 text-blue-400" />;
      case 'subscriber':
        return <Sparkles className="w-2 h-2 text-purple-400" />;
      case 'message':
        return <MessageCircle className="w-2 h-2 text-cyan-400" />;
      default:
        return null;
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

  

  // Calculate XP progress for current level
  const calculateXPProgress = (currentXP: number, level: number) => {
    // Simple level system: 100 XP per level
    const xpPerLevel = 100;
    const currentLevelXP = (level - 1) * xpPerLevel;
    const nextLevelXP = level * xpPerLevel;
    const progressXP = currentXP - currentLevelXP;
    const requiredXP = xpPerLevel;
    const progressPercent = Math.min(100, Math.max(0, (progressXP / requiredXP) * 100));
    
    return {
      progressXP,
      requiredXP,
      progressPercent,
      nextLevelXP
    };
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 overflow-hidden h-full flex flex-col">
      {/* Mini Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1.5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold text-white flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Community</span>
          </h2>
          <div className="text-purple-100 text-xs">Live</div>
        </div>
        
        {/* Member of the Month in Header */}
        {stats.viewerOfMonth && (
          <div className="bg-yellow-500/20 border border-yellow-500/40 rounded px-2 py-1 mb-1">
            <div className="flex items-center space-x-1">
              <Crown className="w-3 h-3 text-yellow-400" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-yellow-400">⭐ Member of Month</div>
                <div className="text-xs text-white truncate">{stats.viewerOfMonth.name}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Mini Tab Buttons */}
        <div className="flex space-x-0.5">
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
              activeTab === 'activity'
                ? 'bg-white/20 text-white'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
              activeTab === 'stats'
                ? 'bg-white/20 text-white'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Stats
          </button>
        </div>
      </div>

      <div className="p-2 flex-1 flex flex-col min-h-0">
        {/* User's Personal Stats (Always Visible at Top) */}
        {currentUser?.localUser && (
          <div className="mb-2">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">{currentUser.localUser.name}</div>
                    <div className="text-xs text-blue-400">Level {currentUser.localUser.user_level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-blue-400">{formatNumber(currentUser.localUser.xp_total)} XP</div>
                  <div className="text-xs text-yellow-400">{formatNumber(currentUser.localUser.points_balance)} pts</div>
                </div>
              </div>
              
              {/* XP Progress Bar */}
              {(() => {
                const xpProgress = calculateXPProgress(currentUser.localUser.xp_total, currentUser.localUser.user_level);
                return (
                  <div>
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                      <span>{xpProgress.progressXP}/{xpProgress.requiredXP} XP</span>
                      <span>Next: Level {currentUser.localUser.user_level + 1}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${xpProgress.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        
        

        {activeTab === 'activity' ? (
          <>
            {/* Mini Activity Stats */}
            <div className="grid grid-cols-2 gap-1 mb-2">
              <div className="bg-gray-800/50 rounded border border-gray-600 p-1 text-center">
                <Sparkles className="w-2 h-2 text-purple-400 mx-auto mb-0.5" />
                <div className="text-xs font-bold text-purple-400">{activityStats.subscribers}</div>
                <div className="text-xs text-gray-400">Subs</div>
              </div>
              <div className="bg-gray-800/50 rounded border border-gray-600 p-1 text-center">
                <Users className="w-2 h-2 text-blue-400 mx-auto mb-0.5" />
                <div className="text-xs font-bold text-blue-400">+{activityStats.recentFollowers}</div>
                <div className="text-xs text-gray-400">Follows</div>
              </div>
            </div>

            {/* Mini Recent Activity */}
            <div className="space-y-1 flex-1 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="text-center py-2">
                  <div className="text-xs text-gray-400">No recent activity</div>
                </div>
              ) : (
                activities.slice(0, 6).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-1 rounded bg-gray-800/30"
                  >
                    <div className="flex items-center space-x-1 min-w-0 flex-1">
                      {getActivityIcon(activity.type)}
                      <span className="text-xs text-white">
                        {activity.username}
                      </span>
                      {activity.amount && (
                        <span className="text-xs bg-green-500 text-white px-1 rounded">
                          ${activity.amount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Mini Community Stats */}
            <div className="grid grid-cols-2 gap-1 mb-2">
              <div className="bg-gray-800/50 rounded border border-gray-600 p-1">
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="w-2 h-2 text-blue-400" />
                  <span className="text-xs font-semibold text-white">XP</span>
                </div>
                <div className="text-sm font-bold text-blue-400">{formatNumber(stats.totalXp)}</div>
              </div>
              <div className="bg-gray-800/50 rounded border border-gray-600 p-1">
                <div className="flex items-center space-x-1 mb-1">
                  <Zap className="w-2 h-2 text-yellow-400" />
                  <span className="text-xs font-semibold text-white">Points</span>
                </div>
                <div className="text-sm font-bold text-yellow-400">{formatNumber(stats.totalPoints)}</div>
              </div>
            </div>

            {/* Unified Leaderboard */}
            <div className="space-y-1 flex-1 overflow-y-auto">
              <div className="bg-gray-800/50 rounded border border-purple-500/30 p-2">
                <div className="flex items-center space-x-1 mb-2">
                  <Award className="w-3 h-3 text-purple-400" />
                  <span className="text-xs font-semibold text-white">Community Leaders</span>
                </div>
                <div className="space-y-1.5">
                  {stats.topCombinedUsers.slice(0, 6).map((user, index) => (
                    <div key={user.name} className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 min-w-0 flex-1">
                        <div className="flex-shrink-0 mt-0.5 text-sm">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : 
                           <div className="w-3 h-3 rounded-full bg-gray-600 text-white flex items-center justify-center">
                             <span className="text-xs font-bold">{index + 1}</span>
                           </div>
                          }
                        </div>
                        <span className="text-white text-xs leading-tight">{user.name}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2 mt-0.5">
                        <div className="text-purple-400 text-xs font-semibold">{formatNumber(user.combined_score)}</div>
                        <div className="text-gray-400 text-xs">L{user.user_level}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        
      </div>
    </div>
  );
}
